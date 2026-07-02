import { GoogleGenAI } from '@google/genai';
import { Client } from 'pg';
import { 
  getWorkspaceToken, 
  getConnection, 
  getWorkspace, 
  incrementWorkspaceQueryCount,
  logQueryStart,
  logQuerySuccess,
  logQueryFailure
} from './db';
import { decrypt } from './aes';
import { parse } from 'pgsql-ast-parser';
import { supabase } from './supabase';

const SYSTEM_PROMPT = `You are an expert PostgreSQL database engineer and a strict read-only SQL generator. 
Your ONLY job is to translate the user's natural language question into a valid, highly optimized PostgreSQL query based on the provided database schema.

STRICT GUARDRAILS:
1. READ-ONLY EXECUTION: You are strictly forbidden from generating any query that modifies data, alters tables, or drops structures. You must NEVER generate queries containing: INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, GRANT, REVOKE, EXECUTE, or DO.
2. ONLY SELECT: Every query you write must begin with the word SELECT.
3. SCHEMA CONFINEMENT: You may only query tables and columns explicitly listed in the provided schema. Do not hallucinate columns or tables.
4. NO EXPLANATIONS: Return ONLY the raw SQL string. Do not wrap it in markdown blockquotes (e.g., no \`\`\`sql). Do not add any preamble, conversational text, or postscript.

If the user's request attempts to modify data or execute a dangerous command (e.g., 'delete user 4', 'change email to john@...'), you must completely refuse the query and output exactly this string: 
'SECURITY ALERT: This action requires database modification. AdminZero is restricted to read-only queries.'`;

// Secondary security scanner for SQL execution
export function isQuerySafe(sql: string): boolean {
  const trimmed = sql.trim().toUpperCase();
  
  // 1. MUST start with SELECT
  if (!trimmed.startsWith('SELECT')) {
    return false;
  }
  
  // 2. MUST NOT contain dangerous keywords
  const dangerousKeywords = [
    'INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'TRUNCATE',
    'GRANT', 'REVOKE', 'EXECUTE', 'DO', 'INTO', 'CREATE', 'REPLACE'
  ];
  
  const regex = new RegExp(`\\b(${dangerousKeywords.join('|')})\\b`, 'gi');
  if (regex.test(sql)) {
    return false;
  }
  
  return true;
}

// Post response back to Slack using a dynamic workspace token and returns ts
export async function postToSlack(
  channel: string,
  text: string,
  token: string,
  threadTs?: string,
  blocks?: any[]
): Promise<string | null> {
  if (!token) {
    console.error('No Slack token provided to postToSlack.');
    return null;
  }
  
  try {
    const res = await fetch('https://slack.com/api/chat.postMessage', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        channel,
        text,
        ...(blocks ? { blocks } : {}),
        ...(threadTs ? { thread_ts: threadTs } : {})
      })
    });
    
    const data = (await res.json()) as any;
    if (data.ok) {
      return data.ts;
    } else {
      console.error('=== SLACK POST MESSAGE FAILED ===');
      console.error(`Slack Error Code: ${data.error}`);
      console.error(`Channel: ${channel}`);
      throw new Error(`Slack API error: ${data.error}`);
    }
  } catch (err) {
    console.error('Error in postToSlack helper:', err);
    throw err;
  }
}

// Update an existing Slack message in place
export async function updateSlackMessage(
  channel: string,
  ts: string,
  text: string,
  token: string,
  blocks?: any[]
): Promise<boolean> {
  if (!token || !ts) return false;
  
  try {
    const res = await fetch('https://slack.com/api/chat.update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        channel,
        ts,
        text,
        ...(blocks ? { blocks } : {})
      })
    });
    
    const data = (await res.json()) as any;
    return data.ok;
  } catch (err) {
    console.error('Network error updating Slack message:', err);
    return false;
  }
}

// Helper to automatically append LIMIT 100 to optimize database query runtime
export function applyAutoLimit(sql: string): string {
  let cleanSql = sql.trim();
  const endsWithSemicolon = cleanSql.endsWith(';');
  if (endsWithSemicolon) {
    cleanSql = cleanSql.slice(0, -1).trim();
  }
  
  // If there's no LIMIT clause in the query, append LIMIT 100
  if (!/\bLIMIT\b/i.test(cleanSql)) {
    cleanSql = `${cleanSql} LIMIT 100`;
  }
  
  if (endsWithSemicolon) {
    cleanSql = `${cleanSql};`;
  }
  return cleanSql;
}

// Convert DB rows to a clean monospace Markdown table for Slack
function formatSlackResults(rows: any[]): string {
  if (!rows || rows.length === 0) {
    return 'No results found.';
  }
  
  const headers = Object.keys(rows[0]);
  
  // 1. Headers row
  let table = headers.join(' | ') + '\n';
  table += headers.map(() => '---').join(' | ') + '\n';
  
  // 2. Data rows
  const MAX_ROWS = 15;
  const displayRows = rows.slice(0, MAX_ROWS);
  
  for (const row of displayRows) {
    const values = headers.map(header => {
      const val = row[header];
      if (val === null || val === undefined) return 'NULL';
      if (typeof val === 'object') return JSON.stringify(val);
      return String(val);
    });
    table += values.join(' | ') + '\n';
  }
  
  let output = '```\n' + table + '```';
  
  if (rows.length > MAX_ROWS) {
    output += `\n_Showing first ${MAX_ROWS} of ${rows.length} rows_`;
  }
  
  return output;
}

/**
 * Executes a PostgreSQL query using a one-off connection wrapper to prevent leaks.
 */
async function executeQuery(pgUrl: string, sql: string): Promise<any[]> {
  const pgClient = new Client({
    connectionString: pgUrl,
    connectionTimeoutMillis: 10000,
    statement_timeout: 5000, // Enforce 5s timeout on database queries to prevent Cartesian join DoS
    ssl: { rejectUnauthorized: false }
  });
  try {
    await pgClient.connect();
    const res = await pgClient.query({ text: sql });
    return res.rows;
  } finally {
    await pgClient.end();
  }
}

/**
 * Validates a generated SQL string against an AST structure using pgsql-ast-parser.
 * Enforces zero-trust constraints: blocks mutating query types and blacklisted column accesses.
 */
export function validateSQLWithAST(sql: string): void {
  let ast: any;
  try {
    ast = parse(sql);
  } catch (err: any) {
    throw new Error(`SQL AST Parsing Error: ${err.message}`);
  }

  if (!ast || !Array.isArray(ast)) {
    throw new Error('Invalid SQL statement structure.');
  }

  // Prevent query chaining to block side-channel attacks
  if (ast.length > 1) {
    throw new Error('Multiple SQL statements in a single execution are strictly forbidden.');
  }

  const blacklistColumns = ['password', 'passwd', 'pass', 'ssn', 'social_security', 'credit_card', 'cc_number', 'secret_key', 'private_key', 'token', 'pii'];

  function traverse(node: any) {
    if (!node || typeof node !== 'object') return;

    if (Array.isArray(node)) {
      for (const item of node) {
        traverse(item);
      }
      return;
    }

    // Check statement type property
    if (node.type) {
      const typeStr = String(node.type).toLowerCase();
      const forbiddenKeywords = [
        'update', 'delete', 'insert', 'drop', 'alter', 'truncate', 'create', 'replace', 'grant', 'revoke'
      ];
      if (forbiddenKeywords.some(keyword => typeStr.includes(keyword))) {
        throw new Error(`Unauthorized SQL operation detected: statement type '${node.type}' is forbidden.`);
      }
    }

    // Check for blacklisted column references (pgsql-ast-parser maps columns as { type: 'ref', name: 'col_name' })
    if (node.type === 'ref' && node.name) {
      const colName = String(node.name).toLowerCase();
      if (blacklistColumns.some(blacklisted => colName.includes(blacklisted))) {
        throw new Error(`Unauthorized SQL access: column '${node.name}' is blacklisted.`);
      }
    }

    // Deep check any identifier or name properties to prevent inference side-channel leaks
    if (node.name && typeof node.name === 'string') {
      const nameLower = node.name.toLowerCase();
      if (blacklistColumns.some(blacklisted => nameLower.includes(blacklisted))) {
        if (node.type !== 'table') {
          throw new Error(`Unauthorized SQL access: identifier/property '${node.name}' contains a blacklisted column name.`);
        }
      }
    }

    // Recursively traverse child keys
    for (const key of Object.keys(node)) {
      traverse(node[key]);
    }
  }

  traverse(ast);
}

/**
 * Attempts to translate natural language to SQL using DeepSeek V3 (Direct, OpenRouter, or Groq)
 */
async function generateSQLWithDeepSeek(schema: string, query: string): Promise<string> {
  const deepseekKey = process.env.DEEPSEEK_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  
  let url = '';
  let key = '';
  let model = '';
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  
  if (deepseekKey) {
    url = 'https://api.deepseek.com/chat/completions';
    key = deepseekKey;
    model = 'deepseek-chat';
  } else if (openrouterKey) {
    url = 'https://openrouter.ai/api/v1/chat/completions';
    key = openrouterKey;
    model = 'deepseek/deepseek-chat';
    headers['HTTP-Referer'] = 'https://glitchgo.tech';
    headers['X-Title'] = 'AdminZero';
  } else if (groqKey) {
    url = 'https://api.groq.com/openai/v1/chat/completions';
    key = groqKey;
    model = 'deepseek-r1-distill-llama-70b';
  } else {
    throw new Error('No API key configured for DeepSeek (DEEPSEEK_API_KEY, OPENROUTER_API_KEY, or GROQ_API_KEY).');
  }
  
  headers['Authorization'] = `Bearer ${key}`;
  
  const systemPrompt = SYSTEM_PROMPT;
  const userPrompt = `Database Schema:\n${schema || 'No schema hint provided.'}\n\nUser Question: "${query}"`;
  
  const res = await fetch(url, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify({
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.1
    })
  });
  
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`DeepSeek API error (${res.status}): ${errText}`);
  }
  
  const data = (await res.json()) as any;
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('DeepSeek API returned empty response.');
  }
  
  let cleanResult = choice.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  cleanResult = cleanResult.replace(/```sql/gi, '')
                           .replace(/```/g, '')
                           .trim();
                           
  return cleanResult;
}

/**
 * Escalates to Gemini 2.5 Pro to correct failed SQL query based on pg error logs.
 */
async function escalateToGeminiPro(
  schema: string,
  query: string,
  failedSql: string,
  pgError: string
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }
  
  const ai = new GoogleGenAI({ apiKey });
  
  const dbaPrompt = `You are a Senior Database Administrator (DBA) and an expert PostgreSQL engineer.
Your job is to debug a failed SQL query that was generated for a user's natural language request.

Original User Question: "${query}"

Database Schema:
${schema || 'No schema hint provided.'}

Failed SQL Query:
\`\`\`sql
${failedSql}
\`\`\`

PostgreSQL Error Message:
\`\`\`
${pgError}
\`\`\`

INSTRUCTIONS:
1. Analyze the PostgreSQL error message and the database schema.
2. Correct the failed SQL query so that it successfully answers the original user question.
3. Strict read-only constraint: The corrected query MUST be a SELECT query. Do not perform any mutating operations.
4. Return ONLY the corrected raw SQL string. Do not wrap it in markdown code blocks (no \`\`\`sql). Do not include any explanation, reasoning, or extra text.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro',
    contents: dbaPrompt,
    config: {
      systemInstruction: 'You are a Senior DBA and expert PostgreSQL query corrector. Return ONLY raw SQL, no markdown blocks, no explanations.',
      temperature: 0.1,
    }
  });
  
  let correctedSql = (response.text || '').trim();
  correctedSql = correctedSql.replace(/```sql/gi, '')
                             .replace(/```/g, '')
                             .trim();
                             
  return correctedSql;
}

/**
 * Route raw query results to a synthesis function powered by Gemini 2.5 Flash.
 * Interprets database rows and formats into conversational mrkdwn with text-bar visualizations (PowerBI mode).
 */
async function synthesizeResults(query: string, rows: any[], systemNote?: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('Gemini API key is not configured for synthesis.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const rawDataJson = JSON.stringify(rows.slice(0, 100));

  const synthesisPrompt = `You are an elite Lead Data Analyst.
You have successfully executed a database query to answer a user's question.

User Question: "${query}"

${systemNote ? `${systemNote}\n\n` : ''}Raw Database Rows Returned:
${rawDataJson}

Your job is to synthesize these raw rows into a concise, professional response.

LOGIC DIRECTIVES:
1. ADMINISTRATIVE CHECKS: If the user's query is administrative, return a concise confirmation of the tables/schemas and format the raw rows into a clean text table.
2. POWERBI MODE: If the query involves metrics, counts, timelines, or financial aggregations, you MUST trigger "PowerBI Mode".
   PowerBI Mode Requirements:
   - Calculate and display grand totals.
   - Identify percentage trends or comparisons.
   - Flag any anomalies or outliers in the data.
   - Draw text-based horizontal visual progress bars or bar charts where appropriate to visualize the distributions (e.g. using symbols like █ and ░).
3. SLACK MRKDWN FORMATTING:
   - Use single asterisks for bold (*this is bold*).
   - Use underscores for italics (_this is italic_).
   - Never use double asterisks.
   - Keep paragraphs separated by double newlines.
4. Keep the synthesis under 500 words. Do not leak sensitive credentials.`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: synthesisPrompt,
    config: {
      systemInstruction: 'You are an elite Lead Data Analyst. Format your output strictly for Slack mrkdwn (single asterisks *bold*, underscores _italic_). No double asterisks.',
      temperature: 0.2
    }
  });

  return (response.text || '').trim();
}

/**
 * Helper function to log Slack pipeline errors using Supabase database insert.
 */
export async function logErrorToDatabase(userPrompt: string, generatedSql: string | null, error: any, queryLogId?: number | null) {
  try {
    const errorMessage = error instanceof Error ? `${error.message}\n${error.stack}` : String(error);
    const { error: dbErr } = await supabase.from('error_logs').insert([
      {
        user_prompt: userPrompt,
        generated_sql: generatedSql || null,
        error_message: errorMessage,
        query_log_id: queryLogId || null
      }
    ]);
    if (dbErr) {
      console.error('Failed to log error to database:', dbErr);
    }
  } catch (err) {
    console.error('Exception in logErrorToDatabase helper:', err);
  }
}

/**
 * Core handler to process user slack command, translate to SQL using DeepSeek, execute, and fallback to Gemini Pro on failure.
 */
export async function handleSlackMessage(channel: string, text: string, userId: string, teamId: string) {
  const cleanText = text.replace(/<@U[A-Z0-9]+>/g, '').trim();
  console.log('--- handleSlackMessage (Advanced Router) Started ---');
  console.log(`Channel: ${channel}`);
  console.log(`Clean Text: "${cleanText}"`);
  console.log(`User ID: ${userId}`);
  console.log(`Team ID: ${teamId}`);
  
  let token: string | null = null;
  try {
    token = await getWorkspaceToken(teamId);
  } catch (dbErr) {
    console.error('Error fetching workspace token from Supabase:', dbErr);
  }
  
  token = token || process.env.SLACK_BOT_TOKEN || null;
  
  if (!token) {
    console.error(`Cannot process message: Slack bot token is missing for team ID: ${teamId}`);
    return;
  }

  let workspace: any = null;
  if (teamId) {
    try {
      workspace = await getWorkspace(teamId);
    } catch (dbErr) {
      console.error('Error fetching workspace quota details:', dbErr);
    }
  }

  const queryCount = workspace?.query_count ?? 0;
  const maxQueries = workspace?.max_queries ?? 30;

  if (queryCount >= maxQueries) {
    console.warn(`Quota exhausted for Slack Team ${teamId}: ${queryCount}/${maxQueries}`);
    await postToSlack(
      channel,
      `🚨 USAGE LIMIT REACHED: Your workspace has exhausted its monthly query quota for the Free Tier. Upgrade your plan at glitchgo.tech/adminzero.`,
      token
    );
    return;
  }
  
  if (!cleanText) {
    await postToSlack(channel, `Hi <@${userId}>! Ask me a database query, for example: "How many users signed up last week?"`, token);
    return;
  }
  
  let queryId: number | null = null;
  try {
    queryId = await logQueryStart(teamId, cleanText);
  } catch (err) {
    console.error('Failed to log query start telemetry:', err);
  }

  let messageTs: string | null = null;
  let activeSql = '';
  try {
    const conn = await getConnection(channel);
    
    if (!conn) {
      console.log(`No connection mapping found for channel ${channel}. Posting error to Slack...`);
      await postToSlack(channel, `❌ Channel **${channel}** is not mapped to any database connection. Map this channel in the AdminZero config portal.`, token);
      return;
    }
    
    const { client_name, encrypted_pg_url, schema_hint } = conn;
    
    messageTs = await postToSlack(channel, `🔍 _Analyzing data..._`, token);
    if (!messageTs) {
      throw new Error('Failed to post initial message to Slack (returned empty message ID).');
    }

    const pgUrl = decrypt(encrypted_pg_url as string);
    
    activeSql = '';
    let rows: any[] = [];
    let executeSuccess = false;
    let queryErrorText = '';
    let deepseekSql = '';
    
    // --- STEP 1: FAST LANE (DEEPSEEK V3) ---
    try {
      deepseekSql = await generateSQLWithDeepSeek(schema_hint || 'No schema hint provided.', cleanText);
      const deepseekFinalSql = applyAutoLimit(deepseekSql);
      activeSql = deepseekFinalSql;
      
      validateSQLWithAST(deepseekFinalSql);
      
      await updateSlackMessage(
        channel,
        messageTs,
        `⚙️ _Executing generated query:_\n\`\`\`sql\n${deepseekFinalSql}\n\`\`\``,
        token
      );
      
      rows = await executeQuery(pgUrl, deepseekFinalSql);
      executeSuccess = true;
      
    } catch (deepseekErr: any) {
      queryErrorText = deepseekErr.message;
    }
    
    // --- STEP 2: HEAVY LIFTER ESCALATION (GEMINI 2.5 PRO REPAIR) ---
    if (!executeSuccess) {
      try {
        await updateSlackMessage(
          channel,
          messageTs,
          `🛠️ _SQL error detected. Escalating to Senior DBA (Gemini Pro) to self-heal..._`,
          token
        );
        
        const correctedSql = await escalateToGeminiPro(
          schema_hint || 'No schema hint provided.',
          cleanText,
          deepseekSql || '-- No valid SQL generated --',
          queryErrorText || 'Unknown query error'
        );
        
        const geminiFinalSql = applyAutoLimit(correctedSql);
        activeSql = geminiFinalSql;
        
        validateSQLWithAST(geminiFinalSql);
        
        await updateSlackMessage(
          channel,
          messageTs,
          `⚙️ _Executing corrected query:_\n\`\`\`sql\n${geminiFinalSql}\n\`\`\``,
          token
        );
        
        rows = await executeQuery(pgUrl, geminiFinalSql);
        executeSuccess = true;
        
      } catch (geminiErr: any) {
        if (queryId) {
          try { await logQueryFailure(queryId); } catch (logErr) {}
        }
        const finalFailureMsg = `❌ AdminZero encountered an issue with that complex query. Please try simplifying your request.`;
        await updateSlackMessage(channel, messageTs, finalFailureMsg, token);
        return;
      }
    }
    
    // --- STEP 3: CONVERSATIONAL SYNTHESIS ---
    if (executeSuccess) {
      if (queryId) {
        try { await logQuerySuccess(queryId); } catch (logErr) {}
      }
      try {
        const safeRows = rows.slice(0, 100);
        let systemNote = '';
        if (rows.length > 100) {
          systemNote = '[System Note: The data payload exceeded safe limits and was truncated to the first 100 records for performance and safety.]';
        }
        
        const synthesizedText = await synthesizeResults(cleanText, safeRows, systemNote);
        
        const slackBlocks = [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: synthesizedText
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `_Executed SQL:_\n\`\`\`sql\n${activeSql}\n\`\`\`\n\n⭐ *Enjoying AdminZero?* <https://glitchgo.tech#reviews|Leave us a review!>`
              }
            ]
          },
          {
            type: 'actions',
            elements: [
              {
                type: 'button',
                text: {
                  type: 'plain_text',
                  text: '🔗 Share Public Insight',
                  emoji: true
                },
                value: JSON.stringify({ query: cleanText, teamId, date: new Date().toISOString() }),
                action_id: 'adminzero_share_insight'
              }
            ]
          }
        ];

        await updateSlackMessage(channel, messageTs, synthesizedText, token, slackBlocks);
        
        if (teamId) {
          try { await incrementWorkspaceQueryCount(teamId); } catch (incErr) {}
        }
        
      } catch (synthErr: any) {
        const formattedResults = formatSlackResults(rows);
        const successMsg = `✅ **Query Results:**\n${formattedResults}\n\n_Executed SQL:_\n\`\`\`sql\n${activeSql}\n\`\`\``;
        await updateSlackMessage(channel, messageTs, successMsg, token);
      }
    }
    
  } catch (err: any) {
    if (queryId) {
      try { await logQueryFailure(queryId); } catch (logErr) {}
    }
    await logErrorToDatabase(cleanText, activeSql || null, err, queryId);
    
    const errorText = `AdminZero encountered a technical snag. Our team has been notified.`;
    const errorBlocks = [
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: `❌ *${errorText}*`
        }
      },
      {
        type: 'actions',
        elements: [
          {
            type: 'button',
            text: {
              type: 'plain_text',
              text: '🚨 Report Issue',
              emoji: true
            },
            value: JSON.stringify({ prompt: cleanText, sql: activeSql || null, error: err.message }),
            action_id: 'adminzero_report_issue'
          }
        ]
      }
    ];

    if (messageTs) {
      await updateSlackMessage(channel, messageTs, errorText, token, errorBlocks);
    } else {
      await postToSlack(channel, errorText, token, undefined, errorBlocks);
    }
  }
}

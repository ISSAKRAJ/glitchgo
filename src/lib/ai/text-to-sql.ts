import { GoogleGenAI } from '@google/genai';
import { Client } from 'pg';
import { getWorkspaceToken, getConnection, getWorkspace, incrementWorkspaceQueryCount } from '../db/supabase-workspaces';
import { decrypt } from '../encryption/aes';

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
export async function postToSlack(channel: string, text: string, token: string, threadTs?: string): Promise<string | null> {
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
        ...(threadTs ? { thread_ts: threadTs } : {})
      })
    });
    
    const data = await res.json();
    if (data.ok) {
      return data.ts;
    } else {
      console.error('Error posting response to Slack:', data.error);
      return null;
    }
  } catch (err) {
    console.error('Network error posting response to Slack:', err);
    return null;
  }
}

// Update an existing Slack message in place
export async function updateSlackMessage(channel: string, ts: string, text: string, token: string): Promise<boolean> {
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
        text
      })
    });
    
    const data = await res.json();
    if (data.ok) {
      return true;
    } else {
      console.error('Error updating Slack message:', data.error);
      return false;
    }
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
  
  const data = await res.json();
  const choice = data.choices?.[0]?.message?.content;
  if (!choice) {
    throw new Error('DeepSeek API returned empty response.');
  }
  
  // Clean thinking tags from DeepSeek R1 models if used via Groq/OpenRouter
  let cleanResult = choice.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
  
  // Strip markdown code blocks
  cleanResult = cleanResult.replace(/```sql/gi, '')
                           .replace(/```/g, '')
                           .trim();
                           
  return cleanResult;
}

/**
 * Escalates to Gemini 1.5 Pro to correct failed SQL query based on pg error logs.
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
    model: 'gemini-1.5-pro',
    contents: dbaPrompt,
    config: {
      systemInstruction: 'You are a Senior DBA and expert PostgreSQL query corrector. Return ONLY raw SQL, no markdown blocks, no explanations.',
      temperature: 0.1,
    }
  });
  
  let correctedSql = (response.text || '').trim();
  
  // Clean markdown blocks if outputted
  correctedSql = correctedSql.replace(/```sql/gi, '')
                             .replace(/```/g, '')
                             .trim();
                             
  return correctedSql;
}

/**
 * Core handler to process user slack command, translate to SQL using DeepSeek, execute, and fallback to Gemini Pro on failure.
 */
export async function handleSlackMessage(channel: string, text: string, userId: string, teamId: string) {
  // Strip bot user mention from incoming message (e.g. <@U123456>)
  const cleanText = text.replace(/<@U[A-Z0-9]+>/g, '').trim();
  console.log('--- handleSlackMessage (Dynamic Router) Started ---');
  console.log(`Channel: ${channel}`);
  console.log(`Clean Text: "${cleanText}"`);
  console.log(`User ID: ${userId}`);
  console.log(`Team ID: ${teamId}`);
  
  // 1. Retrieve the bot access token for this workspace
  let token: string | null = null;
  try {
    token = await getWorkspaceToken(teamId);
  } catch (dbErr) {
    console.error('Error fetching workspace token from Supabase:', dbErr);
  }
  
  // Fallback to static bot token from env to support single-tenant installs/testing
  token = token || process.env.SLACK_BOT_TOKEN || null;
  
  if (!token) {
    console.error(`Cannot process message: Slack bot token is missing for team ID: ${teamId}`);
    return;
  }

  // Retrieve workspace usage/quota details from Supabase
  let workspace: any = null;
  if (teamId) {
    try {
      workspace = await getWorkspace(teamId);
    } catch (dbErr) {
      console.error('Error fetching workspace quota details:', dbErr);
    }
  }

  const queryCount = workspace?.query_count ?? 0;
  const maxQueries = workspace?.max_queries ?? 30; // Default Free limit is 30 queries

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
    console.log('Clean text is empty. Posting greeting to Slack...');
    await postToSlack(channel, `Hi <@${userId}>! Ask me a database query, for example: "How many users signed up last week?"`, token);
    return;
  }
  
  let messageTs: string | null = null;
  try {
    // 2. Retrieve connection mapping from Supabase
    console.log('Searching connection for channel ID in Supabase...');
    const conn = await getConnection(channel);
    
    if (!conn) {
      console.log(`No connection mapping found for channel ${channel}. Posting error to Slack...`);
      await postToSlack(channel, `❌ Channel **${channel}** is not mapped to any database connection. Map this channel in the AdminZero config portal.`, token);
      return;
    }
    
    const { client_name, encrypted_pg_url, schema_hint } = conn;
    console.log(`Supabase query finished. Mapped connection name: "${client_name}"`);
    
    // Post initial placeholder message to Slack and save ts
    console.log('Posting placeholder notice to Slack...');
    messageTs = await postToSlack(channel, `🔍 _Analyzing data..._`, token);
    if (!messageTs) {
      console.error('Failed to post initial message to Slack.');
      return;
    }

    // Decrypt connection URL
    const pgUrl = decrypt(encrypted_pg_url as string);
    
    let deepseekSql = '';
    let executeSuccess = false;
    let queryErrorText = '';
    
    // --- STEP 1: FAST LANE (DEEPSEEK V3) ---
    try {
      console.log('Attempting SQL translation using DeepSeek V3...');
      deepseekSql = await generateSQLWithDeepSeek(schema_hint || 'No schema hint provided.', cleanText);
      console.log(`DeepSeek generated raw query:\n${deepseekSql}`);
      
      // Refuse modifications at deepseek layer if caught
      if (deepseekSql.includes('SECURITY ALERT') || deepseekSql.includes('requires database modification')) {
        throw new Error('Refused: AdminZero is restricted to read-only queries.');
      }
      
      // Apply auto limit
      const deepseekFinalSql = applyAutoLimit(deepseekSql);
      
      // Run security scanner
      if (!isQuerySafe(deepseekFinalSql)) {
        throw new Error('Blocked by local safety scanner: Query is not read-only.');
      }
      
      // Update placeholder to executing state
      await updateSlackMessage(
        channel,
        messageTs,
        `⚙️ _Executing generated query:_\n\`\`\`sql\n${deepseekFinalSql}\n\`\`\``,
        token
      );
      
      // Execute query on PostgreSQL
      console.log('Executing DeepSeek SQL on database...');
      const rows = await executeQuery(pgUrl, deepseekFinalSql);
      console.log(`DeepSeek query completed successfully. Returned ${rows.length} rows.`);
      
      const formattedResults = formatSlackResults(rows);
      const successMsg = `✅ **Query Results:**\n${formattedResults}\n\n_Executed SQL (DeepSeek V3):_\n\`\`\`sql\n${deepseekFinalSql}\n\`\`\``;
      
      await updateSlackMessage(channel, messageTs, successMsg, token);
      executeSuccess = true;
      
      // Increment workspace usage
      if (teamId) {
        await incrementWorkspaceQueryCount(teamId);
      }
      
    } catch (deepseekErr: any) {
      console.warn('DeepSeek Fast Lane failed or query crashed. Message:', deepseekErr.message);
      queryErrorText = deepseekErr.message;
      // Do not update Slack or alert the user. Move immediately to escalation.
    }
    
    // --- STEP 2: HEAVY LIFTER ESCALATION (GEMINI PRO REPAIR) ---
    if (!executeSuccess) {
      try {
        console.log('Escalating to Gemini 1.5 Pro to repair query...');
        
        // Notify Slack we are repairing
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
        console.log(`Gemini Pro corrected query:\n${correctedSql}`);
        
        if (correctedSql.includes('SECURITY ALERT') || correctedSql.includes('requires database modification')) {
          throw new Error('Refused: AdminZero is restricted to read-only queries.');
        }
        
        const geminiFinalSql = applyAutoLimit(correctedSql);
        
        // Run security scanner on Gemini corrected SQL
        if (!isQuerySafe(geminiFinalSql)) {
          throw new Error('Blocked by local safety scanner: Corrected query is not read-only.');
        }
        
        // Notify Slack we are running the repaired query
        await updateSlackMessage(
          channel,
          messageTs,
          `⚙️ _Executing corrected query:_\n\`\`\`sql\n${geminiFinalSql}\n\`\`\``,
          token
        );
        
        // Execute on PostgreSQL
        console.log('Executing Gemini corrected SQL on database...');
        const rows = await executeQuery(pgUrl, geminiFinalSql);
        console.log(`Gemini query completed successfully. Returned ${rows.length} rows.`);
        
        const formattedResults = formatSlackResults(rows);
        const successMsg = `✅ **Query Results:**\n${formattedResults}\n\n_Executed SQL (Gemini Pro Corrected):_\n\`\`\`sql\n${geminiFinalSql}\n\`\`\``;
        
        await updateSlackMessage(channel, messageTs, successMsg, token);
        
        // Increment workspace usage
        if (teamId) {
          await incrementWorkspaceQueryCount(teamId);
        }
        
      } catch (geminiErr: any) {
        console.error('Gemini repair cycle failed. Message:', geminiErr.message);
        
        const finalFailureMsg = `❌ AdminZero encountered an issue with that complex query. Please try simplifying your request.`;
        await updateSlackMessage(channel, messageTs, finalFailureMsg, token);
      }
    }
    
  } catch (err: any) {
    console.error('Error in handleSlackMessage dynamic router wrapper:', err);
    const internalErrorMsg = `❌ **Internal Error:** ${err.message}`;
    if (messageTs) {
      await updateSlackMessage(channel, messageTs, internalErrorMsg, token);
    } else {
      await postToSlack(channel, internalErrorMsg, token);
    }
  }
}

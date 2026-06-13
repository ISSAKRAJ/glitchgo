import { GoogleGenAI } from '@google/genai';
import { Client } from 'pg';
import { getWorkspaceToken, getConnection } from '../db/supabase-workspaces';
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

// Post response back to Slack using a dynamic workspace token
export async function postToSlack(channel: string, text: string, token: string, threadTs?: string) {
  if (!token) {
    console.error('No Slack token provided to postToSlack.');
    return;
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
    if (!data.ok) {
      console.error('Error posting response to Slack:', data.error);
    }
  } catch (err) {
    console.error('Network error posting response to Slack:', err);
  }
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
 * Core handler to process user slack command, translate to SQL, execute, and respond.
 */
export async function handleSlackMessage(channel: string, text: string, userId: string, teamId: string) {
  // Strip bot user mention from incoming message (e.g. <@U123456>)
  const cleanText = text.replace(/<@U[A-Z0-9]+>/g, '').trim();
  console.log('--- handleSlackMessage Started ---');
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
  
  if (!cleanText) {
    console.log('Clean text is empty. Posting greeting to Slack...');
    await postToSlack(channel, `Hi <@${userId}>! Ask me a database query, for example: "How many users signed up last week?"`, token);
    return;
  }
  
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
    
    // Send a typing/processing update to Slack
    console.log('Posting translation start notice to Slack...');
    await postToSlack(channel, `🔍 _Translating query for database: "${client_name}"..._`, token);

    // 3. Initialize Gemini API client
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('Gemini API key is not configured.');
      await postToSlack(channel, `❌ Gemini API key is not configured on the server.`, token);
      return;
    }
    
    const ai = new GoogleGenAI({ apiKey });
    
    // 4. Prompt Gemini to translate to SQL
    const prompt = `Database Schema:\n${schema_hint || 'No schema hint provided.'}\n\nUser Question: "${cleanText}"`;
    console.log('Sending request to Gemini model (gemini-2.5-flash)...');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        temperature: 0.1,
      }
    });
    
    const resultSql = (response.text || '').trim();
    console.log(`Gemini raw response text:\n${resultSql}`);
    
    // 5. Handle Gemini refusal
    if (resultSql.includes('SECURITY ALERT') || resultSql.includes('requires database modification')) {
      console.warn('Gemini safety refusal triggered.');
      await postToSlack(channel, `⚠️ **Security Alert**: This action requires database modification. AdminZero is restricted to read-only queries.`, token);
      return;
    }
    
    // 6. Run Secondary Security Scanner Check
    console.log('Running secondary safety scanner...');
    if (!isQuerySafe(resultSql)) {
      console.warn('Secondary safety scanner blocked the query:', resultSql);
      await postToSlack(channel, `⚠️ **Security Alert**: The generated query was blocked by local safety protocols.\nGenerated Query: \`${resultSql}\``, token);
      return;
    }
    
    // Send execution state update
    console.log('Generated SQL is safe. Posting execution start to Slack...');
    await postToSlack(channel, `⚙️ _Executing generated query:_\n\`\`\`sql\n${resultSql}\n\`\`\``, token);

    // 7. Decrypt connection URL and run query on PostgreSQL
    console.log('Decrypting database connection string...');
    const pgUrl = decrypt(encrypted_pg_url as string);
    console.log('Connecting to PostgreSQL database...');
    const pgClient = new Client({
      connectionString: pgUrl,
      connectionTimeoutMillis: 10000,
      ssl: { rejectUnauthorized: false }
    });
    
    await pgClient.connect();
    console.log('Successfully connected to PostgreSQL database. Executing query...');
    
    try {
      const queryRes = await pgClient.query({
        text: resultSql
      });
      
      const rows = queryRes.rows;
      console.log(`Query completed successfully. Returned ${rows.length} rows.`);
      const formattedResults = formatSlackResults(rows);
      
      console.log('Posting results table to Slack...');
      await postToSlack(channel, `✅ **Query Results:**\n${formattedResults}`, token);
      console.log('Posted results to Slack successfully!');
    } catch (queryErr: any) {
      console.error('PostgreSQL execution error:', queryErr);
      await postToSlack(channel, `❌ **Database Query Error:**\n\`\`\`\n${queryErr.message}\n\`\`\``, token);
    } finally {
      await pgClient.end();
      console.log('Closed PostgreSQL connection.');
    }
    
  } catch (err: any) {
    console.error('Error in handleSlackMessage:', err);
    await postToSlack(channel, `❌ **Internal Error:** ${err.message}`, token);
  }
}

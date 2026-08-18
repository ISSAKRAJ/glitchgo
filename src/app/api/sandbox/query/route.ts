import { NextResponse } from 'next/server';
import { createClient } from '@libsql/client';
import { GoogleGenAI } from '@google/genai';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, demo_mode, features = {}, db_url, db_dialect, apiKey } = body;

    // ── MODE B: CUSTOM DATABASE (PROXY TO REAL BACKEND) ──
    if (!demo_mode) {
      const backendUrl = process.env.EXPRESS_API_URL || 'http://localhost:5000';
      try {
        const backendRes = await fetch(`${backendUrl}/api/v1/query`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          },
          body: JSON.stringify({ prompt, db_url, db_dialect, features })
        });
        
        const data = await backendRes.json();
        return NextResponse.json(data, { status: backendRes.status });
      } catch (err: any) {
        return NextResponse.json({ 
          error: `Could not connect to live backend (${backendUrl}). Make sure EXPRESS_API_URL is configured in Vercel.`,
          code: 'BACKEND_UNREACHABLE'
        }, { status: 502 });
      }
    }

    // ── MODE A: ADMINZERO IN-MEMORY DATABASE DEMO ──
    const usePromptFirewall = features.use_prompt_firewall !== false;
    const usePiiScrubber = features.use_pii_scrubber !== false;
    const useAstFirewall = features.use_ast_firewall !== false;
    
    let sanitizedPrompt = prompt;
    let piiScrubbed = false;
    
    // 1. Simulate Prompt Firewall
    if (usePromptFirewall) {
      const lowerPrompt = prompt.toLowerCase();
      if (lowerPrompt.includes('ignore') || lowerPrompt.includes('instructions') || lowerPrompt.includes('bypass')) {
        return NextResponse.json({
          error: '[AdminZero Firewall] THREAT BLOCKED: Prompt injection attempt detected.',
          code: 'PROMPT_INJECTION',
          threatType: 'ROLE_HIJACKING'
        }, { status: 403 });
      }
    }

    // 2. Simulate PII Scrubber
    if (usePiiScrubber) {
      // Very basic regex to match emails and phones
      const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
      const phoneRegex = /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/g;
      
      const beforeLength = sanitizedPrompt.length;
      sanitizedPrompt = sanitizedPrompt.replace(emailRegex, '[REDACTED_EMAIL]');
      sanitizedPrompt = sanitizedPrompt.replace(phoneRegex, '[REDACTED_PHONE]');
      
      if (sanitizedPrompt.length !== beforeLength) {
        piiScrubbed = true;
      }
    }

    // 3. Text to SQL via Gemini
    let generatedSQL = "SELECT 'Query failed to generate' as error;";
    const geminiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;
    
    if (geminiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const systemInstruction = `You are a secure SQLite compiler. Convert the natural language question into a safe, read-only SQL SELECT query. Only return raw SQL.`;
        
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: sanitizedPrompt,
          config: { systemInstruction }
        });

        generatedSQL = (response.text || '').trim().replace(/^```sql\s*/i, '').replace(/```$/, '').trim();
      } catch (e) {
        console.error("Gemini Demo Error", e);
      }
    } else {
      // Fallback if API key is missing
      if (prompt.toLowerCase().includes('active users')) {
        generatedSQL = "SELECT * FROM enterprise_users WHERE active = 1 LIMIT 5;";
      } else if (prompt.toLowerCase().includes('admins')) {
        generatedSQL = "SELECT email, phone FROM enterprise_users WHERE role = 'admin';";
      } else if (prompt.toLowerCase().includes('delete') || prompt.toLowerCase().includes('drop')) {
        generatedSQL = "DELETE FROM enterprise_users WHERE id = 1; DROP TABLE enterprise_users;";
      } else {
        generatedSQL = "SELECT * FROM enterprise_users LIMIT 5;";
      }
    }

    // 4. Simulate AST Firewall
    if (useAstFirewall) {
      const upperSql = generatedSQL.toUpperCase();
      if (upperSql.includes('INSERT') || upperSql.includes('UPDATE') || upperSql.includes('DELETE') || upperSql.includes('DROP')) {
        return NextResponse.json({
          error: 'Syntax violation: DML statements are strictly prohibited.',
          code: 'AST_FIREWALL_BLOCKED',
          sql: generatedSQL
        }, { status: 403 });
      }
    }

    // 5. Execute on In-Memory Database
    let queryResult: any = [];
    try {
      const memDb = createClient({ url: 'file::memory:?cache=shared' });
      await memDb.execute(`CREATE TABLE IF NOT EXISTS enterprise_users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, role TEXT, active BOOLEAN)`);
      
      // Clear existing records in case this runs multiple times
      await memDb.execute(`DELETE FROM enterprise_users`);
      
      await memDb.execute(`INSERT INTO enterprise_users (name, email, phone, role, active) VALUES 
        ('John Doe', 'john.doe@enterprise.com', '+1-555-0198', 'admin', 1),
        ('Jane Smith', 'jane.smith@enterprise.com', '+1-555-0199', 'admin', 1),
        ('Bob Wilson', 'bwilson@corp.com', '+1-555-0200', 'user', 1)`);
        
      const res = await memDb.execute(generatedSQL);
      queryResult = res.rows;
      
      // Post-execution PII redaction (simulating proxy egress redaction)
      if (usePiiScrubber) {
        queryResult = queryResult.map((row: any) => {
          const cleanRow: any = { ...row };
          for (const key in cleanRow) {
            if (typeof cleanRow[key] === 'string') {
               const emailRegex = /([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi;
               const phoneRegex = /(?:\+?1[-. ]?)?\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})/g;
               cleanRow[key] = cleanRow[key].replace(emailRegex, '[REDACTED_EMAIL]').replace(phoneRegex, '[REDACTED_PHONE]');
            }
          }
          return cleanRow;
        });
      }
    } catch (e: any) {
      return NextResponse.json({
        error: `Sandbox DB Error: ${e.message}`,
        code: 'DB_ERROR',
        sql: generatedSQL
      }, { status: 500 });
    }

    return NextResponse.json({
      status: 'success',
      sql: generatedSQL,
      data: queryResult,
      meta: {
        rowsReturned: queryResult.length,
        executionMs: 42,
        piiScrubbed: piiScrubbed || usePiiScrubber
      }
    });

  } catch (err: any) {
    console.error("Sandbox API Error:", err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

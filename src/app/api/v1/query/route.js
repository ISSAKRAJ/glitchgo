/**
 * AdminZero Cloud SaaS Proxy — Main Query Endpoint
 * POST /api/v1/query
 *
 * Combines:
 *  1. License key auth + credit enforcement (AI API Gateway)
 *  2. Prompt Injection Firewall (LLM01 protection)
 *  3. PII Scrubber (strips PII before LLM sees it)
 *  4. Gemini text-to-SQL conversion
 *  5. AST SQL Firewall (blocks dangerous queries)
 *  6. DB execution (Postgres or MySQL)
 *  7. Compliance Audit Trail (full log to Supabase)
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GoogleGenAI } from '@google/genai';
import pg from 'pg';
import { scrubPII } from '../../../../lib/pii-scrubber.js';
import { scanPrompt } from '../../../../lib/prompt-firewall.js';
import { validateQuery, validateQueryMySQL } from '../../../../lib/ast-firewall.js';

const { Client } = pg;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// In-memory rate limiter: licenseKey → { count, windowStart }
const rateLimitMap = new Map();
const RATE_LIMIT_PER_MINUTE = 30;

function checkRateLimit(licenseKey) {
  const now = Date.now();
  const window = 60_000; // 1 minute
  const entry = rateLimitMap.get(licenseKey);

  if (!entry || now - entry.windowStart > window) {
    rateLimitMap.set(licenseKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - 1 };
  }

  if (entry.count >= RATE_LIMIT_PER_MINUTE) {
    return { allowed: false, remaining: 0 };
  }

  entry.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_PER_MINUTE - entry.count };
}

async function logAuditEvent(event) {
  try {
    await supabase.from('query_logs').insert([{
      workspace_id: event.licenseKey,
      user_prompt: event.prompt?.substring(0, 1000),
      generated_sql: event.sql?.substring(0, 2000),
      status: event.status,
      threat_type: event.threatType || null,
      pii_detected: event.piiDetected || false,
      pii_types: event.piiTypes || [],
      execution_ms: event.executionMs || 0,
      rows_returned: event.rowsReturned || 0,
      created_at: new Date().toISOString()
    }]);
  } catch (err) {
    console.error('[AdminZero] Audit log write failed:', err.message);
  }
}

export async function POST(req) {
  const startTime = Date.now();
  const auditEvent = { status: 'unknown', prompt: '', sql: '', piiDetected: false, piiTypes: [] };

  try {
    const body = await req.json();
    const {
      prompt,
      license_key,
      db_url,       // optional override — if not provided, uses stored one
      db_dialect = 'postgres',
      blocked_tables = [],
      mode = 'sql'  // 'sql' | 'passthrough'
    } = body;

    // ── 0. Basic validation ──────────────────────────────────────────────
    if (!license_key) {
      return NextResponse.json({ error: 'Missing license_key header.' }, { status: 401 });
    }
    if (!prompt) {
      return NextResponse.json({ error: 'Missing prompt in request body.' }, { status: 400 });
    }

    auditEvent.licenseKey = license_key;
    auditEvent.prompt = prompt;

    // ── 1. Rate Limiting (AI API Gateway) ───────────────────────────────
    const rateCheck = checkRateLimit(license_key);
    if (!rateCheck.allowed) {
      await logAuditEvent({ ...auditEvent, status: 'rate_limited', threatType: 'RATE_LIMIT_EXCEEDED' });
      return NextResponse.json(
        { error: 'Rate limit exceeded. Maximum 30 requests per minute per license key.', code: 'RATE_LIMITED' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0', 'X-RateLimit-Reset': '60' } }
      );
    }

    // ── 2. License Key Validation + Credit Check ─────────────────────────
    const { data: workspace, error: wsError } = await supabase
      .from('workspaces')
      .select('*')
      .eq('team_id', license_key)
      .single();

    if (wsError || !workspace) {
      await logAuditEvent({ ...auditEvent, status: 'blocked', threatType: 'INVALID_LICENSE' });
      return NextResponse.json({ error: 'Invalid or unregistered license key.', code: 'INVALID_LICENSE' }, { status: 401 });
    }

    const creditsUsed = workspace.query_count || 0;
    const creditsMax = workspace.max_queries || 500;
    if (creditsUsed >= creditsMax) {
      await logAuditEvent({ ...auditEvent, status: 'blocked', threatType: 'QUOTA_EXCEEDED', licenseKey: license_key });
      return NextResponse.json(
        { error: `Query quota exceeded (${creditsUsed}/${creditsMax}). Top up at glitchgo.tech/portal`, code: 'QUOTA_EXCEEDED' },
        { status: 402 }
      );
    }

    // ── 3. Prompt Injection Firewall ─────────────────────────────────────
    const promptScan = scanPrompt(prompt);
    if (!promptScan.safe) {
      const topThreat = promptScan.threats[0];
      await logAuditEvent({
        ...auditEvent,
        status: 'blocked',
        threatType: `PROMPT_INJECTION:${topThreat.type}`,
        licenseKey: license_key
      });
      return NextResponse.json({
        error: '[AdminZero Firewall] THREAT BLOCKED: Prompt injection attempt detected.',
        code: 'PROMPT_INJECTION',
        threatType: topThreat.type,
        severity: topThreat.severity,
        riskScore: promptScan.riskScore
      }, { status: 403 });
    }

    // ── 4. PII Scrubber ──────────────────────────────────────────────────
    const piiResult = scrubPII(prompt);
    const sanitizedPrompt = piiResult.sanitized;
    auditEvent.piiDetected = piiResult.count > 0;
    auditEvent.piiTypes = piiResult.detectedTypes;

    // ── 5. Resolve DB connection ─────────────────────────────────────────
    const resolvedDbUrl = db_url || workspace.db_url;
    const resolvedDialect = db_dialect || workspace.db_dialect || 'postgres';
    const resolvedBlockedTables = blocked_tables.length > 0
      ? blocked_tables
      : (workspace.blocked_tables || '').split(',').map(t => t.trim()).filter(Boolean);

    if (!resolvedDbUrl) {
      return NextResponse.json(
        { error: 'No database URL configured. Add your DB URL in the portal or pass db_url in the request.', code: 'NO_DB_URL' },
        { status: 400 }
      );
    }

    // ── 6. Text-to-SQL via Gemini ────────────────────────────────────────
    let generatedSQL = sanitizedPrompt; // fallback: treat as raw SQL

    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey && mode === 'sql') {
      try {
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const systemInstruction = `You are a secure ${resolvedDialect} SQL compiler. 
Convert the user's natural language question into a safe, read-only SQL SELECT query.
Rules:
- Output ONLY the raw SQL. No markdown, no backticks, no explanation.
- Only SELECT statements are allowed.
- Never generate INSERT, UPDATE, DELETE, DROP, ALTER, TRUNCATE, or GRANT statements.
- If the question cannot be answered with a SELECT, respond with: SELECT 'Query not allowed' as error;`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: sanitizedPrompt,
          config: { systemInstruction }
        });

        generatedSQL = (response.text || '').trim().replace(/^```sql\s*/i, '').replace(/```$/, '').trim();
      } catch (geminiErr) {
        console.error('[AdminZero] Gemini error:', geminiErr.message);
        // Fallback to treating prompt as raw SQL
      }
    }

    auditEvent.sql = generatedSQL;

    // ── 7. AST SQL Firewall ──────────────────────────────────────────────
    try {
      if (resolvedDialect === 'postgres') {
        validateQuery(generatedSQL, resolvedBlockedTables);
      } else {
        validateQueryMySQL(generatedSQL, resolvedBlockedTables);
      }
    } catch (firewallErr) {
      await logAuditEvent({
        ...auditEvent,
        status: 'blocked',
        threatType: 'AST_FIREWALL',
        licenseKey: license_key,
        executionMs: Date.now() - startTime
      });

      // Increment threat counter
      await supabase.from('workspaces')
        .update({ threats_blocked: (workspace.threats_blocked || 0) + 1 })
        .eq('team_id', license_key);

      return NextResponse.json({
        error: firewallErr.message,
        code: 'AST_FIREWALL_BLOCKED',
        sql: generatedSQL
      }, { status: 403 });
    }

    // ── 8. Database Execution ────────────────────────────────────────────
    let queryResult = [];
    try {
      if (resolvedDialect === 'postgres') {
        const client = new Client({
          connectionString: resolvedDbUrl,
          connectionTimeoutMillis: 8000,
          ssl: resolvedDbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
        });
        await client.connect();
        const dbRes = await client.query(generatedSQL);
        queryResult = dbRes.rows;
        await client.end();
      } else {
        // MySQL — dynamic import to keep bundle lean
        const mysql = await import('mysql2/promise');
        const connection = await mysql.default.createConnection(resolvedDbUrl);
        const [rows] = await connection.execute(generatedSQL);
        queryResult = rows;
        await connection.end();
      }
    } catch (dbErr) {
      await logAuditEvent({
        ...auditEvent,
        status: 'db_error',
        threatType: 'DB_EXECUTION_ERROR',
        licenseKey: license_key,
        executionMs: Date.now() - startTime
      });
      return NextResponse.json(
        { error: `Database execution failed: ${dbErr.message}`, code: 'DB_ERROR', sql: generatedSQL },
        { status: 500 }
      );
    }

    const executionMs = Date.now() - startTime;

    // ── 9. Deduct Credit + Log Success ──────────────────────────────────
    await supabase.from('workspaces')
      .update({ query_count: creditsUsed + 1 })
      .eq('team_id', license_key);

    await logAuditEvent({
      ...auditEvent,
      status: 'success',
      licenseKey: license_key,
      executionMs,
      rowsReturned: Array.isArray(queryResult) ? queryResult.length : 1
    });

    // ── 10. Return Response ──────────────────────────────────────────────
    return NextResponse.json({
      status: 'success',
      sql: generatedSQL,
      data: queryResult,
      meta: {
        rowsReturned: Array.isArray(queryResult) ? queryResult.length : 1,
        executionMs,
        creditsUsed: creditsUsed + 1,
        creditsRemaining: creditsMax - creditsUsed - 1,
        piiScrubbed: piiResult.count > 0,
        piiTypesFound: piiResult.detectedTypes,
        rateLimit: { remaining: rateCheck.remaining, resetInSeconds: 60 }
      }
    }, {
      status: 200,
      headers: {
        'X-AdminZero-Credits-Remaining': String(creditsMax - creditsUsed - 1),
        'X-AdminZero-PII-Scrubbed': String(piiResult.count > 0),
        'X-RateLimit-Remaining': String(rateCheck.remaining)
      }
    });

  } catch (err) {
    console.error('[AdminZero /api/v1/query] Unhandled error:', err);
    await logAuditEvent({ ...auditEvent, status: 'error', threatType: 'INTERNAL_ERROR' });
    return NextResponse.json(
      { error: 'Internal server error.', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AdminZero Cloud Query Gateway',
    version: '2.0.0',
    status: 'operational',
    features: ['pii-scrubber', 'prompt-firewall', 'ast-firewall', 'text-to-sql', 'audit-trail', 'rate-limiting'],
    docs: 'https://glitchgo.tech/guide',
    endpoint: 'POST /api/v1/query',
    required: { license_key: 'string', prompt: 'string' },
    optional: { db_url: 'string', db_dialect: 'postgres|mysql', blocked_tables: 'string[]', mode: 'sql|passthrough' }
  });
}

import { Router, Request, Response } from 'express';
import { supabase } from '../lib/supabase.js';
import { 
  getWorkspace, 
  getAllWorkspaces, 
  adminUpdateWorkspace 
} from '../lib/db.js';
import { scrubPII } from '../lib/pii-scrubber.js';
import { scanPrompt } from '../lib/prompt-firewall.js';
import { validateQuery, validateQueryMySQL } from '../lib/ast-firewall.js';
import { GoogleGenAI } from '@google/genai';
import pg from 'pg';
import mysql from 'mysql2/promise';

export const apiRouter = Router();

// In-memory rate limiter: licenseKey → { count, windowStart }
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT_PER_MINUTE = 30;

setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now - entry.windowStart > 60_000) rateLimitMap.delete(key);
  }
}, 300000).unref();

function checkRateLimit(licenseKey: string) {
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

async function logAuditEvent(event: any) {
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
  } catch (err: any) {
    console.error('[AdminZero] Audit log write failed:', err.message);
  }
}

/**
 * Helper to authenticate Super Admin request
 */
async function authenticateSuperAdmin(req: Request): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;
    
    return user.email === 'issakrajraj@gmail.com';
  } catch (err) {
    return false;
  }
}

/**
 * POST /v1/query
 * AdminZero Cloud API Gateway for Render
 */
apiRouter.post('/v1/query', async (req: Request, res: Response) => {
  const startTime = Date.now();
  const auditEvent = { status: 'unknown', prompt: '', sql: '', piiDetected: false, piiTypes: [] as string[], licenseKey: '', threatType: '', executionMs: 0, rowsReturned: 0 };

  try {
    const {
      prompt,
      license_key,
      db_url,
      db_dialect = 'postgres',
      blocked_tables = [],
      mode = 'sql',
      features = {}
    } = req.body;
    
    const usePromptFirewall = features.use_prompt_firewall !== false;
    const usePiiScrubber = features.use_pii_scrubber !== false;
    const useAstFirewall = features.use_ast_firewall !== false;

    // Calculate Compute Cost
    const queryCost = 1 + (usePiiScrubber ? 1 : 0) + (usePromptFirewall ? 1 : 0) + (useAstFirewall ? 2 : 0);

    // ── 0. Basic validation ──────────────────────────────────────────────
    if (!license_key) {
      return res.status(401).json({ error: 'Missing license_key parameter.' });
    }
    if (!prompt) {
      return res.status(400).json({ error: 'Missing prompt in request body.' });
    }

    auditEvent.licenseKey = license_key;
    auditEvent.prompt = prompt;

    // ── 1. Rate Limiting ───────────────────────────────
    const rateCheck = checkRateLimit(license_key);
    if (!rateCheck.allowed) {
      logAuditEvent({ ...auditEvent, status: 'rate_limited', threatType: 'RATE_LIMIT_EXCEEDED' });
      res.set('X-RateLimit-Remaining', '0');
      res.set('X-RateLimit-Reset', '60');
      return res.status(429).json({ error: 'Rate limit exceeded. Maximum 30 requests per minute.', code: 'RATE_LIMITED' });
    }
    res.set('X-RateLimit-Remaining', String(rateCheck.remaining));

    // ── 2. License Key Validation + Credit Check ─────────────────────────
    const workspace = await getWorkspace(license_key);
    if (!workspace) {
      logAuditEvent({ ...auditEvent, status: 'blocked', threatType: 'INVALID_LICENSE' });
      return res.status(401).json({ error: 'Invalid or unregistered license key.', code: 'INVALID_LICENSE' });
    }

    const creditsUsed = workspace.query_count || 0;
    const creditsMax = workspace.max_queries || 500;
    if (creditsUsed + queryCost > creditsMax) {
      logAuditEvent({ ...auditEvent, status: 'blocked', threatType: 'QUOTA_EXCEEDED' });
      return res.status(402).json({ error: `Insufficient compute credits. Request requires ${queryCost} credits, but only ${creditsMax - creditsUsed} remaining.`, code: 'QUOTA_EXCEEDED' });
    }

    // ── 3. Prompt Injection Firewall ─────────────────────────────────────
    if (usePromptFirewall) {
      const promptScan = scanPrompt(prompt);
      if (!promptScan.safe) {
        const topThreat = promptScan.threats[0];
        logAuditEvent({
          ...auditEvent,
          status: 'blocked',
          threatType: `PROMPT_INJECTION:${topThreat.type}`
        });
        return res.status(403).json({
          error: '[AdminZero Firewall] THREAT BLOCKED: Prompt injection attempt detected.',
          code: 'PROMPT_INJECTION',
          threatType: topThreat.type,
          severity: topThreat.severity,
          riskScore: promptScan.riskScore
        });
      }
    }

    // ── 4. PII Scrubber ──────────────────────────────────────────────────
    let sanitizedPrompt = prompt;
    let piiScrubbed = false;
    let piiTypesFound: string[] = [];
    if (usePiiScrubber) {
      const piiResult = scrubPII(prompt);
      sanitizedPrompt = piiResult.sanitized;
      piiScrubbed = piiResult.count > 0;
      piiTypesFound = piiResult.detectedTypes;
      auditEvent.piiDetected = piiScrubbed;
      auditEvent.piiTypes = piiTypesFound;
    }

    // ── 5. Resolve DB connection ─────────────────────────────────────────
    const resolvedDbUrl = db_url || workspace.db_url;
    const resolvedDialect = db_dialect || workspace.db_dialect || 'postgres';
    const resolvedBlockedTables = blocked_tables.length > 0
      ? blocked_tables
      : (workspace.blocked_tables || '').split(',').map((t: string) => t.trim()).filter(Boolean);

    if (!resolvedDbUrl) {
      return res.status(400).json({ error: 'No database URL configured.', code: 'NO_DB_URL' });
    }

    // ── 6. Text-to-SQL via Gemini ────────────────────────────────────────
    let generatedSQL = sanitizedPrompt; 

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
      } catch (geminiErr: any) {
        console.error('[AdminZero] Gemini error:', geminiErr.message);
      }
    }

    auditEvent.sql = generatedSQL;

    // ── 7. AST SQL Firewall ──────────────────────────────────────────────
    if (useAstFirewall) {
      try {
        if (resolvedDialect === 'postgres') {
          validateQuery(generatedSQL, resolvedBlockedTables);
        } else {
          validateQueryMySQL(generatedSQL, resolvedBlockedTables);
        }
      } catch (firewallErr: any) {
        logAuditEvent({
          ...auditEvent,
          status: 'blocked',
          threatType: 'AST_FIREWALL',
          executionMs: Date.now() - startTime
        });
        adminUpdateWorkspace(license_key, { threats_blocked: (workspace.threats_blocked || 0) + 1 });
        return res.status(403).json({ error: firewallErr.message, code: 'AST_FIREWALL_BLOCKED', sql: generatedSQL });
      }
    }

    // ── 8. Database Execution ────────────────────────────────────────────
    let queryResult: any = [];
    try {
      if (resolvedDialect === 'postgres') {
        const { Client } = pg;
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
        const connection = await mysql.createConnection(resolvedDbUrl);
        const [rows] = await connection.execute(generatedSQL);
        queryResult = rows;
        await connection.end();
      }
    } catch (dbErr: any) {
      logAuditEvent({
        ...auditEvent,
        status: 'db_error',
        threatType: 'DB_EXECUTION_ERROR',
        executionMs: Date.now() - startTime
      });
      return res.status(500).json({ error: `Database execution failed: ${dbErr.message}`, code: 'DB_ERROR', sql: generatedSQL });
    }

    const executionMs = Date.now() - startTime;

    // ── 9. Deduct Credit + Log Success ──────────────────────────────────
    adminUpdateWorkspace(license_key, { query_count: creditsUsed + queryCost });

    logAuditEvent({
      ...auditEvent,
      status: 'success',
      executionMs,
      rowsReturned: Array.isArray(queryResult) ? queryResult.length : 1
    });

    res.set('X-AdminZero-Credits-Remaining', String(creditsMax - creditsUsed - queryCost));
    res.set('X-AdminZero-PII-Scrubbed', String(piiScrubbed));

    // ── 10. Return Response ──────────────────────────────────────────────
    return res.status(200).json({
      status: 'success',
      sql: generatedSQL,
      data: queryResult,
      meta: {
        rowsReturned: Array.isArray(queryResult) ? queryResult.length : 1,
        executionMs,
        creditsUsed: creditsUsed + queryCost,
        creditsRemaining: creditsMax - creditsUsed - queryCost,
        piiScrubbed: piiScrubbed,
        piiTypesFound: piiTypesFound,
        queryCost: queryCost,
        rateLimit: { remaining: rateCheck.remaining, resetInSeconds: 60 }
      }
    });

  } catch (err: any) {
    console.error('[AdminZero /v1/query] Unhandled error:', err);
    logAuditEvent({ ...auditEvent, status: 'error', threatType: 'INTERNAL_ERROR' });
    return res.status(500).json({ error: 'Internal server error.', code: 'INTERNAL_ERROR' });
  }
});

/**
 * POST /api/v1/license/sync
 * Syncs usage credits and threat metrics from downloadable local agents.
 */
apiRouter.post('/v1/license/sync', async (req: Request, res: Response) => {
  try {
    const { licenseKey, queryCountIncrement, threatsBlockedIncrement } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ active: false, error: 'Missing licenseKey parameter.' });
    }

    // 1. Fetch license workspace details
    const ws = await getWorkspace(licenseKey);
    if (!ws) {
      return res.status(404).json({ active: false, error: 'License key not registered.' });
    }

    // 2. Increment query counts
    const increment = Number(queryCountIncrement) || 0;
    const newQueryCount = (ws.query_count || 0) + increment;
    await adminUpdateWorkspace(licenseKey, { query_count: newQueryCount });

    // 3. Log query telemetry logs
    if (Number(threatsBlockedIncrement) > 0) {
      await supabase.from('query_logs').insert([{
        workspace_id: licenseKey,
        user_prompt: `Blocked ${threatsBlockedIncrement} malicious P2SQL injection attempts locally.`,
        status: 'failed'
      }]);
    } else if (increment > 0) {
      await supabase.from('query_logs').insert([{
        workspace_id: licenseKey,
        user_prompt: `Processed ${increment} database transactions safely.`,
        status: 'success'
      }]);
    }

    // 4. Calculate limit status
    const active = newQueryCount < (ws.max_queries || 500);
    const creditsRemaining = Math.max(0, (ws.max_queries || 500) - newQueryCount);

    return res.status(200).json({
      active,
      creditsRemaining,
      tier: ws.tier
    });

  } catch (err: any) {
    console.error('Error syncing license:', err);
    return res.status(500).json({ active: false, error: err.message || 'License sync failed.' });
  }
});

/**
 * GET /api/admin/workspaces
 * Restricted to super admin: retrieves all client licenses with user emails mapped.
 */
apiRouter.get('/admin/workspaces', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await authenticateSuperAdmin(req);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Access Denied: Super Admin authentication failed.' });
    }

    // 1. Fetch all workspaces
    const workspaces = await getAllWorkspaces();

    // 2. Fetch all user profile emails
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.warn('Auth admin listUsers failed, returning workspaces without emails:', usersError);
    }

    const mapped = workspaces.map(ws => {
      const matchedUser = users?.find((u: any) => u.id === ws.user_id);
      return {
        ...ws,
        email: matchedUser ? matchedUser.email : 'Unknown / Deleted User'
      };
    });

    return res.status(200).json({ success: true, workspaces: mapped });

  } catch (err: any) {
    console.error('Error fetching admin workspaces:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/admin/workspaces/update
 * Restricted to super admin: updates quotas and tiers.
 */
apiRouter.post('/admin/workspaces/update', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await authenticateSuperAdmin(req);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Access Denied: Super Admin authentication failed.' });
    }

    const { teamId, tier, maxQueries, queryCount } = req.body;
    if (!teamId) {
      return res.status(400).json({ success: false, error: 'Missing teamId parameter.' });
    }

    await adminUpdateWorkspace(teamId, {
      tier,
      max_queries: Number(maxQueries),
      query_count: Number(queryCount)
    });

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Error updating admin workspace:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

/**
 * GET /v1/logs
 * Returns full query audit logs for a license key, or a CSV if format=csv
 */
apiRouter.get('/v1/logs', async (req: Request, res: Response) => {
  try {
    const licenseKey = req.query.license_key as string;
    const format = req.query.format as string;
    const status = req.query.status as string;
    const threatType = req.query.threat_type as string;
    const piiOnly = req.query.pii_only === 'true';
    const limit = Math.min(parseInt((req.query.limit as string) || '50'), 1000);
    const offset = parseInt((req.query.offset as string) || '0');

    if (!licenseKey) {
      return res.status(400).json({ error: 'Missing license_key query param.' });
    }

    const workspace = await getWorkspace(licenseKey);
    if (!workspace) {
      return res.status(401).json({ error: 'Invalid license key.' });
    }

    let query = supabase
      .from('query_logs')
      .select('*', { count: 'exact' })
      .eq('workspace_id', licenseKey)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (threatType) query = query.eq('threat_type', threatType);
    if (piiOnly) query = query.eq('pii_detected', true);

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      return res.status(500).json({ error: 'Failed to fetch logs.' });
    }

    if (format === 'csv') {
      const headers = ['Timestamp', 'Prompt', 'SQL', 'Status', 'Threat Type', 'PII Detected', 'PII Types', 'Rows', 'Exec Ms'];
      const rows = (logs || []).map(l => [
        l.created_at,
        `"${(l.user_prompt || '').replace(/"/g, "'")}"`,
        `"${(l.generated_sql || '').replace(/"/g, "'")}"`,
        l.status,
        l.threat_type || '',
        l.pii_detected ? 'YES' : 'NO',
        (l.pii_types || []).join(';'),
        l.rows_returned || 0,
        l.execution_ms || 0
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="adminzero-audit-${licenseKey}-${Date.now()}.csv"`);
      return res.send(csv);
    }

    return res.status(200).json({ logs: logs || [], total: count || 0 });

  } catch (err) {
    console.error('[AdminZero /v1/logs] Error:', err);
    return res.status(500).json({ error: 'Internal server error.' });
  }
});


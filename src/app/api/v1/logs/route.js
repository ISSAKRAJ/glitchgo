/**
 * AdminZero Compliance Audit Trail
 * GET /api/v1/logs
 *
 * Returns full query audit logs for a license key.
 * Supports filtering by status, date range, threat type.
 * Used by the portal dashboard and compliance reports.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseKey = searchParams.get('license_key');
    const status = searchParams.get('status');          // success|blocked|error
    const threatType = searchParams.get('threat_type'); // AST_FIREWALL|PROMPT_INJECTION etc
    const piiOnly = searchParams.get('pii_only') === 'true';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 200);
    const offset = parseInt(searchParams.get('offset') || '0');
    const from = searchParams.get('from'); // ISO date
    const to = searchParams.get('to');     // ISO date

    if (!licenseKey) {
      return NextResponse.json({ error: 'Missing license_key query param.' }, { status: 400 });
    }

    // Validate license key exists
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('team_id, tier, query_count, threats_blocked, pii_events')
      .eq('team_id', licenseKey)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: 'Invalid license key.' }, { status: 401 });
    }

    // Build query
    let query = supabase
      .from('query_logs')
      .select('*', { count: 'exact' })
      .eq('workspace_id', licenseKey)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);
    if (threatType) query = query.eq('threat_type', threatType);
    if (piiOnly) query = query.eq('pii_detected', true);
    if (from) query = query.gte('created_at', from);
    if (to) query = query.lte('created_at', to);

    const { data: logs, error: logsError, count } = await query;

    if (logsError) {
      return NextResponse.json({ error: 'Failed to fetch logs.' }, { status: 500 });
    }

    // Compute stats summary
    const allLogs = logs || [];
    const blockedCount = allLogs.filter(l => l.status === 'blocked').length;
    const piiCount = allLogs.filter(l => l.pii_detected).length;
    const threatTypes = [...new Set(allLogs.filter(l => l.threat_type).map(l => l.threat_type))];

    return NextResponse.json({
      logs: allLogs,
      pagination: {
        total: count || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (count || 0)
      },
      summary: {
        licenseKey,
        tier: workspace.tier,
        totalQueriesAllTime: workspace.query_count || 0,
        threatsBlockedAllTime: workspace.threats_blocked || 0,
        piiEventsAllTime: workspace.pii_events || 0,
        inThisPage: {
          total: allLogs.length,
          blocked: blockedCount,
          piiDetected: piiCount,
          threatTypesFound: threatTypes
        }
      }
    });

  } catch (err) {
    console.error('[AdminZero /api/v1/logs] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// Export logs as CSV for compliance reports
export async function POST(req) {
  try {
    const body = await req.json();
    const { license_key, format = 'json' } = body;

    if (!license_key) {
      return NextResponse.json({ error: 'Missing license_key.' }, { status: 400 });
    }

    const { data: logs } = await supabase
      .from('query_logs')
      .select('*')
      .eq('workspace_id', license_key)
      .order('created_at', { ascending: false })
      .limit(1000);

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

      return new Response(csv, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="adminzero-audit-${license_key}-${Date.now()}.csv"`
        }
      });
    }

    return NextResponse.json({ logs: logs || [], total: logs?.length || 0 });

  } catch (err) {
    console.error('[AdminZero /api/v1/logs POST] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

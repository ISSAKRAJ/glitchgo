/**
 * AdminZero License Sync Endpoint
 * POST /api/v1/license/sync
 *
 * Called by the AdminZero desktop app to:
 * - Validate license key
 * - Sync query count increments
 * - Get current tier, credits remaining, active status
 * - Log threats blocked from local agent
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(req) {
  try {
    const body = await req.json();
    const {
      licenseKey,
      queryCountIncrement = 0,
      threatsBlockedIncrement = 0
    } = body;

    if (!licenseKey) {
      return NextResponse.json({ error: 'Missing licenseKey.' }, { status: 400 });
    }

    // Fetch workspace
    const { data: workspace, error } = await supabase
      .from('workspaces')
      .select('*')
      .eq('team_id', licenseKey)
      .single();

    if (error || !workspace) {
      return NextResponse.json({
        active: false,
        error: 'License key not found.',
        code: 'INVALID_LICENSE'
      }, { status: 401 });
    }

    // Build updated fields
    const updates = {};
    if (queryCountIncrement > 0) {
      updates.query_count = (workspace.query_count || 0) + queryCountIncrement;
    }
    if (threatsBlockedIncrement > 0) {
      updates.threats_blocked = (workspace.threats_blocked || 0) + threatsBlockedIncrement;
    }

    if (Object.keys(updates).length > 0) {
      await supabase
        .from('workspaces')
        .update(updates)
        .eq('team_id', licenseKey);
    }

    const currentCount = (updates.query_count ?? workspace.query_count) || 0;
    const maxQueries = workspace.max_queries || 500;
    const creditsRemaining = Math.max(0, maxQueries - currentCount);
    const active = creditsRemaining > 0;

    return NextResponse.json({
      active,
      tier: workspace.tier || 'free',
      creditsRemaining,
      queryCount: currentCount,
      maxQueries,
      threatsBlocked: (updates.threats_blocked ?? workspace.threats_blocked) || 0,
      syncedAt: new Date().toISOString()
    });

  } catch (err) {
    console.error('[AdminZero /api/v1/license/sync] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const licenseKey = searchParams.get('key');

  if (!licenseKey) {
    return NextResponse.json({ error: 'Missing key parameter.' }, { status: 400 });
  }

  const { data: workspace } = await supabase
    .from('workspaces')
    .select('tier, query_count, max_queries, threats_blocked')
    .eq('team_id', licenseKey)
    .single();

  if (!workspace) {
    return NextResponse.json({ active: false, error: 'Invalid license.' }, { status: 401 });
  }

  const creditsRemaining = Math.max(0, (workspace.max_queries || 500) - (workspace.query_count || 0));

  return NextResponse.json({
    active: creditsRemaining > 0,
    tier: workspace.tier || 'free',
    creditsRemaining,
    queryCount: workspace.query_count || 0,
    maxQueries: workspace.max_queries || 500,
    threatsBlocked: workspace.threats_blocked || 0
  });
}

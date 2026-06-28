import { NextRequest, NextResponse } from 'next/server';
import { supabase as anonSupabase } from '../../../../lib/supabase';
import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const dbClient = supabaseServiceKey ? createClient(supabaseUrl, supabaseServiceKey, { auth: { persistSession: false, autoRefreshToken: false } }) : anonSupabase;
export async function GET(req: NextRequest) {
  try {
    const { data: workspaces, error: workspacesError } = await dbClient.from('workspaces').select('*');
    const { data: connections, error: connectionsError } = await dbClient.from('connections').select('*');
    const envDebug = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: supabaseServiceKey ? 'Configured' : 'MISSING',
      NEXT_PUBLIC_SLACK_CLIENT_ID: process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || 'MISSING',
      SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || 'MISSING',
      SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET ? 'Configured' : 'MISSING',
      SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ? 'Configured' : 'MISSING',
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? 'Configured' : 'MISSING',
    };
    return NextResponse.json({ status: 'success', environment: envDebug, workspaces: workspaces || [], workspacesError: workspacesError || null, connections: connections || [], connectionsError: connectionsError || null });
  } catch (err: any) {
    return NextResponse.json({ status: 'error', message: err.message }, { status: 500 });
  }
}

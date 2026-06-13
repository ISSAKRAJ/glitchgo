import { NextRequest, NextResponse } from 'next/server';
import { getAllConnections, saveConnection } from '../../../../lib/db/supabase-workspaces';

/**
 * GET /api/adminzero/connections
 * Returns a list of database connections (masking the encrypted connection URLs).
 */
export async function GET() {
  try {
    const result = await getAllConnections();
    
    const connections = result.map(row => ({
      id: row.id,
      client_name: row.client_name,
      schema_hint: row.schema_hint,
      created_at: row.created_at,
    }));
    
    return NextResponse.json({ success: true, connections });
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/adminzero/connections
 * Creates or updates a connection in SQLite.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, client_name, pg_url, schema_hint } = body;
    
    if (!id || !client_name || !pg_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields: id, client_name, pg_url' }, { status: 400 });
    }
    
    // Save mapping directly to Supabase connection registry
    await saveConnection(id, client_name, pg_url, schema_hint);
    
    return NextResponse.json({ success: true, message: 'Connection saved successfully' });
  } catch (error: any) {
    console.error('Error saving connection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

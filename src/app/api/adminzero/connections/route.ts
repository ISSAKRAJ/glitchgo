import { NextRequest, NextResponse } from 'next/server';
import { getAllConnections, saveConnection } from '../../../../lib/db/supabase-workspaces';
import { supabase } from '../../../../lib/supabase';

// Helper to authenticate request using Bearer token
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (err) {
    console.error('Error authenticating user in API route:', err);
    return null;
  }
}

/**
 * GET /api/adminzero/connections
 * Returns a list of database connections (masking the encrypted connection URLs) for the logged-in user.
 */
export async function GET(req: NextRequest) {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const result = await getAllConnections(userId);
    
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
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid or missing token' }, { status: 401 });
    }

    const body = await req.json();
    const { id, client_name, pg_url, schema_hint } = body;
    
    if (!id || !client_name || !pg_url) {
      return NextResponse.json({ success: false, error: 'Missing required fields: id, client_name, pg_url' }, { status: 400 });
    }
    
    // Save mapping directly to Supabase connection registry, passing userId
    await saveConnection(id, client_name, pg_url, schema_hint, userId);
    
    return NextResponse.json({ success: true, message: 'Connection saved successfully' });
  } catch (error: any) {
    console.error('Error saving connection:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}


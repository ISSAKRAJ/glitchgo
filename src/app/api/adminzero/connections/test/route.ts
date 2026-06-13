import { NextRequest, NextResponse } from 'next/server';
import { Client } from 'pg';
import { getConnection } from '../../../../../lib/db/supabase-workspaces';
import { decrypt } from '../../../../../lib/encryption/aes';

/**
 * POST /api/adminzero/connections/test
 * Tests database connection given either a connection ID (already saved in SQLite) or a raw pg_url.
 */
export async function POST(req: NextRequest) {
  let client: Client | null = null;
  try {
    const body = await req.json();
    const { id, pg_url } = body;
    
    let connectionUrl = '';
    
    if (id) {
      const conn = await getConnection(id);
      
      if (!conn) {
        return NextResponse.json({ success: false, error: 'Connection ID not found' }, { status: 404 });
      }
      
      const encryptedUrl = conn.encrypted_pg_url;
      connectionUrl = decrypt(encryptedUrl);
    } else if (pg_url) {
      connectionUrl = pg_url;
    } else {
      return NextResponse.json({ success: false, error: 'Missing connection ID (id) or PostgreSQL URL (pg_url)' }, { status: 400 });
    }
    
    if (!connectionUrl.startsWith('postgresql://') && !connectionUrl.startsWith('postgres://')) {
      return NextResponse.json({ success: false, error: 'Invalid connection protocol. Must start with postgresql:// or postgres://' }, { status: 400 });
    }
    
    // Connect to PostgreSQL database to test connection
    client = new Client({
      connectionString: connectionUrl,
      connectionTimeoutMillis: 6000,
      ssl: {
        rejectUnauthorized: false // Bypasses self-signed certificate rejections commonly found on managed DBs
      }
    });
    
    await client.connect();
    
    // Run a basic test query
    const dbRes = await client.query('SELECT 1 as connected');
    
    return NextResponse.json({ 
      success: true, 
      message: 'Connection test successful!', 
      data: dbRes.rows[0] 
    });
  } catch (error: any) {
    console.error('Database connection test failed:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Connection failed. Please check credentials and try again.' 
    });
  } finally {
    if (client) {
      try {
        await client.end();
      } catch (err) {
        console.error('Error closing test DB client:', err);
      }
    }
  }
}

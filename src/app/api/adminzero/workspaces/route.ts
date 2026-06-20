import { NextRequest, NextResponse } from 'next/server';
import { getAllWorkspaces, adminUpdateWorkspace } from '../../../../lib/db/supabase-workspaces';
import { supabase } from '../../../../lib/supabase';

// Helper to authenticate request and verify super admin permissions
async function verifySuperAdmin(req: NextRequest): Promise<boolean> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return false;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return false;
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;

    const adminEmail = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'issakrajraj@gmail.com';
    return user.email?.toLowerCase().trim() === adminEmail.toLowerCase().trim();
  } catch (err) {
    console.error('Error verifying super admin permission:', err);
    return false;
  }
}

/**
 * GET /api/adminzero/workspaces
 * Returns a list of all Slack workspaces and subscription details. Restricted to Super Admin.
 */
export async function GET(req: NextRequest) {
  try {
    const isAdmin = await verifySuperAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const workspaces = await getAllWorkspaces();
    return NextResponse.json({ success: true, workspaces });
  } catch (error: any) {
    console.error('Error listing workspaces for admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/adminzero/workspaces
 * Admin override to manually update workspace subscriptions, reset counters, or revoke access.
 */
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await verifySuperAdmin(req);
    if (!isAdmin) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const body = await req.json();
    const { team_id, updates } = body;

    if (!team_id || !updates) {
      return NextResponse.json({ success: false, error: 'Missing required parameters: team_id, updates' }, { status: 400 });
    }

    console.log(`Admin update request for Team: ${team_id}, Updates:`, JSON.stringify(updates));
    await adminUpdateWorkspace(team_id, updates);

    return NextResponse.json({ success: true, message: 'Workspace updated successfully' });
  } catch (error: any) {
    console.error('Error updating workspace by admin:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { saveWorkspace } from '../../../../lib/db/supabase-workspaces';

/**
 * GET /api/slack/oauth
 * Redirect URI for Slack OAuth. Receives the authorization `code` and exchanges it for a permanent Bot token.
 */
export async function GET(req: NextRequest) {
  // Determine the correct host and protocol from proxy headers (so it redirects back to the HTTPS tunnel domain, not localhost HTTP)
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
  const proto = req.headers.get('x-forwarded-proto') || 'http';
  const redirectBase = `${proto}://${host}`;

  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam) {
      console.error('Slack OAuth error param received:', errorParam);
      return NextResponse.redirect(new URL(`/adminzero?error=${encodeURIComponent(errorParam)}`, redirectBase));
    }

    if (!code) {
      return new Response('Missing authorization code', { status: 400 });
    }

    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Slack Client ID or Client Secret is not configured.');
      return new Response('OAuth configuration error on server', { status: 500 });
    }

    console.log('Exchanging OAuth code for Slack access token...');
    
    // Exchange the code for an access token
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('code', code);

    // Bypass SSL rejects internally for the fetch if rejected leaf signature env is set
    const oauthRes = await fetch('https://slack.com/api/oauth.v2.access', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    });

    if (!oauthRes.ok) {
      const errorText = await oauthRes.text();
      console.error('Slack OAuth API response error:', errorText);
      return NextResponse.redirect(new URL(`/adminzero?error=oauth_fetch_failed`, redirectBase));
    }

    const data = await oauthRes.json();
    
    if (!data.ok) {
      console.error('Slack OAuth exchange failed:', data.error);
      return NextResponse.redirect(new URL(`/adminzero?error=${encodeURIComponent(data.error)}`, redirectBase));
    }

    const teamId = data.team?.id;
    const botAccessToken = data.access_token;
    const state = searchParams.get('state');

    if (!teamId || !botAccessToken) {
      console.error('Slack OAuth response is missing team ID or bot access token:', data);
      return NextResponse.redirect(new URL(`/adminzero?error=missing_credentials`, redirectBase));
    }

    console.log(`OAuth exchange successful! Team: ${data.team.name} (${teamId})`);

    // Save the workspace details securely in Supabase, linking to user_id if passed in state
    await saveWorkspace(teamId, botAccessToken, state || undefined);

    console.log(`Workspace details saved successfully for team ${teamId}.`);

    // Redirect user back to the admin page indicating installation success
    return NextResponse.redirect(new URL(`/adminzero?installed=true&team_id=${teamId}`, redirectBase));
    
  } catch (err: any) {
    console.error('Fatal error in Slack OAuth GET route:', err);
    return NextResponse.redirect(new URL(`/adminzero?error=internal_server_error`, redirectBase));
  }
}

import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { handleSlackMessage } from '../lib/text-to-sql.js';
import { saveWorkspace, getWorkspaceToken, getConnection } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';

export const slackRouter = Router();

// Cache to deduplicate Slack event retries
const processedEvents = new Set<string>();
const DEDUPLICATION_TIMEOUT = 1000 * 60 * 10; // 10 minutes

function verifySlackSignature(
  rawBody: string,
  signature: string | null,
  timestampStr: string | null,
  signingSecret: string | undefined
): boolean {
  if (!signingSecret) {
    console.warn('SLACK_SIGNING_SECRET is not configured.');
    return false;
  }
  if (!signature || !timestampStr) {
    return false;
  }
  
  const timestamp = parseInt(timestampStr, 10);
  const now = Math.floor(Date.now() / 1000);
  
  // Protect against replay attacks (5 minute window)
  if (Math.abs(now - timestamp) > 300) {
    console.warn('Slack request timestamp is outside the 5-minute window.');
    return false;
  }
  
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const hmac = crypto.createHmac('sha256', signingSecret);
  const mySignature = `v0=${hmac.update(sigBaseString).digest('hex')}`;
  
  // Timing safe comparison to block timing side-channel attacks
  try {
    return crypto.timingSafeEqual(Buffer.from(mySignature), Buffer.from(signature));
  } catch (e) {
    return false;
  }
}

/**
 * POST /api/slack/events
 * Slack Event Subscriptions webhook.
 */
slackRouter.post('/events', async (req: any, res: any) => {
  try {
    const body = req.body;
    
    // 1. Handle Slack URL Verification Challenge (url_verification) BEFORE signature checks
    if (body.type === 'url_verification') {
      return res.status(200).send(body.challenge);
    }
    
    // 2. Verify Slack Signature
    const signature = req.headers['x-slack-signature'] as string || null;
    const timestamp = req.headers['x-slack-request-timestamp'] as string || null;
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    
    // Allow bypassing signature check if explicitly configured (for testing/debugging)
    const bypassSignature = process.env.BYPASS_SLACK_SIGNATURE === 'true';
    
    if (signingSecret && !bypassSignature) {
      const rawBody = req.rawBody || JSON.stringify(body);
      if (!verifySlackSignature(rawBody, signature, timestamp, signingSecret)) {
        console.error('Slack event signature verification failed.');
        return res.status(401).send('Unauthorized');
      }
    } else {
      console.log('Skipping Slack signature verification (either signing secret is missing or BYPASS_SLACK_SIGNATURE is enabled)');
    }
    
    // 3. Handle Event Payload
    if (body.type === 'event_callback') {
      const event = body.event;
      const eventId = body.event_id;
      
      // Deduplicate retries from Slack
      if (processedEvents.has(eventId)) {
        console.log('Ignoring duplicate Slack event:', eventId);
        return res.status(200).send('Duplicate Event ignored');
      }
      processedEvents.add(eventId);
      setTimeout(() => processedEvents.delete(eventId), DEDUPLICATION_TIMEOUT);
      
      if (event && event.type === 'app_mention') {
        const { text, channel, user } = event;
        const teamId = body.team_id || '';
        
        console.log(`Received app_mention from user ${user} in channel ${channel} (Team: ${teamId}): "${text}"`);
        
        // Execute the ChatOps handler asynchronously without holding the connection!
        // This ensures the Express server responds with 200 OK immediately within Slack's 3-second limit.
        handleSlackMessage(channel, text, user, teamId).catch((err: any) => {
          console.error('Error processing Slack message in background:', err);
        });
      }
    }
    
    return res.status(200).send('OK');
  } catch (error: any) {
    console.error('Error handling Slack event POST:', error);
    return res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/slack/oauth/start
 * Initiates the Slack OAuth v2 flow by redirecting the client to Slack.
 * Loads Client ID at runtime.
 */
slackRouter.get('/oauth/start', (req: Request, res: Response) => {
  const host = (req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:5000') as string;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const redirectUri = `${proto}://${host}/api/slack/oauth`;
  
  const clientId = process.env.SLACK_CLIENT_ID || '11352040316962.11349992784470';
  const slackUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&scope=app_mentions:read,chat:write&redirect_uri=${encodeURIComponent(redirectUri)}`;
  
  return res.redirect(slackUrl);
});

/**
 * GET /api/slack/oauth
 * OAuth redirect callback. Receives the authorization code and exchanges it.
 */
slackRouter.get('/oauth', async (req: Request, res: any) => {
  const host = (req.headers['x-forwarded-host'] || req.headers['host'] || 'localhost:5000') as string;
  const proto = req.headers['x-forwarded-proto'] || 'http';
  const redirectBase = `${proto}://${host.replace(':5000', ':3000')}`; // Redirect back to Next.js port in dev, or same host in prod
  
  try {
    const code = req.query.code as string;
    const errorParam = req.query.error as string;
    
    if (errorParam) {
      console.error('Slack OAuth error parameter received:', errorParam);
      return res.redirect(`${redirectBase}/adminzero?error=${encodeURIComponent(errorParam)}`);
    }
    
    if (!code) {
      return res.status(400).send('Missing authorization code');
    }
    
    const clientId = process.env.SLACK_CLIENT_ID;
    const clientSecret = process.env.SLACK_CLIENT_SECRET;
    
    if (!clientId || !clientSecret) {
      console.error('Slack Client ID or Client Secret is not configured.');
      return res.status(500).send('OAuth configuration error on server');
    }
    
    console.log('Exchanging OAuth code for Slack access token...');
    
    const formData = new URLSearchParams();
    formData.append('client_id', clientId);
    formData.append('client_secret', clientSecret);
    formData.append('code', code);
    
    // Add matching redirect_uri (required by Slack OAuth v2 spec if present in the start URL)
    const redirectUri = `${proto}://${host}/api/slack/oauth`;
    formData.append('redirect_uri', redirectUri);
    
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
      return res.redirect(`${redirectBase}/adminzero?error=oauth_fetch_failed`);
    }
    
    const data = (await oauthRes.json()) as any;
    
    if (!data.ok) {
      console.error('Slack OAuth exchange failed:', data.error);
      return res.redirect(`${redirectBase}/adminzero?error=${encodeURIComponent(data.error)}`);
    }
    
    const teamId = data.team?.id;
    const botAccessToken = data.access_token;
    const state = req.query.state as string;
    
    if (!teamId || !botAccessToken) {
      console.error('Slack OAuth response is missing team ID or bot access token:', data);
      return res.redirect(`${redirectBase}/adminzero?error=missing_credentials`);
    }
    
    console.log(`OAuth exchange successful! Team: ${data.team.name} (${teamId})`);
    
    // Save token dynamically to database using Service Role
    await saveWorkspace(teamId, botAccessToken, state || undefined);
    
    console.log(`Workspace details saved successfully for team ${teamId}.`);
    
    return res.redirect(`${redirectBase}/adminzero?installed=true&team_id=${teamId}`);
    
  } catch (err: any) {
    console.error('Fatal error in Slack OAuth route:', err);
    return res.redirect(`${redirectBase}/adminzero?error=internal_server_error`);
  }
});

/**
 * GET /api/slack/debug
 * Server and Database telemetry checks.
 */
slackRouter.get('/debug', async (req: Request, res: any) => {
  try {
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('team_id');
      
    const { data: connections, error: connectionsError } = await supabase
      .from('connections')
      .select('id, client_name');

    const envDebug = {
      NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configured' : 'MISSING',
      SLACK_CLIENT_ID: process.env.SLACK_CLIENT_ID || 'MISSING',
      SLACK_CLIENT_SECRET: process.env.SLACK_CLIENT_SECRET ? 'Configured' : 'MISSING',
      SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET ? 'Configured' : 'MISSING',
      SLACK_BOT_TOKEN: process.env.SLACK_BOT_TOKEN ? 'Configured' : 'MISSING',
    };

    return res.json({
      status: 'success',
      environment: envDebug,
      workspaces: workspaces || [],
      workspacesError: workspacesError || null,
      connections: connections || [],
      connectionsError: connectionsError || null,
    });
  } catch (err: any) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
});

/**
 * POST /api/slack/interactions
 * Slack Block Kit interactive element callbacks.
 */
slackRouter.post('/interactions', async (req: Request, res: any) => {
  try {
    let payload: any = null;
    if (req.body && req.body.payload) {
      payload = JSON.parse(req.body.payload);
    } else {
      payload = req.body;
    }
    
    console.log('--- Slack Interaction Webhook Triggered ---');
    console.log('Received Slack Interactive payload:', JSON.stringify(payload));
    
    if (payload && payload.actions && payload.actions.length > 0) {
      const action = payload.actions[0];
      
      if (action.action_id === 'adminzero_share_insight') {
        const valData = action.value ? JSON.parse(action.value) : {};
        console.log(`Successfully intercepted insight sharing for query: "${valData.query}" in team: ${valData.teamId}`);
        
        const responseUrl = payload.response_url;
        if (responseUrl) {
          fetch(responseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              replace_original: false,
              text: `🔗 *Public Insight Generated:* An anonymized, public link for this query has been generated! View and share it here: https://glitchgo.tech/shared/${payload.trigger_id || 'preview'}`
            })
          }).catch(fetchErr => {
            console.error('Failed to post interactive response back to Slack:', fetchErr);
          });
        }
      } else if (action.action_id === 'adminzero_report_issue') {
        const valData = action.value ? JSON.parse(action.value) : {};
        console.log(`[REPORT ISSUE] Slack user clicked 'Report Issue' button.`);
        
        const responseUrl = payload.response_url;
        if (responseUrl) {
          fetch(responseUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              replace_original: false,
              text: `✅ *Issue Reported:* Our engineering team has been notified of this error. Thank you!`
            })
          }).catch(fetchErr => {
            console.error('Failed to post report acknowledgement back to Slack:', fetchErr);
          });
        }
      }
    }
    
    return res.status(200).send('OK');
  } catch (err: any) {
    console.error('Error handling Slack interaction webhook:', err);
    return res.status(500).send('Internal Server Error');
  }
});


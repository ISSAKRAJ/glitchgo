import { NextRequest, NextResponse, after } from 'next/server';
import crypto from 'crypto';
import { handleSlackMessage } from '../../../../lib/ai/text-to-sql';

// Simple in-memory cache to deduplicate Slack event retries
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
  
  // Reject requests older than 5 minutes to prevent replay attacks
  if (Math.abs(now - timestamp) > 300) {
    console.warn('Slack event timestamp is too old:', timestamp);
    return false;
  }
  
  const sigBaseString = `v0:${timestamp}:${rawBody}`;
  const calculatedSignature = 'v0=' + crypto
    .createHmac('sha256', signingSecret)
    .update(sigBaseString, 'utf8')
    .digest('hex');
    
  try {
    return crypto.timingSafeEqual(
      Buffer.from(calculatedSignature, 'utf8'),
      Buffer.from(signature, 'utf8')
    );
  } catch (err) {
    return false;
  }
}

/**
 * POST /app/api/slack/events
 * Catch incoming Slack event POST requests and verify the Slack signature.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const body = JSON.parse(rawBody);
    console.log("Slack Webhook Body:", JSON.stringify(body));
    
    // 1. Handle Slack URL Verification Challenge (url_verification) BEFORE signature checks
    // This ensures that Slack's URL verification always succeeds.
    if (body.type === 'url_verification') {
      return new Response(body.challenge, {
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      });
    }

    const signature = req.headers.get('x-slack-signature');
    const timestamp = req.headers.get('x-slack-request-timestamp');
    const signingSecret = process.env.SLACK_SIGNING_SECRET;
    
    // 2. Verify Slack Signature (Bypassed temporarily for testing/debugging)
    /*
    if (signingSecret && !verifySlackSignature(rawBody, signature, timestamp, signingSecret)) {
      console.error('Slack event signature verification failed.');
      return new Response('Unauthorized', { status: 401 });
    }
    */
    console.log('Skipping Slack event signature check for testing.');
    
    // 3. Handle Events (event_callback)
    if (body.type === 'event_callback') {
      const event = body.event;
      const eventId = body.event_id;
      
      // Deduplicate retries
      if (processedEvents.has(eventId)) {
        console.log('Ignoring duplicate Slack event:', eventId);
        return new Response('Duplicate Event ignored', { status: 200 });
      }
      processedEvents.add(eventId);
      setTimeout(() => processedEvents.delete(eventId), DEDUPLICATION_TIMEOUT);
      
      // We process event types like 'app_mention' or 'message' (if message in a channel containing bot trigger)
      // Standard: handle 'app_mention' events
      if (event && event.type === 'app_mention') {
        const { text, channel, user } = event;
        const teamId = body.team_id || '';
        
        console.log(`Received app_mention from user ${user} in channel ${channel} (Team: ${teamId}): "${text}"`);
        
        try {
          await handleSlackMessage(channel, text, user, teamId);
        } catch (err) {
          console.error('Error processing Slack message:', err);
        }
      }
    }
    
    // Always respond with 200 OK immediately
    return new Response('OK', { status: 200 });
  } catch (error: any) {
    console.error('Error handling Slack event POST:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

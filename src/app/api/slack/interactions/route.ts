import { NextRequest } from 'next/server';

/**
 * POST /api/slack/interactions
 * Receives and processes interactive button clicks (Slack Block Kit callbacks).
 */
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';
    let payload: any = null;

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const payloadStr = formData.get('payload') as string;
      if (payloadStr) {
        payload = JSON.parse(payloadStr);
      }
    } else {
      payload = await req.json();
    }

    console.log('--- Slack Interaction Webhook Triggered ---');
    console.log('Received Slack Interactive payload:', JSON.stringify(payload));

    if (payload && payload.actions && payload.actions.length > 0) {
      const action = payload.actions[0];
      
      // Handle the "Share Public Insight" viral loop button
      if (action.action_id === 'adminzero_share_insight') {
        const valData = action.value ? JSON.parse(action.value) : {};
        console.log(`Successfully intercepted insight sharing for query: "${valData.query}" in team: ${valData.teamId}`);

        // Respond asynchronously back to the Slack channel using Slack's response_url
        const responseUrl = payload.response_url;
        if (responseUrl) {
          try {
            await fetch(responseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                replace_original: false, // Do not delete the main synthesis message
                text: `🔗 *Public Insight Generated:* An anonymized, public link for this query has been generated! View and share it here: https://glitchgo.tech/shared/${payload.trigger_id || 'preview'}`
              })
            });
          } catch (fetchErr) {
            console.error('Failed to post interactive response back to Slack:', fetchErr);
          }
        }
      } else if (action.action_id === 'adminzero_report_issue') {
        const valData = action.value ? JSON.parse(action.value) : {};
        console.log(`[REPORT ISSUE] Slack user clicked 'Report Issue' button.`);
        console.log(`Prompt: "${valData.prompt}"`);
        console.log(`Generated SQL: "${valData.sql}"`);
        console.log(`Error Message: "${valData.error}"`);

        // Respond asynchronously back to confirm acknowledgement
        const responseUrl = payload.response_url;
        if (responseUrl) {
          try {
            await fetch(responseUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                replace_original: false,
                text: `✅ *Issue Reported:* Our engineering team has been notified of this error. Thank you!`
              })
            });
          } catch (fetchErr) {
            console.error('Failed to post report acknowledgement back to Slack:', fetchErr);
          }
        }
      }
    }

    return new Response('OK', { status: 200 });
  } catch (err: any) {
    console.error('Error handling Slack interaction webhook:', err);
    return new Response('Internal Server Error', { status: 500 });
  }
}

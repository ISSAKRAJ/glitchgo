import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { updateWorkspaceSubscription, resetWorkspaceSubscription } from '../../../../lib/db/supabase-workspaces';
import { supabase } from '../../../../lib/supabase';

export async function POST(req: NextRequest) {
  let rawBody: string;
  try {
    rawBody = await req.text();
  } catch (err: any) {
    console.error('Error reading raw webhook body:', err);
    return new Response('Internal Server Error', { status: 500 });
  }

  const signature = req.headers.get('x-signature');
  const webhookSecret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    console.error('Missing x-signature or LEMON_SQUEEZY_WEBHOOK_SECRET');
    return new Response('Webhook Secret or Signature Missing', { status: 400 });
  }

  // Verify signature using HMAC-SHA256
  const hmac = crypto.createHmac('sha256', webhookSecret);
  const digest = hmac.update(rawBody).digest('hex');

  let isVerified = false;
  try {
    isVerified = crypto.timingSafeEqual(
      Buffer.from(digest, 'hex'),
      Buffer.from(signature, 'hex')
    );
  } catch (err) {
    console.error('Signature comparison error:', err);
  }

  if (!isVerified) {
    console.error('Lemon Squeezy signature verification failed.');
    return new Response('Unauthorized: Invalid Signature', { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const eventName = payload.meta?.event_name;
  console.log(`Processing Lemon Squeezy Webhook Event: ${eventName}`);

  try {
    if (eventName === 'subscription_created' || eventName === 'subscription_updated') {
      const teamId = payload.meta?.custom_data?.team_id;
      const customerId = String(payload.data?.attributes?.customer_id);
      const subscriptionId = String(payload.data?.id);
      const variantId = String(payload.data?.attributes?.variant_id);
      const status = payload.data?.attributes?.status;

      // Handle trial or active states
      if (status !== 'active' && status !== 'on_trial' && status !== 'trialing') {
        console.log(`Subscription status is ${status}. Ignoring upgrade/update payload.`);
        return new Response('OK', { status: 200 });
      }

      let targetTeamId = teamId;

      // Fallback: If teamId is missing in custom_data (common on portal updates), lookup the workspace by subscription ID
      if (!targetTeamId) {
        try {
          const { data: wsData, error: wsError } = await supabase
            .from('workspaces')
            .select('team_id')
            .eq('stripe_subscription_id', subscriptionId)
            .single();

          if (!wsError && wsData) {
            targetTeamId = wsData.team_id;
            console.log(`Linked subscription update for Sub ID ${subscriptionId} back to Slack Team: ${targetTeamId}`);
          }
        } catch (err) {
          console.error('Error looking up workspace by subscription ID:', err);
        }
      }

      if (!targetTeamId) {
        console.warn(`Webhook received for event ${eventName} but could not link to a Slack team.`);
        return new Response('OK', { status: 200 });
      }

      let tier = 'pro';
      let maxQueries = 1000;
      const proVariantId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_PRO_VARIANT_ID;
      const bizVariantId = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_BIZ_VARIANT_ID;

      if (variantId && variantId === bizVariantId) {
        tier = 'business';
        maxQueries = 999999;
      } else if (variantId && variantId === proVariantId) {
        tier = 'pro';
        maxQueries = 1000;
      } else if (variantId && (variantId.toLowerCase().includes('biz') || variantId.toLowerCase().includes('business') || variantId.toLowerCase().includes('unlimited'))) {
        tier = 'business';
        maxQueries = 999999;
      }

      console.log(`Lemon Squeezy Sync: Team: ${targetTeamId}, Customer: ${customerId}, Sub: ${subscriptionId}, Tier: ${tier}, Max Queries: ${maxQueries}`);
      await updateWorkspaceSubscription(targetTeamId, customerId, subscriptionId, tier, maxQueries);

    } else if (eventName === 'subscription_cancelled' || eventName === 'subscription_expired') {
      const subscriptionId = String(payload.data?.id);

      console.log(`Lemon Squeezy Subscription Ended/Cancelled: ${subscriptionId}. Downgrading workspace to Free tier.`);
      await resetWorkspaceSubscription(subscriptionId);
    }

    return new Response('Success', { status: 200 });
  } catch (error: any) {
    console.error('Error handling Lemon Squeezy webhook event:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

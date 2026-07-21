import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { addWorkspaceCredits } from '../../../../lib/db/supabase-workspaces';

export async function POST(req: NextRequest) {
  try {
    const bodyText = await req.text();
    const params = new URLSearchParams(bodyText);
    const payload: Record<string, string> = {};
    params.forEach((value, key) => {
      payload[key] = value;
    });

    const receivedMac = payload['mac'];
    const status = payload['status']; // 'Credit' on success
    const purpose = payload['purpose'] || '';
    const amountStr = payload['amount'] || '0.00';
    const paymentId = payload['payment_id'];

    console.log(`[Instamojo Webhook] Received payment ID: ${paymentId}, Status: ${status}, Purpose: ${purpose}, Amount: ${amountStr}`);

    // Verify MAC Signature if SALT is configured
    const salt = process.env.INSTAMOJO_SALT;
    if (salt && receivedMac) {
      delete payload['mac'];
      const sortedKeys = Object.keys(payload).sort();
      const message = sortedKeys.map(k => payload[k]).join('|');

      const calculatedMac = crypto
        .createHmac('sha1', salt)
        .update(message)
        .digest('hex');

      if (receivedMac !== calculatedMac) {
        console.error('[Instamojo Webhook] Signature verification failed. MAC mismatch.');
        return new Response('Unauthorized: Invalid Signature', { status: 401 });
      }
      console.log('[Instamojo Webhook] Signature verified successfully.');
    } else {
      console.warn('[Instamojo Webhook] Skipping MAC signature check because INSTAMOJO_SALT is not configured.');
    }

    // Process only credited payments
    if (status !== 'Credit') {
      console.log(`[Instamojo Webhook] Ignoring payment status: ${status}`);
      return new Response('OK', { status: 200 });
    }

    // Parse team_id (workspace license key) from purpose: "Growth Pack top-up (az_lic_xyz)"
    const match = purpose.match(/\((az_lic_[a-z0-9]+)\)/i);
    const teamId = match ? match[1] : null;

    if (!teamId) {
      console.error(`[Instamojo Webhook] Failed to extract team_id from purpose: "${purpose}"`);
      return new Response('Missing Workspace ID context', { status: 400 });
    }

    // Map payment amount to corresponding credit package
    const amount = parseFloat(amountStr);
    let creditsToAdd = 100000; // Default Growth Pack fallback
    let newTier = 'pro';

    if (amount >= 1999) {
      creditsToAdd = 500000;
      newTier = 'team';
    } else if (amount >= 499) {
      creditsToAdd = 100000;
      newTier = 'pro';
    } else if (amount >= 99) {
      creditsToAdd = 15000;
      newTier = 'pro';
    } else {
      // General fallback: ₹1 = 200 credits
      creditsToAdd = Math.floor(amount * 200);
      newTier = 'pro';
    }

    console.log(`[Instamojo Webhook] Crediting Workspace: ${teamId} with +${creditsToAdd.toLocaleString()} queries. Elevating to tier: ${newTier}`);
    await addWorkspaceCredits(teamId, creditsToAdd, newTier);

    return new Response('OK', { status: 200 });

  } catch (error: any) {
    console.error('[Instamojo Webhook] Error processing event:', error);
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getWorkspace } from '../../../../lib/db/supabase-workspaces';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team_id } = body;

    if (!team_id) {
      return NextResponse.json({ error: 'Missing team_id' }, { status: 400 });
    }

    // Lookup workspace details to fetch the Lemon Squeezy Subscription ID (stored under stripe_subscription_id)
    const ws = await getWorkspace(team_id);
    if (!ws || !ws.stripe_subscription_id) {
      return NextResponse.json({ error: 'No active billing profile found for this workspace. Please subscribe first.' }, { status: 404 });
    }

    const subscriptionId = ws.stripe_subscription_id;
    const apiKey = process.env.LEMON_SQUEEZY_API_KEY;

    if (!apiKey) {
      console.error('LEMON_SQUEEZY_API_KEY is not configured on the server.');
      return NextResponse.json({ error: 'SaaS Billing API Key configuration error on the server.' }, { status: 500 });
    }

    console.log(`Requesting signed billing portal URL for Lemon Squeezy Subscription: ${subscriptionId}`);

    // Call the Lemon Squeezy API to fetch the subscription details (which contains the signed customer portal URL)
    const res = await fetch(`https://api.lemonsqueezy.com/v1/subscriptions/${subscriptionId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Accept': 'application/vnd.api+json',
        'Content-Type': 'application/vnd.api+json'
      }
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Lemon Squeezy API response failure:', errorText);
      return NextResponse.json({ error: 'Could not fetch portal URL from billing provider' }, { status: res.status });
    }

    const data = await res.json();
    const portalUrl = data?.data?.attributes?.urls?.customer_portal;

    if (!portalUrl) {
      console.error('Lemon Squeezy response did not contain customer_portal URL:', data);
      return NextResponse.json({ error: 'Billing portal URL is currently unavailable' }, { status: 500 });
    }

    return NextResponse.json({ url: portalUrl });
  } catch (error: any) {
    console.error('Error generating Lemon Squeezy portal redirect:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team_id, pack, email } = body;

    if (!team_id || !pack) {
      return NextResponse.json({ error: 'Missing team_id or pack' }, { status: 400 });
    }

    let amount = '499.00';
    let purpose = 'Growth Pack top-up';
    if (pack === 'starter') {
      amount = '99.00';
      purpose = 'Starter Pack top-up';
    } else if (pack === 'growth') {
      amount = '499.00';
      purpose = 'Growth Pack top-up';
    } else if (pack === 'scale') {
      amount = '1999.00';
      purpose = 'Scale Pack top-up';
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    const apiBaseUrl = process.env.INSTAMOJO_API_URL || 'https://test.instamojo.com/api/1.1/';
    const apiKey = process.env.INSTAMOJO_API_KEY || '';
    const authToken = process.env.INSTAMOJO_AUTH_TOKEN || '';

    const payload = new URLSearchParams();
    payload.append('purpose', `${purpose} (${team_id})`);
    payload.append('amount', amount);
    payload.append('buyer_name', 'GlitchGo Developer');
    payload.append('email', email || 'teamglitchgo@gmail.com');
    payload.append('redirect_url', `${origin}/portal?checkout_success=true&team_id=${team_id}`);
    payload.append('webhook', `${origin}/api/instamojo/webhook`);
    payload.append('allow_repeated_payments', 'false');

    const res = await fetch(`${apiBaseUrl.replace(/\/$/, '')}/payment-requests/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-Api-Key': apiKey,
        'X-Auth-Token': authToken
      },
      body: payload.toString()
    });

    const result = await res.json();
    if (result.success && result.payment_request?.longurl) {
      return NextResponse.json({ url: result.payment_request.longurl });
    } else {
      console.error('Instamojo order creation failed:', result);
      return NextResponse.json({ error: result.message || 'Failed to create Instamojo payment link' }, { status: 500 });
    }
  } catch (error: any) {
    console.error('Error generating Instamojo checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

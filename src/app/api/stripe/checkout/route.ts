import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { team_id, price_id } = body; // For Lemon Squeezy, price_id corresponds to the Variant ID

    if (!team_id || !price_id) {
      return NextResponse.json({ error: 'Missing team_id or price_id' }, { status: 400 });
    }

    const host = req.headers.get('x-forwarded-host') || req.headers.get('host') || 'localhost:3000';
    const proto = req.headers.get('x-forwarded-proto') || 'http';
    const origin = `${proto}://${host}`;

    // Get Lemon Squeezy Store Checkout base URL from environment
    const storeUrl = process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_URL || 'https://adminzero.lemonsqueezy.com';
    
    // Construct signed checkout link, appending team_id as custom data, and redirect_url on success
    const checkoutUrl = `${storeUrl.replace(/\/$/, '')}/checkout/buy/${price_id}?checkout[custom][team_id]=${team_id}&checkout[redirect_url]=${encodeURIComponent(origin + '/adminzero?checkout_success=true&team_id=' + team_id)}`;

    console.log(`Generated Lemon Squeezy Checkout Link for Team: ${team_id}, Variant ID: ${price_id}`);

    return NextResponse.json({ url: checkoutUrl });
  } catch (error: any) {
    console.error('Error generating Lemon Squeezy checkout link:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

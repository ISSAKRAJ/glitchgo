import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { supabase } from '../../../../../lib/supabase';

/**
 * POST /api/adminzero/services/verify-upi
 * Verifies a client service ticket payment (either via Gemini AI scan or manual UTR entry).
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { ticket_id, image, mime_type, manual_utr } = body;

    if (!ticket_id) {
      return NextResponse.json({ success: false, error: 'Missing ticket ID' }, { status: 400 });
    }

    // 1. Fetch ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from('client_requests')
      .select('*')
      .eq('id', ticket_id)
      .single();

    if (fetchError || !ticket) {
      return NextResponse.json({ success: false, error: 'Service request/ticket not found' }, { status: 404 });
    }

    if (!ticket.quoted_price) {
      return NextResponse.json({ success: false, error: 'No price has been quoted for this ticket yet.' }, { status: 400 });
    }

    // Parse the quoted price as a number
    const cleanPriceStr = ticket.quoted_price.toString().replace(/[^0-9.]/g, '');
    const numericPrice = parseFloat(cleanPriceStr);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid quoted price format on this ticket.' }, { status: 400 });
    }

    const targetUpiId = process.env.NEXT_PUBLIC_UPI_ID || '7013017818@naviaxis';

    // 2. Handle manual UTR submission
    if (manual_utr) {
      const utr = manual_utr.trim();
      if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
        return NextResponse.json({ success: false, error: 'Invalid UTR: Must be exactly 12 numeric digits.' }, { status: 400 });
      }

      // Check if this UTR has already been submitted in client_requests
      const { data: existingUtr, error: utrCheckError } = await supabase
        .from('client_requests')
        .select('id')
        .eq('payment_link', utr)
        .limit(1);

      if (existingUtr && existingUtr.length > 0) {
        return NextResponse.json({ success: false, error: 'Submission Rejected: This payment Reference/UTR has already been submitted before.' }, { status: 409 });
      }

      // Update the ticket to paid and save UTR in payment_link
      const { error: updateError } = await supabase
        .from('client_requests')
        .update({
          payment_link: utr,
          status: 'Paid'
        })
        .eq('id', ticket_id);

      if (updateError) {
        throw new Error(`Failed to update ticket: ${updateError.message}`);
      }

      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Success! Your payment reference has been submitted. Our team will verify it and begin working shortly.',
        utr
      });
    }

    // 3. Handle AI receipt scanning
    if (!image || !mime_type) {
      return NextResponse.json({ success: false, error: 'Missing required parameters for AI scan: image, mimeType' }, { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured on the server.');
      return NextResponse.json({ success: false, error: 'Server AI configuration error.' }, { status: 500 });
    }

    console.log(`Sending services UPI receipt to Gemini for Ticket: ${ticket_id}, Target UPI: ${targetUpiId}, Amount: ₹${numericPrice}`);

    let result;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a strict financial audit assistant. Analyze this UPI payment receipt screenshot and verify it strictly:
1. Recipient UPI ID: Verify if the payment is sent to "${targetUpiId}". Note that minor differences, missing domain names or formatting variations matching the digits/letters are acceptable (e.g. matching "7013017818" or "naviaxis").
2. Amount paid: Must be at least ₹${numericPrice} (INR).
3. Transaction status: Must show a successful payment status (e.g., "Success", "Completed", "Paid", "Done", "Transferred successfully", or a green checkmark). If it shows "Pending", "Failed", "Processing", or represents a fake template, reject it.
4. UTR/Transaction Ref: Extract the 12-digit UTR (UPI Transaction Reference / Transaction ID / Ref No). It must be exactly 12 numeric digits.

You MUST respond ONLY with a clean, raw JSON object matching the following schema (do not wrap in markdown code blocks, do not add conversational preamble):
{
  "isValid": true,
  "utr": "12-digit UTR extracted",
  "amount": 999,
  "recipient": "recipient UPI parsed",
  "reason": "if invalid, provide rejection reason in simple words"
}

If any of the verification criteria are not met, set "isValid" to false and provide the rejection reason.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            inlineData: {
              data: image,
              mimeType: mime_type
            }
          },
          prompt
        ]
      });

      const resultText = (response.text || '').trim();
      console.log('Gemini raw response text:', resultText);

      const cleanedText = resultText
        .replace(/^```json\s*/i, '')
        .replace(/```$/, '')
        .trim();

      result = JSON.parse(cleanedText);
    } catch (aiError: any) {
      console.error('Gemini AI Verification failed for services:', aiError);
      return NextResponse.json({
        success: false,
        fallbackRequired: true,
        error: 'AI verification service is temporarily busy. Please enter your 12-digit UTR number manually to verify.'
      });
    }

    if (!result.isValid) {
      console.warn(`Services UPI Receipt Rejected by Gemini: ${result.reason}`);
      return NextResponse.json({ success: false, error: `AI Verification Failed: ${result.reason || 'Invalid payment receipt.'}` }, { status: 400 });
    }

    const utr = (result.utr || '').trim();
    if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
      console.warn(`Gemini extracted invalid UTR number: ${utr}`);
      return NextResponse.json({ success: false, error: 'AI Verification Failed: Could not extract a valid 12-digit UPI Transaction ID (UTR) from the receipt. Make sure the UTR is clearly visible.' }, { status: 400 });
    }

    // Check if this UTR has already been submitted
    const { data: existingUtr, error: utrCheckError } = await supabase
      .from('client_requests')
      .select('id')
      .eq('payment_link', utr)
      .limit(1);

    if (existingUtr && existingUtr.length > 0) {
      console.warn(`Rejected duplicate UTR submission for services: ${utr}`);
      return NextResponse.json({ success: false, error: 'Submission Rejected: This payment receipt / Transaction ID has already been submitted and approved before.' }, { status: 409 });
    }

    // Save payment reference and mark paid
    const { error: updateError } = await supabase
      .from('client_requests')
      .update({
        payment_link: utr,
        status: 'Paid'
      })
      .eq('id', ticket_id);

    if (updateError) {
      throw new Error(`Failed to update ticket payment status: ${updateError.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `Success! Payment verified. Your ticket is now marked as Paid, and our team has been notified.`,
      utr
    });

  } catch (error: any) {
    console.error('Error in services UPI verification route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { checkUtrExists, adminUpdateWorkspace, getWorkspace } from '../../../../../lib/db/supabase-workspaces';
import { supabase } from '../../../../../lib/supabase';

// Helper to authenticate request using Bearer token
async function getUserIdFromRequest(req: NextRequest): Promise<string | null> {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return null;
    const token = authHeader.replace('Bearer ', '').trim();
    if (!token) return null;
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;
    return user.id;
  } catch (err) {
    console.error('Error authenticating user in verify API:', err);
    return null;
  }
}

/**
 * POST /api/adminzero/workspaces/verify-upi
 * Automatically verifies a UPI payment receipt upload using Gemini, extracts UTR, and upgrades workspace.
 */
export async function POST(req: NextRequest) {
  try {
    // 1. Authenticate the user session
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized: Invalid session' }, { status: 401 });
    }

    const body = await req.json();
    const { team_id, plan_type, image, mime_type, manual_utr } = body;

    if (!team_id || !plan_type) {
      return NextResponse.json({ success: false, error: 'Missing required parameters: team_id, plan_type' }, { status: 400 });
    }

    // 2. Fetch workspace details to verify it exists and belongs to the user
    const ws = await getWorkspace(team_id);
    if (!ws) {
      return NextResponse.json({ success: false, error: 'Workspace not found' }, { status: 404 });
    }
    if (ws.user_id !== userId) {
      return NextResponse.json({ success: false, error: 'Forbidden: You do not own this workspace' }, { status: 403 });
    }

    // Handle manual UTR fallback submission
    if (manual_utr) {
      const utr = manual_utr.trim();
      if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
        return NextResponse.json({ success: false, error: 'Invalid UTR: Must be exactly 12 numeric digits.' }, { status: 400 });
      }

      const utrExists = await checkUtrExists(utr);
      if (utrExists) {
        return NextResponse.json({ success: false, error: 'Submission Rejected: This payment Reference/UTR has already been submitted before.' }, { status: 409 });
      }

      // Save as pending manual approval
      await adminUpdateWorkspace(team_id, {
        tier: `pending_${plan_type}`,
        stripe_subscription_id: utr,
        stripe_customer_id: 'UPI_PENDING_MANUAL'
      });

      return NextResponse.json({
        success: true,
        pending: true,
        message: 'Success! Your payment reference has been submitted. An admin will review it and activate your workspace shortly.'
      });
    }

    if (!image || !mime_type) {
      return NextResponse.json({ success: false, error: 'Missing required parameters for AI scan: image, mime_type' }, { status: 400 });
    }

    // 3. Initialize Gemini Client
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured on the server.');
      return NextResponse.json({ success: false, error: 'Server AI configuration error.' }, { status: 500 });
    }

    const targetUpiId = process.env.NEXT_PUBLIC_UPI_ID || '7013017818@naviaxis';
    const planPrice = plan_type === 'business' ? '3999' : '999';

    console.log(`Sending UPI receipt to Gemini for Team: ${team_id}, Target UPI: ${targetUpiId}, Amount: ₹${planPrice}`);

    let result;
    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are a strict financial audit assistant. Analyze this UPI payment receipt screenshot and verify it strictly:
1. Recipient UPI ID: Verify if the payment is sent to "${targetUpiId}". Note that minor differences, missing domain names or formatting variations matching the digits/letters are acceptable (e.g. matching "7013017818" or "naviaxis").
2. Amount paid: Must be at least ₹${planPrice} (INR).
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
      console.error('Gemini AI Verification failed (fallback triggered):', aiError);
      return NextResponse.json({
        success: false,
        fallbackRequired: true,
        error: 'AI verification service is temporarily busy or quota limit reached. Please enter your 12-digit UTR number manually to submit for admin review.'
      });
    }

    if (!result.isValid) {
      console.warn(`UPI Receipt Rejected by Gemini: ${result.reason}`);
      return NextResponse.json({ success: false, error: `AI Verification Failed: ${result.reason || 'Invalid payment receipt.'}` }, { status: 400 });
    }

    const utr = (result.utr || '').trim();
    if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
      console.warn(`Gemini extracted invalid UTR number: ${utr}`);
      return NextResponse.json({ success: false, error: 'AI Verification Failed: Could not extract a valid 12-digit UPI Transaction ID (UTR) from the receipt. Make sure the UTR is clearly visible.' }, { status: 400 });
    }

    // 5. Check if the UTR was already submitted (Deduplication Check)
    const utrExists = await checkUtrExists(utr);
    if (utrExists) {
      console.warn(`Rejected duplicate UTR submission: ${utr}`);
      return NextResponse.json({ success: false, error: 'Submission Rejected: This payment receipt / Transaction ID has already been submitted and approved before.' }, { status: 409 });
    }

    // 6. Apply subscription upgrade in Supabase
    const maxQueries = plan_type === 'business' ? 999999 : 1000;
    
    console.log(`AI verification passed. Upgrading Team: ${team_id} to Tier: ${plan_type} (UTR: ${utr})`);
    
    await adminUpdateWorkspace(team_id, {
      tier: plan_type,
      stripe_subscription_id: utr,
      stripe_customer_id: 'UPI_AI_VERIFIED',
      max_queries: maxQueries,
      query_count: 0
    });

    return NextResponse.json({
      success: true,
      message: `Success! Payment reference verified. Your workspace has been upgraded to ${plan_type.toUpperCase()} Tier.`,
      utr
    });

  } catch (error: any) {
    console.error('Error in UPI verification route:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

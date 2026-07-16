import { Router, Request, Response } from 'express';
import { Client } from 'pg';
import { saveConnection, getAllConnections, getAllWorkspaces, checkUtrExists, adminUpdateWorkspace, getWorkspace } from '../lib/db.js';
import { supabase } from '../lib/supabase.js';
import { GoogleGenAI } from '@google/genai';

export const adminzeroRouter = Router();

async function getUserIdFromRequest(req: Request): Promise<string | null> {
  try {
    const authHeader = req.headers['authorization'];
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
 * GET /api/adminzero/connections
 * Lists all registered database connections.
 */
adminzeroRouter.get('/connections', async (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || undefined;
    const connections = await getAllConnections(userId);
    return res.json(connections);
  } catch (error: any) {
    console.error('Error fetching connections:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/adminzero/connections
 * Registers or updates a database connection mapping.
 */
adminzeroRouter.post('/connections', async (req: Request, res: Response) => {
  try {
    const { id, clientName, pgUrl, schemaHint, userId } = req.body;
    
    if (!id || !clientName || !pgUrl) {
      return res.status(400).json({ error: 'Missing required parameters (id, clientName, pgUrl)' });
    }
    
    await saveConnection(id, clientName, pgUrl, schemaHint || '', userId || undefined);
    return res.json({ success: true });
  } catch (error: any) {
    console.error('Error saving connection:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/adminzero/connections/test
 * Tests a PostgreSQL URL connection for validity.
 */
adminzeroRouter.post('/connections/test', async (req: Request, res: Response) => {
  try {
    const { pgUrl } = req.body;
    
    if (!pgUrl) {
      return res.status(400).json({ error: 'Missing PostgreSQL URL parameter pgUrl' });
    }
    
    console.log('Testing PostgreSQL connection...');
    const pgClient = new Client({
      connectionString: pgUrl.trim(),
      connectionTimeoutMillis: 5000,
      ssl: { rejectUnauthorized: false }
    });
    
    try {
      await pgClient.connect();
      const result = await pgClient.query('SELECT 1 as connected;');
      if (result.rows[0]?.connected === 1) {
        return res.json({ success: true, message: 'PostgreSQL connection test succeeded.' });
      }
      throw new Error('Connection probe failed.');
    } finally {
      await pgClient.end();
    }
  } catch (error: any) {
    console.error('PostgreSQL connection test failed:', error.message);
    return res.status(400).json({ error: error.message });
  }
});

/**
 * GET /api/adminzero/workspaces
 * Lists all Slack workspace installations.
 */
adminzeroRouter.get('/workspaces', async (req: Request, res: Response) => {
  try {
    const workspaces = await getAllWorkspaces();
    return res.json(workspaces);
  } catch (error: any) {
    console.error('Error fetching workspaces:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
});

/**
 * POST /api/adminzero/workspaces/verify-upi
 * Automatically verifies a UPI payment receipt upload using Gemini, extracts UTR, and upgrades workspace.
 */
adminzeroRouter.post('/workspaces/verify-upi', async (req: Request, res: Response) => {
  try {
    const userId = await getUserIdFromRequest(req);
    if (!userId) {
      return res.status(401).json({ success: false, error: 'Unauthorized: Invalid session' });
    }

    const { team_id, plan_type, image, mime_type, manual_utr } = req.body;

    if (!team_id || !plan_type) {
      return res.status(400).json({ success: false, error: 'Missing required parameters: team_id, plan_type' });
    }

    const ws = await getWorkspace(team_id);
    if (!ws) {
      return res.status(404).json({ success: false, error: 'Workspace not found' });
    }
    if (ws.user_id !== userId) {
      return res.status(403).json({ success: false, error: 'Forbidden: You do not own this workspace' });
    }

    if (manual_utr) {
      const utr = manual_utr.trim();
      if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
        return res.status(400).json({ success: false, error: 'Invalid UTR: Must be exactly 12 numeric digits.' });
      }

      const utrExists = await checkUtrExists(utr);
      if (utrExists) {
        return res.status(409).json({ success: false, error: 'Submission Rejected: This payment Reference/UTR has already been submitted before.' });
      }

      await adminUpdateWorkspace(team_id, {
        tier: `pending_${plan_type}`,
        stripe_subscription_id: utr,
        stripe_customer_id: 'UPI_PENDING_MANUAL'
      });

      return res.json({
        success: true,
        pending: true,
        message: 'Success! Your payment reference has been submitted. An admin will review it and activate your workspace shortly.'
      });
    }

    if (!image || !mime_type) {
      return res.status(400).json({ success: false, error: 'Missing required parameters for AI scan: image, mime_type' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured on the server.');
      return res.status(500).json({ success: false, error: 'Server AI configuration error.' });
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
      return res.json({
        success: false,
        fallbackRequired: true,
        error: 'AI verification service is temporarily busy or quota limit reached. Please enter your 12-digit UTR number manually to submit for admin review.'
      });
    }

    if (!result.isValid) {
      console.warn(`UPI Receipt Rejected by Gemini: ${result.reason}`);
      return res.status(400).json({ success: false, error: `AI Verification Failed: ${result.reason || 'Invalid payment receipt.'}` });
    }

    const utr = (result.utr || '').trim();
    if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
      console.warn(`Gemini extracted invalid UTR number: ${utr}`);
      return res.status(400).json({ success: false, error: 'AI Verification Failed: Could not extract a valid 12-digit UPI Transaction ID (UTR) from the receipt. Make sure the UTR is clearly visible.' });
    }

    const utrExists = await checkUtrExists(utr);
    if (utrExists) {
      console.warn(`Rejected duplicate UTR submission: ${utr}`);
      return res.status(409).json({ success: false, error: 'Submission Rejected: This payment receipt / Transaction ID has already been submitted and approved before.' });
    }

    const maxQueries = plan_type === 'business' ? 999999 : 1000;
    
    console.log(`AI verification passed. Upgrading Team: ${team_id} to Tier: ${plan_type} (UTR: ${utr})`);
    
    await adminUpdateWorkspace(team_id, {
      tier: plan_type,
      stripe_subscription_id: utr,
      stripe_customer_id: 'UPI_AI_VERIFIED',
      max_queries: maxQueries,
      query_count: 0
    });

    return res.json({
      success: true,
      message: `Success! Payment reference verified. Your workspace has been upgraded to ${plan_type.toUpperCase()} Tier.`,
      utr
    });

  } catch (error: any) {
    console.error('Error in UPI verification route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/adminzero/services/verify-upi
 * Verifies a client service ticket payment (either via Gemini AI scan or manual UTR entry).
 */
adminzeroRouter.post('/services/verify-upi', async (req: Request, res: Response) => {
  try {
    const { ticket_id, image, mime_type, manual_utr } = req.body;

    if (!ticket_id) {
      return res.status(400).json({ success: false, error: 'Missing ticket ID' });
    }

    // 1. Fetch ticket details
    const { data: ticket, error: fetchError } = await supabase
      .from('client_requests')
      .select('*')
      .eq('id', ticket_id)
      .single();

    if (fetchError || !ticket) {
      return res.status(404).json({ success: false, error: 'Service request/ticket not found' });
    }

    if (!ticket.quoted_price) {
      return res.status(400).json({ success: false, error: 'No price has been quoted for this ticket yet.' });
    }

    const cleanPriceStr = ticket.quoted_price.toString().replace(/[^0-9.]/g, '');
    const numericPrice = parseFloat(cleanPriceStr);
    if (isNaN(numericPrice) || numericPrice <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid quoted price format on this ticket.' });
    }

    const targetUpiId = process.env.NEXT_PUBLIC_UPI_ID || '7013017818@naviaxis';

    // 2. Handle manual UTR submission
    if (manual_utr) {
      const utr = manual_utr.trim();
      if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
        return res.status(400).json({ success: false, error: 'Invalid UTR: Must be exactly 12 numeric digits.' });
      }

      const { data: existingUtr } = await supabase
        .from('client_requests')
        .select('id')
        .eq('payment_link', utr)
        .limit(1);

      if (existingUtr && existingUtr.length > 0) {
        return res.status(409).json({ success: false, error: 'Submission Rejected: This payment Reference/UTR has already been submitted before.' });
      }

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

      return res.json({
        success: true,
        pending: true,
        message: 'Success! Your payment reference has been submitted. Our team will verify it and begin working shortly.',
        utr
      });
    }

    // 3. Handle AI receipt scanning
    if (!image || !mime_type) {
      return res.status(400).json({ success: false, error: 'Missing required parameters for AI scan: image, mimeType' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error('GEMINI_API_KEY is not configured on the server.');
      return res.status(500).json({ success: false, error: 'Server AI configuration error.' });
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
      return res.json({
        success: false,
        fallbackRequired: true,
        error: 'AI verification service is temporarily busy. Please enter your 12-digit UTR number manually to verify.'
      });
    }

    if (!result.isValid) {
      console.warn(`Services UPI Receipt Rejected by Gemini: ${result.reason}`);
      return res.status(400).json({ success: false, error: `AI Verification Failed: ${result.reason || 'Invalid payment receipt.'}` });
    }

    const utr = (result.utr || '').trim();
    if (!utr || utr.length !== 12 || isNaN(Number(utr))) {
      console.warn(`Gemini extracted invalid UTR number: ${utr}`);
      return res.status(400).json({ success: false, error: 'AI Verification Failed: Could not extract a valid 12-digit UPI Transaction ID (UTR) from the receipt. Make sure the UTR is clearly visible.' });
    }

    const { data: existingUtr } = await supabase
      .from('client_requests')
      .select('id')
      .eq('payment_link', utr)
      .limit(1);

    if (existingUtr && existingUtr.length > 0) {
      console.warn(`Rejected duplicate UTR submission for services: ${utr}`);
      return res.status(409).json({ success: false, error: 'Submission Rejected: This payment receipt / Transaction ID has already been submitted and approved before.' });
    }

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

    return res.json({
      success: true,
      message: `Success! Payment verified. Your ticket is now marked as Paid, and our team has been notified.`,
      utr
    });

  } catch (error: any) {
    console.error('Error in services UPI verification route:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

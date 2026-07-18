import { supabase as anonSupabase } from '../supabase';
import { createClient } from '@supabase/supabase-js';
import { encrypt, decrypt } from '../encryption/aes';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// Use Service Role client on the server to bypass RLS policies for telemetry and workspace queries
const supabase = supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      }
    })
  : anonSupabase;

/**
 * Saves or updates a workspace's bot access token securely in Supabase.
 * Links to user_id if provided.
 */
export async function saveWorkspace(teamId: string, botAccessToken: string, userId?: string): Promise<void> {
  const encryptedToken = encrypt(botAccessToken);
  const payload: any = {
    team_id: teamId.trim(),
    encrypted_bot_access_token: encryptedToken
  };
  
  if (userId) {
    payload.user_id = userId;
  }
  
  const { error } = await supabase
    .from('workspaces')
    .upsert(payload, { onConflict: 'team_id' });
    
  if (error) {
    console.error('Error saving workspace to Supabase:', error);
    throw error;
  }
}

/**
 * Retrieves a workspace's details including subscription info.
 */
export async function getWorkspace(teamId: string) {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .eq('team_id', teamId.trim())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching workspace detail from Supabase:', error);
    throw error;
  }
  return data;
}

/**
 * Updates subscription details for a workspace.
 */
export async function updateWorkspaceSubscription(
  teamId: string,
  stripeCustomerId: string,
  stripeSubscriptionId: string,
  tier: string,
  maxQueries: number
): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      stripe_customer_id: stripeCustomerId,
      stripe_subscription_id: stripeSubscriptionId,
      tier,
      max_queries: maxQueries
    })
    .eq('team_id', teamId.trim());

  if (error) {
    console.error('Error updating workspace subscription:', error);
    throw error;
  }
}

/**
 * Resets subscription info to free tier for a given subscription ID (e.g. cancellation).
 */
export async function resetWorkspaceSubscription(stripeSubscriptionId: string): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update({
      tier: 'free',
      max_queries: 30,
      query_count: 0
    })
    .eq('stripe_subscription_id', stripeSubscriptionId);

  if (error) {
    console.error('Error resetting workspace subscription:', error);
    throw error;
  }
}

/**
 * Increments query count atomically using RPC. Falls back to a local read-increment-write if RPC fails.
 */
export async function incrementWorkspaceQueryCount(teamId: string): Promise<void> {
  // First, try calling the database RPC function
  const { error: rpcError } = await supabase.rpc('increment_query_count', {
    target_team_id: teamId.trim()
  });

  if (!rpcError) {
    return;
  }

  console.warn('RPC increment_query_count failed (probably function not created yet). Falling back to non-atomic update...', rpcError);

  // Fallback if the RPC is not defined in Supabase yet
  const ws = await getWorkspace(teamId);
  if (!ws) {
    throw new Error(`Workspace not found for team: ${teamId}`);
  }

  const { error: updateError } = await supabase
    .from('workspaces')
    .update({
      query_count: (ws.query_count || 0) + 1
    })
    .eq('team_id', teamId.trim());

  if (updateError) {
    console.error('Error in fallback query increment:', updateError);
    throw updateError;
  }
}

/**
 * Retrieves and decrypts a workspace's bot access token from Supabase.
 */
export async function getWorkspaceToken(teamId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('encrypted_bot_access_token')
    .eq('team_id', teamId.trim())
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') { // Postgrest single row not found
      return null;
    }
    console.error('Error fetching workspace token from Supabase:', error);
    throw error;
  }
  
  if (!data || !data.encrypted_bot_access_token) {
    return null;
  }
  
  return decrypt(data.encrypted_bot_access_token);
}

/**
 * Saves or updates a Slack channel-to-PostgreSQL connection mapping in Supabase.
 * Links to user_id if provided.
 */
export async function saveConnection(
  id: string,
  clientName: string,
  pgUrl: string,
  schemaHint: string,
  userId?: string
): Promise<void> {
  const encryptedUrl = encrypt(pgUrl);
  const payload: any = {
    id: id.trim(),
    client_name: clientName.trim(),
    encrypted_pg_url: encryptedUrl,
    schema_hint: schemaHint?.trim() || ''
  };

  if (userId) {
    payload.user_id = userId;
  }

  const { error } = await supabase
    .from('connections')
    .upsert(payload, { onConflict: 'id' });
    
  if (error) {
    console.error('Error saving connection to Supabase:', error);
    throw error;
  }
}

/**
 * Retrieves a connection mapping from Supabase by Slack Channel ID.
 */
export async function getConnection(id: string) {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .eq('id', id.trim())
    .single();
    
  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching connection from Supabase:', error);
    throw error;
  }
  
  return data;
}

/**
 * Retrieves all connection mappings from Supabase.
 * Optionally filters by user_id.
 */
export async function getAllConnections(userId?: string) {
  let query = supabase
    .from('connections')
    .select('*');
    
  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching connections list from Supabase:', error);
    throw error;
  }
  
  return data || [];
}

/**
 * Checks if a UTR code has already been registered in the workspaces table.
 */
export async function checkUtrExists(utr: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('workspaces')
    .select('team_id')
    .eq('stripe_subscription_id', utr.trim())
    .limit(1);

  if (error) {
    console.error('Error checking UTR uniqueness in Supabase:', error);
    throw error;
  }
  return data && data.length > 0;
}

/**
 * Retrieves all registered workspaces from Supabase.
 */
export async function getAllWorkspaces() {
  const { data, error } = await supabase
    .from('workspaces')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching workspaces list from Supabase:', error);
    throw error;
  }
  return data || [];
}

/**
 * Super admin updates workspace subscription and quota states.
 */
export async function adminUpdateWorkspace(teamId: string, updates: any): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .update(updates)
    .eq('team_id', teamId.trim());

  if (error) {
    console.error('Error in adminUpdateWorkspace:', error);
    throw error;
  }
}

/**
 * Telemetry: Logs workspace installation.
 */
export async function logWorkspaceInstall(teamId: string): Promise<void> {
  const { error } = await supabase
    .from('workspaces')
    .upsert({ 
      team_id: teamId.trim(), 
      installed_at: new Date().toISOString() 
    }, { onConflict: 'team_id' });
    
  if (error) {
    console.error('Error in logWorkspaceInstall:', error);
    throw error;
  }
}

/**
 * Telemetry: Logs query execution start as 'pending' and returns query ID.
 */
export async function logQueryStart(workspaceId: string, userPrompt: string): Promise<number | null> {
  const { data, error } = await supabase
    .from('query_logs')
    .insert([
      {
        workspace_id: workspaceId.trim(),
        user_prompt: userPrompt,
        status: 'pending'
      }
    ])
    .select('id')
    .single();
    
  if (error) {
    console.error('Error in logQueryStart:', error);
    throw error;
  }
  
  return data ? Number(data.id) : null;
}

/**
 * Telemetry: Updates query log status to 'success'.
 */
export async function logQuerySuccess(queryId: number): Promise<void> {
  const { error } = await supabase
    .from('query_logs')
    .update({ status: 'success' })
    .eq('id', queryId);
    
  if (error) {
    console.error('Error in logQuerySuccess:', error);
    throw error;
  }
}

/**
 * Telemetry: Updates query log status to 'failed'.
 */
export async function logQueryFailure(queryId: number): Promise<void> {
  const { error } = await supabase
    .from('query_logs')
    .update({ status: 'failed' })
    .eq('id', queryId);
    
  if (error) {
    console.error('Error in logQueryFailure:', error);
    throw error;
  }
}

/**
 * Adds query credits to a workspace for a one-time purchase.
 */
export async function addWorkspaceCredits(
  teamId: string,
  creditsToAdd: number,
  newTier?: string
): Promise<void> {
  const current = await getWorkspace(teamId);
  if (!current) {
    throw new Error(`Workspace ${teamId} not found.`);
  }

  const newMax = (current.max_queries || 500) + creditsToAdd;
  const updatePayload: any = { max_queries: newMax };
  if (newTier) {
    updatePayload.tier = newTier;
  }

  const { error } = await supabase
    .from('workspaces')
    .update(updatePayload)
    .eq('team_id', teamId.trim());

  if (error) {
    console.error('Error adding credits to workspace:', error);
    throw error;
  }
}

import { supabase } from '../supabase';
import { encrypt, decrypt } from '../encryption/aes';

/**
 * Saves or updates a workspace's bot access token securely in Supabase.
 */
export async function saveWorkspace(teamId: string, botAccessToken: string): Promise<void> {
  const encryptedToken = encrypt(botAccessToken);
  const { error } = await supabase
    .from('workspaces')
    .upsert(
      {
        team_id: teamId.trim(),
        encrypted_bot_access_token: encryptedToken
      },
      { onConflict: 'team_id' }
    );
    
  if (error) {
    console.error('Error saving workspace to Supabase:', error);
    throw error;
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
    console.error('Error fetching workspace from Supabase:', error);
    throw error;
  }
  
  if (!data || !data.encrypted_bot_access_token) {
    return null;
  }
  
  return decrypt(data.encrypted_bot_access_token);
}

/**
 * Saves or updates a Slack channel-to-PostgreSQL connection mapping in Supabase.
 */
export async function saveConnection(
  id: string,
  clientName: string,
  pgUrl: string,
  schemaHint: string
): Promise<void> {
  const encryptedUrl = encrypt(pgUrl);
  const { error } = await supabase
    .from('connections')
    .upsert(
      {
        id: id.trim(),
        client_name: clientName.trim(),
        encrypted_pg_url: encryptedUrl,
        schema_hint: schemaHint?.trim() || ''
      },
      { onConflict: 'id' }
    );
    
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
 */
export async function getAllConnections() {
  const { data, error } = await supabase
    .from('connections')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching connections list from Supabase:', error);
    throw error;
  }
  
  return data || [];
}

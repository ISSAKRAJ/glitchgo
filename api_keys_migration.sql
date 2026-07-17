-- =======================================================================
-- AdminZero Database Migration: API Keys & Pricing Upgrade
-- Run this in your Supabase SQL Editor
-- =======================================================================

-- 1. Fix insert policy for workspaces (Resolves dashboard onboarding bug)
CREATE POLICY "Users can insert own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 2. Create the api_keys table to store multiple API keys per workspace
CREATE TABLE IF NOT EXISTS api_keys (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id text NOT NULL REFERENCES workspaces(team_id) ON DELETE CASCADE,
  key_value text UNIQUE NOT NULL,
  name text NOT NULL DEFAULT 'Secret Key',
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'revoked')),
  created_at timestamptz DEFAULT now(),
  last_used_at timestamptz
);

-- 3. Enable Row Level Security (RLS) on api_keys
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS Policies for api_keys
-- This allows client applications to select, insert, and delete their own keys
CREATE POLICY "Users can manage own api keys" ON api_keys
  FOR ALL USING (
    workspace_id IN (
      SELECT team_id FROM workspaces WHERE user_id = auth.uid()
    )
  );

-- 5. Make encrypted_bot_access_token nullable on workspaces table
-- (Allows Cloud API-only workspaces to be created without Slack tokens)
ALTER TABLE workspaces ALTER COLUMN encrypted_bot_access_token DROP NOT NULL;

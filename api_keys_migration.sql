-- =======================================================================
-- AdminZero Database Migration: API Keys & Pricing Upgrade
-- Run this in your Supabase SQL Editor
-- =======================================================================

-- 1. Fix RLS policies for workspaces table (Ensures dashboard onboarding and loading works)
DROP POLICY IF EXISTS "Users can read own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can insert own workspaces" ON workspaces;
DROP POLICY IF EXISTS "Users can update own workspaces" ON workspaces;

CREATE POLICY "Users can read own workspaces" ON workspaces
  FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own workspaces" ON workspaces
  FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own workspaces" ON workspaces
  FOR UPDATE USING (auth.uid()::text = user_id::text);

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
      SELECT team_id FROM workspaces WHERE user_id::text = auth.uid()::text
    )
  );

-- 5. Make encrypted_bot_access_token nullable on workspaces table
-- (Allows Cloud API-only workspaces to be created without Slack tokens)
ALTER TABLE workspaces ALTER COLUMN encrypted_bot_access_token DROP NOT NULL;

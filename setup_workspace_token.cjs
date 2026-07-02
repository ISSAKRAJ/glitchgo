const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const crypto = require('crypto');
const readline = require('readline');
const envContent = fs.readFileSync('./.env.local', 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    env[parts[0].trim()] = parts.slice(1).join('=').trim();
  }
});
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const encryptionKey = env.ENCRYPTION_KEY || 'adminzero-encryption-key-32chars';
if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question('Please paste your custom Bot User OAuth Token (starts with xoxb-): ', (token) => {
  if (!token.startsWith('xoxb-')) {
    console.error('Error: Token must start with xoxb-');
    rl.close();
    process.exit(1);
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(encryptionKey.padEnd(32, '0').substring(0, 32)), iv);
  let encrypted = cipher.update(token.trim(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const encryptedToken = iv.toString('hex') + ':' + encrypted;
  const teamId = 'T0BDRBZKXSQ';
  console.log('Inserting/Upserting workspace token into Supabase workspaces table...');
  supabase.from('workspaces').upsert({ team_id: teamId, encrypted_bot_access_token: encryptedToken }).then(({ error }) => {
    if (error) {
      console.error('Error inserting workspace:', error);
    } else {
      console.log('SUCCESS! Workspace token has been encrypted and successfully saved in Supabase for Team ID: T0BDRBZKXSQ.');
    }
    rl.close();
  });
});

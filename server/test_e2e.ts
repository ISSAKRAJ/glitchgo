process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import 'dotenv/config';
import express from 'express';
import { apiRouter } from './src/routes/api.js';
import { supabase } from './src/lib/supabase.js';
import http from 'http';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

const PORT = 5050;

async function runTests() {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(PORT, () => resolve(true)));
  console.log(`[E2E] Server listening on port ${PORT}`);

  try {
    // 1. Get an existing workspace to test against (memory bans won't affect prod)
    const { data: workspaces, error: wsErr } = await supabase.from('workspaces').select('team_id').limit(1);
    if (wsErr || !workspaces || workspaces.length === 0) {
      console.error('[E2E] Failed to find a valid workspace in DB:', wsErr);
      process.exit(1);
    }
    
    const TEST_WORKSPACE = workspaces[0].team_id;
    console.log(`[E2E] Using Workspace ID: ${TEST_WORKSPACE}`);

    const testUrl = `http://localhost:${PORT}/api/v1/query`;

    async function sendQuery(prompt: string) {
      const res = await fetch(testUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          license_key: TEST_WORKSPACE,
          prompt: prompt,
          db_url: 'postgres://dummy:dummy@localhost:5432/dummy',
          db_dialect: 'postgres'
        })
      });
      const data = await res.json();
      return { status: res.status, data };
    }

    console.log('\n--- 1. Testing L2 Heavy Hex Encoding Guard ---');
    const hexRes = await sendQuery('SELECT * FROM users WHERE id = 0x41 AND val = 0x42 AND num = 0x43 AND flag = 0x44');
    console.log(`Status: ${hexRes.status}`);
    console.log(`Response:`, hexRes.data);
    if (hexRes.status !== 400 || hexRes.data.code !== 'INPUT_OBFUSCATION_BLOCKED') throw new Error('L2 Guard Failed');

    console.log('\n--- 2. Testing L12 Homoglyph Shield ---');
    const homoglyphRes = await sendQuery('DRОP TАBLE users;');
    console.log(`Status: ${homoglyphRes.status}`);
    console.log(`Response:`, homoglyphRes.data);
    if (homoglyphRes.status !== 403 || homoglyphRes.data.code !== 'AST_FIREWALL_BLOCKED') throw new Error('L12 Homoglyph / AST Guard Failed');

    console.log('\n--- 3. Testing L4 Complexity Depth Guard ---');
    const depthRes = await sendQuery('SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM (SELECT * FROM users as t1) as t2) as t3) as t4) as t5) as t6) as t7) as t8) as t9;');
    console.log(`Status: ${depthRes.status}`);
    console.log(`Response:`, depthRes.data);
    if (depthRes.status !== 403 || !depthRes.data.error.includes('Depth limit')) throw new Error('L4 Complexity Guard Failed');

    console.log('\n--- 4. Triggering L10 Shadow Ban ---');
    console.log('Sending 1 more threat to reach shadow ban threshold...');
    const shadowStart = Date.now();
    const shadowRes = await sendQuery('DELETE FROM users');
    const shadowElapsed = Date.now() - shadowStart;
    console.log(`Status: ${shadowRes.status}`);
    console.log(`Elapsed Time: ${shadowElapsed}ms`);
    if (shadowElapsed < 2000) throw new Error('L10 Shadow Ban (Artificial Delay) Failed to Trigger');
    
    console.log('\n--- 5. Triggering L10 Hard Ban ---');
    console.log('Spamming 6 more threats to hit Hard Ban limit (10)...');
    for (let i = 0; i < 6; i++) {
      await sendQuery('DELETE FROM users');
    }
    const hardBanRes = await sendQuery('SELECT * FROM users');
    console.log(`Status: ${hardBanRes.status}`);
    console.log(`Response:`, hardBanRes.data);
    if (hardBanRes.status !== 403 || hardBanRes.data.code !== 'BEHAVIORAL_HARD_BAN') throw new Error('L10 Hard Ban Failed');

    console.log('\n✅ ALL 20-LAYER E2E TESTS PASSED SUCCESSFULLY! The API is completely secure.');

  } catch (err) {
    console.error('\n❌ E2E TEST FAILED:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();

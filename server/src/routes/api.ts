import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { encryptConnectionString, decryptConnectionString } from '../lib/crypto.js';
import { ConnectorFactory, ConnectionConfig } from '../lib/connectors/factory.js';
import { profileSchema, SemanticSchema } from '../lib/semantic-profiler.js';
import { askDatabase } from '../lib/ai-pipeline.js';
import { supabase } from '../lib/supabase.js';
import { 
  getWorkspace, 
  getAllWorkspaces, 
  adminUpdateWorkspace 
} from '../lib/db.js';

export const apiRouter = Router();

interface StoreEntry {
  dbId: string;
  dialect: 'postgres' | 'mysql';
  encryptedData: string;
  iv: string;
  authTag: string;
  schema: SemanticSchema;
}

const dbStore = new Map<string, StoreEntry>();

/**
 * Helper to authenticate Super Admin request
 */
async function authenticateSuperAdmin(req: Request): Promise<boolean> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
    const token = authHeader.split(' ')[1];
    
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return false;
    
    return user.email === 'issakrajraj@gmail.com';
  } catch (err) {
    return false;
  }
}

/**
 * POST /api/onboard
 */
apiRouter.post('/onboard', async (req: Request, res: Response) => {
  try {
    const { dialect, connectionString } = req.body;
    if (!dialect || !connectionString) {
      return res.status(400).json({ status: 'error', message: 'Missing parameters.' });
    }
    const encrypted = encryptConnectionString(connectionString);
    const config: ConnectionConfig = { dialect, connectionString };
    const testResult = await ConnectorFactory.testConnection(config);
    if (!testResult.success) {
      return res.status(400).json({ status: 'error', message: `Database connection test failed: ${testResult.error}` });
    }
    const schema = await profileSchema(config);
    const dbId = randomUUID();
    dbStore.set(dbId, {
      dbId,
      dialect,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      schema
    });
    return res.status(200).json({ status: 'success', dbId, schema });
  } catch (err: any) {
    return res.status(500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/query
 */
apiRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { dbId, question } = req.body;
    if (!dbId || !question) {
      return res.status(400).json({ status: 'error', message: 'Missing parameters.' });
    }
    const entry = dbStore.get(dbId);
    if (!entry) {
      return res.status(404).json({ status: 'error', message: 'Config not found.' });
    }
    const connectionString = decryptConnectionString({
      encryptedData: entry.encryptedData,
      iv: entry.iv,
      authTag: entry.authTag
    });
    const config: ConnectionConfig = { id: entry.dbId, dialect: entry.dialect, connectionString };
    const result = await askDatabase(question, config, entry.schema, ['hr_salaries', 'admin_passwords']);
    return res.status(200).json({ status: 'success', sql: result.sql, data: result.data });
  } catch (err: any) {
    const isFirewallBlock = err.message && err.message.startsWith('AST Firewall Blocked Query');
    return res.status(isFirewallBlock ? 400 : 500).json({ status: 'error', message: err.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/v1/license/sync
 * Syncs usage credits and threat metrics from downloadable local agents.
 */
apiRouter.post('/v1/license/sync', async (req: Request, res: Response) => {
  try {
    const { licenseKey, queryCountIncrement, threatsBlockedIncrement } = req.body;

    if (!licenseKey) {
      return res.status(400).json({ active: false, error: 'Missing licenseKey parameter.' });
    }

    // 1. Fetch license workspace details
    const ws = await getWorkspace(licenseKey);
    if (!ws) {
      return res.status(404).json({ active: false, error: 'License key not registered.' });
    }

    // 2. Increment query counts
    const increment = Number(queryCountIncrement) || 0;
    const newQueryCount = (ws.query_count || 0) + increment;
    await adminUpdateWorkspace(licenseKey, { query_count: newQueryCount });

    // 3. Log query telemetry logs
    if (Number(threatsBlockedIncrement) > 0) {
      await supabase.from('query_logs').insert([{
        workspace_id: licenseKey,
        user_prompt: `Blocked ${threatsBlockedIncrement} malicious P2SQL injection attempts locally.`,
        status: 'failed'
      }]);
    } else if (increment > 0) {
      await supabase.from('query_logs').insert([{
        workspace_id: licenseKey,
        user_prompt: `Processed ${increment} database transactions safely.`,
        status: 'success'
      }]);
    }

    // 4. Calculate limit status
    const active = newQueryCount < (ws.max_queries || 500);
    const creditsRemaining = Math.max(0, (ws.max_queries || 500) - newQueryCount);

    return res.status(200).json({
      active,
      creditsRemaining,
      tier: ws.tier
    });

  } catch (err: any) {
    console.error('Error syncing license:', err);
    return res.status(500).json({ active: false, error: err.message || 'License sync failed.' });
  }
});

/**
 * GET /api/admin/workspaces
 * Restricted to super admin: retrieves all client licenses with user emails mapped.
 */
apiRouter.get('/admin/workspaces', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await authenticateSuperAdmin(req);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Access Denied: Super Admin authentication failed.' });
    }

    // 1. Fetch all workspaces
    const workspaces = await getAllWorkspaces();

    // 2. Fetch all user profile emails
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) {
      console.warn('Auth admin listUsers failed, returning workspaces without emails:', usersError);
    }

    const mapped = workspaces.map(ws => {
      const matchedUser = users?.find((u: any) => u.id === ws.user_id);
      return {
        ...ws,
        email: matchedUser ? matchedUser.email : 'Unknown / Deleted User'
      };
    });

    return res.status(200).json({ success: true, workspaces: mapped });

  } catch (err: any) {
    console.error('Error fetching admin workspaces:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

/**
 * POST /api/admin/workspaces/update
 * Restricted to super admin: updates quotas and tiers.
 */
apiRouter.post('/admin/workspaces/update', async (req: Request, res: Response) => {
  try {
    const isAuthorized = await authenticateSuperAdmin(req);
    if (!isAuthorized) {
      return res.status(403).json({ success: false, error: 'Access Denied: Super Admin authentication failed.' });
    }

    const { teamId, tier, maxQueries, queryCount } = req.body;
    if (!teamId) {
      return res.status(400).json({ success: false, error: 'Missing teamId parameter.' });
    }

    await adminUpdateWorkspace(teamId, {
      tier,
      max_queries: Number(maxQueries),
      query_count: Number(queryCount)
    });

    return res.status(200).json({ success: true });

  } catch (err: any) {
    console.error('Error updating admin workspace:', err);
    return res.status(500).json({ success: false, error: err.message || 'Internal Server Error' });
  }
});

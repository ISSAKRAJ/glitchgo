import { Router, Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { encryptConnectionString, decryptConnectionString } from '../lib/crypto.js';
import { ConnectorFactory, ConnectionConfig } from '../lib/connectors/factory.js';
import { profileSchema, SemanticSchema } from '../lib/semantic-profiler.js';
import { askDatabase } from '../lib/ai-pipeline.js';

export const apiRouter = Router();

interface StoreEntry {
  dbId: string;
  dialect: 'postgres' | 'mysql';
  encryptedData: string;
  iv: string;
  authTag: string;
  schema: SemanticSchema;
}

// Temporary in-memory state store for MVP testing
const dbStore = new Map<string, StoreEntry>();

/**
 * POST /api/onboard
 * Encrypts connection string, validates connection health, profiles database schema, and caches it.
 */
apiRouter.post('/onboard', async (req: Request, res: Response) => {
  try {
    const { dialect, connectionString } = req.body;

    if (!dialect || !connectionString) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: dialect and connectionString are required.'
      });
    }

    if (dialect !== 'postgres' && dialect !== 'mysql') {
      return res.status(400).json({
        status: 'error',
        message: "Invalid dialect. Must be 'postgres' or 'mysql'."
      });
    }

    // 1. Encrypt credentials at rest
    const encrypted = encryptConnectionString(connectionString);

    // 2. Validate connection health
    const config: ConnectionConfig = { dialect, connectionString };
    const testResult = await ConnectorFactory.testConnection(config);
    if (!testResult.success) {
      return res.status(400).json({
        status: 'error',
        message: `Database connection test failed: ${testResult.error}`
      });
    }

    // 3. Profile database schema for LLM context mapping
    const schema = await profileSchema(config);

    // 4. Generate database token ID
    const dbId = randomUUID();

    // 5. Store configuration securely
    dbStore.set(dbId, {
      dbId,
      dialect,
      encryptedData: encrypted.encryptedData,
      iv: encrypted.iv,
      authTag: encrypted.authTag,
      schema
    });

    return res.status(200).json({
      status: 'success',
      dbId,
      schema
    });

  } catch (err: any) {
    console.error('Error onboarding database:', err);
    return res.status(500).json({
      status: 'error',
      message: err.message || 'Internal Server Error'
    });
  }
});

/**
 * POST /api/query
 * Decrypts database credentials, runs AST validation, generates SQL with DeepSeek, and executes it.
 */
apiRouter.post('/query', async (req: Request, res: Response) => {
  try {
    const { dbId, question } = req.body;

    if (!dbId || !question) {
      return res.status(400).json({
        status: 'error',
        message: 'Missing required parameters: dbId and question are required.'
      });
    }

    // 1. Look up connection metadata
    const entry = dbStore.get(dbId);
    if (!entry) {
      return res.status(404).json({
        status: 'error',
        message: `Database config with ID '${dbId}' not found.`
      });
    }

    // 2. Decrypt connection string on-the-fly
    let connectionString: string;
    try {
      connectionString = decryptConnectionString({
        encryptedData: entry.encryptedData,
        iv: entry.iv,
        authTag: entry.authTag
      });
    } catch (decryptErr: any) {
      return res.status(500).json({
        status: 'error',
        message: `Failed to decrypt database connection string: ${decryptErr.message}`
      });
    }

    const config: ConnectionConfig = {
      id: entry.dbId,
      dialect: entry.dialect,
      connectionString
    };

    // 3. Orchestrate deepseek + AST validation + execution
    // HR Salaries and Admin Passwords are sent as forbidden tables to prove firewall works
    const result = await askDatabase(
      question,
      config,
      entry.schema,
      ['hr_salaries', 'admin_passwords']
    );

    return res.status(200).json({
      status: 'success',
      sql: result.sql,
      data: result.data
    });

  } catch (err: any) {
    console.error('Error querying database:', err);
    // Return 400 if it was blocked by the AST firewall, 500 for other system errors
    const isFirewallBlock = err.message && err.message.startsWith('AST Firewall Blocked Query');
    return res.status(isFirewallBlock ? 400 : 500).json({
      status: 'error',
      message: err.message || 'Internal Server Error'
    });
  }
});

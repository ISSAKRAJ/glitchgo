import pg from 'pg';
import mysql from 'mysql2/promise';
import crypto from 'node:crypto';

export type DBDialect = 'postgres' | 'mysql';

export interface ConnectionConfig {
  id?: string;
  dialect: DBDialect;
  connectionString: string;
}

export class DatabaseConnectionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DatabaseConnectionError';
  }
}

interface CachedPoolEntry {
  dialect: DBDialect;
  pool: pg.Pool | mysql.Pool;
}

// Map preserves insertion order. Oldest elements are at the beginning, newest at the end.
const poolCache = new Map<string, CachedPoolEntry>();
const MAX_CACHE_SIZE = 50;

/**
 * Sanitizes errors to prevent connection string credentials from leaking in stack traces.
 */
function sanitizeError(err: any, connectionString: string): Error {
  let message = err.message || String(err);
  
  if (connectionString) {
    try {
      const url = new URL(connectionString);
      if (url.password) {
        message = message.replace(url.password, '****');
      }
      // Scrub the entire raw connection string if it appears in the message
      message = message.replaceAll(connectionString, `${url.protocol}//${url.host}${url.pathname}`);
    } catch (_) {
      message = message.replaceAll(connectionString, '[REDACTED CONNECTION STRING]');
    }
  }

  // Scrub any credential patterns (e.g. mongodb://user:pass@host or postgres://user:pass@host)
  message = message.replace(/\/\/[^:]+:[^@]+@/g, '//****:****@');

  return new DatabaseConnectionError(message);
}

/**
 * Safely closes a connection pool.
 */
async function closePool(dialect: DBDialect, pool: pg.Pool | mysql.Pool): Promise<void> {
  try {
    if (dialect === 'postgres') {
      await (pool as pg.Pool).end();
    } else {
      await (pool as mysql.Pool).end();
    }
  } catch (err) {
    console.error(`Error closing ${dialect} pool:`, err);
  }
}

// Background cleanup interval to evict idle pools that have 0 connections
const CLEANUP_INTERVAL_MS = 15000;
setInterval(() => {
  for (const [key, entry] of poolCache.entries()) {
    let shouldEvict = false;
    
    if (entry.dialect === 'postgres') {
      const pgPool = entry.pool as pg.Pool;
      if (pgPool.totalCount === 0) {
        shouldEvict = true;
      }
    } else {
      const mysqlPool = entry.pool as mysql.Pool;
      const internalPool = (mysqlPool as any).pool;
      if (internalPool && internalPool._allConnections && internalPool._allConnections.length === 0) {
        shouldEvict = true;
      }
    }

    if (shouldEvict) {
      poolCache.delete(key);
      closePool(entry.dialect, entry.pool).catch(err => {
        console.error(`Error during idle eviction of pool ${key}:`, err);
      });
    }
  }
}, CLEANUP_INTERVAL_MS).unref();

/**
 * Computes a cache key for the connection pool.
 */
function getCacheKey(config: ConnectionConfig): string {
  if (config.id) {
    return `${config.dialect}:${config.id}`;
  }
  const hash = crypto.createHash('sha256').update(config.connectionString).digest('hex');
  return `${config.dialect}:hash:${hash}`;
}

export class ConnectorFactory {
  /**
   * Retrieves or instantiates a cached Pool for the given database connection config.
   * Enforces O(1) LRU eviction policy using Map insertion order.
   */
  static getOrCreatePool(config: ConnectionConfig): pg.Pool | mysql.Pool {
    const key = getCacheKey(config);
    const existing = poolCache.get(key);
    
    if (existing) {
      // Refresh key insertion order in Map for LRU cache ranking
      poolCache.delete(key);
      poolCache.set(key, existing);
      return existing.pool;
    }

    // Evict the oldest pool (first element in Map iteration order) if cache is full
    if (poolCache.size >= MAX_CACHE_SIZE) {
      const oldestKey = poolCache.keys().next().value;
      if (oldestKey) {
        const evictedEntry = poolCache.get(oldestKey);
        poolCache.delete(oldestKey);
        if (evictedEntry) {
          closePool(evictedEntry.dialect, evictedEntry.pool).catch(err => {
            console.error(`Error closing evicted pool ${oldestKey}:`, err);
          });
        }
      }
    }

    // Create new pool
    let pool: pg.Pool | mysql.Pool;
    if (config.dialect === 'postgres') {
      pool = new pg.Pool({
        connectionString: config.connectionString,
        idleTimeoutMillis: 60000,          // 1 minute idle timeout
        connectionTimeoutMillis: 5000,    // 5 seconds connection timeout
        max: 10,                          // limit pool size to max 10
      });

      // Monitor pg pool connection removals
      pool.on('remove', () => {
        const pgPool = pool as pg.Pool;
        if (pgPool.totalCount === 0) {
          const currentEntry = poolCache.get(key);
          if (currentEntry && currentEntry.pool === pool) {
            poolCache.delete(key);
            closePool('postgres', pool).catch(() => {});
          }
        }
      });
    } else if (config.dialect === 'mysql') {
      pool = mysql.createPool({
        uri: config.connectionString,
        idleTimeout: 60000,               // 1 minute idle timeout
        connectTimeout: 5000,             // 5 seconds connection timeout
        connectionLimit: 10,              // limit pool size to max 10
        waitForConnections: true,
      });
    } else {
      throw new Error(`Unsupported database dialect: ${config.dialect}`);
    }

    poolCache.set(key, {
      dialect: config.dialect,
      pool
    });

    return pool;
  }

  /**
   * Executes a database function inside a managed transient connection context.
   * Leverages cached connection pools under the hood to prevent SSL latency.
   */
  static async runQuery<T>(
    config: ConnectionConfig,
    queryFn: (client: any) => Promise<T>
  ): Promise<T> {
    try {
      const pool = this.getOrCreatePool(config);
      
      if (config.dialect === 'postgres') {
        const pgPool = pool as pg.Pool;
        const client = await pgPool.connect();
        try {
          return await queryFn(client);
        } finally {
          client.release();
        }
      } else {
        const mysqlPool = pool as mysql.Pool;
        const connection = await mysqlPool.getConnection();
        try {
          return await queryFn(connection);
        } finally {
          connection.release();
        }
      }
    } catch (err: any) {
      throw sanitizeError(err, config.connectionString);
    }
  }

  /**
   * Ping testing endpoint. Executes a low-overhead query on the database.
   */
  static async testConnection(config: ConnectionConfig): Promise<{ success: boolean; latencyMs: number; error?: string }> {
    const startTime = Date.now();
    try {
      if (config.dialect === 'postgres') {
        await this.runQuery(config, async (client) => {
          await client.query('SELECT 1');
        });
      } else if (config.dialect === 'mysql') {
        await this.runQuery(config, async (connection) => {
          await connection.query('SELECT 1');
        });
      } else {
        throw new Error(`Unsupported dialect: ${config.dialect}`);
      }
      return {
        success: true,
        latencyMs: Date.now() - startTime
      };
    } catch (err: any) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: err.message || String(err)
      };
    }
  }
}

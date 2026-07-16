/**
 * AdminZero AST SQL Firewall — Next.js compatible port
 * Validates SQL queries using recursive AST scanning.
 * Protects against Prompt-to-SQL (P2SQL) Injection (OWASP LLM01).
 */

import { parse } from 'pgsql-ast-parser';

const FORBIDDEN_STATEMENT_TYPES = [
  'insert', 'update', 'delete', 'drop', 'alter', 'truncate',
  'create', 'grant', 'revoke', 'replace', 'transaction',
  'commit', 'rollback', 'copy', 'explain', 'prepare', 'execute', 'deallocate'
];

const ALLOWED_STATEMENT_TYPES = ['select', 'show', 'describe', 'with'];

const FORBIDDEN_FUNCTIONS = [
  'sleep', 'pg_sleep', 'sys_eval', 'sys_exec', 'version',
  'load_file', 'current_setting', 'session_user', 'execute',
  'pg_read_file', 'pg_ls_dir', 'pg_stat_file'
];

const SENSITIVE_SCHEMAS = [
  'information_schema', 'pg_catalog', 'performance_schema', 'sys', 'mysql'
];

/**
 * Validates SQL using AST parsing for Postgres.
 * @param {string} sql - SQL query to validate
 * @param {string[]} forbiddenTables - Table names to block
 * @returns {{ safe: boolean, auditData: object }}
 * @throws {Error} with THREAT BLOCKED prefix if unsafe
 */
export function validateQuery(sql, forbiddenTables = []) {
  if (!sql || typeof sql !== 'string') {
    throw new Error('[AdminZero AST] THREAT BLOCKED: Empty or invalid SQL payload.');
  }

  const normalizedRaw = sql.toLowerCase().replace(/\s+/g, ' ');

  // Pre-parser: block comment injection
  if (normalizedRaw.includes('/*') || normalizedRaw.includes('--')) {
    const dangerousInComment = [
      'drop', 'delete', 'update', 'insert', 'alter', 'truncate',
      'pg_', 'information_schema', 'mysql', 'schema', 'credential'
    ];
    if (dangerousInComment.some(kw => normalizedRaw.includes(kw))) {
      throw new Error('[AdminZero AST] THREAT BLOCKED: Suspicious keyword detected inside SQL comment syntax.');
    }
  }

  let astArray;
  try {
    astArray = parse(sql);
  } catch {
    throw new Error('[AdminZero AST] THREAT BLOCKED: Unparseable SQL detected. Possible obfuscation or syntax attack. Fail-closed.');
  }

  // Block query stacking
  if (astArray.length > 1) {
    throw new Error('[AdminZero AST] THREAT BLOCKED: Multiple SQL statements in a single transaction (query stacking) are forbidden.');
  }

  const normalizedForbidden = forbiddenTables.map(t => t.toLowerCase().trim());

  function checkNode(node) {
    if (!node || typeof node !== 'object') return;

    if (node.type) {
      const nodeType = String(node.type).toLowerCase();
      if (FORBIDDEN_STATEMENT_TYPES.some(f => nodeType.includes(f))) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: Destructive statement type [${node.type.toUpperCase()}] is prohibited.`);
      }
    }

    // Table reference check
    if (node.type === 'table' && node.name) {
      let tableName = '';
      let schemaName = '';

      if (typeof node.name === 'string') {
        tableName = node.name.replace(/[`"[\]]/g, '').toLowerCase();
      } else if (typeof node.name === 'object') {
        tableName = String(node.name.name || '').replace(/[`"[\]]/g, '').toLowerCase();
        if (node.name.schema) {
          schemaName = String(node.name.schema).replace(/[`"[\]]/g, '').toLowerCase();
        }
      }

      if (normalizedForbidden.includes(tableName)) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: Restricted table access attempt on '${tableName}'.`);
      }

      if (SENSITIVE_SCHEMAS.includes(schemaName) || SENSITIVE_SCHEMAS.includes(tableName)) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: Administrative schema access denied on '${tableName}'.`);
      }

      if (tableName.startsWith('pg_') || tableName.startsWith('mysql_')) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: System table access attempt on '${tableName}'.`);
      }
    }

    // Function call check
    if (node.type === 'call' && node.function) {
      const funcName = String(node.function.name || '').toLowerCase();
      if (FORBIDDEN_FUNCTIONS.some(f => funcName.includes(f))) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: Execution of administrative function '${funcName}' is blocked.`);
      }
    }

    // Recurse into child nodes
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const item of child) checkNode(item);
        } else if (typeof child === 'object' && child !== null) {
          checkNode(child);
        }
      }
    }
  }

  for (const stmt of astArray) {
    if (stmt.type) {
      const stmtType = String(stmt.type).toLowerCase();
      if (!ALLOWED_STATEMENT_TYPES.some(a => stmtType.includes(a))) {
        throw new Error(`[AdminZero AST] THREAT BLOCKED: Statement type [${stmt.type.toUpperCase()}] is forbidden under read-only security policy.`);
      }
    }
    checkNode(stmt);
  }

  return {
    safe: true,
    auditData: {
      timestamp: Date.now(),
      statementCount: astArray.length,
      statementType: astArray[0]?.type || 'unknown'
    }
  };
}

/**
 * MySQL/generic regex-based validation fallback.
 * @param {string} sql
 * @param {string[]} forbiddenTables
 */
export function validateQueryMySQL(sql, forbiddenTables = []) {
  const upper = sql.toUpperCase();

  const writeKeywords = [
    'INSERT ', 'UPDATE ', 'DELETE ', 'DROP ', 'ALTER ', 'CREATE ',
    'TRUNCATE ', 'REPLACE ', 'GRANT ', 'REVOKE ', 'EXECUTE '
  ];
  if (writeKeywords.some(kw => upper.includes(kw))) {
    throw new Error('[AdminZero AST] THREAT BLOCKED: Write/mutation commands are forbidden under read-only policy.');
  }

  const sensitiveNames = ['INFORMATION_SCHEMA', 'PG_CATALOG', 'MYSQL', 'SYS', 'PERFORMANCE_SCHEMA'];
  if (sensitiveNames.some(t => upper.includes(t))) {
    throw new Error('[AdminZero AST] THREAT BLOCKED: Administrative schema access denied.');
  }

  for (const table of forbiddenTables) {
    if (upper.includes(table.toUpperCase())) {
      throw new Error(`[AdminZero AST] THREAT BLOCKED: Restricted table access attempt on '${table}'.`);
    }
  }

  return { safe: true, auditData: { timestamp: Date.now(), dialect: 'mysql' } };
}

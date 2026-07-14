import { parse } from 'pgsql-ast-parser';

/**
 * Deterministically validates the security of a given SQL query using a recursive fail-closed AST scanner.
 * Specifically protects against Prompt-to-SQL (P2SQL) Injection vectors (OWASP LLM01).
 *
 * @param sql The raw SQL query string to inspect.
 * @param forbiddenTables Array of table names restricted from query access.
 * @throws {Error} Security exception indicating threat block if validation fails.
 * @returns Safety audit data if query validation passes cleanly.
 */
export async function validateQuery(
  sql: string,
  forbiddenTables: string[] = []
): Promise<{ safe: boolean; auditData: any }> {
  // Pre-parser defense: Sanity check for dangerous comments and obfuscation patterns before compilation
  const normalizedRaw = sql.toLowerCase().replace(/\s+/g, ' ');
  
  // Block inline comments containing dangerous keywords or administrative schemas
  if (normalizedRaw.includes('/*') || normalizedRaw.includes('--')) {
    const suspiciousKeywords = [
      'drop', 'delete', 'update', 'insert', 'alter', 'truncate', 
      'pg_', 'information_schema', 'mysql', 'schema', 'credential'
    ];
    if (suspiciousKeywords.some(kw => normalizedRaw.includes(kw))) {
      throw new Error('[AdminZero SecOps] THREAT BLOCKED: Suspicious keyword detected inside SQL comment syntax.');
    }
  }

  let astArray: any[];
  try {
    // Attempt AST parsing to catch malformed SQL / syntax obfuscations designed to bypass validation
    astArray = parse(sql);
  } catch (err: any) {
    console.error('[AdminZero SecOps] Parsing failed:', err);
    throw new Error('[AdminZero SecOps] THREAT BLOCKED: Unparseable SQL Syntax payload detected. Failsafe Closed.');
  }

  const normalizedForbidden = forbiddenTables.map(t => t.toLowerCase());

  // Recursive AST scanner checking all child nodes for unauthorized types
  function checkNode(node: any): void {
    if (!node || typeof node !== 'object') return;

    // Check node statement type
    if (node.type) {
      const nodeType = String(node.type).toLowerCase();
      
      // Prohibited statement types
      const forbiddenTypes = [
        'insert', 'update', 'delete', 'drop', 'alter', 'truncate', 
        'create', 'grant', 'revoke', 'replace', 'transaction', 
        'commit', 'rollback', 'copy', 'explain', 'prepare', 'execute', 'deallocate'
      ];
      
      if (forbiddenTypes.some(forbidden => nodeType.includes(forbidden))) {
        throw new Error(
          `[AdminZero SecOps] THREAT BLOCKED: Destructive statement type [${node.type.toUpperCase()}] is prohibited.`
        );
      }
    }

    // Check table references
    if (node.type === 'tableRef' && node.name) {
      // Strip brackets, backticks, or double-quotes from table/schema names
      const tableNameClean = String(node.name).replace(/[`"\[\]]/g, '').toLowerCase();
      const schemaNameClean = node.schema ? String(node.schema).replace(/[`"\[\]]/g, '').toLowerCase() : '';

      // Block access to forbidden tables
      if (normalizedForbidden.includes(tableNameClean)) {
        throw new Error(`[AdminZero SecOps] THREAT BLOCKED: Restricted table access attempt on '${node.name}'.`);
      }

      // Block access to internal metadata schemas (schema-harvesting protection)
      const sensitiveSchemas = ['information_schema', 'pg_catalog', 'performance_schema', 'sys', 'mysql'];
      if (sensitiveSchemas.includes(schemaNameClean) || sensitiveSchemas.includes(tableNameClean)) {
        throw new Error(`[AdminZero SecOps] THREAT BLOCKED: Administrative database schema access denied on '${node.name}'.`);
      }
      
      // Block prefix system tables (e.g. pg_shadow, pg_authid)
      if (tableNameClean.startsWith('pg_') || tableNameClean.startsWith('mysql_')) {
        throw new Error(`[AdminZero SecOps] THREAT BLOCKED: System table access attempt on '${node.name}'.`);
      }
    }

    // Check function calls (block sleep injection attacks and execution exploits)
    if (node.type === 'call' && node.function) {
      const funcName = String(node.function.name).toLowerCase();
      const forbiddenFunctions = [
        'sleep', 'pg_sleep', 'sys_eval', 'sys_exec', 'version', 
        'load_file', 'current_setting', 'session_user', 'execute'
      ];
      if (forbiddenFunctions.some(f => funcName.includes(f))) {
        throw new Error(`[AdminZero SecOps] THREAT BLOCKED: Execution of administrative function '${funcName}' is blocked.`);
      }
    }

    // Recursively scan all properties on this AST node
    for (const key in node) {
      if (Object.prototype.hasOwnProperty.call(node, key)) {
        const child = node[key];
        if (Array.isArray(child)) {
          for (const item of child) {
            checkNode(item);
          }
        } else if (typeof child === 'object' && child !== null) {
          checkNode(child);
        }
      }
    }
  }

  // Iterate through all parsed statements in the batch (blocks semicolon stacked queries)
  for (const stmt of astArray) {
    if (stmt.type) {
      const stmtType = String(stmt.type).toLowerCase();
      // Allow only SELECT, SHOW, or DESCRIBE statements
      const allowedTypes = ['select', 'show', 'describe'];
      const isAllowed = allowedTypes.some(allowed => stmtType.includes(allowed));
      if (!isAllowed) {
        throw new Error(
          `[AdminZero SecOps] THREAT BLOCKED: Statement type [${stmt.type.toUpperCase()}] is forbidden under read-only security policies.`
        );
      }
    }
    checkNode(stmt);
  }

  return {
    safe: true,
    auditData: {
      timestamp: Date.now(),
      statementCount: astArray.length
    }
  };
}

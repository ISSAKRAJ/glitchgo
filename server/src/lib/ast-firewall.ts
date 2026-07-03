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

    if (node.type) {
      const nodeType = String(node.type).toLowerCase();
      // Block any non-read-only statement types or data mutation operations
      const forbiddenTypes = [
        'insert', 'update', 'delete', 'drop', 'alter', 'truncate', 
        'create', 'grant', 'replace', 'transaction', 'commit', 'rollback'
      ];
      const isForbidden = forbiddenTypes.some(forbidden => nodeType.includes(forbidden));
      if (isForbidden) {
        throw new Error(
          `[AdminZero SecOps] THREAT BLOCKED: Prompt-to-SQL (P2SQL) Injection attempt detected. Destructive AST node type [${node.type.toUpperCase()}] intercepted.`
        );
      }
    }

    // Check table references against forbidden tables registry
    if (node.type === 'tableRef' && node.name) {
      const tableNameLower = String(node.name).toLowerCase();
      if (normalizedForbidden.includes(tableNameLower)) {
        throw new Error(`[AdminZero SecOps] THREAT BLOCKED: Restricted table access attempt on '${node.name}'.`);
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
          `[AdminZero SecOps] THREAT BLOCKED: Prompt-to-SQL (P2SQL) Injection attempt detected. Destructive AST node type [${stmt.type.toUpperCase()}] intercepted.`
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

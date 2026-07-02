import { parse, astVisitor } from 'pgsql-ast-parser';

/**
 * Validates the safety of a given SQL query string.
 * Enforces read-only SELECT constraints and checks against a forbidden tables registry using AST parsing.
 * 
 * @param sql The raw SQL query string to evaluate.
 * @param forbiddenTables Optional array of table names restricted from query access.
 * @returns Safety validation status and the failure reason if blocked.
 */
export function validateQuerySafety(
  sql: string,
  forbiddenTables: string[] = []
): { isSafe: boolean; reason?: string } {
  try {
    // Attempt AST parsing to catch malformed SQL / syntax error obfuscations
    const statements = parse(sql);

    // 1. Read-Only Constraint Check
    for (const stmt of statements) {
      if (stmt.type !== 'select') {
        return {
          isSafe: false,
          reason: "Forbidden Statement Type: Only SELECT queries are allowed."
        };
      }
    }

    // 2. Table Restriction Check via AST Traversal
    const normalizedForbidden = forbiddenTables.map(t => t.toLowerCase());
    let forbiddenFound: string | null = null;

    const visitor = astVisitor(map => ({
      tableRef: t => {
        const tableNameLower = t.name.toLowerCase();
        if (normalizedForbidden.includes(tableNameLower)) {
          forbiddenFound = t.name;
          // Halt execution immediately by throwing a recognizable internal string
          throw new Error(`__FORBIDDEN_TABLE__:${t.name}`);
        }
      }
    }));

    for (const stmt of statements) {
      visitor.statement(stmt);
    }

    return { isSafe: true };

  } catch (err: any) {
    // Intercept our targeted internal error for immediate return
    if (err.message && err.message.startsWith('__FORBIDDEN_TABLE__:')) {
      const tableName = err.message.split('__FORBIDDEN_TABLE__:')[1];
      return {
        isSafe: false,
        reason: `Access Denied: Table '${tableName}' is restricted.`
      };
    }
    // Block any other errors as Syntax or Parse failures
    return {
      isSafe: false,
      reason: "Syntax Error or Malformed SQL"
    };
  }
}

import { validateQuery } from '../../server/src/lib/ast-firewall';

describe('AdminZero Deterministic AST Security Firewall Suite', () => {
  
  // 1. Safe Queries
  describe('Safe Read-Only Operations', () => {
    test('should allow simple SELECT statements', async () => {
      const q = "SELECT id, name FROM products WHERE category = 'hardware' LIMIT 10;";
      const result = await validateQuery(q);
      expect(result.safe).toBe(true);
      expect(result.auditData.statementCount).toBe(1);
    });

    test('should allow CTEs (WITH expressions) that are read-only', async () => {
      const q = `
        WITH regional_sales AS (
          SELECT region, SUM(amount) AS total FROM sales GROUP BY region
        )
        SELECT * FROM regional_sales WHERE total > 10000;
      `;
      const result = await validateQuery(q);
      expect(result.safe).toBe(true);
    });

    test('should allow JOINs and aggregations', async () => {
      const q = `
        SELECT o.id, c.name, SUM(i.price) 
        FROM orders o
        JOIN clients c ON o.client_id = c.id
        JOIN items i ON i.order_id = o.id
        GROUP BY o.id, c.name;
      `;
      const result = await validateQuery(q);
      expect(result.safe).toBe(true);
    });
  });

  // 2. Destructive SQL Block
  describe('Mutation & Destructive Query Interception', () => {
    const dangerousQueries = [
      "DROP TABLE users;",
      "DELETE FROM products WHERE price < 100;",
      "UPDATE accounts SET balance = 9999999 WHERE id = 1;",
      "INSERT INTO logs (action, timestamp) VALUES ('leak', NOW());",
      "ALTER TABLE credentials ADD COLUMN is_admin boolean;",
      "TRUNCATE TABLE transactions;",
      "CREATE TABLE backdoors (cmd text);",
      "GRANT ALL PRIVILEGES ON DATABASE prod TO hacker;"
    ];

    dangerousQueries.forEach((q, index) => {
      test(`should block dangerous query #${index + 1}`, async () => {
        await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
      });
    });
  });

  // 3. Stacked Semicolon Queries
  describe('Stacked Query Execution Attacks', () => {
    test('should block stacked statements attempting mutations after select', async () => {
      const q = "SELECT * FROM sales; DROP TABLE users;";
      await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
    });

    test('should block multiple safe statements (strict read-only batch limits)', async () => {
      const q = "SELECT 1; SELECT 2;";
      // Semicolon queries are parsed as batches, if any statement is stacked, block it for safety
      await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
    });
  });

  // 4. System Schema Harvesting Protection
  describe('Internal Catalog & System Schema Protection', () => {
    const sysQueries = [
      "SELECT * FROM information_schema.tables;",
      "SELECT * FROM pg_catalog.pg_user;",
      "SELECT usename, passwd FROM pg_shadow;",
      "SELECT * FROM mysql.user;",
      "SELECT * FROM performance_schema.setup_actors;"
    ];

    sysQueries.forEach((q, index) => {
      test(`should block schema-harvesting query #${index + 1}`, async () => {
        await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
      });
    });
  });

  // 5. Function Injection Attacks
  describe('Administrative Function Abuse', () => {
    const funcQueries = [
      "SELECT pg_sleep(10);",
      "SELECT sleep(5);",
      "SELECT version();",
      "SELECT current_setting('server_version');"
    ];

    funcQueries.forEach((q, index) => {
      test(`should block function abuse query #${index + 1}`, async () => {
        await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
      });
    });
  });

  // 6. Comment Obfuscation Attacks
  describe('Comment Obfuscation Bypass Attacks', () => {
    const commentBypasses = [
      "SELECT * FROM users; -- DROP TABLE users;",
      "SELECT /*!50000 * */ FROM pg_shadow;",
      "SELECT 1; /* delete from users; */",
      "SELECT * FROM companies -- pg_catalog"
    ];

    commentBypasses.forEach((q, index) => {
      test(`should detect and block comment obfuscation query #${index + 1}`, async () => {
        await expect(validateQuery(q)).rejects.toThrow(/THREAT BLOCKED/i);
      });
    });
  });

});

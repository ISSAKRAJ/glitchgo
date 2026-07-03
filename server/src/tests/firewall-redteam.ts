import { validateQuery } from '../lib/ast-firewall.js';

interface TestResult {
  vectorName: string;
  expectedBlocked: boolean;
  actualBlocked: boolean;
  statusCode: string;
  message: string;
}

const tests = [
  {
    name: "Vector A: Semicolon Stacked Query",
    payload: "SELECT id, name, email FROM customers WHERE status = 'active'; DROP TABLE tenant_api_keys;",
    expectedBlocked: true
  },
  {
    name: "Vector B: CTE Modification Exploit",
    payload: "WITH exfiltrated AS (DELETE FROM financial_records WHERE amount > 10000 RETURNING account_id) SELECT * FROM exfiltrated;",
    expectedBlocked: true
  },
  {
    name: "Vector C: Obfuscated Syntax Malformation",
    payload: "SELECT /**/UNION/**/SELExxxxCT char(0x41) FROM (((((users WHERE id = '1' OR 1=1; DROP--",
    expectedBlocked: true
  },
  {
    name: "Vector D: Complex Legitimate Query",
    payload: "SELECT region, COUNT(id) as total_sales, AVG(amount) as avg_deal FROM sales_2026 WHERE date >= '2026-01-01' GROUP BY region ORDER BY total_sales DESC LIMIT 50;",
    expectedBlocked: false
  }
];

async function runSuite() {
  console.log("===============================================================");
  console.log("             AdminZero P2SQL SecOps Red-Team Suite             ");
  console.log("===============================================================");

  let hasFailures = false;

  for (const test of tests) {
    let actualBlocked = false;
    let statusCode = "200 OK";
    let message = "Allowed";

    try {
      const result = await validateQuery(test.payload);
      message = `safe: ${result.safe}`;
    } catch (err: any) {
      actualBlocked = true;
      statusCode = "403 Forbidden";
      message = err.message || String(err);
    }

    const testPassed = test.expectedBlocked === actualBlocked;
    const logTag = testPassed ? "[PASS]" : "[FAIL]";

    if (!testPassed) {
      hasFailures = true;
    }

    console.log(`${logTag} ${test.name} | Status: ${statusCode} | ${message}`);
  }

  console.log("===============================================================");
  if (hasFailures) {
    console.error("RED-TEAM SUITE FAILED: Firewall validation integrity compromised.");
    process.exit(1);
  } else {
    console.log("RED-TEAM SUITE PASSED: All threat vectors blocked. Failsafe secure.");
    process.exit(0);
  }
}

runSuite().catch((err) => {
  console.error("Verification runner crashed:", err);
  process.exit(1);
});

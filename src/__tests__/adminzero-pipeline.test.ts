import { validateSQLWithAST, handleSlackMessage } from '../lib/ai/text-to-sql';
import { POST } from '../app/api/slack/interactions/route';
import { NextRequest } from 'next/server';
import { Client } from 'pg';
import { GoogleGenAI } from '@google/genai';
import * as dbMock from '../lib/db/supabase-workspaces';

// Set up mock environment variables
process.env.GEMINI_API_KEY = 'mock-gemini-key';
process.env.SLACK_BOT_TOKEN = 'mock-slack-token';
process.env.DEEPSEEK_API_KEY = 'mock-deepseek-key';

// Mock supabase db connection methods
jest.mock('../lib/db/supabase-workspaces', () => ({
  getWorkspaceToken: jest.fn(),
  getConnection: jest.fn(),
  getWorkspace: jest.fn(),
  incrementWorkspaceQueryCount: jest.fn(),
}));

jest.mock('../lib/encryption/aes', () => ({
  decrypt: jest.fn((str) => str),
}));

// Mock pg Client
jest.mock('pg', () => {
  const mockQuery = jest.fn();
  const mockConnect = jest.fn();
  const mockEnd = jest.fn();
  class MockClient {
    connect = mockConnect;
    query = mockQuery;
    end = mockEnd;
  }
  return { Client: MockClient };
});

// Mock @google/genai
jest.mock('@google/genai', () => {
  const mockGenerateContent = jest.fn();
  class MockGoogleGenAI {
    models = {
      generateContent: mockGenerateContent,
    };
  }
  return { GoogleGenAI: MockGoogleGenAI };
});

describe('AdminZero Advanced Backend Event Processor - Testing Suite', () => {
  let originalFetch: typeof global.fetch;
  let mockFetch: jest.Mock;

  beforeAll(() => {
    originalFetch = global.fetch;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockFetch = jest.fn();
    global.fetch = mockFetch;
  });

  afterAll(() => {
    global.fetch = originalFetch;
  });

  /* ==========================================
     1. WHITE-BOX TESTING (AST Validator)
     ========================================== */
  describe('White-Box: AST Validator Functions', () => {
    test('should allow a standard safe query', () => {
      const safeQuery = "SELECT * FROM companies WHERE tier = 'Enterprise' LIMIT 10;";
      expect(() => validateSQLWithAST(safeQuery)).not.toThrow();
    });

    test('should block mutating statements', () => {
      const dangerousQueries = [
        'DROP TABLE users;',
        'DELETE FROM products WHERE id = 5;',
        'UPDATE users SET role = \'admin\' WHERE id = 1;',
        'INSERT INTO logs (message) VALUES (\'malicious\');',
        'ALTER TABLE billing ADD COLUMN card_number text;',
        'TRUNCATE TABLE transactions;'
      ];

      for (const query of dangerousQueries) {
        expect(() => validateSQLWithAST(query)).toThrow(/Unauthorized SQL operation/i);
      }
    });

    test('should block queries referencing blacklisted columns', () => {
      const blacklistQueries = [
        'SELECT password FROM users;',
        'SELECT u.username, u.secret_key FROM users u;',
        'SELECT id, name, ssn FROM employees;',
        'SELECT cc_number, cvv FROM payments;'
      ];

      for (const query of blacklistQueries) {
        expect(() => validateSQLWithAST(query)).toThrow(/column.*is blacklisted/i);
      }
    });
  });

  /* ==========================================
     2. INTEGRATION TESTING (Orchestration & Fallback)
     ========================================== */
  describe('Integration: Orchestration & Dual-Model Fallback', () => {
    const mockSchema = 'CREATE TABLE companies (id int, name text, tier text);';
    const mockChannel = 'C12345';
    const mockUserId = 'U99999';
    const mockTeamId = 'T88888';

    beforeEach(() => {
      // Mock Supabase calls
      (dbMock.getWorkspaceToken as jest.Mock).mockResolvedValue('mock-workspace-slack-token');
      (dbMock.getWorkspace as jest.Mock).mockResolvedValue({ query_count: 0, max_queries: 100 });
      (dbMock.getConnection as jest.Mock).mockResolvedValue({
        client_name: 'Test DB',
        encrypted_pg_url: 'postgres://localhost/test',
        schema_hint: mockSchema
      });
    });

    test('Scenario A (Fast Lane Success): DeepSeek V3 succeeds directly without escalation', async () => {
      // 1. Mock fetch responses:
      // - First: Slack post placeholder
      // - Second: DeepSeek query completion (valid SQL)
      // - Third: Slack message update
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, ts: 'placeholder-ts' })
        }) // postToSlack (placeholder)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'SELECT * FROM companies;' } }]
          })
        }) // generateSQLWithDeepSeek
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // updateSlackMessage (executing)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }); // updateSlackMessage (final success)

      // Mock pg client
      const pgClientMock = new Client();
      const mockRows = [{ id: 1, name: 'Acme Corp', tier: 'Enterprise' }];
      (pgClientMock.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

      // Mock Gemini synthesis (gemini-2.5-flash)
      const aiInstance = new GoogleGenAI({ apiKey: 'key' });
      const mockSynthesize = (aiInstance.models.generateContent as jest.Mock).mockResolvedValueOnce({
        text: '*Acme Corp* is an enterprise company.'
      });

      // Run orchestrator
      await handleSlackMessage(mockChannel, 'Show me enterprise companies', mockUserId, mockTeamId);

      // Verify DeepSeek SQL executed
      expect(pgClientMock.query).toHaveBeenCalledWith({ text: 'SELECT * FROM companies LIMIT 100;' });

      // Verify no escalation to Gemini Pro occurred (generateContent only called once for Synthesis)
      expect(mockSynthesize).toHaveBeenCalledTimes(1);

      // Verify query count incremented
      expect(dbMock.incrementWorkspaceQueryCount).toHaveBeenCalledWith(mockTeamId);
    });

    test('Scenario B (Fast-Fail Escalation): DeepSeek fails, Gemini 2.5 Pro repairs', async () => {
      // Mock fetch responses:
      // - 1st: Slack placeholder
      // - 2nd: DeepSeek API (returns bad SQL query)
      // - 3rd: Slack executing notice
      // - 4th: Slack escalate notice
      // - 5th: Slack repaired query notice
      // - 6th: Slack final message update
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, ts: 'placeholder-ts' })
        }) // Slack placeholder
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'SELECT * FROM non_existent_table;' } }]
          })
        }) // DeepSeek generates SQL with error
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack executing notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack escalate notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack repaired query notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }); // Slack final synthesis update

      // Mock PG query
      const pgClientMock = new Client();
      // First query (DeepSeek SQL) fails
      (pgClientMock.query as jest.Mock).mockRejectedValueOnce(
        new Error('relation "non_existent_table" does not exist')
      );
      // Second query (Gemini Pro corrected SQL) succeeds
      const mockRows = [{ id: 1, name: 'Acme Corp', tier: 'Enterprise' }];
      (pgClientMock.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

      // Mock Gemini calls
      const aiInstance = new GoogleGenAI({ apiKey: 'key' });
      // 1. Gemini Pro (Senior DBA) repair call returns corrected SQL
      (aiInstance.models.generateContent as jest.Mock).mockResolvedValueOnce({
        text: 'SELECT * FROM companies;'
      });
      // 2. Gemini Flash synthesis call
      (aiInstance.models.generateContent as jest.Mock).mockResolvedValueOnce({
        text: 'Corrected insight: *Acme Corp* matches.'
      });

      // Run orchestrator
      await handleSlackMessage(mockChannel, 'Show companies', mockUserId, mockTeamId);

      // Verify Gemini Pro repair escalation was called
      expect(aiInstance.models.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-pro',
          contents: expect.stringContaining('relation "non_existent_table" does not exist')
        })
      );

      // Verify Gemini Flash synthesis was called
      expect(aiInstance.models.generateContent).toHaveBeenLastCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          contents: expect.stringContaining('Show companies')
        })
      );

      // Verify query count incremented
      expect(dbMock.incrementWorkspaceQueryCount).toHaveBeenCalledWith(mockTeamId);
    });

    test('Integration: Should gracefully handle statement timeouts when a query takes too long', async () => {
      // Mock fetch responses:
      // - 1st: Slack placeholder
      // - 2nd: DeepSeek API (returns SQL that will timeout)
      // - 3rd: Slack executing notice
      // - 4th: Slack escalate notice
      // - 5th: Slack repaired query executing notice
      // - 6th: Slack final failure message
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, ts: 'placeholder-ts' })
        }) // Slack placeholder
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'SELECT * FROM complex_joins;' } }]
          })
        }) // DeepSeek
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack executing notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack escalate notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }) // Slack repaired query executing notice
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        }); // Slack final failure message

      // Mock PG queries: both fail with timeout error
      const pgClientMock = new Client();
      (pgClientMock.query as jest.Mock)
        .mockRejectedValueOnce(new Error('canceling statement due to statement timeout'))
        .mockRejectedValueOnce(new Error('canceling statement due to statement timeout'));

      // Mock Gemini repair call (return same SQL)
      const aiInstance = new GoogleGenAI({ apiKey: 'key' });
      (aiInstance.models.generateContent as jest.Mock).mockResolvedValueOnce({
        text: 'SELECT * FROM complex_joins;'
      });

      // Run orchestrator
      await handleSlackMessage(mockChannel, 'Get giant Cartesian join', mockUserId, mockTeamId);

      // Verify that final failure message was sent to Slack
      expect(mockFetch).toHaveBeenLastCalledWith(
        'https://slack.com/api/chat.update',
        expect.objectContaining({
          body: expect.stringContaining('encountered an issue with that complex query')
        })
      );
    });

    test('Integration: Should truncate row arrays to a maximum of 100 entries before passing to synthesis', async () => {
      // Mock fetch responses:
      // - 1st: Slack placeholder
      // - 2nd: DeepSeek API (valid SQL)
      // - 3rd: Slack executing notice
      // - 4th: Slack final update
      mockFetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true, ts: 'placeholder-ts' })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            choices: [{ message: { content: 'SELECT * FROM large_table;' } }]
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ ok: true })
        });

      // Mock PG query returning 150 rows
      const pgClientMock = new Client();
      const mockRows = Array.from({ length: 150 }, (_, i) => ({ id: i, value: `row-${i}` }));
      (pgClientMock.query as jest.Mock).mockResolvedValueOnce({ rows: mockRows });

      // Mock Gemini calls
      const aiInstance = new GoogleGenAI({ apiKey: 'key' });
      (aiInstance.models.generateContent as jest.Mock).mockResolvedValueOnce({
        text: 'Synthesized summary of 100 rows.'
      });

      // Run orchestrator
      await handleSlackMessage(mockChannel, 'Show me large table', mockUserId, mockTeamId);

      // Verify that Gemini Flash was called with the truncated rows list of size 100 and system note
      expect(aiInstance.models.generateContent).toHaveBeenCalledWith(
        expect.objectContaining({
          model: 'gemini-2.5-flash',
          contents: expect.stringContaining('[System Note: The data payload exceeded safe limits and was truncated to the first 100 records for performance and safety.]')
        })
      );

      // Verify it contains the first 100 rows, but not the 101st (id: 100)
      const lastCallArgs = (aiInstance.models.generateContent as jest.Mock).mock.calls[0][0];
      const contentsStr = lastCallArgs.contents;
      expect(contentsStr).toContain('"id":99');
      expect(contentsStr).not.toContain('"id":100');
    });
  });

  /* ==========================================
     3. CYBERSECURITY TESTING (Injection Defenses)
     ========================================== */
  describe('Cybersecurity: Vulnerability & Exploit Testing', () => {
    test('Prompt Injection: AST Blocks LLM-hijacked mutations', () => {
      // Simulate LLM outputting a malicious query generated by a prompt injection attack
      const hijackedLLMOutput = "DROP TABLE users;";
      
      // Ensure the AST security scanner intercepts it before it gets executed
      expect(() => validateSQLWithAST(hijackedLLMOutput)).toThrow(/Unauthorized SQL operation/i);
    });

    test('SQL Injection via Natural Language: Tautologies treated as literal comparison structures', () => {
      // Malicious natural language query: "' OR '1'='1' --"
      // Simulated LLM output translating it:
      const sqlWithTautology = "SELECT * FROM users WHERE name = '' OR '1'='1';";
      
      // The AST should parse it as a single statement (SELECT) without issues, 
      // preventing arbitrary statement execution.
      expect(() => validateSQLWithAST(sqlWithTautology)).not.toThrow();
      
      // Let's verify that chained statements (e.g., trying to run DROP table after the SELECT) are blocked.
      const chainedSQLInjection = "SELECT * FROM users WHERE name = ''; DROP TABLE users;";
      expect(() => validateSQLWithAST(chainedSQLInjection)).toThrow(/Multiple SQL statements.*forbidden/i);
    });

    test('Cybersecurity: Should block inference side-channel attacks trying to scan blacklisted columns in WHERE clauses', () => {
      const sideChannelAttack = "SELECT count(*) FROM users WHERE password LIKE 'a%';";
      expect(() => validateSQLWithAST(sideChannelAttack)).toThrow(/is blacklisted|contains a blacklisted/i);
    });
  });

  /* ==========================================
     4. BLACK-BOX TESTING (Slack boundary)
     ========================================== */
  describe('Black-Box: Slack Interaction Boundaries', () => {
    test('should respond to share insight click action with HTTP 200 and trigger webhook message', async () => {
      // Mock Slack response_url fetch POST
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ok: true })
      });

      // Prepare NextRequest mock
      const mockReq = {
        headers: {
          get: jest.fn().mockReturnValue('application/json')
        },
        json: jest.fn().mockResolvedValue({
          actions: [
            {
              action_id: 'adminzero_share_insight',
              value: JSON.stringify({ query: 'SELECT 1;', teamId: 'T123', date: '2026-06-25' })
            }
          ],
          response_url: 'https://hooks.slack.com/actions/mock-url',
          trigger_id: 'mock_trigger'
        })
      } as unknown as NextRequest;

      // Invoke NEXT POST endpoint
      const response = await POST(mockReq);

      // Verify HTTP status code
      expect(response.status).toBe(200);

      // Verify mockFetch dispatched callback to response_url with public insight link
      expect(mockFetch).toHaveBeenCalledWith(
        'https://hooks.slack.com/actions/mock-url',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('Public Insight Generated')
        })
      );
    });
  });
});

import { handleSlackMessage } from '../lib/ai/text-to-sql';
import { supabase } from '../lib/supabase';
import * as dbMock from '../lib/db/supabase-workspaces';

// Set up mock environment variables
process.env.GEMINI_API_KEY = 'mock-gemini-key';
process.env.SLACK_BOT_TOKEN = 'mock-slack-token';
process.env.DEEPSEEK_API_KEY = 'mock-deepseek-key';

// Mock Supabase workspaces operations
jest.mock('../lib/db/supabase-workspaces', () => ({
  getWorkspaceToken: jest.fn(),
  getConnection: jest.fn(),
  getWorkspace: jest.fn(),
  incrementWorkspaceQueryCount: jest.fn(),
  logWorkspaceInstall: jest.fn(),
  logQueryStart: jest.fn().mockResolvedValue(123),
  logQuerySuccess: jest.fn(),
  logQueryFailure: jest.fn(),
}));

// Mock Supabase Client inside factory to avoid Jest hoisting ReferenceErrors
jest.mock('../lib/supabase', () => {
  const mockInsert = jest.fn(() => Promise.resolve({ error: null }));
  const mockFrom = jest.fn(() => ({
    insert: mockInsert
  }));
  return {
    supabase: {
      from: mockFrom
    }
  };
});

// Mock decrypt connection string helper
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

describe('AdminZero Automated Telemetry Integration Testing Suite', () => {
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

  test('Should catch failures in handler pipeline, post safe fallback with Report Issue button, and log to database', async () => {
    // 1. MOCK THE SLACK INPUT & WORKSPACE ENVIRONMENT
    const mockChannel = 'C99999';
    const mockUserId = 'U88888';
    const mockTeamId = 'T77777';
    const brokenPrompt = 'SELECT * FROM a_table_that_does_not_exist';

    // Mock workspaces & credentials mapping to fail and trigger the outer catch wrapper
    (dbMock.getConnection as jest.Mock).mockRejectedValueOnce(
      new Error('Supabase database connection failure')
    );

    (dbMock.getWorkspaceToken as jest.Mock).mockResolvedValue('xoxb-mock-bot-token');
    (dbMock.getWorkspace as jest.Mock).mockResolvedValue({
      query_count: 5,
      max_queries: 100
    });

    // Mock Slack response call and API completions dynamically based on URL
    let postedSlackBlocks: any[] = [];
    mockFetch.mockImplementation((url, options) => {
      // Intercept and store posted Slack messages and block layouts
      if (url.includes('chat.postMessage') || url.includes('chat.update')) {
        if (options && options.body) {
          const body = JSON.parse(options.body);
          if (body.blocks) {
            postedSlackBlocks = body.blocks;
          }
        }
        return Promise.resolve({
          ok: true,
          json: async () => ({ ok: true, ts: '12345.678' })
        });
      }

      return Promise.resolve({
        ok: true,
        json: async () => ({ ok: true })
      });
    });

    // Run the main handler pipeline
    await handleSlackMessage(mockChannel, brokenPrompt, mockUserId, mockTeamId);

    // 3. ASSERTION 1: The UI Fallback checks
    // Assert that we sent the safe, hardcoded error notification text
    const errorSection = postedSlackBlocks.find(b => b.type === 'section');
    expect(errorSection).toBeDefined();
    expect(errorSection.text.text).toContain('AdminZero encountered a technical snag. Our team has been notified.');

    // Assert that the Block Kit "Report Issue" action button is appended
    const actionBlock = postedSlackBlocks.find(b => b.type === 'actions');
    expect(actionBlock).toBeDefined();
    expect(actionBlock.elements[0].action_id).toBe('adminzero_report_issue');
    expect(actionBlock.elements[0].text.text).toBe('🚨 Report Issue');

    // 4. ASSERTION 2: Telemetry verification
    // Verify mock database table logging insert was called
    expect(supabase.from).toHaveBeenCalledWith('error_logs');
    
    // Retrieve the insert mock spy from results
    const mockFromSpy = supabase.from as jest.Mock;
    const insertMock = mockFromSpy.mock.results[0].value.insert;

    expect(insertMock).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({
          user_prompt: 'SELECT * FROM a_table_that_does_not_exist',
          generated_sql: null,
          error_message: expect.stringContaining('Supabase database connection failure')
        })
      ])
    );

    // 5. CLEANUP
    mockFromSpy.mockClear();
    insertMock.mockClear();
  });
});

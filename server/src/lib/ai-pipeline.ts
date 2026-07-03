import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { SemanticSchema } from './semantic-profiler.js';
import { validateQuery } from './ast-firewall.js';
import { ConnectorFactory, ConnectionConfig } from './connectors/factory.js';

export class GatewayOutageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GatewayOutageError';
  }
}

/**
 * Redacts any markdown code block wrapping from the LLM sql output.
 */
function cleanSqlOutput(rawSql: string): string {
  let cleaned = rawSql.trim();
  // Strip markdown code block wrapping: e.g. ```sql ... ``` or ``` ... ```
  const match = cleaned.match(/^```(?:sql)?\s*([\s\S]*?)\s*```$/i);
  if (match) {
    cleaned = match[1].trim();
  }
  return cleaned;
}

/**
 * Formats the SemanticSchema into a structured text context for the prompt.
 */
function formatSchemaForPrompt(schema: SemanticSchema): string {
  let result = "Database Schema:\n";
  for (const table of schema.tables) {
    result += `- Table: "${table.tableName}"\n`;
    result += "  Columns:\n";
    for (const col of table.columns) {
      result += `    * "${col.name}" (${col.type})${col.isPrimaryKey ? ' [PRIMARY KEY]' : ''}\n`;
    }
    if (table.foreignKeys && table.foreignKeys.length > 0) {
      result += "  Relationships:\n";
      for (const fk of table.foreignKeys) {
        result += `    * Column "${fk.column}" references "${fk.referencesTable}"("${fk.referencesColumn}")\n`;
      }
    }
  }
  return result;
}

/**
 * Builds the system instructions for the LLM.
 */
function buildSystemPrompt(dialect: string, schemaContext: string): string {
  return `You are an expert database backend engineer.
Your task is to translate the user's natural language question into a single, clean, valid SQL SELECT query targeting the ${dialect} dialect.

Rules:
1. You MUST ONLY generate a SELECT query. Modifying, creating, or destroying schema/data is strictly forbidden.
2. Rely EXCLUSIVELY on the schema context provided. Do not query tables or columns not defined.
3. Be highly performant, use joins correctly, and keep it minimal.
4. Output ONLY the raw SQL query. Do not add markdown wrapping (like \`\`\`sql), descriptions, text explanations, or notes.
5. All identifiers (tables, columns) must match the case and naming defined in the schema.

${schemaContext}`;
}

/**
 * Wires the LLM generation, AST Security Firewall, and Database Connection Factory.
 * Employs a 3-tier resilient fallback cascade (Groq -> Gemini -> OpenRouter) to guarantee gateway uptime.
 * 
 * @param question The natural language question to ask the database.
 * @param config The target database connection configuration.
 * @param schema The semantic schema definition of the target database.
 * @param forbiddenTables Array of tables that are restricted from query access.
 * @throws {GatewayOutageError} If all three model providers fail.
 * @throws {Error} If query fails security check or database query throws error.
 * @returns Object containing the generated SQL query and the resulting data rows.
 */
export async function askDatabase(
  question: string,
  config: ConnectionConfig,
  schema: SemanticSchema,
  forbiddenTables: string[] = []
): Promise<{ sql: string; data: any[] }> {
  const dialect = config.dialect;
  const schemaContext = formatSchemaForPrompt(schema);
  const systemPrompt = buildSystemPrompt(dialect, schemaContext);

  let generatedSql = '';
  const errors: string[] = [];

  // --- ATTEMPT 1: GROQ (deepseek-r1-distill-llama-70b) ---
  const groqKey = process.env.GROQ_API_KEY;
  if (groqKey) {
    try {
      console.log('[Gateway] Attempting query generation via Groq...');
      const groqClient = new OpenAI({
        apiKey: groqKey,
        baseURL: 'https://api.groq.com/openai/v1'
      });
      const response = await groqClient.chat.completions.create({
        model: 'deepseek-r1-distill-llama-70b',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: question }
        ],
        temperature: 0.0
      });
      const rawText = response.choices[0]?.message?.content;
      if (rawText) {
        generatedSql = cleanSqlOutput(rawText);
        console.log('[Gateway] Groq generation: SUCCESS');
      }
    } catch (err: any) {
      const errMsg = err.message || String(err);
      console.warn(`[Gateway] Groq failed: ${errMsg}. Falling back to Gemini...`);
      errors.push(`Groq: ${errMsg}`);
    }
  } else {
    console.log('[Gateway] Groq skipped: GROQ_API_KEY is not defined.');
    errors.push('Groq: GROQ_API_KEY missing');
  }

  // --- ATTEMPT 2: GEMINI (gemini-2.5-flash) ---
  if (!generatedSql) {
    const geminiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (geminiKey) {
      try {
        console.log('[Gateway] Attempting query generation via Gemini...');
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: question,
          config: {
            systemInstruction: systemPrompt,
            temperature: 0.0
          }
        });
        const rawText = response.text;
        if (rawText) {
          generatedSql = cleanSqlOutput(rawText);
          console.log('[Gateway] Gemini generation: SUCCESS');
        }
      } catch (err: any) {
        const errMsg = err.message || String(err);
        console.warn(`[Gateway] Gemini failed: ${errMsg}. Falling back to OpenRouter...`);
        errors.push(`Gemini: ${errMsg}`);
      }
    } else {
      console.log('[Gateway] Gemini skipped: GEMINI_API_KEY is not defined.');
      errors.push('Gemini: GEMINI_API_KEY missing');
    }
  }

  // --- ATTEMPT 3: OPENROUTER (deepseek/deepseek-chat) ---
  if (!generatedSql) {
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      try {
        console.log('[Gateway] Attempting query generation via OpenRouter...');
        const orClient = new OpenAI({
          apiKey: openrouterKey,
          baseURL: 'https://openrouter.ai/api/v1',
          defaultHeaders: {
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "AdminZero Gateway"
          }
        });
        const response = await orClient.chat.completions.create({
          model: 'deepseek/deepseek-chat',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: question }
          ],
          temperature: 0.0
        });
        const rawText = response.choices[0]?.message?.content;
        if (rawText) {
          generatedSql = cleanSqlOutput(rawText);
          console.log('[Gateway] OpenRouter generation: SUCCESS');
        }
      } catch (err: any) {
        const errMsg = err.message || String(err);
        console.warn(`[Gateway] OpenRouter failed: ${errMsg}.`);
        errors.push(`OpenRouter: ${errMsg}`);
      }
    } else {
      console.log('[Gateway] OpenRouter skipped: OPENROUTER_API_KEY is not defined.');
      errors.push('OpenRouter: OPENROUTER_API_KEY missing');
    }
  }

  // If all providers failed, throw GatewayOutageError
  if (!generatedSql) {
    throw new GatewayOutageError(
      `All query generation providers failed.\nDetails:\n- ${errors.join('\n- ')}`
    );
  }

  // Run the generated SQL query through the AST Security Firewall
  try {
    await validateQuery(generatedSql, forbiddenTables);
  } catch (err: any) {
    throw new Error(`AST Firewall Blocked Query: ${err.message}`);
  }

  // Execute the safe query in the target database connection
  const data = await ConnectorFactory.runQuery(config, async (client) => {
    if (dialect === 'postgres') {
      const res = await client.query(generatedSql);
      return res.rows;
    } else {
      const [rows] = await client.query(generatedSql);
      return rows as any[];
    }
  });

  return { sql: generatedSql, data };
}

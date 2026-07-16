/**
 * AdminZero Vector DB Protection
 * POST /api/v1/query/vector
 *
 * Protects vector/semantic search queries:
 * 1. Prompt injection firewall
 * 2. PII scrubber
 * 3. Returns sanitized query safe for embedding
 * 4. Audit trail logging
 *
 * The developer passes the raw user query, we return a clean version
 * they can safely send to Pinecone / Weaviate / ChromaDB / pgvector.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { scrubPII } from '../../../../../lib/pii-scrubber.js';
import { scanPrompt } from '../../../../../lib/prompt-firewall.js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Semantic search specific threat patterns
const VECTOR_THREATS = [
  { type: 'EMBEDDING_POISON', pattern: /ignore\s+(previous|all)\s+(embeddings?|vectors?|context)/i },
  { type: 'CONTEXT_OVERRIDE', pattern: /the\s+(true|real|actual)\s+(answer|result|meaning)\s+is/i },
  { type: 'RETRIEVAL_ATTACK', pattern: /always\s+return\s+(this|the\s+following)\s+(document|result|text)/i },
  { type: 'SIMILARITY_BYPASS', pattern: /set\s+(similarity|score|distance)\s+to\s+(1|100|maximum)/i },
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { query, license_key, collection, top_k = 10 } = body;

    if (!license_key) {
      return NextResponse.json({ error: 'Missing license_key.' }, { status: 401 });
    }
    if (!query) {
      return NextResponse.json({ error: 'Missing query.' }, { status: 400 });
    }

    // Validate license
    const { data: workspace } = await supabase
      .from('workspaces')
      .select('team_id, query_count, max_queries, tier')
      .eq('team_id', license_key)
      .single();

    if (!workspace) {
      return NextResponse.json({ error: 'Invalid license key.', code: 'INVALID_LICENSE' }, { status: 401 });
    }

    if ((workspace.query_count || 0) >= (workspace.max_queries || 500)) {
      return NextResponse.json({ error: 'Query quota exceeded.', code: 'QUOTA_EXCEEDED' }, { status: 402 });
    }

    // Prompt injection scan
    const injectionScan = scanPrompt(query);
    const vectorThreat = VECTOR_THREATS.find(({ pattern }) => pattern.test(query));

    if (!injectionScan.safe || vectorThreat) {
      const threat = injectionScan.threats[0] || vectorThreat;
      await supabase.from('query_logs').insert([{
        workspace_id: license_key,
        user_prompt: query.substring(0, 500),
        status: 'blocked',
        threat_type: `VECTOR:${threat?.type || 'INJECTION'}`,
        created_at: new Date().toISOString()
      }]);

      return NextResponse.json({
        error: '[AdminZero] THREAT BLOCKED: Dangerous pattern detected in vector query.',
        code: 'VECTOR_INJECTION_BLOCKED',
        threatType: threat?.type
      }, { status: 403 });
    }

    // PII Scrub
    const piiResult = scrubPII(query);

    // Log event
    await supabase.from('query_logs').insert([{
      workspace_id: license_key,
      user_prompt: query.substring(0, 500),
      generated_sql: `[VECTOR] collection=${collection || 'default'} top_k=${top_k}`,
      status: 'success',
      pii_detected: piiResult.count > 0,
      pii_types: piiResult.detectedTypes,
      created_at: new Date().toISOString()
    }]);

    // Deduct credit
    await supabase.from('workspaces')
      .update({ query_count: (workspace.query_count || 0) + 1 })
      .eq('team_id', license_key);

    return NextResponse.json({
      status: 'success',
      sanitizedQuery: piiResult.sanitized,
      originalQuery: query,
      meta: {
        piiScrubbed: piiResult.count > 0,
        piiTypesFound: piiResult.detectedTypes,
        injectionSafe: true,
        collection: collection || 'default',
        top_k,
        usage: 'Pass sanitizedQuery to your vector DB embedding function.'
      }
    });

  } catch (err) {
    console.error('[AdminZero /api/v1/query/vector] Error:', err);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'AdminZero Vector DB Protection',
    version: '1.0.0',
    description: 'Sanitizes semantic search queries before they reach vector databases.',
    features: ['prompt-injection-scan', 'pii-scrubber', 'vector-specific-threats', 'audit-trail'],
    supported: ['Pinecone', 'Weaviate', 'ChromaDB', 'pgvector', 'Qdrant', 'Milvus', 'any embedding API'],
    endpoint: 'POST /api/v1/query/vector',
    required: { license_key: 'string', query: 'string' },
    optional: { collection: 'string', top_k: 'number' }
  });
}

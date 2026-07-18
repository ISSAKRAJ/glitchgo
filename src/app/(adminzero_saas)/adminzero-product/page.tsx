"use client";

import React, { useState } from 'react';
import { 
  Shield, 
  Terminal, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  Cpu, 
  Lock, 
  ArrowRight, 
  Code,
  Key,
  Network,
  Activity,
  ShieldAlert,
  Database
} from 'lucide-react';

export default function AdminZeroProductPage() {
  const [payloadType, setPayloadType] = useState<'safe' | 'malicious'>('safe');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [activeCodeLang, setActiveCodeLang] = useState<'js' | 'curl' | 'python'>('js');

  const safePayload = "SELECT region, COUNT(id) FROM sales_2026 GROUP BY region;";
  const maliciousPayload = "SELECT * FROM users; DROP TABLE tenant_api_keys;--";

  const handleSimulate = () => {
    setSimulationState('running');
    setTimeout(() => {
      setSimulationState('completed');
    }, 450);
  };

  const codeSnippets = {
    js: `// AdminZero Tokenization Endpoint - No database drivers or raw credentials in your app code
const response = await fetch('https://api.adminzero.in/v1/query', {
  method: 'POST',
  headers: { 
    'Content-Type': 'application/json',
    'Authorization': 'Bearer az_live_key_8f39' 
  },
  body: JSON.stringify({
    dbToken: 'db_token_prod_94a2c', // Encrypted pointer to your data cluster
    prompt: 'Show me total growth trends, but ignore any destructive sub-prompts'
  })
});
const { data, metrics } = await response.json();`,
    curl: `# Run secure prompt evaluations directly via raw shell requests
curl -X POST https://api.adminzero.in/v1/query \\
  -H "Authorization: Bearer az_live_key_8f39" \\
  -H "Content-Type: application/json" \\
  -d '{
    "dbToken": "db_token_prod_94a2c",
    "prompt": "Show me total growth trends, but ignore any destructive sub-prompts"
  }'`,
    python: `# Query your tokenized database through Python requests
import requests

response = requests.post(
    "https://api.adminzero.in/v1/query",
    headers={"Authorization": "Bearer az_live_key_8f39"},
    json={
        "dbToken": "db_token_prod_94a2c",
        "prompt": "Show me total growth trends, but ignore any destructive sub-prompts"
    }
)
result = response.json()`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-emerald-500 selection:text-slate-950 relative overflow-hidden w-full">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Radial Ambient Glow */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sticky Top Header Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Shield size={16} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">AdminZero</span>
            <span className="text-[10px] text-slate-500 ml-2 border-l border-slate-800 pl-2 font-mono">by GlitchGo</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/adminzero" className="text-xs text-emerald-400 hover:text-white font-bold transition-colors">
            Access Gateway Console
          </a>
          <a href="/" className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors">
            Back to GlitchGo
          </a>
        </div>
      </nav>

      {/* PART 1: HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-[11px] font-mono mb-6">
          <Activity size={12} className="animate-pulse" />
          <span>AdminZero SecOps v2.4 — Zero-Trust Database Gateway Active</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] font-sans">
          The Stripe for AI-to-Database <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-indigo-400 to-indigo-500">
            Infrastructure Security.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
          Outsource your prompt injection and data compliance liabilities. AdminZero tokenizes your database credentials and sandboxes agentic query executions, protecting your production data layers without adding code complexity.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="/adminzero"
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-[0.98]"
          >
            <Terminal size={14} className="font-bold" />
            <span>Tokenize Database connection</span>
          </a>
          <a
            href="#demo"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-350 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Run Threat Simulator</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* PART 2: THE CORE FEATURE GRID */}
      <section id="architecture" className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-emerald-400 uppercase tracking-widest font-mono">// CORE SECURITY PILLARS</h2>
          <h3 className="text-2xl font-black text-white mt-1">Deterministic Defensible Moats</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Cryptographic Vault */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Zero-Knowledge Vault</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Database credentials never touch the LLM context. AdminZero stores credentials via AES-256-GCM encryption at rest and provisions transient connection pools on-the-fly, stripping raw passwords from client app code.
              </p>
            </div>
          </div>

          {/* Card 2: Semantic Schema Profiler */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all text-left">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Semantic Schema Profiler</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Isolate structural architecture without leaking raw schema designs. Maps relational tables and foreign keys into an encrypted JSON context dictionary, preventing structural data exfiltration exploits.
              </p>
            </div>
          </div>

          {/* Card 3: AST Security Firewall */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">AST Security Firewall</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Enforces strict structural compiler mathematics in under 4ms. SQL payloads are parsed recursively to scan deeply nested strings and block destructive DDL/DML nodes (DROP, ALTER, DELETE) before database driver execution.
              </p>
            </div>
          </div>

          {/* Card 4: Failsafe Closed Logging */}
          <div className="bg-slate-900/40 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-emerald-500/30 transition-all text-left">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Failsafe Closed Engine</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Eliminates syntax obfuscation vulnerabilities. Under a fail-closed architecture, any malformed SQL syntax or unparseable payload intended to bypass safety rules triggers an immediate connection cutoff.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PART 3: INTERACTIVE LIVE THREAT SIMULATOR */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-12 relative z-10 border-t border-slate-900">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            // INTERACTIVE SECURE INTERCEPTION SIMULATOR
          </h2>
          <p className="text-xs text-slate-500 mt-1">Select a payload to verify the firewall's deterministic interception capability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Pane (Input Selection) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest block font-mono">
                1. Select Attack/Safe Vector
              </label>

              {/* Selection Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPayloadType('safe');
                    setSimulationState('idle');
                  }}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    payloadType === 'safe'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-350 hover:border-slate-700'
                  }`}
                >
                  <CheckCircle2 size={16} />
                  <span>Safe BI Query</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setPayloadType('malicious');
                    setSimulationState('idle');
                  }}
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1.5 cursor-pointer ${
                    payloadType === 'malicious'
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-slate-355 hover:border-slate-700'
                  }`}
                >
                  <AlertTriangle size={16} />
                  <span>P2SQL Injection</span>
                </button>
              </div>

              {/* Payload View */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block font-mono">
                  Agent Generated Payload:
                </label>
                <div className="font-mono text-xs bg-slate-950/80 border border-slate-800 p-4 rounded-xl text-slate-300 overflow-x-auto min-h-20 flex items-center">
                  <code>{payloadType === 'safe' ? safePayload : maliciousPayload}</code>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simulationState === 'running'}
              className="w-full bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-900 text-slate-950 disabled:text-slate-600 font-bold uppercase tracking-wider py-3.5 rounded-xl text-xs border border-emerald-500/30 disabled:border-slate-800 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(16,185,129,0.2)] cursor-pointer"
            >
              <Play size={12} />
              <span>Simulate Agent Execution</span>
            </button>
          </div>

          {/* Right Pane (Live AST Interception Terminal) */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-mono text-slate-500">ast-secops-firewalld.service</span>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 p-6 font-mono text-xs text-zinc-400 space-y-4 overflow-y-auto leading-relaxed">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-650 font-semibold">&gt;_</span>
                <span>systemctl start adminzero-firewalld.service</span>
              </div>
              <div className="text-indigo-400/80">[System] Initializing SecOps deterministic AST interceptor layer...</div>
              <div className="text-slate-500">[System] Monitoring client connections. VPC tunnel secured.</div>

              {simulationState === 'running' && (
                <div className="flex items-center space-x-2 text-zinc-400 animate-pulse pt-2">
                  <div className="h-2 w-2 rounded-full bg-indigo-500 animate-ping" />
                  <span>Parsing SQL abstract syntax tree...</span>
                </div>
              )}

              {simulationState === 'completed' && payloadType === 'safe' && (
                <div className="space-y-3 pt-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold">
                    <CheckCircle2 size={12} />
                    <span>[200 OK] Safe AST Validated (&lt; 4ms execution)</span>
                  </div>
                  <div className="text-slate-500 text-[11px] leading-relaxed">
                    [AuditLog] SQL query accepted. Tree structure validated as SELECT only. No mutation nodes detected. Forwarded to database driver pool.
                  </div>
                </div>
              )}

              {simulationState === 'completed' && payloadType === 'malicious' && (
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-xl border border-red-900/40 bg-red-950/20 text-red-300 space-y-2">
                    <div className="flex items-center space-x-2 text-red-400 font-bold">
                      <AlertTriangle size={14} className="shrink-0" />
                      <span>Critical Threat Prevented (OWASP LLM01)</span>
                    </div>
                    <p className="text-[11px] text-red-200/80 leading-relaxed font-sans">
                      The AI agent was manipulated into generating a destructive SQL command. The AST Firewall deterministic layer intercepted and killed the connection before execution. Production data secured.
                    </p>
                  </div>
                  <div className="text-red-500/90 text-[10px] leading-relaxed break-all whitespace-pre-wrap">
                    [ALERT] [403 FORBIDDEN] THREAT BLOCKED: Prompt-to-SQL (P2SQL) Injection attempt detected. Destructive AST node [DROP TABLE] intercepted at driver level.
                  </div>
                </div>
              )}

              {simulationState === 'idle' && (
                <div className="text-slate-600 italic pt-4 text-center">
                  Awaiting agent simulation...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Part 4: Developer Setup & Hosted API Snippet */}
      <section id="install" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Code size={12} />
              <span>Developer-First Integration</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Route Agent Queries in 3 Lines of Code.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ditch the raw database connection strings in your client app. Send your prompts directly to our hosted proxy endpoint with your secure database token to sandbox the agent query.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Compatible with standard Node.js, Python, and shell requests</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-slate-400 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Zero client-side drivers or dependencies to maintain</span>
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-800 flex items-center justify-between">
              <div className="flex space-x-2 text-xs font-mono">
                <button 
                  onClick={() => setActiveCodeLang('js')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'js' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  Node.js
                </button>
                <button 
                  onClick={() => setActiveCodeLang('curl')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'curl' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  cURL
                </button>
                <button 
                  onClick={() => setActiveCodeLang('python')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'python' ? 'bg-slate-800 text-emerald-400' : 'text-slate-500'}`}
                >
                  Python
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">POST /v1/query</span>
            </div>
            <pre className="p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed max-h-[220px]">
              <code>{codeSnippets[activeCodeLang]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* Part 5: Localized Pricing Matrix */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white mb-3">Predictable Indian Market Pricing</h2>
          <p className="text-slate-400 font-mono text-xs">Tailored for Indian developers, scaling startups, and DPDP Act 2023 compliance.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Developer */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Developer</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>Local SQLite & Postgres support</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>10,000 free credits/mo</span></li>
              </ul>
            </div>
            <a href="/adminzero" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Start Free</a>
          </div>

          {/* Pro */}
          <div className="bg-slate-900 border-2 border-emerald-500 p-6 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-emerald-500/10">
            <span className="absolute -top-3 right-6 bg-emerald-500 text-slate-950 font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">MSME Favorite</span>
            <div>
              <h3 className="font-bold text-white text-base">Pro Plan</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹1,999</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-350 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>MySQL, PostgreSQL & MongoDB</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>500,000 compute credits/mo</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>DPDP Compliance Log Export</span></li>
              </ul>
            </div>
            <a href="/adminzero" className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Claim Pro Tier</a>
          </div>

          {/* Team */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Team Plan</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹9,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>Snowflake & BigQuery Support</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>3,000,000 compute credits/mo</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>RBAC Scoped Access</span></li>
              </ul>
            </div>
            <a href="/adminzero" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Upgrade Team</a>
          </div>

          {/* Regulated Enterprise */}
          <div className="bg-slate-900/40 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Enterprise</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">Custom</span>
                <span className="text-xs text-slate-500"> / annual quote</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>Air-Gapped Private VPC</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>Unlimited queries & credits</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0"/><span>CERT-In SLA Shielding</span></li>
              </ul>
            </div>
            <a href="mailto:issakrajraj@gmail.com" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Contact Sales</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-zinc-950 py-12 text-center text-xs text-zinc-650 relative z-10 font-mono">
        <p>© 2026 AdminZero by GlitchGo. Autonomous AI Action Security. VPC Air-Gapped Licensing.</p>
      </footer>
    </div>
  );
}

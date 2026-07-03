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
  Code
} from 'lucide-react';

export default function AdminZeroProductPage() {
  const [payloadType, setPayloadType] = useState<'safe' | 'malicious'>('safe');
  const [simulationState, setSimulationState] = useState<'idle' | 'running' | 'completed'>('idle');

  const safePayload = "SELECT region, COUNT(id) FROM sales_2026 GROUP BY region;";
  const maliciousPayload = "SELECT * FROM users; DROP TABLE tenant_api_keys;--";

  const handleSimulate = () => {
    setSimulationState('running');
    setTimeout(() => {
      setSimulationState('completed');
    }, 450);
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-indigo-500 selection:text-white relative overflow-hidden">
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293710_1px,transparent_1px),linear-gradient(to_bottom,#1f293710_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Decorative Radial Ambient Glow */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-bold uppercase tracking-widest mb-6">
          <Shield size={12} />
          <span>OWASP LLM01 Mitigation</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] font-sans">
          The Zero-Trust Firewall <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-emerald-400">
            for Autonomous AI Agents.
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-2xl mx-auto mt-6 leading-relaxed">
          Prevent prompt injection, data exfiltration, and destructive database manipulation with deterministic Abstract Syntax Tree (AST) inspection. Zero probabilistic guessing. Zero data leakage.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="#install"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
            <Terminal size={14} className="font-bold" />
            <span>Deploy Local Gateway (npm)</span>
          </a>
          <button
            onClick={() => window.open('mailto:ciso@adminzero.security')}
            className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Book CISO PoV</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* Part 2: Interactive Live Threat Simulator */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-12 relative z-10">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            // INTERACTIVE SECURE INTERCEPTION SIMULATOR
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Select a payload to verify the firewall's deterministic interception capability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Pane (Input Selection) */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-mono">
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
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1.5 ${
                    payloadType === 'safe'
                      ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
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
                  className={`py-3 px-4 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center space-y-1.5 ${
                    payloadType === 'malicious'
                      ? 'bg-red-500/10 border-red-500/50 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.15)]'
                      : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:border-zinc-700'
                  }`}
                >
                  <AlertTriangle size={16} />
                  <span>P2SQL Injection</span>
                </button>
              </div>

              {/* Payload View */}
              <div className="space-y-2 pt-2">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block font-mono">
                  Agent Generated Payload:
                </label>
                <div className="font-mono text-xs bg-zinc-950/80 border border-zinc-800 p-4 rounded-xl text-zinc-300 overflow-x-auto min-h-20 flex items-center">
                  <code>{payloadType === 'safe' ? safePayload : maliciousPayload}</code>
                </div>
              </div>
            </div>

            <button
              onClick={handleSimulate}
              disabled={simulationState === 'running'}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-white disabled:text-zinc-600 font-bold uppercase tracking-wider py-3.5 rounded-xl text-xs border border-indigo-500/30 disabled:border-zinc-800 transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(79,70,229,0.2)]"
            >
              <Play size={12} />
              <span>Simulate Agent Execution</span>
            </button>
          </div>

          {/* Right Pane (Live AST Interception Terminal) */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            {/* Terminal Header */}
            <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">ast-secops-firewalld.service</span>
            </div>

            {/* Terminal Screen */}
            <div className="flex-1 p-6 font-mono text-xs text-zinc-400 space-y-4 overflow-y-auto leading-relaxed">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-600 font-semibold">&gt;_</span>
                <span>systemctl start adminzero-firewalld.service</span>
              </div>
              <div className="text-indigo-500/80">[System] Initializing SecOps deterministic AST interceptor layer...</div>
              <div className="text-zinc-500">[System] Monitoring client connections. VPC tunnel secured.</div>

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
                  <div className="text-zinc-500 text-[11px] leading-relaxed">
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
                <div className="text-zinc-600 italic pt-4 text-center">
                  Awaiting agent simulation...
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Part 3: Benchmark & Performance Grid */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-zinc-900 bg-zinc-950">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">// VERIFIABLE BENCHMARK METRICS</h2>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">Deterministic Protection vs. Heuristic Guessing</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase font-mono">100% Interception Rate</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Deterministic mathematical parser validation blocks stacked statements and subquery injections with 100% precision, compared to 81.4% average protection rate of probabilistic LLM guardrails.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase font-mono">&lt; 4ms Latency Overhead</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Local AST parsing compiled in Node.js compiles and inspects in milliseconds, completely bypassing the massive latency overhead (often 250ms+) of external LLM-evaluator roundtrips.
              </p>
            </div>
          </div>

          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all">
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Lock size={20} />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white uppercase font-mono">Zero-Knowledge VPC</h4>
              <p className="text-xs text-zinc-500 mt-1">
                Runs completely air-gapped within your internal VPC network environment. Connection configurations and SQL scripts never pass through or get logged by external telemetry networks.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Part 4: Developer Setup & Code Snippet */}
      <section id="install" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Code size={12} />
              <span>Developer-First Integration</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Deploy as an Inline Middleware in 3 Lines of Code.
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AdminZero integrates directly into your existing Node.js database pools. Simply wrap your query dispatcher with our middleware proxy to inspect statements before drivers execute them.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center space-x-3 text-xs text-zinc-400 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Compatible with Knex.js, TypeORM, Prisma, and raw pg client</span>
              </div>
              <div className="flex items-center space-x-3 text-xs text-zinc-400 font-semibold">
                <CheckCircle2 size={14} className="text-emerald-500" />
                <span>Supports PostgreSQL, MySQL, and CockroachDB</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600">npm-install.sh</span>
            </div>
            <div className="p-5 font-mono text-xs space-y-4">
              <div className="text-zinc-400">
                <span className="text-zinc-600 font-semibold">$</span> npm install @adminzero/proxy
              </div>
              <hr className="border-zinc-900/60" />
              <div className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest font-sans pt-1">
                Implementation Example:
              </div>
              <pre className="text-[11px] text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
{`import { validateQuery } from '@adminzero/proxy';

// 1. Intercept prompt-generated query
const { safe, auditData } = await validateQuery(generatedSql);

// 2. Safe execution pathway
if (safe) {
  const result = await db.query(generatedSql);
  return result;
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full border-t border-zinc-900 bg-zinc-950 py-12 text-center text-xs text-zinc-600 relative z-10 font-mono">
        <p>© 2026 AdminZero. Autonomous AI Action Security. VPC Air-Gapped Licensing.</p>
      </footer>
    </div>
  );
}

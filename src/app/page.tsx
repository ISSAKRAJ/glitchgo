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
  ShieldCheck,
  Database,
  Check
} from 'lucide-react';

export default function SecurityLandingPage() {
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

      {/* Decorative Radial Ambient Glows */}
      <div className="absolute top-[-10%] left-[10%] w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Sticky Top Header Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b border-zinc-900 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="h-7 w-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(79,70,229,0.5)]">
            <Shield size={16} />
          </div>
          <div>
            <span className="font-extrabold text-sm tracking-tight text-white uppercase font-mono">AdminZero</span>
            <span className="text-[10px] text-zinc-500 ml-2 border-l border-zinc-800 pl-2 font-mono">SECOPS v2.4</span>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <a href="/adminzero" className="text-xs text-zinc-400 hover:text-white font-semibold transition-colors">
            Access Portal
          </a>
          <a href="#demo" className="text-xs bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 px-3 py-1.5 rounded-lg font-semibold transition-all">
            Live Simulator
          </a>
        </div>
      </nav>

      {/* SECTION 1: TOP ALERT & HERO HEADER */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] font-mono mb-6">
          <span className="text-indigo-400 font-bold">&lt;/&gt;</span>
          <span>AdminZero SecOps v2.4 — Zero-Trust Database Gateway Active</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.1] font-sans">
          Stop Autonomous AI Agents <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-violet-400 to-indigo-500">
            From Destroying Your Databases.
          </span>
        </h1>

        <p className="text-zinc-400 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
          The deterministic security firewall for enterprise AI workflows. AdminZero intercepts Prompt-to-SQL (P2SQL) injections, Agent Goal Hijacking (OWASP ASI01), and unauthorized schema modifications in under 4 milliseconds before the payload hits your database driver.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="#install"
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl border border-indigo-500/30 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_30px_rgba(79,70,229,0.5)] active:scale-[0.98]"
          >
            <Terminal size={14} className="font-bold" />
            <span>Install Local Proxy (npm)</span>
          </a>
          <a
            href="#features"
            className="w-full sm:w-auto bg-zinc-950 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 text-xs font-bold uppercase tracking-wider py-3.5 px-6 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>View Architecture Specs</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* SECTION 2: THE 4 CORE TECHNICAL MOATS */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-zinc-900/60">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">// CORE SECURITY PILLARS</h2>
          <h3 className="text-2xl font-black text-white mt-1">Deterministic Defensible Moats</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: AST Security Firewall */}
          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all text-left">
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">AST Security Firewall</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Eliminates probabilistic ML guardrails. AdminZero tokenizes outgoing queries into an Abstract Syntax Tree (AST) in real time. Any non-authorized modification node (DROP, ALTER, UPDATE, DELETE outside strict policies) is caught by strict compiler math and terminated instantly with a 403 exception.
              </p>
            </div>
          </div>

          {/* Card 2: Fail-Closed Obfuscation Block */}
          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all text-left">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Fail-Closed Obfuscation Block</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Protects against syntax obfuscation and multi-statement stacking. If an attacker injects malformed SQL intended to crash the query parser or slip through regex filters, AdminZero defaults to a Failsafe Closed state, instantly dropping the connection.
              </p>
            </div>
          </div>

          {/* Card 3: Zero-Knowledge Credential Vault */}
          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all text-left">
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Zero-Knowledge Credential Vault</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                AI agents never hold raw database passwords. Credentials are encrypted at rest using AES-256-GCM. AdminZero provisions low-latency, transient, scoped connection pools on the fly, enforcing least-privilege access at the network driver level.
              </p>
            </div>
          </div>

          {/* Card 4: Semantic Schema Profiling */}
          <div className="bg-zinc-900/20 border border-zinc-900 p-6 rounded-2xl space-y-4 hover:border-zinc-800 transition-all text-left">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Semantic Schema Profiling</h3>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Never leak raw relational schemas into your LLM context window. AdminZero maps foreign keys and table relationships into a clean, minimized JSON dictionary, stripping sensitive row data and preventing structural database reconnaissance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE DEMO (simulator) */}
      <section id="demo" className="max-w-6xl mx-auto px-6 py-12 relative z-10 border-t border-zinc-900/60">
        <div className="text-center mb-10">
          <h2 className="text-xl font-bold tracking-tight text-white font-mono">
            // INTERACTIVE SECURE INTERCEPTION SIMULATOR
          </h2>
          <p className="text-xs text-zinc-500 mt-1">Select a payload to verify the firewall's deterministic interception capability</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* Left Pane */}
          <div className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <label className="text-xs font-bold text-zinc-400 uppercase tracking-widest block font-mono">
                1. Select Attack/Safe Vector
              </label>
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

          {/* Right Pane */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden flex flex-col shadow-2xl">
            <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-500" />
              </div>
              <span className="text-[10px] font-mono text-zinc-500">ast-secops-firewalld.service</span>
            </div>

            <div className="flex-1 p-6 font-mono text-xs text-zinc-400 space-y-4 overflow-y-auto leading-relaxed">
              <div className="flex items-center space-x-2">
                <span className="text-zinc-600 font-semibold">&gt;_</span>
                <span>systemctl start adminzero-firewalld.service</span>
              </div>
              <div className="text-indigo-500/80">[System] Initializing SecOps deterministic AST interceptor layer...</div>
              <div className="text-zinc-500">[System] Monitoring client connections. VPC tunnel secured.</div>

              {simulationState === 'running' && (
                <div className="flex items-center space-x-2 text-zinc-400 animate-pulse pt-2">
                  <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-ping" />
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

      {/* SECTION 3: LIVE ARCHITECTURE BENCHMARKS */}
      <section className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-zinc-900 bg-zinc-950">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">// VERIFIABLE SECURE METRICS</h2>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">Why CISOs Choose Deterministic Math Over Probabilistic AI</h3>
        </div>

        <div className="max-w-5xl mx-auto overflow-x-auto border border-zinc-800 rounded-2xl bg-zinc-900/25">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-800 bg-zinc-900/50 text-zinc-300 font-mono">
                <th className="p-4 font-bold">Security Metric</th>
                <th className="p-4 font-bold">Traditional LLM Guardrails</th>
                <th className="p-4 font-bold text-indigo-400">AdminZero AST Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-900/80 text-zinc-400">
              <tr className="hover:bg-zinc-900/40">
                <td className="p-4 font-semibold text-white">Prompt Injection Protection</td>
                <td className="p-4">~81.4% (Vulnerable to jailbreaks)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">100.0% Deterministic Block</td>
              </tr>
              <tr className="hover:bg-zinc-900/40">
                <td className="p-4 font-semibold text-white">False Positive Rate</td>
                <td className="p-4">~4.2% (Blocks complex valid reads)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">0.0% (Valid AST nodes pass cleanly)</td>
              </tr>
              <tr className="hover:bg-zinc-900/40">
                <td className="p-4 font-semibold text-white">Latency Overhead</td>
                <td className="p-4">250ms – 800ms (LLM evaluator delay)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">&lt; 4ms (Local Node.js compilation)</td>
              </tr>
              <tr className="hover:bg-zinc-900/40">
                <td className="p-4 font-semibold text-white">Multi-Statement Stacking</td>
                <td className="p-4">Frequently bypassed</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">Strict Multi-Tree Iteration Block</td>
              </tr>
              <tr className="hover:bg-zinc-900/40">
                <td className="p-4 font-semibold text-white">Data Privacy & Telemetry</td>
                <td className="p-4">Routed through external scanners</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">100% Air-Gapped / Local VPC</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 4: DROP-IN INTEGRATION SNIPPET */}
      <section id="install" className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-zinc-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
              <Code size={12} />
              <span>Developer-First Integration</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Drop Into Your Connection Pool in 10 Minutes
            </h3>
            <p className="text-sm text-zinc-400 leading-relaxed">
              AdminZero integrates directly into your existing Node.js database pools. Simply wrap your query dispatcher with our middleware proxy to inspect statements before drivers execute them.
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-zinc-900/60 px-4 py-3 border-b border-zinc-900 flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
                <div className="h-2 w-2 rounded-full bg-zinc-800" />
              </div>
              <span className="text-[10px] font-mono text-zinc-600">database-pool.js</span>
            </div>
            <div className="p-5 font-mono text-xs space-y-4">
              <pre className="text-[11px] text-zinc-300 leading-relaxed overflow-x-auto whitespace-pre">
{`import { AdminZeroGateway } from '@adminzero/proxy';
import { Pool } from 'pg';

// 1. Wrap your standard PostgreSQL pool with AdminZero proxy rules
const securePool = new AdminZeroGateway({
  driver: new Pool({ connectionString: process.env.DATABASE_URL }),
  securityPolicy: 'STRICT_READ_ONLY',
  failClosed: true
});

// 2. Execute AI-generated SQL safely
try {
  const result = await securePool.query(aiGeneratedPayload);
  return result;
} catch (error) {
  // Returns custom AdminZero 403 Threat Interception details
  console.error("[AdminZero SecOps] Threat Intercepted:", error.threatDetails);
}`}
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: LOCALIZED INDIAN PRICING OVERHAUL */}
      <section className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-zinc-900 bg-zinc-950">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-indigo-400 uppercase tracking-widest font-mono">// SECURE LICENSING MODEL</h2>
          <h3 className="text-3xl font-extrabold text-white mt-2 tracking-tight">Flexible Compliance & Scaling Tiers</h3>
          <p className="text-xs text-zinc-500 mt-2">Tailored pricing specifically for the Indian IT, startup, and enterprise ecosystems.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {/* Tier 1: Developer */}
          <div className="bg-zinc-900/10 border border-zinc-900/80 hover:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Developer / Open Source</div>
              <div className="text-3xl font-black text-white">₹0</div>
              <div className="text-[10px] text-zinc-500">Free Forever — Student builders, solo devs, & hackathon teams</div>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                Everything needed to secure local AI agent workflows and test deterministic AST blocking.
              </p>
              <ul className="space-y-2 text-[11px] text-zinc-500 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Local Node.js AST Firewall SDK</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Real-time CLI threat logging</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Standard pg & sqlite support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Community Discord access</span>
                </li>
              </ul>
            </div>
            <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
              Get Started
            </button>
          </div>

          {/* Tier 2: MSME / Startup Growth */}
          <div className="bg-indigo-600/[0.03] border-2 border-indigo-500/60 p-6 rounded-2xl flex flex-col justify-between transition-all relative shadow-[0_0_30px_rgba(79,70,229,0.1)]">
            <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-widest py-1 px-3.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Most Popular
            </div>
            <div className="space-y-4">
              <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest">MSME / Startup Growth</div>
              <div className="text-3xl font-black text-white">₹2,999<span className="text-xs font-normal text-zinc-500"> / month</span></div>
              <div className="text-[10px] text-zinc-500">Indian MSMEs & Early-Stage GenAI Startups</div>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                Essential AI database protection and local regulatory audit trails for small engineering teams.
              </p>
              <ul className="space-y-2 text-[11px] text-zinc-400 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-indigo-400 shrink-0" />
                  <span>Automated P2SQL Guardrails</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-indigo-400 shrink-0" />
                  <span>7-day immutable threat audit log</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-indigo-400 shrink-0" />
                  <span className="font-semibold text-zinc-200">DPDP Act 2023 Compliance logs</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-indigo-400 shrink-0" />
                  <span>Email & chat support</span>
                </li>
              </ul>
            </div>
            <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all uppercase tracking-wider shadow-[0_0_15px_rgba(79,70,229,0.3)]">
              Secure MSME
            </button>
          </div>

          {/* Tier 3: Scale / Business Team */}
          <div className="bg-zinc-900/10 border border-zinc-900/80 hover:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Scale / Business Team</div>
              <div className="text-3xl font-black text-white">₹14,999<span className="text-xs font-normal text-zinc-500"> / month</span></div>
              <div className="text-[10px] text-zinc-500">Scaling Tech Companies & Mid-Sized Agencies</div>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                Advanced governance, access control, and team observability for production AI pipelines.
              </p>
              <ul className="space-y-2 text-[11px] text-zinc-500 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>SSO & RBAC security setup</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>PostgreSQL, MySQL, MongoDB</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>30-day cloud audit / Prometheus</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Priority SLA (4-hour response)</span>
                </li>
              </ul>
            </div>
            <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
              Upgrade Now
            </button>
          </div>

          {/* Tier 4: Regulated Enterprise */}
          <div className="bg-zinc-900/10 border border-zinc-900/80 hover:border-zinc-800 p-6 rounded-2xl flex flex-col justify-between transition-all">
            <div className="space-y-4">
              <div className="text-xs font-mono text-zinc-500 uppercase tracking-widest">Regulated Enterprise</div>
              <div className="text-3xl font-black text-white">Custom</div>
              <div className="text-[10px] text-zinc-500">Starts at ₹8 Lakhs / year</div>
              <p className="text-xs text-zinc-400 leading-relaxed pt-2">
                Zero-Trust air-gapped deployment with dedicated legal and regulatory shielding.
              </p>
              <ul className="space-y-2 text-[11px] text-zinc-500 pt-4">
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>On-Premises / Air-Gapped VPC</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Custom AST compiler rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span>Snowflake, Oracle, BigQuery support</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check size={12} className="text-emerald-500 shrink-0" />
                  <span className="font-semibold text-zinc-400">CERT-In & BAA Shielding</span>
                </li>
              </ul>
            </div>
            <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
              Contact Enterprise
            </button>
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

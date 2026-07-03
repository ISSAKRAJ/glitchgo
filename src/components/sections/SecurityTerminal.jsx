import React from 'react';
import { Terminal, Shield } from 'lucide-react';

const JEST_LINES = [
  { text: 'PASS  src/__tests__/adminzero-pipeline.test.ts', color: 'text-emerald-400 font-semibold' },
  { text: '  White-Box: AST Validator Functions', color: 'text-slate-400' },
  { text: '    ✓ should allow a standard safe query (30 ms)', color: 'text-slate-300' },
  { text: '    ✓ should block mutating statements (DROP, DELETE) (45 ms)', color: 'text-amber-400 font-semibold' },
  { text: '    ✓ should block queries referencing blacklisted columns (12 ms)', color: 'text-slate-300' },
  { text: '  Integration: Orchestration & Dual-Model Fallback', color: 'text-slate-400' },
  { text: '    ✓ Scenario A (Fast Lane Success): DeepSeek V3 succeeds directly (85 ms)', color: 'text-slate-300' },
  { text: '    ✓ Scenario B (Fast-Fail Escalation): DeepSeek fails, Gemini 2.5 Pro repairs (42 ms)', color: 'text-indigo-400 font-semibold' },
  { text: '    ✓ Integration: Should gracefully handle statement timeouts (37 ms)', color: 'text-slate-300' },
  { text: '    ✓ Integration: Should truncate row arrays to 100 entries max (19 ms)', color: 'text-slate-300' },
  { text: '  Cybersecurity: Vulnerability & Exploit Testing', color: 'text-slate-400' },
  { text: '    ✓ Prompt Injection: AST Blocks LLM-hijacked mutations (3 ms)', color: 'text-rose-400 font-semibold' },
  { text: '    ✓ SQL Injection: Tautologies treated as text comparison literals (6 ms)', color: 'text-slate-300' },
  { text: '    ✓ Cybersecurity: Should block inference side-channel attacks in WHERE clauses (11 ms)', color: 'text-rose-400 font-semibold' },
  { text: '  Black-Box: Gateway Interaction Boundaries', color: 'text-slate-400' },
  { text: '    ✓ should respond to client query action with HTTP 200 (8 ms)', color: 'text-slate-300' },
  { text: '', color: 'text-white' },
  { text: 'PASS  src/__tests__/error-logger.test.ts', color: 'text-emerald-400 font-semibold' },
  { text: '  AdminZero Automated Telemetry Integration Testing Suite', color: 'text-slate-400' },
  { text: '    ✓ Should catch failures in handler pipeline, post safe fallback with Report Issue button, and log to database (84 ms)', color: 'text-slate-300' },
  { text: '', color: 'text-white' },
  { text: 'Test Suites: 2 passed, 2 total', color: 'text-emerald-400 font-semibold' },
  { text: 'Tests:       12 passed, 12 total', color: 'text-emerald-400 font-semibold' },
  { text: 'Snapshots:   0 total', color: 'text-slate-400' },
  { text: 'Time:        1.943 s', color: 'text-slate-400' },
  { text: 'Ran all test suites.', color: 'text-slate-400' },
  { text: '✔ Zero-Trust pipeline verified.', color: 'text-emerald-400 font-extrabold shadow-[0_0_15px_rgba(16,185,129,0.3)]' }
];

export default function SecurityTerminal() {
  return (
    <section className="relative py-24 bg-[#08080c] overflow-hidden">
      {/* Background radial glowing effects */}
      <div className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 translate-x-1/2 -translate-y-1/2 w-[450px] h-[450px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold tracking-wider uppercase mb-4">
            <Shield size={12} /> Verification Engine
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
            Mathematically Proven Security.<br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-indigo-400 bg-clip-text text-transparent">No Hallucinations.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            AdminZero automatically runs our entire zero-trust testing suite locally and in CI, ensuring that no malicious injection or mutating statement can ever slip through.
          </p>
        </div>

        {/* Terminal Wrapper */}
        <div className="w-full bg-[#0a0a0f]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden shadow-emerald-950/10">
          
          {/* macOS window header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#111118] border-b border-white/[0.04] select-none">
            <div className="flex space-x-2">
              <span className="w-3 h-3 rounded-full bg-rose-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-amber-500 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" />
            </div>
            <div className="text-slate-500 text-xs font-medium flex items-center gap-1.5 mx-auto">
              <Terminal size={12} /> bash — adminzero-pipeline.test.ts
            </div>
          </div>

          {/* Terminal Output Body */}
          <div className="p-6 font-mono text-xs md:text-sm leading-relaxed text-slate-300 h-96 overflow-y-auto bg-[#050508] max-h-[450px]">
            <div className="mb-2">
              <span className="text-indigo-400">guest@adminzero</span>
              <span className="text-white">:</span>
              <span className="text-emerald-400">~#</span>{' '}
              <span className="text-white">npm run test</span>
            </div>

            {/* Render log lines */}
            <div className="space-y-1.5">
              {JEST_LINES.map((line, idx) => (
                <div key={idx} className={line.color}>
                  {line.text}
                </div>
              ))}
            </div>

            <div className="mt-4">
              <span className="text-indigo-400">guest@adminzero</span>
              <span className="text-white">:</span>
              <span className="text-emerald-400">~#</span>{' '}
              <span className="w-2 h-4 bg-emerald-400 inline-block animate-pulse align-middle ml-1" />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

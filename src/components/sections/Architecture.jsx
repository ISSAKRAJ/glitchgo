import React from 'react';
import { ShieldAlert, Cpu, Sparkles, Database, Code } from 'lucide-react';

export default function Architecture() {
  return (
    <section id="architecture" className="relative py-24 bg-[#0a0a0f] overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-10 left-10 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[90px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-4 animate-pulse">
            <Cpu size={12} /> System Design
          </div>
          <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
            Under the Hood:<br />
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Dual-System Zero-Trust Pipeline</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg">
            AdminZero doesn't just pass queries to AI models. We run a secure, deterministic verification and multi-model synthesis pipeline.
          </p>
        </div>

        {/* 3-Column Pipeline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          
          {/* Column 1: The AST Shield */}
          <div className="flex flex-col bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 hover:border-indigo-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-indigo-500/0 via-indigo-500/30 to-indigo-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <ShieldAlert className="text-indigo-400" size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-indigo-400 transition-colors duration-300">
              1. The AST Shield
            </h3>
            
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Unlike regular query tools that rely on fragile keyword filtering, AdminZero parses every generated SQL query into an Abstract Syntax Tree (AST) using a deterministic SQL parser.
            </p>

            <ul className="space-y-3 text-xs text-slate-500 mt-auto border-t border-white/[0.04] pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Read-Only enforcement (Blocks updates/deletes)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                PII scanning (Blocks password/ssn columns)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Blocks SQL injection & statement chaining
              </li>
            </ul>
          </div>

          {/* Column 2: Self-Healing Router */}
          <div className="flex flex-col bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 hover:border-purple-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/5 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500/0 via-purple-500/30 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Cpu className="text-purple-400" size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-purple-400 transition-colors duration-300">
              2. The Self-Healing Router
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              We employ a fast-fail routing system. Queries are sent to DeepSeek V3 (Fast Lane) for instant execution. If it fails due to database syntax or schema mismatch, the pipeline catches it.
            </p>

            <ul className="space-y-3 text-xs text-slate-500 mt-auto border-t border-white/[0.04] pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                DeepSeek V3 processes 95% of queries
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Escalates query + error log on crash
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                Healed by <strong className="text-purple-300 font-semibold">gemini-2.5-pro</strong> (Senior DBA)
              </li>
            </ul>
          </div>

          {/* Column 3: Slack Synthesis */}
          <div className="flex flex-col bg-white/[0.02] backdrop-blur-md border border-white/[0.06] rounded-2xl p-8 hover:border-pink-500/20 transition-all duration-300 hover:shadow-2xl hover:shadow-pink-500/5 group relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-pink-500/0 via-pink-500/30 to-pink-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

            <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <Sparkles className="text-pink-400" size={24} />
            </div>

            <h3 className="text-xl font-bold text-white mb-3 group-hover:text-pink-400 transition-colors duration-300">
              3. Conversational Synthesis
            </h3>

            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              Raw database rows are dense. The pipeline passes verified results to our synthesis engine powered by <strong className="text-pink-300 font-semibold">gemini-2.5-flash</strong> acting as an elite Lead Data Analyst.
            </p>

            <ul className="space-y-3 text-xs text-slate-500 mt-auto border-t border-white/[0.04] pt-6">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Aggregates metrics & identifies anomalies
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Renders PowerBI text-based charts (█ ░)
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-pink-500" />
                Slack mrkdwn-native bolding & highlights
              </li>
            </ul>
          </div>

        </div>

      </div>
    </section>
  );
}

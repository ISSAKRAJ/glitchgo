import React from 'react';
import { motion } from 'framer-motion';

export default function SecurityBenchmarks() {
  return (
    <section className="py-24 relative overflow-hidden bg-dark-bg border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold uppercase tracking-widest text-indigo-400 mb-4"
          >
            ⚡ Verifiable Security Metrics
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-white font-outfit"
          >
            Why CISOs Choose Deterministic Math Over Probabilistic AI
          </motion.h2>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto overflow-x-auto border border-white/10 rounded-2xl bg-dark-surface/50 backdrop-blur-md shadow-2xl"
        >
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.02] text-gray-300 font-mono">
                <th className="p-4 font-bold">Security Metric</th>
                <th className="p-4 font-bold">Traditional LLM Guardrails</th>
                <th className="p-4 font-bold text-indigo-400">AdminZero AST Gateway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-400">
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="p-4 font-semibold text-white">Prompt Injection Protection</td>
                <td className="p-4">~81.4% (Vulnerable to jailbreaks)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">100.0% Deterministic Block</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="p-4 font-semibold text-white">False Positive Rate</td>
                <td className="p-4">~4.2% (Blocks complex valid reads)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">0.0% (Valid AST nodes pass cleanly)</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="p-4 font-semibold text-white">Latency Overhead</td>
                <td className="p-4">250ms – 800ms (LLM evaluator delay)</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">&lt; 4ms (Local Node.js compilation)</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="p-4 font-semibold text-white">Multi-Statement Stacking</td>
                <td className="p-4">Frequently bypassed</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">Strict Multi-Tree Iteration Block</td>
              </tr>
              <tr className="hover:bg-white/[0.01] transition-colors">
                <td className="p-4 font-semibold text-white">Data Privacy & Telemetry</td>
                <td className="p-4">Routed through external scanners</td>
                <td className="p-4 font-bold text-emerald-400 bg-emerald-500/[0.02]">100% Air-Gapped / Local VPC</td>
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Card from '../ui/Card';

export default function SecurityPricing() {
  return (
    <section className="py-24 relative overflow-hidden bg-dark-bg border-t border-white/5">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-indigo-500/5 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4"
          >
            ⚡ Secure Licensing Model
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-white font-outfit"
          >
            Flexible Compliance & Scaling Tiers
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-6"
          >
            Tailored pricing specifically for the Indian IT, startup, and enterprise ecosystems.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch max-w-7xl mx-auto">
          {/* Tier 1: Developer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex"
          >
            <div className="bg-zinc-900/10 border border-white/5 hover:border-white/10 p-6 rounded-3xl flex flex-col justify-between transition-all w-full text-left bg-dark-surface/30 backdrop-blur-md">
              <div className="space-y-4">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Developer / Open Source</div>
                <div className="text-3xl font-black text-white">₹0</div>
                <div className="text-[10px] text-gray-500">Free Forever — Student builders, solo devs, & hackathon teams</div>
                <p className="text-xs text-gray-400 leading-relaxed pt-2">
                  Everything needed to secure local AI agent workflows and test deterministic AST blocking.
                </p>
                <ul className="space-y-2 text-[11px] text-gray-500 pt-4 border-t border-white/5">
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
              <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
                Get Started
              </button>
            </div>
          </motion.div>

          {/* Tier 2: MSME / Startup Growth */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex relative"
          >
            <div className="bg-indigo-600/[0.03] border-2 border-indigo-500/60 p-6 rounded-3xl flex flex-col justify-between transition-all relative shadow-[0_0_30px_rgba(79,70,229,0.15)] w-full text-left bg-dark-surface/40 backdrop-blur-md">
              <div className="absolute top-0 right-6 -translate-y-1/2 bg-indigo-600 text-white text-[9px] font-extrabold uppercase tracking-widest py-1 px-3.5 rounded-full shadow-[0_0_15px_rgba(79,70,229,0.4)]">
                Most Popular
              </div>
              <div className="space-y-4">
                <div className="text-xs font-mono text-indigo-400 uppercase tracking-widest">MSME / Startup Growth</div>
                <div className="text-3xl font-black text-white">₹2,999<span className="text-xs font-normal text-gray-500"> / month</span></div>
                <div className="text-[10px] text-gray-500">Indian MSMEs & Early-Stage GenAI Startups</div>
                <p className="text-xs text-gray-300 leading-relaxed pt-2">
                  Essential AI database protection and local regulatory audit trails for small engineering teams.
                </p>
                <ul className="space-y-2 text-[11px] text-gray-400 pt-4 border-t border-white/5">
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
                    <span className="font-semibold text-white">DPDP Act 2023 Compliance logs</span>
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
          </motion.div>

          {/* Tier 3: Scale / Business Team */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex"
          >
            <div className="bg-zinc-900/10 border border-white/5 hover:border-white/10 p-6 rounded-3xl flex flex-col justify-between transition-all w-full text-left bg-dark-surface/30 backdrop-blur-md">
              <div className="space-y-4">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Scale / Business Team</div>
                <div className="text-3xl font-black text-white">₹14,999<span className="text-xs font-normal text-gray-500"> / month</span></div>
                <div className="text-[10px] text-gray-500">Scaling Tech Companies & Mid-Sized Agencies</div>
                <p className="text-xs text-gray-400 leading-relaxed pt-2">
                  Advanced governance, access control, and team observability for production AI pipelines.
                </p>
                <ul className="space-y-2 text-[11px] text-gray-500 pt-4 border-t border-white/5">
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
              <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
                Upgrade Now
              </button>
            </div>
          </motion.div>

          {/* Tier 4: Regulated Enterprise */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex"
          >
            <div className="bg-zinc-900/10 border border-white/5 hover:border-white/10 p-6 rounded-3xl flex flex-col justify-between transition-all w-full text-left bg-dark-surface/30 backdrop-blur-md">
              <div className="space-y-4">
                <div className="text-xs font-mono text-gray-500 uppercase tracking-widest">Regulated Enterprise</div>
                <div className="text-3xl font-black text-white">Custom</div>
                <div className="text-[10px] text-gray-500">Starts at ₹8 Lakhs / year</div>
                <p className="text-xs text-gray-400 leading-relaxed pt-2">
                  Zero-Trust air-gapped deployment with dedicated legal and regulatory shielding.
                </p>
                <ul className="space-y-2 text-[11px] text-gray-500 pt-4 border-t border-white/5">
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
                    <span className="font-semibold text-gray-400">CERT-In & BAA Shielding</span>
                  </li>
                </ul>
              </div>
              <button className="w-full mt-8 py-2.5 px-4 rounded-xl bg-zinc-950 hover:bg-zinc-900 border border-white/5 text-zinc-300 text-xs font-bold transition-all uppercase tracking-wider">
                Contact Enterprise
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

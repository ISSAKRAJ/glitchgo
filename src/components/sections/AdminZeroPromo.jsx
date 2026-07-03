import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Key, Network, ShieldAlert, Terminal, ArrowRight } from 'lucide-react';
import Card from '../ui/Card';
import Button from '../ui/Button';

export default function AdminZeroPromo() {
  return (
    <section className="py-24 relative overflow-hidden border-t border-white/5 bg-dark-bg">
      {/* Background glow ambient effects */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Column: Product Info & CTAs */}
          <div className="lg:w-1/2 space-y-8 text-left">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 text-xs font-mono"
            >
              <span className="text-indigo-400 font-bold">&lt;/&gt;</span>
              <span>AdminZero SecOps — The Zero-Trust Agent Gateway is active.</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              Stop AI From <br />
              <span className="text-gradient font-black">Destroying Your Production Databases.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base md:text-lg leading-relaxed"
            >
              AdminZero is a deterministic proxy layer for autonomous agentic workflows. Intercept Prompt-to-SQL (P2SQL) injections at the driver level before malicious commands reach your data layer. Zero probabilistic guessing. Zero leaks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pt-2"
            >
              <Button
                variant="primary"
                onClick={() => window.location.href = '/adminzero-product#install'}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Deploy Local Proxy (npm)</span>
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/adminzero-product'}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>View Security Architecture</span>
                <Terminal size={14} />
              </Button>
            </motion.div>
          </div>

          {/* Right Column: 4 Technical Pillars Grid */}
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            
            {/* Card 1: Cryptographic Vault */}
            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-blue/5">
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Key size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cryptographic Vault</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Database credentials never touch the LLM context. AdminZero stores credentials via local AES-256-GCM encryption and provisions low-latency, scoped transient connection pools on-the-fly, stripping administrative data privileges from the active agent pipeline.
              </p>
            </Card>

            {/* Card 2: Semantic Schema Profiler */}
            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-orange/5">
              <div className="p-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Network size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Semantic Schema Profiler</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Isolate structural architecture without leaking raw schema designs. Maps relational tables, foreign keys, and column constraints into an encrypted, minimized JSON context dictionary, preventing schema discovery and structural data exfiltration exploits.
              </p>
            </Card>

            {/* Card 3: AST Security Firewall */}
            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-blue/5">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AST Security Firewall</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Enforces strict structural compiler mathematics in under 4ms. Tokens are compiled into a hierarchical Abstract Syntax Tree (AST) to recursively scan deeply nested queries, multi-statement semicolon stacks, and CTE chains for unauthorized modification blocks.
              </p>
            </Card>

            {/* Card 4: Failsafe Closed Logging */}
            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-amber-500/5">
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <ShieldAlert size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Failsafe Closed Logging</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Eliminates syntax obfuscation vulnerabilities. Operating under a strict fail-closed security architecture, any malformed SQL syntax or unparseable payload intended to bypass safety rules triggers an immediate 403 exception, locking the data layer instantly.
              </p>
            </Card>

          </div>

        </div>
      </div>
    </section>
  );
}

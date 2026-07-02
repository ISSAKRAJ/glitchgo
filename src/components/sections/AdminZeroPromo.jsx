import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Database, ArrowRight, Terminal, Key, Cpu, BarChart3 } from 'lucide-react';
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
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-semibold uppercase tracking-widest"
            >
              <Shield size={14} />
              <span>ZERO-TRUST SEMANTIC GATEWAY</span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight"
            >
              Meet <span className="text-gradient font-black">AdminZero</span> <br />
              Autonomous AI Data Platform.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base md:text-lg leading-relaxed"
            >
              Securely query production databases in plain English. AdminZero acts as an isolated bouncer between your LLM and enterprise databases—introspecting metadata, scanning query ASTs for destructive commands, and returning visual dashboards without leaking raw schemas.
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
                onClick={() => window.location.href = '/adminzero'}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Deploy AdminZero</span>
                <ArrowRight size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/adminzero'}
                className="w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <span>Access the Gateway</span>
                <Terminal size={14} />
              </Button>
            </motion.div>
          </div>

          {/* Right Column: 4 Technical Pillars Grid */}
          <div className="lg:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
            
            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-blue/5">
              <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Key size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Cryptographic Vault</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Credentials are encrypted using AES-256-GCM at rest. Low-latency, transient connection pools (`pg` and `mysql2`) spin up on-the-fly and terminate instantly.
              </p>
            </Card>

            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-orange/5">
              <div className="p-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Cpu size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Semantic Schema Profiler</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Dynamically maps relational schemas, foreign keys, and column types into a clean JSON dictionary, feeding the LLM only the structural context it needs.
              </p>
            </Card>

            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-brand-blue/5">
              <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <Shield size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AST Security Firewall</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Intercepts generated SQL in-memory and parses it using an AST validator. Restricts queries to read-only SELECTs, preventing destructive commands and table leakage.
              </p>
            </Card>

            <Card className="bg-white/[0.01] border-white/5 p-6 hover:shadow-amber-500/5">
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl w-11 h-11 flex items-center justify-center mb-5">
                <BarChart3 size={20} />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Dynamic BI Rendering</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Intelligently analyzes query results and maps them on-the-fly to interactive Tremor LineCharts (time-series), BarCharts (categories), or high-fidelity tables.
              </p>
            </Card>

          </div>

        </div>
      </div>
    </section>
  );
}

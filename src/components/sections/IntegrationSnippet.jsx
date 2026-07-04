import React from 'react';
import { motion } from 'framer-motion';
import { Code, CheckCircle2 } from 'lucide-react';

export default function IntegrationSnippet() {
  return (
    <section id="install" className="py-24 relative overflow-hidden bg-dark-bg border-t border-white/5">
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-6 text-left">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold uppercase tracking-widest text-emerald-400"
            >
              <Code size={14} />
              <span>Developer-First Integration</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl md:text-5xl font-black tracking-tight text-white font-outfit"
            >
              Drop Into Your Connection Pool in 10 Minutes
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base md:text-lg leading-relaxed"
            >
              AdminZero integrates directly into your existing Node.js database pools. Simply wrap your query dispatcher with our middleware proxy to inspect statements before database drivers execute them.
            </motion.p>

            <ul className="space-y-3 text-xs text-gray-500 pt-4">
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Compatible with Knex.js, TypeORM, Prisma, and raw pg client
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                Supports PostgreSQL, MySQL, and CockroachDB
              </li>
            </ul>
          </div>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="bg-zinc-950 border border-zinc-900 rounded-2xl overflow-hidden shadow-2xl text-left"
          >
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
          </motion.div>

        </div>
      </div>
    </section>
  );
}

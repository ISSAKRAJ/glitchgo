import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Code2 } from 'lucide-react';
import Button from '../ui/Button';

export default function Hero() {
  return (
    <section className="relative pt-40 pb-20 md:pt-56 md:pb-32 overflow-hidden">
      {/* Background glowing effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-brand-blue/20 rounded-full blur-[120px] -z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-brand-orange/10 rounded-full blur-[100px] -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-orange font-mono text-sm mb-8"
        >
          <span className="text-indigo-400 font-bold">&lt;/&gt;</span>
          <span>AdminZero SecOps v2.4 — Zero-Trust Database Gateway Active</span>
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6 leading-tight text-white"
        >
          Stop Autonomous AI Agents <br className="hidden md:block" />
          <span className="text-gradient">From Destroying Your Databases.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-gray-400 max-w-4xl mx-auto mb-10 leading-relaxed font-sans"
        >
          The deterministic security firewall for enterprise AI workflows. AdminZero intercepts Prompt-to-SQL (P2SQL) injections, Agent Goal Hijacking (OWASP ASI01), and unauthorized schema modifications in under 4 milliseconds before the payload hits your database driver.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Button size="lg" className="w-full sm:w-auto group shadow-[0_0_20px_rgba(79,70,229,0.3)] bg-indigo-600 hover:bg-indigo-500 border-none" onClick={() => window.location.href = '/adminzero-product'}>
            Install Local Proxy (npm)
            <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
          </Button>
          <Button variant="secondary" size="lg" className="w-full sm:w-auto" onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}>
            View Architecture Specs
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

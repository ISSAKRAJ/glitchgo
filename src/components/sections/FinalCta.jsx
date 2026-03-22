import React from 'react';
import { motion } from 'framer-motion';
import Button from '../ui/Button';

export default function FinalCta() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-orange/5" />
      
      <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-12 border border-brand-blue/20 shadow-[0_0_50px_rgba(59,130,246,0.15)] bg-dark-surface/80"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
            🚨 Deadline near? <br className="hidden sm:block" />
            <span className="text-brand-orange">Get help now.</span>
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-xl mx-auto">
            Don't let a stubborn bug or deployment issue ruin your launch. Let our experts handle it right away.
          </p>
          <Button size="lg" className="w-full sm:w-auto shadow-[0_0_20px_rgba(249,115,22,0.4)] bg-brand-orange hover:bg-orange-600 border-none" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Submit Your Problem
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

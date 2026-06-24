import React from 'react';
import { motion } from 'framer-motion';

const steps = [
  {
    number: "01",
    title: "Connect Your Database",
    desc: "Securely link your read-only PostgreSQL credentials in our configuration portal in 30 seconds."
  },
  {
    number: "02",
    title: "Install Slack App",
    desc: "Add the AdminZero bot to your Slack workspace with a simple secure one-click OAuth flow."
  },
  {
    number: "03",
    title: "Query in Plain English",
    desc: "Ask questions in your Slack channels and receive secure, instant visual data tables."
  }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-dark-bg relative overflow-hidden">
      <div className="absolute top-1/2 left-0 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[100px] -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center relative z-10">
        <div>
          <motion.h2 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-6 font-outfit tracking-tight"
          >
            Simple 3-Step Setup.<br />
            <span className="text-brand-blue">Instant Slack ChatOps.</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 text-lg mb-8 leading-relaxed"
          >
            Get up and running in minutes. Connect your PostgreSQL database, invite the Slack bot, and start querying instantly with natural language.
          </motion.p>
        </div>

        <div className="space-y-8">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-6 relative group"
            >
              {index !== steps.length - 1 && (
                <div className="absolute left-[28px] top-14 bottom-[-32px] w-[2px] bg-gradient-to-b from-brand-blue/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-500" />
              )}
              <div className="w-14 h-14 rounded-full bg-dark-bg border border-brand-blue/30 flex items-center justify-center shrink-0 shadow-[0_0_15px_rgba(59,130,246,0.2)] group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] group-hover:border-brand-orange relative z-10 transition-all duration-500">
                <span className="text-brand-blue font-bold group-hover:text-brand-orange transition-colors duration-500">{step.number}</span>
              </div>
              <div className="pt-2 transform group-hover:translate-x-3 transition-transform duration-500">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-brand-blue group-hover:to-brand-orange transition-all duration-500">{step.title}</h3>
                <p className="text-gray-400 group-hover:text-gray-300 transition-colors duration-500">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

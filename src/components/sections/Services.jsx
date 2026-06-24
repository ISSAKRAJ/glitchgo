import React from 'react';
import { motion } from 'framer-motion';
import { Rocket, Bot, Check } from 'lucide-react';
import Card from '../ui/Card';

const services = [
  {
    icon: <Rocket size={28} className="text-emerald-400" />,
    title: "Enterprise System Refactoring & Scale",
    price: "Custom Quote",
    desc: "Full database architecture audits, performance tuning, and legacy refactoring to migrate your systems into a modern, scalable AI-enabled hub.",
    bullets: [
      "Complete Codebase & Security Audits",
      "Database Optimization & Read-Replica Setup",
      "High-Throughput Performance Tuning",
      "Production-Ready Cloud Deployments"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    borderClass: "group-hover:border-emerald-500/40",
    buttonClass: "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/20"
  },
  {
    icon: <Bot size={28} className="text-brand-blue" />,
    title: "Custom AI Agent & Pipeline Development",
    price: "Custom Quote",
    desc: "Build secure LLM integrations, autonomous AI agents, and custom workflow automations tailored to your internal databases and business tools.",
    bullets: [
      "Custom Multi-Agent System Design",
      "Private Enterprise LLM Integrations",
      "Automated Alerting & Slack/Email Sync",
      "Full Uptime Monitoring & SLA Maintenance"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    borderClass: "group-hover:border-brand-blue/40",
    buttonClass: "bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border-brand-blue/20"
  }
];

export default function Services() {
  const handleSelectService = (title) => {
    window.dispatchEvent(
      new CustomEvent('select-service', { 
         detail: { title } 
      })
    );
  };

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-dark-bg">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16 flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4"
          >
            ⚡ Custom Enterprise Solutions
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 font-outfit"
          >
            Custom Enterprise AI Implementations
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-6"
          >
            Empower your organization with tailored AI modules and scalable enterprise data integrations built to your exact security specifications.
          </motion.p>
        </div>

        {/* Pricing Cards Grid (Center-aligned 2-column layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex"
            >
              <Card 
                className={`group flex flex-col justify-between text-left border bg-dark-surface/30 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 w-full hover:-translate-y-2 hover:bg-dark-surface/50 relative overflow-hidden border-white/5 ${service.borderClass} ${service.glowClass}`}
                hover={false}
              >
                <div>
                  {/* Icon & Title */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-2xl bg-dark-bg border border-white/5 shadow-inner">
                      {service.icon}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      Bespoke Consulting
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 font-outfit tracking-tight">
                    {service.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-3xl font-extrabold text-white tracking-tight font-mono">
                      {service.price}
                    </span>
                  </div>

                  <p className="text-gray-400 text-sm leading-relaxed mb-6 border-b border-white/5 pb-6">
                    {service.desc}
                  </p>

                  {/* Bullet Benefits */}
                  <ul className="space-y-3 mb-8">
                    {service.bullets.map((bullet, idx) => (
                      <li key={idx} className="flex items-center gap-2.5 text-xs text-gray-300">
                        <div className="w-4 h-4 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                          <Check size={10} />
                        </div>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Booking Button */}
                <button
                  onClick={() => handleSelectService(service.title)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer text-center ${service.buttonClass}`}
                >
                  🚀 Request Custom Proposal
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Bot, Rocket, Check } from 'lucide-react';
import Card from '../ui/Card';

const services = [
  {
    icon: <Bug size={28} className="text-brand-orange" />,
    title: "Urgent Bug Fix (24h)",
    price: "₹999",
    rawPrice: "₹999",
    desc: "Got a critical error, server crash, or database failure? I will dive straight into your codebase, identify the issue, and patch it before your deadline.",
    bullets: [
      "Guaranteed 24-Hour Delivery",
      "1-on-1 Debugging Session",
      "Post-Patch Bug Support",
      "100% Secure & Private"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    borderClass: "group-hover:border-brand-orange/40",
    buttonClass: "bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white border-brand-orange/20"
  },
  {
    icon: <Rocket size={28} className="text-emerald-400" />,
    title: "Full Project Rescue",
    price: "₹2,999",
    rawPrice: "₹2,999",
    desc: "If your project is a mess, structurally unscalable, or abandoned by a developer, I will refactor the codebase and rescue it into production shape.",
    bullets: [
      "Complete Architecture Audit",
      "Database & Query Optimization",
      "Performance & Speed Tuning",
      "Production Deployment Setup"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(16,185,129,0.15)]",
    borderClass: "group-hover:border-emerald-500/40",
    buttonClass: "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/20"
  },
  {
    icon: <Bot size={28} className="text-brand-blue" />,
    title: "AI Automation Setup",
    price: "₹1,999",
    rawPrice: "₹1,999",
    desc: "Build autonomous AI agents directly into your workflows, database, or applications utilizing APIs like OpenAI, Anthropic, or DeepSeek.",
    bullets: [
      "Custom AI Agent Pipelines",
      "LLM API Integration Support",
      "Automated Slack/Email Alerts",
      "30-Day System Maintenance"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    borderClass: "group-hover:border-brand-blue/40",
    buttonClass: "bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border-brand-blue/20"
  }
];

export default function Services() {
  const handleSelectService = (title, price) => {
    window.dispatchEvent(
      new CustomEvent('select-service', { 
        detail: { title, price } 
      })
    );
  };

  return (
    <section id="services" className="py-24 relative overflow-hidden bg-dark-bg">
      {/* Background ambient glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-blue/5 rounded-full blur-[160px] pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="text-center mb-20">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4"
          >
            ⚡ Premium Tech Execution
          </motion.div>
          
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-6xl font-black mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400 font-outfit"
          >
            Pricing & Services
          </motion.h2>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed"
          >
            Clear, transparent flat rates for engineering bug fixes, codebase refactoring, and AI automations. Choose a package below to load it directly.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="flex"
            >
              <Card 
                className={`group flex flex-col justify-between text-left border border-white/5 bg-dark-surface/30 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 w-full hover:-translate-y-2 hover:bg-dark-surface/50 ${service.borderClass} ${service.glowClass}`}
                hover={false}
              >
                <div>
                  {/* Icon & Title */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="p-3.5 rounded-2xl bg-dark-bg border border-white/5 shadow-inner">
                      {service.icon}
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                      Flat Rate
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2 font-outfit tracking-tight">
                    {service.title}
                  </h3>
                  
                  <div className="flex items-baseline gap-1.5 mb-4">
                    <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                      {service.price}
                    </span>
                    <span className="text-xs text-gray-500 font-medium">INR</span>
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
                  onClick={() => handleSelectService(service.title, service.rawPrice)}
                  className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer text-center ${service.buttonClass}`}
                >
                  🚀 Order & Book Service
                </button>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

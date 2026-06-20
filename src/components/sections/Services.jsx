import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bug, Bot, Rocket, Check, Sparkles, Layers, Shield } from 'lucide-react';
import Card from '../ui/Card';

const oneTimeServices = [
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
    buttonClass: "bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border-emerald-500/20",
    popular: true
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

const monthlyRetainers = [
  {
    icon: <Layers size={28} className="text-brand-orange" />,
    title: "Starter Retainer",
    price: "₹4,999",
    rawPrice: "₹4,999/mo",
    desc: "On-demand development support. Perfect for side projects, indie hackers, and small applications needing steady maintenance.",
    bullets: [
      "Up to 5 Bug Fixes / Month",
      "Max 8 Hours Development",
      "48-Hour Response SLA",
      "Shared Email & Chat Support"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(249,115,22,0.15)]",
    borderClass: "group-hover:border-brand-orange/40",
    buttonClass: "bg-brand-orange/10 hover:bg-brand-orange text-brand-orange hover:text-white border-brand-orange/20"
  },
  {
    icon: <Sparkles size={28} className="text-indigo-400" />,
    title: "Pro Retainer",
    price: "₹19,999",
    rawPrice: "₹19,999/mo",
    desc: "Your dedicated engineering partner. Perfect for growing startups needing rapid debugging and active codebase features.",
    bullets: [
      "Up to 20 Bug Fixes / Month",
      "Max 30 Hours Development",
      "24-Hour Response SLA",
      "Dedicated Slack Workspace",
      "Weekly Security & Code Audits"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(129,140,248,0.2)]",
    borderClass: "border-indigo-500/40 hover:border-indigo-500/60 bg-indigo-500/[0.02]",
    buttonClass: "bg-indigo-500 hover:bg-indigo-600 text-white border-transparent shadow-[0_0_15px_rgba(99,102,241,0.2)]",
    popular: true
  },
  {
    icon: <Shield size={28} className="text-brand-blue" />,
    title: "Enterprise CTO",
    price: "₹39,999",
    rawPrice: "₹39,999/mo",
    desc: "Elite full-stack consulting. Unlimited bug fixes, custom architecture design, and critical priority response for agencies.",
    bullets: [
      "Unlimited Bug Fixes",
      "Custom Feature Development",
      "6-Hour Emergency response SLA",
      "Direct CTO Whatsapp / Call Line",
      "Dedicated Dev & Deployment Setup"
    ],
    glowClass: "group-hover:shadow-[0_0_40px_rgba(59,130,246,0.15)]",
    borderClass: "group-hover:border-brand-blue/40",
    buttonClass: "bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white border-brand-blue/20"
  }
];

export default function Services() {
  const [billingCycle, setBillingCycle] = useState('one-time'); // 'one-time' | 'monthly'

  const currentServices = billingCycle === 'one-time' ? oneTimeServices : monthlyRetainers;

  const handleSelectService = (title, price) => {
    window.dispatchEvent(
      new CustomEvent('select-service', { 
         detail: { title, price, billingCycle } 
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
            className="text-gray-400 max-w-2xl mx-auto text-base md:text-lg leading-relaxed mb-12"
          >
            Choose between flat-rate one-time bug fixes or partner with us long-term with on-demand monthly developer retainers.
          </motion.p>

          {/* Interactive billing cycle toggle switch */}
          <div className="inline-flex bg-dark-surface/50 border border-white/10 p-1.5 rounded-2xl relative shadow-inner">
            <div className="relative flex gap-2 z-10">
              <button
                onClick={() => setBillingCycle('one-time')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-250 cursor-pointer ${
                  billingCycle === 'one-time' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                One-Time Fixes
              </button>
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-250 cursor-pointer flex items-center gap-1.5 ${
                  billingCycle === 'monthly' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                Monthly Retainer
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.5 rounded-full font-bold">
                  Save
                </span>
              </button>
            </div>
            
            {/* Sliding background pill indicator */}
            <div
              className="absolute top-1.5 bottom-1.5 left-1.5 bg-brand-blue rounded-xl shadow-lg shadow-brand-blue/20 transition-all duration-300"
              style={{
                width: billingCycle === 'one-time' ? '128px' : '172px',
                transform: billingCycle === 'one-time' ? 'translateX(0)' : 'translateX(136px)'
              }}
            />
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 min-h-[460px]">
          <AnimatePresence mode="wait">
            {currentServices.map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex"
              >
                <Card 
                  className={`group flex flex-col justify-between text-left border bg-dark-surface/30 backdrop-blur-md p-8 rounded-3xl transition-all duration-300 w-full hover:-translate-y-2 hover:bg-dark-surface/50 relative overflow-hidden ${
                    service.popular ? 'border-brand-blue/30 shadow-[0_0_30px_rgba(59,130,246,0.05)]' : 'border-white/5'
                  } ${service.borderClass} ${service.glowClass}`}
                  hover={false}
                >
                  {service.popular && (
                    <div className="absolute top-0 right-0 bg-brand-blue text-white font-extrabold text-[9px] uppercase tracking-widest py-1 px-4 rounded-bl-xl">
                      RECOMMENDED
                    </div>
                  )}

                  <div>
                    {/* Icon & Title */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="p-3.5 rounded-2xl bg-dark-bg border border-white/5 shadow-inner">
                        {service.icon}
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono uppercase tracking-widest bg-white/5 px-2.5 py-1 rounded-full border border-white/5">
                        {billingCycle === 'one-time' ? 'Flat Rate' : 'Monthly'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-white mb-2 font-outfit tracking-tight">
                      {service.title}
                    </h3>
                    
                    <div className="flex items-baseline gap-1.5 mb-4">
                      <span className="text-4xl font-extrabold text-white tracking-tight font-mono">
                        {service.price}
                      </span>
                      <span className="text-xs text-gray-500 font-medium">
                        {billingCycle === 'one-time' ? 'INR' : 'INR / mo'}
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
                    onClick={() => handleSelectService(service.title, service.rawPrice)}
                    className={`w-full py-3.5 px-4 rounded-xl border text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-[0.98] cursor-pointer text-center ${service.buttonClass}`}
                  >
                    🚀 {billingCycle === 'one-time' ? 'Order & Book Service' : 'Subscribe to Retainer'}
                  </button>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

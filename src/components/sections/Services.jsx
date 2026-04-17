import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Bot, Rocket } from 'lucide-react';
import Card from '../ui/Card';

const services = [
  {
    icon: <Bug size={32} className="text-brand-orange" />,
    title: "Urgent Bug Fix (24h)",
    price: "₹999",
    desc: "Got a critical error or crash? I will dive straight into your codebase, identify the exact issue, and patch it seamlessly before your deadline hits."
  },
  {
    icon: <Rocket size={32} className="text-emerald-400" />,
    title: "Full Project Rescue",
    price: "₹2999",
    desc: "If your project is a mess, structurally unscalable, or abandoned by a previous freelancer, I'll completely refactor and rescue it into production shape."
  },
  {
    icon: <Bot size={32} className="text-brand-blue" />,
    title: "AI Automation Setup",
    price: "₹1999",
    desc: "I will build bleeding-edge AI models directly into your workflow or app using APIs like OpenAI, Anthropic, or DeepSeek to fully automate your business."
  }
];

export default function Services() {
  return (
    <section id="services" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            Clear and Transparent Pricing
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto text-lg"
          >
            No hidden fees, no unnecessary waiting periods. Flat rates for expert execution.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group flex flex-col items-start text-left border-white/5 bg-white/[0.02]">
              <div className="p-4 rounded-xl bg-dark-bg border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">{service.title}</h3>
              <div className="text-3xl font-extrabold text-emerald-400 tracking-tight mb-4">{service.price}</div>
              <p className="text-gray-400 leading-relaxed text-sm lg:text-base">{service.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

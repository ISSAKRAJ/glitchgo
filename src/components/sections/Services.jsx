import React from 'react';
import { motion } from 'framer-motion';
import { Bug, Bot, Rocket } from 'lucide-react';
import Card from '../ui/Card';

const services = [
  {
    icon: <Bug size={32} className="text-brand-orange" />,
    title: "Bug Fixing",
    desc: "Got a critical error or crash? We dive into your codebase and patch it up before your deadline hits."
  },
  {
    icon: <Bot size={32} className="text-purple-500" />,
    title: "AI Automation",
    desc: "Automate repetitive tasks and integrate AI tools like OpenAI or Claude directly into your workflow."
  },
  {
    icon: <Rocket size={32} className="text-brand-blue" />,
    title: "Deployment Help",
    desc: "Struggling with hosting, APIs, or server configurations? We'll get your app live and scalable."
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
            How We Save Your Project
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-gray-400 max-w-2xl mx-auto"
          >
            We specialize in rapid response technical solutions to make sure your product ships on time, every time.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <Card key={index} className="group flex flex-col items-start text-left border-white/5 bg-white/[0.02]">
              <div className="p-4 rounded-xl bg-dark-bg border border-white/5 mb-6 group-hover:scale-110 transition-transform duration-300">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold text-white mb-3">{service.title}</h3>
              <p className="text-gray-400 leading-relaxed">{service.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

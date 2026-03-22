import React from 'react';
import { motion } from 'framer-motion';
import { Zap, GraduationCap, CheckCircle2 } from 'lucide-react';

const trustItems = [
  {
    icon: <Zap size={24} className="text-brand-orange" />,
    text: "Fast Delivery",
    desc: "Solutions precisely when you need them."
  },
  {
    icon: <GraduationCap size={24} className="text-brand-blue" />,
    text: "Student-friendly pricing",
    desc: "Premium help that fits your budget."
  },
  {
    icon: <CheckCircle2 size={24} className="text-emerald-500" />,
    text: "Real problem solving",
    desc: "Guaranteed fixes or your money back."
  }
];

export default function Trust() {
  return (
    <section className="py-10 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {trustItems.map((item, index) => (
            <motion.div 
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex flex-col items-center text-center space-y-3"
            >
              <div className="p-3 rounded-full bg-dark-surface border border-white/5">
                {item.icon}
              </div>
              <h3 className="text-white font-semibold text-lg">{item.text}</h3>
              <p className="text-gray-400 text-sm max-w-xs">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

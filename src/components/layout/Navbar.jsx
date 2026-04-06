import React from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
import Button from '../ui/Button';

export default function Navbar() {
  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b-0 border-white/5"
    >
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center cursor-pointer group" onClick={() => window.location.href='/'}>
          <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[2px] rounded-xl shadow-[0_0_20px_rgba(59,130,246,0.2)] group-hover:shadow-[0_0_25px_rgba(249,115,22,0.3)] transition-all duration-300">
            <div className="bg-dark-bg px-4 py-1.5 rounded-[10px] flex items-center gap-0.5">
              <span className="font-extrabold text-2xl text-white tracking-tighter">Glitch</span>
              <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
            </div>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-6 text-sm font-medium text-gray-300">
          <a href="/#services" className="hover:text-brand-blue transition-colors">Services</a>
          <a href="/#how-it-works" className="hover:text-brand-blue transition-colors">How it Works</a>
          <a href="/status" className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-brand-blue to-brand-orange hover:opacity-80 transition-opacity ml-2">Track Ticket ✨</a>

          <Button size="sm" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Help Now
          </Button>
        </div>
      </div>
    </motion.nav>
  );
}

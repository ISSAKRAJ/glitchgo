import React from 'react';
import { Terminal, Lock, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-dark-bg py-12 pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        {/* Left Side: Logo & Employee Login */}
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="cursor-pointer group" onClick={() => window.location.href='/'}>
            <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[2px] rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
              <div className="bg-dark-bg px-3 py-1 rounded-[10px] flex items-center gap-0.5">
                <span className="font-extrabold text-xl text-white tracking-tighter">Glitch</span>
                <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
              </div>
            </div>
          </div>
          
          <Link to="/dashboard" className="text-brand-orange hover:text-orange-400 flex items-center gap-1.5 transition-colors bg-brand-orange/10 hover:bg-brand-orange/20 px-4 py-2 rounded-lg border border-brand-orange/20 shadow-[0_0_10px_rgba(249,115,22,0.1)]">
            <Lock size={14} /> Employee Login
          </Link>
        </div>
        
        {/* Middle: Copyright */}
        <p className="text-gray-500 text-sm hidden lg:block">
          &copy; {new Date().getFullYear()} GlitchGo. Solving tech problems fast.
        </p>
        
        {/* Right Side: Links */}
        <div className="flex flex-wrap justify-center lg:justify-end gap-4 md:gap-6 text-sm text-gray-400 items-center pb-8 sm:pb-0 z-10 relative">
          <a href="mailto:teamglitchgo@gmail.com" className="hover:text-white transition-colors flex items-center gap-1 sm:border-r border-white/10 sm:pr-6">
            <Mail size={14} /> teamglitchgo@gmail.com
          </a>
          <a href="#" className="hover:text-white transition-colors">Privacy</a>
          <a href="#" className="hover:text-white transition-colors pr-20 md:pr-0">Terms</a>
        </div>
      </div>
    </footer>
  );
}

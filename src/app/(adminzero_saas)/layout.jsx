import React from 'react';
import Link from 'next/link';
import { Terminal, Shield, Database, HelpCircle, ArrowRight } from 'lucide-react';

export default function AdminZeroLayout({ children }) {
  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-brand-blue/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-brand-orange/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Top Header */}
      <header className="border-b border-white/5 bg-dark-surface/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-1 group">
              <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[1px] rounded-lg shadow-lg group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)] transition-all">
                <div className="bg-dark-bg px-2.5 py-0.5 rounded-[7px] flex items-center gap-0.5">
                  <span className="font-extrabold text-lg text-white tracking-tighter">Admin</span>
                  <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Zero</span>
                </div>
              </div>
            </Link>
            <span className="text-white/20 text-lg">/</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-brand-blue bg-brand-blue/10 px-2.5 py-1 rounded-full border border-brand-blue/20">
              SaaS Admin Portal
            </span>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <Link href="/" className="text-gray-400 hover:text-white transition-colors">
              Public Home
            </Link>
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              Employee Dashboard
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Layout Body */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-6 py-8 relative z-10">
        {children}
      </div>
    </div>
  );
}

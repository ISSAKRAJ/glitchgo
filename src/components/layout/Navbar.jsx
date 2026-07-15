import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Download } from 'lucide-react';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const isSuperAdmin = user?.email === 'issakrajraj@gmail.com';

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
    >
      {/* Top Notification Banner */}
      <div className="w-full bg-slate-900 border-b border-slate-850 py-2 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-mono tracking-wider text-brand-orange">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-4">
              <span>🚀 ADMINZERO V2.4 IS LIVE:</span>
              <span className="text-white">SECURE DOWNLOADABLE AGENTS AVAILABLE FOR WINDOWS, MACOS, AND LINUX.</span>
              <span className="text-slate-600 font-normal">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-850 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer space-x-2" onClick={() => window.location.href='/'}>
            <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[1.5px] rounded-lg shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:shadow-[0_0_20px_rgba(249,115,22,0.25)] transition-all duration-300">
              <div className="bg-slate-950 px-3 py-1 rounded-[6px] flex items-center gap-0.5">
                <span className="font-extrabold text-lg text-white tracking-tighter">Glitch</span>
                <span className="font-extrabold text-lg text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest font-bold pl-1.5 border-l border-slate-800">AdminZero</span>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-slate-350">
            <a href="/" className="hover:text-brand-orange transition-colors">Product</a>
            <a href="/guide" className="hover:text-brand-orange transition-colors">Developer Guide</a>
            <a href="/adminzero" className="hover:text-brand-orange transition-colors">Test Console</a>
            
            {user ? (
              <a href="/portal" className="hover:text-brand-orange transition-colors text-brand-orange font-bold">Client Portal</a>
            ) : (
              <a href="/signin?next=/portal" className="hover:text-brand-orange transition-colors">License Keys</a>
            )}

            {isSuperAdmin && (
              <a href="/portal?tab=admin" className="hover:text-red-400 text-red-400 transition-colors font-bold">Admin Panel</a>
            )}

            <span className="text-slate-850">|</span>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-500 font-mono max-w-[120px] truncate select-none">{user.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="hover:text-red-400 text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <a href="/signin" className="hover:text-brand-orange transition-colors">Sign In</a>
                <a href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-400 hover:opacity-80 transition-opacity font-extrabold uppercase tracking-wide">Sign Up</a>
              </>
            )}

            <Button 
              size="sm" 
              className="bg-brand-orange hover:bg-opacity-90 text-white font-extrabold shadow-[0_0_15px_rgba(249,115,22,0.2)] border-none" 
              onClick={() => {
                if (window.location.pathname === '/') {
                  document.getElementById('download-center')?.scrollIntoView({ behavior: 'smooth' });
                } else {
                  window.location.href = '/#download-center';
                }
              }}
            >
              <Download size={12} className="mr-1.5" />
              Download App
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

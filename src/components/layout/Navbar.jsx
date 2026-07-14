import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, LogOut } from 'lucide-react';
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
      <div className="w-full bg-slate-900 border-b border-slate-800 py-2 overflow-hidden select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-mono tracking-wider text-emerald-400">
          {Array(6).fill(null).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-4">
              <span>🚀 ADMINZERO V2.4 IS LIVE:</span>
              <span className="text-white">SECURE LOCAL AGENT & TELEMETRY CONTROL PLANE ACTIVATED.</span>
              <span className="text-slate-600 font-normal">★</span>
            </span>
          ))}
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-slate-950/90 backdrop-blur-md border-b border-slate-850 w-full">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center cursor-pointer space-x-2" onClick={() => window.location.href='/'}>
            <div className="h-8 w-8 rounded-lg bg-emerald-500 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Shield size={18} />
            </div>
            <div>
              <span className="text-lg font-black tracking-tight text-white">Admin<span className="text-emerald-400">Zero</span></span>
              <span className="text-[9px] font-mono text-slate-500 ml-1.5 uppercase">by GlitchGo</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wider uppercase text-slate-300">
            <a href="/" className="hover:text-emerald-400 transition-colors">Product</a>
            <a href="/guide" className="hover:text-emerald-400 transition-colors">Developer Guide</a>
            <a href="/adminzero" className="hover:text-emerald-400 transition-colors">Test Console</a>
            
            {user ? (
              <a href="/portal" className="hover:text-emerald-400 transition-colors text-emerald-400 font-bold">Client Portal</a>
            ) : (
              <a href="/signin?next=/portal" className="hover:text-emerald-400 transition-colors">License Keys</a>
            )}

            {isSuperAdmin && (
              <a href="/portal?tab=admin" className="hover:text-red-400 text-red-400 transition-colors font-bold">Admin Panel</a>
            )}

            <span className="text-slate-800">|</span>

            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-[10px] text-slate-400 font-mono max-w-[120px] truncate select-none">{user.email}</span>
                <button 
                  onClick={handleSignOut}
                  className="hover:text-red-400 text-[10px] uppercase tracking-wider font-extrabold transition-colors cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <>
                <a href="/signin" className="hover:text-emerald-400 transition-colors">Sign In</a>
                <a href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 hover:opacity-80 transition-opacity font-extrabold uppercase tracking-wide">Sign Up</a>
              </>
            )}

            <Button size="sm" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold" onClick={() => window.location.href = '/portal'}>
              Get API Key
            </Button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
}

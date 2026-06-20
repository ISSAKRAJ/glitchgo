import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal } from 'lucide-react';
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

  return (
    <motion.nav 
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 flex flex-col"
    >
      <div className="w-full bg-[#0d0e12] border-b border-white/5 py-2.5 overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.3)] select-none">
        <div className="animate-marquee whitespace-nowrap flex items-center text-xs font-semibold uppercase tracking-wider text-gray-300">
          {Array(4).fill(null).map((_, i) => (
            <span key={i} className="inline-flex items-center gap-8 mx-4">
              <span className="text-brand-orange font-extrabold flex items-center gap-1">🔥 NEW LAUNCH:</span>
              <span>CHECK OUT OUR NEW PRODUCT <a href="/adminzero-product" className="text-brand-blue underline hover:text-white transition-colors font-extrabold">ADMINZERO BOT</a> BELOW</span>
              <span className="text-gray-600">|</span>
              <span className="text-brand-blue font-extrabold">⚡ SECURE CHATOPS:</span>
              <span>QUERY POSTGRES DIRECTLY FROM SLACK</span>
              <span className="text-gray-600">|</span>
              <span>🇮🇳 GOVT REGISTERED MSME: UDYAM-AP-17-0080333</span>
              <span className="text-gray-600">|</span>
              <span>SUPPORT: <a href="mailto:teamglitchgo@gmail.com" className="text-brand-orange underline hover:text-white transition-colors font-extrabold">TEAMGLITCHGO@GMAIL.COM</a></span>
              <span className="text-gray-500 font-normal">★</span>
            </span>
          ))}
        </div>
      </div>
      <div className="glass border-b-0 border-white/5 w-full">
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
          <a href="/adminzero-product" className="hover:text-brand-blue transition-colors">AdminZero Bot</a>
          <a href="/guide" className="hover:text-brand-blue transition-colors font-semibold">Guide</a>
          <a href="/status" className="hover:text-brand-blue transition-colors font-semibold">Track Ticket</a>
          {user ? (
            <a href="/portal" className="hover:text-brand-blue transition-colors font-bold text-brand-blue">My Portal</a>
          ) : (
            <a href="/signin?next=/adminzero" className="hover:text-brand-blue transition-colors">Config Portal</a>
          )}
          <span className="text-gray-600">|</span>
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-xs text-brand-blue font-mono max-w-[150px] truncate select-none">{user.email}</span>
              <button 
                onClick={handleSignOut}
                className="hover:text-brand-orange text-xs uppercase tracking-wider font-extrabold transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <>
              <a href="/signin" className="hover:text-brand-blue transition-colors">Sign In</a>
              <a href="/signup" className="text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 hover:opacity-80 transition-opacity font-extrabold uppercase tracking-wide">Sign Up</a>
            </>
          )}

          <Button size="sm" onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}>
            Get Help Now
          </Button>
        </div>
        </div>
      </div>
    </motion.nav>
  );
}

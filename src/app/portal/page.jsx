"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, LogOut, FileText, Send, Terminal, Settings, 
  HelpCircle, ShieldCheck, User 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { supabase } from '../../lib/supabase';

// Modular tab components
import DashboardTab from '../../components/portal/DashboardTab';
import OrderTab from '../../components/portal/OrderTab';
import AdminZeroTab from '../../components/portal/AdminZeroTab';
import SettingsTab from '../../components/portal/SettingsTab';

export default function PortalPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Active Tab State: 'dashboard' | 'order' | 'products' | 'settings'
  const [activeTab, setActiveTab] = useState('dashboard');

  // Enforce session check on mount & listen to redirects/params
  useEffect(() => {
    const checkSession = async () => {
      setIsAuthLoading(true);
      let { data: { session } } = await supabase.auth.getSession();
      
      // Prevent race conditions on Google OAuth callbacks
      const hasHash = typeof window !== 'undefined' && (
        window.location.hash.includes('access_token=') || 
        window.location.hash.includes('id_token=') || 
        window.location.hash.includes('error=') ||
        window.location.search.includes('code=')
      );

      if (!session && hasHash) {
        console.log("OAuth token detected in URL. Waiting for Supabase to parse...");
        // Poll for session up to 2.5 seconds (25 attempts * 100ms)
        for (let i = 0; i < 25; i++) {
          await new Promise(r => setTimeout(r, 100));
          const { data: { session: activeSession } } = await supabase.auth.getSession();
          if (activeSession) {
            session = activeSession;
            break;
          }
        }
      }

      if (!session) {
        router.push('/signin?next=/portal');
        return;
      }
      
      setUser(session.user);
      setUserToken(session.access_token);
      setIsAuthLoading(false);

      // Parse initial tab from query parameters
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['dashboard', 'order', 'products', 'settings'].includes(tab)) {
          setActiveTab(tab);
        }
      }
    };
    
    checkSession();

    // Listen to global auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in Portal:", event, session ? "session exists" : "no session");
      if (session) {
        setUser(session.user);
        setUserToken(session.access_token);
        setIsAuthLoading(false);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setUserToken(null);
        setIsAuthLoading(false);
        router.push('/signin?next=/portal');
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  // Listen to custom tab change events from child components
  useEffect(() => {
    const handleTabChange = (e) => {
      const targetTab = e.detail;
      if (['dashboard', 'order', 'products', 'settings'].includes(targetTab)) {
        setActiveTab(targetTab);
      }
    };
    window.addEventListener('change-portal-tab', handleTabChange);
    return () => window.removeEventListener('change-portal-tab', handleTabChange);
  }, []);

  const handleSignOut = async () => {
    setIsAuthLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setUserToken(null);
    router.push('/');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-dark-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-brand-blue" size={48} />
          <p className="text-gray-400 text-sm font-semibold tracking-wider uppercase">Loading client portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-white font-sans">
      <Navbar />

      <main className="flex-1 w-full pt-32 pb-24 relative overflow-hidden">
        {/* Background ambient lighting */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-8 mb-10">
            <div>
              <span className="text-[10px] text-brand-blue font-bold uppercase tracking-wider">Welcome Back</span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1 font-outfit">
                GlitchGo Client Console
              </h1>
            </div>
            
            {user && (
              <div className="glass px-4 py-2.5 rounded-2xl flex items-center gap-3.5 border border-white/5 bg-white/[0.01]">
                <div className="text-left select-none">
                  <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block">Account Session</span>
                  <span className="text-xs font-semibold text-gray-300 block truncate max-w-[160px]">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 bg-white/5 hover:bg-red-500/10 text-gray-400 hover:text-red-400 rounded-xl transition-all cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-white/5 overflow-x-auto whitespace-nowrap gap-6 mb-10 text-sm font-semibold tracking-wide scrollbar-hide select-none">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'border-brand-blue text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <FileText size={16} />
              <span>Dashboard & Tickets</span>
            </button>
            <button
              onClick={() => setActiveTab('order')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'order' 
                  ? 'border-brand-blue text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Send size={16} />
              <span>Book a Service</span>
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'products' 
                  ? 'border-brand-blue text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Terminal size={16} />
              <span>Database ChatOps (AdminZero)</span>
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings' 
                  ? 'border-brand-blue text-white' 
                  : 'border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <Settings size={16} />
              <span>Settings</span>
            </button>
          </div>

          {/* Render Active Tab Component */}
          <div className="animate-fade-in min-h-[40vh]">
            {activeTab === 'dashboard' && (
              <DashboardTab user={user} supabase={supabase} />
            )}
            
            {activeTab === 'order' && (
              <OrderTab 
                user={user} 
                supabase={supabase} 
                onOrderSuccess={() => setActiveTab('dashboard')} 
              />
            )}
            
            {activeTab === 'products' && (
              <AdminZeroTab user={user} supabase={supabase} userToken={userToken} />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab user={user} supabase={supabase} />
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

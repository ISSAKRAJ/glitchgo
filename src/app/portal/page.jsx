"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Loader2, LogOut, FileText, Settings, ShieldCheck, Terminal
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { supabase } from '../../lib/supabase';

// Tab components
import AdminZeroTab from '../../components/portal/AdminZeroTab';
import SettingsTab from '../../components/portal/SettingsTab';
import AdminTab from '../../components/portal/AdminTab';

export default function PortalPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Active Tab State: 'dashboard' | 'settings' | 'admin'
  const [activeTab, setActiveTab] = useState('dashboard');

  const isSuperAdmin = user?.email === 'issakrajraj@gmail.com';

  useEffect(() => {
    const checkSession = async () => {
      setIsAuthLoading(true);
      let { data: { session } } = await supabase.auth.getSession();
      
      const hasHash = typeof window !== 'undefined' && (
        window.location.hash.includes('access_token=') || 
        window.location.hash.includes('id_token=') || 
        window.location.hash.includes('error=') ||
        window.location.search.includes('code=')
      );

      if (!session && hasHash) {
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

      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) {
        await supabase.auth.signOut();
        router.push('/signin?next=/portal');
        return;
      }
      
      setUser(user);
      setUserToken(session.access_token);
      setIsAuthLoading(false);

      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const tab = params.get('tab');
        if (tab && ['dashboard', 'settings', 'admin'].includes(tab)) {
          setActiveTab(tab);
        }
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
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

  useEffect(() => {
    const handleTabChange = (e) => {
      const targetTab = e.detail;
      if (['dashboard', 'settings', 'admin'].includes(targetTab)) {
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
      <div style={{minHeight:'100vh',background:'#040404',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px'}}>
        <div style={{width:'44px',height:'44px',border:'2px solid rgba(234,108,18,0.12)',borderTop:'2px solid #ea6c12',borderRadius:'50%',animation:'spin 0.9s linear infinite'}} />
        <p style={{color:'#3f3f46',fontSize:'11px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',fontFamily:"'JetBrains Mono',monospace"}}>Loading AdminZero portal...</p>
        <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#040404] text-white font-sans relative overflow-hidden">
      <Navbar />

      <style>{`
        .bg-wrap { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; will-change: transform; }
        .o1 {
          width: 800px; height: 800px; top: -250px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(234,108,18,0.07) 0%, transparent 65%);
          filter: blur(100px); animation: f1 16s ease-in-out infinite;
        }
        .o2 {
          width: 600px; height: 600px; bottom: 5%; right: -100px;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%);
          filter: blur(120px); animation: f2 20s ease-in-out infinite;
        }
        .o3 {
          width: 450px; height: 450px; top: 45%; left: -80px;
          background: radial-gradient(circle, rgba(234,108,18,0.05) 0%, transparent 65%);
          filter: blur(100px); animation: f3 24s ease-in-out infinite;
        }
        @keyframes f1 { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(-30px);} }
        @keyframes f2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-30px,-40px);} }
        @keyframes f3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,-30px);} }
        .bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 100%);
        }
      `}</style>
      
      <div className="bg-wrap">
        <div className="orb o1"></div>
        <div className="orb o2"></div>
        <div className="orb o3"></div>
        <div className="bg-grid"></div>
      </div>

      <main className="flex-1 w-full pt-32 pb-24 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* Dashboard Header Bar */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-800 pb-8 mb-10">
            <div>
              <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider font-mono">SaaS Control Plane</span>
              <h1 className="text-3xl font-black text-white tracking-tight mt-1">
                AdminZero Client Dashboard
              </h1>
            </div>
            
            {user && (
              <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-2xl flex items-center gap-3.5">
                <div className="text-left select-none">
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block font-mono">Active Client</span>
                  <span className="text-xs font-semibold text-slate-300 block truncate max-w-[160px]">{user.email}</span>
                </div>
                <button 
                  onClick={handleSignOut}
                  className="p-2 bg-slate-950 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-xl transition-all cursor-pointer border border-slate-850"
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Navigation tabs */}
          <div className="flex border-b border-slate-800 overflow-x-auto whitespace-nowrap gap-6 mb-10 text-xs font-bold uppercase tracking-wider select-none font-mono">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'dashboard' 
                  ? 'border-emerald-500 text-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <FileText size={16} />
              <span>License & Telemetry</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'settings' 
                  ? 'border-emerald-500 text-white' 
                  : 'border-transparent text-slate-500 hover:text-slate-350'
              }`}
            >
              <Settings size={16} />
              <span>Account Settings</span>
            </button>

            {isSuperAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`pb-4 border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === 'admin' 
                    ? 'border-red-500 text-red-400' 
                    : 'border-transparent text-slate-500 hover:text-slate-350'
                }`}
              >
                <Terminal size={16} />
                <span>Super Admin Panel</span>
              </button>
            )}
          </div>

          {/* Render Active Tab Component */}
          <div className="animate-fade-in min-h-[40vh]">
            {activeTab === 'dashboard' && (
              <AdminZeroTab user={user} supabase={supabase} userToken={userToken} />
            )}
            
            {activeTab === 'settings' && (
              <SettingsTab user={user} supabase={supabase} />
            )}
            
            {activeTab === 'admin' && isSuperAdmin && (
              <AdminTab user={user} supabase={supabase} userToken={userToken} />
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Database, Shield, Play, Plus, RefreshCw, CheckCircle, XCircle, Terminal, Loader2, Sparkles, LogOut, CreditCard, Copy, Upload, QrCode, ShieldAlert, Award } from 'lucide-react';
import { supabase } from '../../../lib/supabase';

// Default Admin configs from user request
const ADMIN_EMAIL = process.env.NEXT_PUBLIC_SUPER_ADMIN_EMAIL || 'issakrajraj@gmail.com';
const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || '7013017818@naviaxis';

export default function AdminZeroPage() {
  const router = useRouter();

  // Authentication State
  const [user, setUser] = useState(null);
  const [userToken, setUserToken] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Connection Form State
  const [connectionId, setConnectionId] = useState('');
  const [clientName, setClientName] = useState('');
  const [pgUrl, setPgUrl] = useState('');
  const [schemaHint, setSchemaHint] = useState('');
  
  // List & UI State
  const [connections, setConnections] = useState([]);
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingWorkspaces, setIsLoadingWorkspaces] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectUri, setRedirectUri] = useState('');

  // UPI Payment Modal State
  const [isUpiModalOpen, setIsUpiModalOpen] = useState(false);
  const [upiModalTeamId, setUpiModalTeamId] = useState('');
  const [selectedUpiPlan, setSelectedUpiPlan] = useState('pro'); // 'pro' | 'business'
  const [upiScreenshot, setUpiScreenshot] = useState(null); // base64 representation of image
  const [upiScreenshotName, setUpiScreenshotName] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerifyError, setUpiVerifyError] = useState('');
  const [upiVerifySuccess, setUpiVerifySuccess] = useState('');
  const [showManualUtrInput, setShowManualUtrInput] = useState(false);
  const [manualUtr, setManualUtr] = useState('');

  // Super Admin Workspace List & Override Controls State
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [isLoadingAllWorkspaces, setIsLoadingAllWorkspaces] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  const isSuperAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  // Tab State & Change Password State
  const [activeTab, setActiveTab] = useState('connections');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSubmitting, setPasswordSubmitting] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setPasswordSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordError(err.message || 'Failed to update password.');
    } finally {
      setPasswordSubmitting(false);
    }
  };

  // Fetch registered connections with bearer token auth
  const fetchConnections = async (token) => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/adminzero/connections', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setConnections(data.connections || []);
      } else {
        setError(data.error || 'Failed to load connections');
      }
    } catch (err) {
      setError('Error contacting API: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch connected workspaces and tiers from Supabase client-side
  const fetchWorkspaces = async (userId) => {
    if (!userId) return;
    setIsLoadingWorkspaces(true);
    try {
      const { data, error: wsError } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', userId);
        
      if (!wsError && data) {
        setWorkspaces(data);
      } else if (wsError) {
        console.error('Error fetching workspaces:', wsError);
      }
    } catch (err) {
      console.error('Network error fetching workspaces:', err);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  // Fetch all workspaces (Admin only)
  const fetchAllWorkspaces = async (token = userToken) => {
    if (!isSuperAdmin || !token) return;
    setIsLoadingAllWorkspaces(true);
    setAdminMessage('');
    try {
      const res = await fetch('/api/adminzero/workspaces', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (data.success) {
        setAllWorkspaces(data.workspaces || []);
      } else {
        setAdminMessage(data.error || 'Failed to load all workspaces');
      }
    } catch (err) {
      setAdminMessage('Error loading workspaces: ' + err.message);
    } finally {
      setIsLoadingAllWorkspaces(false);
    }
  };

  // Enforce session check on mount
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
        router.push('/signin');
        return;
      }
      
      setUser(session.user);
      setUserToken(session.access_token);
      setIsAuthLoading(false);
      
      // Load data
      fetchConnections(session.access_token);
      fetchWorkspaces(session.user.id);
      
      // Check if super admin to load all workspaces
      const isUserAdmin = session.user.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();
      if (isUserAdmin) {
        fetchAllWorkspaces(session.access_token);
      }

      // Setup redirect URI for Slack OAuth
      if (typeof window !== 'undefined') {
        setRedirectUri(`${window.location.origin}/api/slack/oauth`);
        
        const params = new URLSearchParams(window.location.search);
        if (params.get('installed') === 'true') {
          const teamId = params.get('team_id');
          setSuccess(`Successfully authorized AdminZero for workspace ID: ${teamId || 'unknown'}. You can now map database connections for this workspace's channels!`);
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchWorkspaces(session.user.id);
          if (isUserAdmin) {
            fetchAllWorkspaces(session.access_token);
          }
        } else if (params.get('checkout_success') === 'true') {
          setSuccess(`Success! Your subscription tier has been updated.`);
          window.history.replaceState({}, document.title, window.location.pathname);
          fetchWorkspaces(session.user.id);
          if (isUserAdmin) {
            fetchAllWorkspaces(session.access_token);
          }
        } else if (params.get('error')) {
          setError(`Slack authorization failed: ${params.get('error')}`);
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      }
    };
    checkSession();
  }, [router]);

  // Sign out handler
  const handleSignout = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  // Open UPI Modal
  const openUpiModal = (teamId) => {
    setUpiModalTeamId(teamId);
    setSelectedUpiPlan('pro');
    setUpiScreenshot(null);
    setUpiScreenshotName('');
    setUpiVerifyError('');
    setUpiVerifySuccess('');
    setShowManualUtrInput(false);
    setManualUtr('');
    setIsUpiModalOpen(true);
  };

  // Convert uploaded image file to Base64
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUpiVerifyError('Please upload an image file (PNG or JPEG)');
      return;
    }

    setUpiVerifyError('');
    setUpiScreenshotName(file.name);

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result.split(',')[1];
      setUpiScreenshot(base64String);
    };
    reader.readAsDataURL(file);
  };

  // Verify UPI screenshot via Gemini API on the server
  const handleVerifyUpiPayment = async () => {
    if (showManualUtrInput) {
      if (!manualUtr || manualUtr.trim().length !== 12 || isNaN(Number(manualUtr))) {
        setUpiVerifyError('Please enter a valid 12-digit numeric UTR/Transaction ID.');
        return;
      }
      setIsVerifyingUpi(true);
      setUpiVerifyError('');
      setUpiVerifySuccess('');

      try {
        const res = await fetch('/api/adminzero/workspaces/verify-upi', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userToken}`
          },
          body: JSON.stringify({
            team_id: upiModalTeamId,
            plan_type: selectedUpiPlan,
            manual_utr: manualUtr.trim()
          })
        });

        const data = await res.json();

        if (data.success) {
          setUpiVerifySuccess(data.message);
          fetchWorkspaces(user.id);
          if (isSuperAdmin) {
            fetchAllWorkspaces(userToken);
          }
          setTimeout(() => {
            setIsUpiModalOpen(false);
          }, 3000);
        } else {
          setUpiVerifyError(data.error || 'Failed to submit manual reference.');
        }
      } catch (err) {
        setUpiVerifyError('Network error: ' + err.message);
      } finally {
        setIsVerifyingUpi(false);
      }
      return;
    }

    if (!upiScreenshot) {
      setUpiVerifyError('Please select and upload a payment receipt screenshot.');
      return;
    }

    setIsVerifyingUpi(true);
    setUpiVerifyError('');
    setUpiVerifySuccess('');

    try {
      const res = await fetch('/api/adminzero/workspaces/verify-upi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          team_id: upiModalTeamId,
          plan_type: selectedUpiPlan,
          image: upiScreenshot,
          mime_type: 'image/png' // Generic mime
        })
      });

      const data = await res.json();

      if (data.success) {
        setUpiVerifySuccess(data.message);
        // Refresh lists
        fetchWorkspaces(user.id);
        if (isSuperAdmin) {
          fetchAllWorkspaces(userToken);
        }
        // Auto close modal after brief delay
        setTimeout(() => {
          setIsUpiModalOpen(false);
        }, 3000);
      } else {
        if (data.fallbackRequired) {
          setShowManualUtrInput(true);
        }
        setUpiVerifyError(data.error || 'AI verification failed. Please check the receipt image and try again.');
      }
    } catch (err) {
      setUpiVerifyError('Network error: ' + err.message);
    } finally {
      setIsVerifyingUpi(false);
    }
  };

  // Super Admin Action override handlers
  const handleAdminWorkspaceUpdate = async (teamId, updates) => {
    setAdminMessage('');
    try {
      const res = await fetch('/api/adminzero/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          team_id: teamId,
          updates
        })
      });

      const data = await res.json();
      if (data.success) {
        setAdminMessage(`Successfully updated Slack workspace ${teamId}.`);
        // Refresh workspace lists
        fetchWorkspaces(user.id);
        fetchAllWorkspaces(userToken);
      } else {
        setAdminMessage(data.error || 'Failed to update workspace');
      }
    } catch (err) {
      setAdminMessage('Network error: ' + err.message);
    }
  };

  // Handle connection test
  const handleTestConnection = async (idToTest = null, rawUrl = '') => {
    if (!userToken) return;
    const activeId = idToTest || 'raw-test';
    setTestingId(activeId);
    setTestResult(null);
    try {
      const payload = idToTest ? { id: idToTest } : { pg_url: rawUrl };
      const res = await fetch('/api/adminzero/connections/test', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      setTestResult({
        id: activeId,
        success: data.success,
        message: data.message || data.error
      });
    } catch (err) {
      setTestResult({
        id: activeId,
        success: false,
        message: 'Network error: ' + err.message
      });
    } finally {
      setTestingId(null);
    }
  };

  // Handle connection save
  const handleSaveConnection = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!connectionId.trim() || !clientName.trim() || !pgUrl.trim()) {
      setError('Please fill in all required fields (Slack Channel ID, Channel Name, PostgreSQL URL).');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/adminzero/connections', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          id: connectionId.trim(),
          client_name: clientName.trim(),
          pg_url: pgUrl.trim(),
          schema_hint: schemaHint.trim()
        })
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess('Database connection configuration saved successfully!');
        // Reset form
        setConnectionId('');
        setClientName('');
        setPgUrl('');
        setSchemaHint('');
        // Reload list
        fetchConnections(userToken);
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  // Pre-fill form for editing
  const handleEditConnection = (conn) => {
    setConnectionId(conn.id);
    setClientName(conn.client_name);
    setSchemaHint(conn.schema_hint || '');
    setPgUrl(''); // Leave blank for security
    setSuccess(`Loaded configuration for Slack Channel ${conn.id}. Re-enter the PostgreSQL URL to update it.`);
  };

  // Copy UPI string helper
  const handleCopyUpi = () => {
    navigator.clipboard.writeText(UPI_ID);
    alert('UPI ID copied to clipboard!');
  };

  if (isAuthLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-gray-400">
        <Loader2 className="animate-spin text-brand-blue mb-4" size={36} />
        <p className="text-sm font-semibold tracking-wider uppercase">Verifying admin session...</p>
      </div>
    );
  }

  // Generate dynamic QR code URI data
  const upiAmount = selectedUpiPlan === 'business' ? '3999' : '999';
  const planLabel = selectedUpiPlan === 'business' ? 'Business Plan (₹3,999/mo)' : 'Pro Plan (₹999/mo)';
  const upiPayUri = `upi://pay?pa=${UPI_ID}&pn=AdminZero&am=${upiAmount}&cu=INR&tn=GlitchGo_${selectedUpiPlan}_${upiModalTeamId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUri)}`;

  return (
    <div className="space-y-10 animate-fade-in relative">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            AdminZero ChatOps Config
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed font-outfit">
            Link Slack channels to target database connections. Chat requests will be translated to SQL, verified for safety, and run against the mapped databases securely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 shrink-0">
          {/* User Details & Logout */}
          {user && (
            <div className="glass px-4 py-2 rounded-xl flex items-center gap-3 border border-white/5 bg-white/[0.01]">
              <div className="text-right">
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Logged In As</div>
                <div className="text-xs font-bold text-gray-300 truncate max-w-[150px]">{user.email}</div>
              </div>
              <button 
                onClick={handleSignout} 
                className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-brand-orange rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          )}

          {/* Add to Slack Button */}
          <a
            href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '11352040316962.11349992784470'}&scope=app_mentions:read,chat:write&redirect_uri=${encodeURIComponent(redirectUri)}&state=${user?.id}`}
            className="flex items-center gap-2 bg-[#4A154B] hover:bg-[#381039] text-white font-bold px-4 py-2.5 rounded-xl border border-[#4A154B]/30 transition-all shadow-md shadow-[#4A154B]/15 text-sm shrink-0 active:scale-95 duration-150"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 122.8 122.8">
              <path d="M25.8 77.6c0-7.1-5.8-12.9-12.9-12.9S0 70.5 0 77.6s5.8 12.9 12.9 12.9h12.9v-12.9zm6.4 0c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9v-38.7c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7zM45.2 12.9c0 7.1 5.8 12.9 12.9 12.9S71 20 71 12.9 65.2 0 58.1 0s-12.9 5.8-12.9 12.9zm0 6.4c7.1 0 12.9 5.8 12.9 12.9v38.7c0 7.1-5.8 12.9-12.9 12.9S32.3 97 32.3 89.9V51.2c0-7.1 5.8-12.9 12.9-12.9zM97 45.2c7.1 0 12.9-5.8 12.9-12.9S104.1 19.4 97 19.4s-12.9 5.8-12.9 12.9v12.9H97zm-6.4 0c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9V45.2zM77.6 109.9c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9h-12.9v-12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9V51.8c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v51.2c0 7.1-5.8 12.9-12.9 12.9z" />
            </svg>
            Add to Slack
          </a>
        </div>
      </div>

      {/* Tab Selector */}
      <div className="flex border-b border-white/10 pb-1 gap-6 text-sm font-semibold mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('connections')}
          className={`pb-3 transition-all relative cursor-pointer ${
            activeTab === 'connections' ? 'text-brand-blue font-bold border-b-2 border-brand-blue' : 'text-gray-400 hover:text-white'
          }`}
        >
          🔌 Database Mappings
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('workspaces')}
          className={`pb-3 transition-all relative cursor-pointer ${
            activeTab === 'workspaces' ? 'text-brand-blue font-bold border-b-2 border-brand-blue' : 'text-gray-400 hover:text-white'
          }`}
        >
          💬 Slack Workspaces
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('settings')}
          className={`pb-3 transition-all relative cursor-pointer ${
            activeTab === 'settings' ? 'text-brand-blue font-bold border-b-2 border-brand-blue' : 'text-gray-400 hover:text-white'
          }`}
        >
          ⚙️ Profile & Settings
        </button>
      </div>

      {activeTab === 'connections' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Mapped Connections Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white font-outfit">
                <Database className="text-brand-blue" size={20} />
                Register Slack & Database Mapping
              </h2>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6">
                  <XCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6 animate-fade-in">
                  <CheckCircle size={16} className="shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <form onSubmit={handleSaveConnection} className="space-y-5">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Slack Channel ID <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. C07ABC123"
                      value={connectionId}
                      onChange={(e) => setConnectionId(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                      Friendly Connection Name <span className="text-brand-orange">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Production Analytics"
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    PostgreSQL Connection URL <span className="text-brand-orange">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder="postgresql://user:password@hostname:5432/db_name"
                    value={pgUrl}
                    onChange={(e) => setPgUrl(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm font-mono"
                    required={!success.includes('Loaded configuration')} // Only optional when editing
                  />
                  <span className="text-[10px] text-gray-500 block mt-1.5 leading-normal font-outfit">
                    Encrypted using AES-256-GCM prior to storage. Never exposed to frontends, users, or raw Slack responses.
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                    <span>Database Schema Definition (Hint for AI)</span>
                    <span className="text-[10px] text-brand-blue font-medium cursor-help" title="Describe tables and fields you want the Slack bot to query.">
                      schema format guide
                  </span>
                  </label>
                  <textarea
                    rows={6}
                    placeholder={`Example schema instructions:
Table: users
- id (INT, PK)
- name (VARCHAR)
- email (VARCHAR)
- created_at (TIMESTAMP)

Table: transactions
- id (INT, PK)
- user_id (INT, FK)
- amount (DECIMAL)
- status (VARCHAR)`}
                    value={schemaHint}
                    onChange={(e) => setSchemaHint(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm font-mono leading-relaxed"
                  />
                </div>

                <div className="flex gap-4 pt-3">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-blue/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Saving Configuration...
                      </>
                    ) : (
                      <>
                        <Plus size={16} />
                        Save Connection
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => handleTestConnection(null, pgUrl)}
                    disabled={!pgUrl.trim() || testingId !== null}
                    className="px-5 border border-white/10 hover:bg-white/5 text-gray-300 hover:text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm shrink-0"
                  >
                    {testingId === 'raw-test' ? (
                      <>
                        <Loader2 className="animate-spin" size={16} />
                        Testing...
                      </>
                    ) : (
                      <>
                        <Play size={14} />
                        Test URL
                      </>
                    )}
                  </button>
                </div>

                {testResult && testResult.id === 'raw-test' && (
                  <div className={`mt-4 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5 border ${
                    testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                  }`}>
                    {testResult.success ? <CheckCircle size={14} className="mt-0.5 shrink-0" /> : <XCircle size={14} className="mt-0.5 shrink-0" />}
                    <div>
                      <div className="font-semibold">{testResult.success ? 'Success' : 'Connection Failed'}</div>
                      <div className="mt-0.5 opacity-90 leading-normal font-mono">{testResult.message}</div>
                    </div>
                  </div>
                )}

              </form>
            </div>
          </div>

          {/* Right Column: Registered Mappings & Setup Guide */}
          <div className="lg:col-span-5 space-y-6">
            {/* Registered Mappings List */}
            <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
              
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-white flex items-center gap-2 font-outfit">
                  <Shield className="text-brand-orange" size={18} />
                  Registered Channels
                </h2>
                <button
                  type="button"
                  onClick={() => fetchConnections(userToken)}
                  disabled={isLoading}
                  className="text-gray-400 hover:text-white transition-colors p-1 cursor-pointer"
                  title="Refresh Mappings"
                >
                  <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                </button>
              </div>

              {isLoading && connections.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-brand-blue mb-3" size={24} />
                  Loading registered channels...
                </div>
              ) : connections.length === 0 ? (
                <div className="py-16 text-center border border-dashed border-white/5 rounded-2xl text-gray-500 text-sm flex flex-col items-center px-4">
                  <Database size={28} className="text-gray-600 mb-3" />
                  <p className="font-medium">No channels mapped yet.</p>
                  <p className="text-xs text-gray-600 mt-1 max-w-[200px] leading-normal">
                    Configure a connection on the left to activate the Slack integration.
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1">
                  {connections.map((conn) => (
                    <div
                      key={conn.id}
                      className="p-4 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-3.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="cursor-pointer" onClick={() => handleEditConnection(conn)}>
                          <h3 className="font-bold text-white text-sm group-hover:text-brand-blue transition-colors flex items-center gap-1.5">
                            {conn.client_name}
                          </h3>
                          <div className="text-[10px] font-mono text-gray-500 mt-1">
                            Channel: <span className="text-gray-300">{conn.id}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleTestConnection(conn.id)}
                            disabled={testingId === conn.id}
                            className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1 transition-colors cursor-pointer"
                          >
                            {testingId === conn.id ? (
                              <Loader2 className="animate-spin" size={10} />
                            ) : (
                              <Play size={8} className="fill-current" />
                            )}
                            Test
                          </button>
                        </div>
                      </div>

                      {conn.schema_hint && (
                        <div className="bg-dark-bg/40 px-3 py-2 rounded-lg border border-white/[0.02] text-[10px] text-gray-500 font-mono line-clamp-2 leading-relaxed">
                          {conn.schema_hint}
                        </div>
                      )}

                      {testResult && testResult.id === conn.id && (
                        <div className={`px-3 py-2 rounded-xl text-[10px] flex items-start gap-1.5 border leading-normal ${
                          testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                        }`}>
                          {testResult.success ? <CheckCircle size={10} className="mt-0.5 shrink-0" /> : <XCircle size={10} className="mt-0.5 shrink-0" />}
                          <span className="font-mono break-all">{testResult.message}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Info Box */}
            <div className="glass p-6 rounded-3xl border border-white/10 space-y-4 font-outfit">
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <Terminal className="text-brand-blue" size={16} />
                Slack Setup Guide
              </h2>
              <ul className="text-xs text-gray-400 space-y-3 list-decimal list-inside leading-relaxed">
                <li>Click the <b>Add to Slack</b> button above to authorize AdminZero for your Slack workspace.</li>
                <li>Configure Slack event subscriptions to point to your proxy URL: <code className="text-brand-blue bg-white/5 px-1 py-0.5 rounded">https://glitchgo.tech/api/slack/events</code>.</li>
                <li>Under Slack App Redirect URLs, configure: <code className="text-brand-blue bg-white/5 px-1 py-0.5 rounded">https://glitchgo.tech/api/slack/oauth</code>.</li>
                <li>Copy the Slack Channel ID from Slack (right click on channel &gt; copy link / details).</li>
                <li>On the left, map that Slack Channel ID to your PostgreSQL connection URL and provide a schema hint.</li>
                <li>Invite the bot to the channel via <code className="text-white bg-white/5 px-1 py-0.5 rounded">/invite @AdminZero</code>, mention it, and query your database!</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'workspaces' && (
        <div className="space-y-10">
          {/* Active Workspaces & Subscriptions Card */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden max-w-4xl mx-auto">
            <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4 font-outfit">
              <Sparkles className="text-amber-400 animate-pulse" size={18} />
              Slack Workspaces & Billing
            </h2>
            
            {isLoadingWorkspaces ? (
              <div className="py-8 text-center text-gray-500 text-xs flex flex-col items-center">
                <Loader2 className="animate-spin text-brand-blue mb-2" size={20} />
                Loading billing information...
              </div>
            ) : workspaces.length === 0 ? (
              <div className="py-6 text-center border border-dashed border-white/5 rounded-2xl text-gray-500 text-xs px-4">
                <p>No Slack Workspaces connected to your account.</p>
                <p className="text-[10px] text-gray-600 mt-1">
                  Authorize GlitchGo using the "Add to Slack" button above.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {workspaces.map((ws) => (
                  <div key={ws.team_id} className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-brand-blue/10 flex items-center justify-center text-brand-blue text-xs font-bold font-mono">
                          {ws.team_id.substring(0,2)}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">Team: {ws.team_id}</h4>
                          <span className="text-[10px] text-gray-500 font-mono">Slack Integration</span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        ws.tier.startsWith('pending_') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        ws.tier === 'business' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                        ws.tier === 'pro' ? 'bg-brand-blue/10 text-brand-blue-light border-brand-blue/20' :
                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                      }`}>
                        {ws.tier || 'free'}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs text-gray-400">
                        <span>Query Quota</span>
                        <span>{ws.query_count || 0} / {ws.max_queries >= 999999 ? '∞' : (ws.max_queries || 30)}</span>
                      </div>
                      <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            ws.tier === 'business' ? 'bg-indigo-500' :
                            ws.tier === 'pro' ? 'bg-brand-blue' :
                            'bg-brand-orange'
                          }`}
                          style={{ width: `${Math.min(100, ((ws.query_count || 0) / (ws.max_queries || 30)) * 100)}%` }}
                        ></div>
                      </div>
                    </div>

                    {ws.tier.startsWith('pending_') && (
                      <div className="text-[10px] text-amber-400 bg-amber-500/5 px-3 py-2 rounded-lg border border-amber-500/10 font-mono">
                        ⚙️ AI Upgrade Pending: UTR {ws.stripe_subscription_id || 'unspecified'}
                      </div>
                    )}

                    <div className="flex gap-2">
                      {ws.tier === 'free' || !ws.tier ? (
                        <button
                          type="button"
                          onClick={() => openUpiModal(ws.team_id)}
                          className="w-full text-xs bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-2 px-3 rounded-xl transition-all active:scale-95 duration-150 flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <Sparkles size={12} />
                          Upgrade Workspace via UPI
                        </button>
                      ) : ws.tier.startsWith('pending_') ? (
                        <button
                          type="button"
                          disabled
                          className="w-full text-xs border border-white/5 text-gray-500 font-bold py-2 px-3 rounded-xl opacity-60 flex items-center justify-center gap-1.5"
                        >
                          <Loader2 className="animate-spin" size={12} />
                          Verifying Payment Reference...
                        </button>
                      ) : (
                        <div className="w-full text-center text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 py-2 px-3 rounded-xl border border-emerald-500/10 flex items-center justify-center gap-1">
                          <CheckCircle size={10} /> Active Subscription (UTR: {ws.stripe_subscription_id || 'Manual'})
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Super Admin Workspace Controls Dashboard */}
          {isSuperAdmin && (
            <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden max-w-4xl mx-auto font-outfit">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
              
              <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
                <Award className="text-brand-orange" size={22} />
                Super Admin Portal Dashboard
              </h2>

              {adminMessage && (
                <div className="bg-brand-blue/10 border border-brand-blue/30 text-brand-blue-light px-4 py-3 rounded-xl text-sm mb-6 flex items-center gap-2 animate-fade-in">
                  <Sparkles size={16} />
                  <span>{adminMessage}</span>
                </div>
              )}

              {isLoadingAllWorkspaces ? (
                <div className="py-12 text-center text-gray-500 text-sm flex flex-col items-center justify-center">
                  <Loader2 className="animate-spin text-brand-blue mb-3" size={24} />
                  Loading all registered workspaces...
                </div>
              ) : allWorkspaces.length === 0 ? (
                <div className="py-12 text-center text-gray-500 text-sm">
                  No registered workspaces found.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400 text-xs uppercase tracking-wider font-semibold">
                        <th className="px-5 py-3">Team ID</th>
                        <th className="px-5 py-3">Current Tier</th>
                        <th className="px-5 py-3">Usage / Max</th>
                        <th className="px-5 py-3">Stripe/UTR ID</th>
                        <th className="px-5 py-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {allWorkspaces.map((ws) => (
                        <tr key={ws.team_id} className="hover:bg-white/[0.01] transition-colors">
                          <td className="px-5 py-4 font-mono font-bold text-white">{ws.team_id}</td>
                          <td className="px-5 py-4">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              ws.tier.startsWith('pending_') ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                              ws.tier === 'business' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                              ws.tier === 'pro' ? 'bg-brand-blue/10 text-brand-blue-light border-brand-blue/20' :
                              'bg-gray-500/10 text-gray-400 border-gray-500/20'
                            }`}>
                              {ws.tier}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-gray-300 font-mono">
                            {ws.query_count || 0} / {ws.max_queries >= 999999 ? 'Unlimited' : (ws.max_queries || 30)}
                          </td>
                          <td className="px-5 py-4">
                            {ws.tier.startsWith('pending_') ? (
                              <span className="text-amber-400 font-mono font-bold bg-amber-500/5 px-2.5 py-1 rounded-md border border-amber-500/20">
                                UTR: {ws.stripe_subscription_id}
                              </span>
                            ) : (
                              <span className="text-gray-500 font-mono text-xs">
                                {ws.stripe_subscription_id || 'None'}
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-4 text-right space-x-2 whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => handleAdminWorkspaceUpdate(ws.team_id, {
                                tier: 'pro',
                                max_queries: 1000,
                                stripe_customer_id: 'MANUAL_ADMIN_PRO',
                                query_count: 0
                              })}
                              className="px-2.5 py-1 text-xs bg-brand-blue/20 hover:bg-brand-blue text-brand-blue-light hover:text-white border border-brand-blue/30 rounded-lg transition-colors font-bold cursor-pointer"
                              title="Activate Pro"
                            >
                              Approve Pro
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminWorkspaceUpdate(ws.team_id, {
                                tier: 'business',
                                max_queries: 999999,
                                stripe_customer_id: 'MANUAL_ADMIN_BIZ',
                                query_count: 0
                              })}
                              className="px-2.5 py-1 text-xs bg-indigo-500/20 hover:bg-indigo-500 text-indigo-400 hover:text-white border border-indigo-500/30 rounded-lg transition-colors font-bold cursor-pointer"
                              title="Activate Business"
                            >
                              Approve Biz
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminWorkspaceUpdate(ws.team_id, {
                                tier: 'free',
                                max_queries: 30,
                                stripe_subscription_id: null,
                                stripe_customer_id: null,
                                query_count: 0
                              })}
                              className="px-2.5 py-1 text-xs bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 rounded-lg transition-colors font-bold cursor-pointer"
                              title="Downgrade to Free"
                            >
                              Revoke / Free
                            </button>
                            <button
                              type="button"
                              onClick={() => handleAdminWorkspaceUpdate(ws.team_id, {
                                query_count: 0
                              })}
                              className="px-2.5 py-1 text-xs border border-white/10 hover:bg-white/5 text-gray-300 rounded-lg transition-all cursor-pointer"
                              title="Reset query count back to 0"
                            >
                              Reset Quota
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto font-outfit">
          {/* Profile Details Card */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-blue/5 rounded-full blur-2xl"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              👤 Profile Details
            </h2>
            <div className="space-y-4">
              <div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">User Email</div>
                <div className="text-sm font-bold text-white bg-white/5 border border-white/5 px-4 py-3 rounded-xl font-mono">{user?.email}</div>
              </div>
              <div>
                <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mb-1">User ID / UID</div>
                <div className="text-sm font-bold text-gray-300 bg-white/5 border border-white/5 px-4 py-3 rounded-xl font-mono break-all select-all">{user?.id}</div>
              </div>
            </div>
          </div>

          {/* Change Password Card */}
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-brand-orange/5 rounded-full blur-2xl"></div>
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              🔒 Change Password
            </h2>
            
            {passwordError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2 mb-4 animate-fade-in">
                <XCircle size={14} className="shrink-0" />
                <span>{passwordError}</span>
              </div>
            )}

            {passwordSuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs flex items-center gap-2 mb-4 animate-fade-in">
                <CheckCircle size={14} className="shrink-0" />
                <span>{passwordSuccess}</span>
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">New Password</label>
                <input 
                  type="password"
                  placeholder="Min 6 characters..."
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirm Password</label>
                <input 
                  type="password"
                  placeholder="Confirm your password..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={passwordSubmitting}
                className="w-full bg-gradient-to-r from-brand-orange to-amber-600 hover:from-orange-500 hover:to-amber-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {passwordSubmitting ? (
                  <>
                    <Loader2 className="animate-spin" size={16} />
                    Updating Password...
                  </>
                ) : (
                  <span>Update Password</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* UPI Payment Modal (Regular Users) */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 bg-dark-bg/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-outfit">
          <div className="bg-dark-surface border border-white/10 rounded-3xl w-full max-w-md p-6 md:p-8 space-y-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/5 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                  <Sparkles className="text-brand-blue" size={18} />
                  Upgrade Workspace: {upiModalTeamId}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">Automated UPI screenshot activation.</p>
              </div>
              <button 
                onClick={() => setIsUpiModalOpen(false)}
                className="text-gray-400 hover:text-white font-bold text-sm bg-white/5 hover:bg-white/10 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                disabled={isVerifyingUpi}
              >
                ✕
              </button>
            </div>

            {/* Error/Success Banner */}
            {upiVerifyError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <ShieldAlert size={14} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{upiVerifyError}</span>
              </div>
            )}
            
            {upiVerifySuccess && (
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-xs flex items-start gap-2.5">
                <CheckCircle size={14} className="mt-0.5 shrink-0" />
                <span className="leading-relaxed">{upiVerifySuccess}</span>
              </div>
            )}

            {/* Step 1: Select Plan */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">Step 1: Choose Subscription Plan</label>
              <div className="grid grid-cols-2 gap-4">
                <div 
                  onClick={() => !isVerifyingUpi && setSelectedUpiPlan('pro')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedUpiPlan === 'pro' 
                      ? 'bg-brand-blue/5 border-brand-blue text-white shadow-md shadow-brand-blue/5' 
                      : 'bg-white/[0.01] border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">Pro Plan</div>
                    <div className="text-[10px] opacity-80 mt-0.5">1,000 queries/mo</div>
                  </div>
                  <div className="text-xs font-extrabold mt-3 text-brand-blue-light">₹999 / mo</div>
                </div>

                <div 
                  onClick={() => !isVerifyingUpi && setSelectedUpiPlan('business')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                    selectedUpiPlan === 'business' 
                      ? 'bg-indigo-500/5 border-indigo-500 text-white shadow-md shadow-indigo-500/5' 
                      : 'bg-white/[0.01] border-white/5 text-gray-400 hover:border-white/10'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm">Business Plan</div>
                    <div className="text-[10px] opacity-80 mt-0.5">Unlimited queries</div>
                  </div>
                  <div className="text-xs font-extrabold mt-3 text-indigo-400">₹3,999 / mo</div>
                </div>
              </div>
            </div>

            {/* Step 2: QR Scan Pay */}
            <div className="space-y-3 bg-white/[0.01] border border-white/5 p-4 rounded-2xl flex flex-col items-center">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest self-start">Step 2: Scan QR & Pay via UPI</label>
              
              <div className="bg-white p-2 rounded-xl border border-white/10 shadow-lg relative group">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-48 h-48 block"
                />
              </div>

              <div className="text-center space-y-1">
                <div className="text-xs font-bold text-white">{planLabel}</div>
                <div className="text-[10px] text-gray-500">Scan using GPay, PhonePe, Paytm, or BHIM apps.</div>
              </div>

              <div className="w-full flex items-center justify-between bg-dark-bg/60 px-3 py-2 rounded-xl border border-white/5 mt-2">
                <div className="truncate pr-2">
                  <div className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">UPI Address</div>
                  <div className="text-xs font-mono text-gray-300 truncate">{UPI_ID}</div>
                </div>
                <button 
                  onClick={handleCopyUpi}
                  className="p-2 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white rounded-lg transition-colors flex items-center gap-1 text-[10px] shrink-0"
                  title="Copy UPI ID"
                >
                  <Copy size={12} />
                  Copy
                </button>
              </div>
            </div>

            {/* Step 3: Receipt Screenshot */}
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest block">
                {showManualUtrInput ? 'Step 3: Enter 12-digit UTR/Transaction ID' : 'Step 3: Upload Payment Receipt Screenshot'}
              </label>
              
              {showManualUtrInput ? (
                <div className="space-y-2">
                  <input 
                    type="text" 
                    maxLength={12}
                    placeholder="e.g. 123456789012"
                    value={manualUtr}
                    onChange={(e) => setManualUtr(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all text-sm font-mono text-center tracking-widest"
                    disabled={isVerifyingUpi}
                  />
                  <p className="text-[9px] text-gray-500 text-center">
                    Enter the 12-digit transaction ID from your payment confirmation screen.
                  </p>
                </div>
              ) : (
                <div className="relative border border-dashed border-white/10 hover:border-white/20 rounded-2xl p-4 transition-all flex flex-col items-center justify-center bg-white/[0.01]">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleScreenshotChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isVerifyingUpi}
                  />
                  <Upload className="text-gray-500 mb-2" size={20} />
                  <div className="text-xs text-gray-300 font-semibold truncate max-w-full">
                    {upiScreenshotName || 'Click to browse receipt screenshot'}
                  </div>
                  <div className="text-[9px] text-gray-500 mt-1">Accepts PNG or JPEG. UUTR must be readable.</div>
                </div>
              )}
            </div>

            {/* Action Trigger */}
            <button
              onClick={handleVerifyUpiPayment}
              disabled={isVerifyingUpi || (!showManualUtrInput && !upiScreenshot) || (showManualUtrInput && manualUtr.length !== 12) || upiVerifySuccess}
              className="w-full bg-gradient-to-r from-brand-blue to-blue-600 hover:from-blue-500 hover:to-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-brand-blue/15 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
            >
              {isVerifyingUpi ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  {showManualUtrInput ? 'Submitting Reference...' : 'AI Scanning Payment Receipt...'}
                </>
              ) : (
                <>
                  <QrCode size={16} />
                  {showManualUtrInput ? 'Submit for Admin Review' : 'Activate Workspace Instantly'}
                </>
              )}
            </button>

            {/* Toggle fallbacks */}
            <div className="text-center">
              {!showManualUtrInput ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowManualUtrInput(true);
                    setUpiVerifyError('');
                  }}
                  className="text-xs text-brand-blue hover:text-blue-400 hover:underline block w-full transition-colors mt-2"
                  disabled={isVerifyingUpi}
                >
                  Having trouble scanning? Enter UTR manually
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setShowManualUtrInput(false);
                    setUpiVerifyError('');
                  }}
                  className="text-xs text-gray-500 hover:text-white hover:underline block w-full transition-colors mt-2"
                  disabled={isVerifyingUpi}
                >
                  ← Go back to screenshot upload
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

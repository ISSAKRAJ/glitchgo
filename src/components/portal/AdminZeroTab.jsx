"use client";

import React, { useState, useEffect } from 'react';
import { 
  Database, Shield, Play, Plus, RefreshCw, CheckCircle, XCircle, Terminal, 
  Loader2, Sparkles, CreditCard, Copy, Upload, QrCode, ShieldAlert, Trash2, Edit 
} from 'lucide-react';
import Card from '../ui/Card';

const ADMIN_EMAIL = 'issakrajraj@gmail.com';
const UPI_ID = '7013017818@naviaxis';

export default function AdminZeroTab({ user, supabase, userToken }) {
  const isSuperAdmin = user?.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase().trim();

  // Connection & Form states
  const [connectionId, setConnectionId] = useState('');
  const [clientName, setClientName] = useState('');
  const [pgUrl, setPgUrl] = useState('');
  const [schemaHint, setSchemaHint] = useState('');
  
  // Lists & loader states
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
  const [upiScreenshot, setUpiScreenshot] = useState(null);
  const [upiScreenshotName, setUpiScreenshotName] = useState('');
  const [isVerifyingUpi, setIsVerifyingUpi] = useState(false);
  const [upiVerifyError, setUpiVerifyError] = useState('');
  const [upiVerifySuccess, setUpiVerifySuccess] = useState('');
  const [showManualUtrInput, setShowManualUtrInput] = useState(false);
  const [manualUtr, setManualUtr] = useState('');

  // Super Admin Workspace List
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [isLoadingAllWorkspaces, setIsLoadingAllWorkspaces] = useState(false);
  const [adminMessage, setAdminMessage] = useState('');

  const fetchConnections = async (token) => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/adminzero/connections', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setConnections(data.connections || []);
      } else {
        setError(data.error || 'Failed to load connections');
      }
    } catch (err) {
      setError('Error loading connections: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

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
      }
    } catch (err) {
      console.error('Error fetching workspaces:', err);
    } finally {
      setIsLoadingWorkspaces(false);
    }
  };

  const fetchAllWorkspaces = async (token) => {
    if (!isSuperAdmin || !token) return;
    setIsLoadingAllWorkspaces(true);
    setAdminMessage('');
    try {
      const res = await fetch('/api/adminzero/workspaces', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setAllWorkspaces(data.workspaces || []);
      } else {
        setAdminMessage(data.error || 'Failed to load workspaces');
      }
    } catch (err) {
      setAdminMessage('Error loading workspaces: ' + err.message);
    } finally {
      setIsLoadingAllWorkspaces(false);
    }
  };

  useEffect(() => {
    if (userToken && user) {
      fetchConnections(userToken);
      fetchWorkspaces(user.id);
      if (isSuperAdmin) {
        fetchAllWorkspaces(userToken);
      }
      if (typeof window !== 'undefined') {
        setRedirectUri(`${window.location.origin}/api/slack/oauth`);
      }
    }
  }, [userToken, user]);

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

  const handleVerifyUpiPayment = async () => {
    if (showManualUtrInput) {
      if (!manualUtr || manualUtr.trim().length !== 12 || isNaN(Number(manualUtr))) {
        setUpiVerifyError('Please enter a valid 12-digit numeric UTR.');
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
          if (isSuperAdmin) fetchAllWorkspaces(userToken);
          setTimeout(() => setIsUpiModalOpen(false), 2000);
        } else {
          setUpiVerifyError(data.error || 'Failed to verify reference.');
        }
      } catch (err) {
        setUpiVerifyError('Error: ' + err.message);
      } finally {
        setIsVerifyingUpi(false);
      }
      return;
    }

    if (!upiScreenshot) {
      setUpiVerifyError('Please select a receipt screenshot first.');
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
          mime_type: 'image/png'
        })
      });
      const data = await res.json();
      if (data.success) {
        setUpiVerifySuccess(data.message);
        fetchWorkspaces(user.id);
        if (isSuperAdmin) fetchAllWorkspaces(userToken);
        setTimeout(() => setIsUpiModalOpen(false), 2000);
      } else {
        if (data.fallbackRequired) setShowManualUtrInput(true);
        setUpiVerifyError(data.error || 'AI verification failed. Try manual entry.');
      }
    } catch (err) {
      setUpiVerifyError('Error: ' + err.message);
    } finally {
      setIsVerifyingUpi(false);
    }
  };

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
        message: 'Test failed: ' + err.message
      });
    } finally {
      setTestingId(null);
    }
  };

  const handleSaveConnection = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!connectionId.trim() || !clientName.trim() || !pgUrl.trim()) {
      setError('Please fill in all required fields.');
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
        setConnectionId('');
        setClientName('');
        setPgUrl('');
        setSchemaHint('');
        fetchConnections(userToken);
      } else {
        setError(data.error || 'Failed to save configuration');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConnection = async (idToDelete) => {
    if (!confirm('Are you sure you want to delete this database mapping connection?')) return;
    setError('');
    setSuccess('');
    try {
      const res = await fetch(`/api/adminzero/connections?id=${idToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setSuccess('Connection mapping removed successfully.');
        fetchConnections(userToken);
      } else {
        setError(data.error || 'Failed to delete connection');
      }
    } catch (err) {
      setError('Error: ' + err.message);
    }
  };

  const handleAdminWorkspaceUpdate = async (teamId, updates) => {
    setAdminMessage('');
    try {
      const res = await fetch('/api/adminzero/workspaces', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({ team_id: teamId, updates })
      });
      const data = await res.json();
      if (data.success) {
        setAdminMessage(`Updated Slack workspace ${teamId} successfully.`);
        fetchWorkspaces(user.id);
        fetchAllWorkspaces(userToken);
      } else {
        setAdminMessage(data.error || 'Failed to update workspace');
      }
    } catch (err) {
      setAdminMessage('Error: ' + err.message);
    }
  };

  const upiAmount = selectedUpiPlan === 'business' ? '3999' : '999';
  const planLabel = selectedUpiPlan === 'business' ? 'Business Plan (₹3,999/mo)' : 'Pro Plan (₹999/mo)';
  const upiPayUri = `upi://pay?pa=${UPI_ID}&pn=AdminZero&am=${upiAmount}&cu=INR&tn=GlitchGo_${selectedUpiPlan}_${upiModalTeamId}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(upiPayUri)}`;

  return (
    <div className="space-y-10">
      
      {/* Title block */}
      <div className="text-left border-b border-white/5 pb-6">
        <h2 className="text-2xl font-bold text-white font-outfit flex items-center gap-2">
          <Terminal className="text-brand-blue" size={24} /> AdminZero Database ChatOps
        </h2>
        <p className="text-sm text-gray-400 mt-1">
          Map your database connections to Slack channels. Query using natural language directly inside Slack.
        </p>
      </div>

      {/* Slack Application Connection Status */}
      <Card className="bg-white/[0.01] border-white/5 p-6 text-left space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="font-bold text-white text-sm">Slack Workspace Integration</h4>
            <p className="text-xs text-gray-400 mt-1">
              Add AdminZero to your Slack workspace to begin querying mapped channels.
            </p>
          </div>
          <a
            href="/api/slack/oauth/start"
            className="flex items-center justify-center gap-2 bg-[#4A154B] hover:bg-[#381039] text-white font-bold px-4 py-2.5 rounded-xl border border-[#4A154B]/30 transition-all text-xs shrink-0 cursor-pointer active:scale-95"
          >
            Add to Slack
          </a>
        </div>

        {/* Workspaces list */}
        {workspaces.length > 0 && (
          <div className="border-t border-white/5 pt-4 mt-2 space-y-3">
            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Connected Slack Workspaces</h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {workspaces.map(ws => (
                <div key={ws.team_id} className="bg-dark-bg border border-white/5 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-500 font-mono block">ID: {ws.team_id}</span>
                    <span className="text-xs font-bold text-white block mt-0.5">{ws.team_name || 'Slack Workspace'}</span>
                    <span className={`inline-block px-1.5 py-0.2 rounded text-[9px] font-bold uppercase tracking-wider mt-1.5 ${
                      ws.tier === 'business' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' :
                      ws.tier === 'pro' ? 'bg-brand-orange/10 text-brand-orange border border-brand-orange/20' :
                      'bg-white/5 text-gray-400 border border-white/10'
                    }`}>
                      Plan: {ws.tier || 'Starter'}
                    </span>
                  </div>
                  {(!ws.tier || ws.tier === 'Starter') && (
                    <button
                      onClick={() => openUpiModal(ws.team_id)}
                      className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-1.5 px-3 rounded-lg text-[10px] uppercase tracking-wider transition-colors cursor-pointer"
                    >
                      🚀 Upgrade Plan
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Grid: Form & List */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 text-left space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Plus size={18} className="text-brand-blue" /> Add Connection Mapping
            </h3>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-xs flex items-center gap-1.5 font-medium">
                <XCircle size={14} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
                <CheckCircle size={14} className="shrink-0" />
                <span>{success}</span>
              </div>
            )}

            <form onSubmit={handleSaveConnection} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Slack Channel ID *</label>
                  <input
                    type="text"
                    placeholder="e.g. C07ABC123"
                    value={connectionId}
                    onChange={(e) => setConnectionId(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue transition-all text-xs font-mono"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Friendly Name *</label>
                  <input
                    type="text"
                    placeholder="e.g. User Database"
                    value={clientName}
                    onChange={(e) => setClientName(e.target.value)}
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue transition-all text-xs"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">PostgreSQL URL *</label>
                <input
                  type="password"
                  placeholder="postgresql://user:password@hostname:5432/db"
                  value={pgUrl}
                  onChange={(e) => setPgUrl(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue transition-all text-xs font-mono"
                  required={!success.includes('Loaded configuration')}
                />
                <span className="text-[9px] text-gray-500 mt-1 block">
                  🔒 Encrypted on the server using AES-256 before database insertion.
                </span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Schema Hints (Optional)</label>
                <textarea
                  rows={4}
                  placeholder={`Describe table fields to guide the AI translator, e.g.\nTable: orders\n- id (INT, PK)\n- amount (DECIMAL)`}
                  value={schemaHint}
                  onChange={(e) => setSchemaHint(e.target.value)}
                  className="w-full bg-dark-bg border border-white/10 rounded-xl px-3 py-2.5 text-white placeholder-gray-600 focus:outline-none focus:border-brand-blue transition-all text-xs font-mono"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-brand-blue hover:bg-blue-600 text-white font-bold py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(59,130,246,0.2)] disabled:opacity-50 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Plus size={14} />}
                  <span>Save Connection</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTestConnection(null, pgUrl)}
                  disabled={!pgUrl.trim() || testingId !== null}
                  className="px-4 border border-white/10 hover:bg-white/5 text-gray-300 font-bold py-2.5 rounded-xl transition-all disabled:opacity-30 text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  {testingId === 'raw-test' ? <Loader2 className="animate-spin" size={14} /> : <Play size={12} />}
                  <span>Test URL</span>
                </button>
              </div>

              {testResult && testResult.id === 'raw-test' && (
                <div className={`mt-3 p-3 rounded-xl text-[10px] flex items-start gap-2 border ${
                  testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                }`}>
                  {testResult.success ? <CheckCircle size={12} className="shrink-0 mt-0.5" /> : <XCircle size={12} className="shrink-0 mt-0.5" />}
                  <div>
                    <div className="font-bold">{testResult.success ? 'Success' : 'Connection Failed'}</div>
                    <div className="mt-0.5 font-mono opacity-90 break-all">{testResult.message}</div>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>

        {/* List Column */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/10 text-left space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
              <Database size={18} className="text-brand-blue" /> Registered Connections
            </h3>

            {isLoading ? (
              <div className="py-10 text-center flex flex-col items-center gap-2">
                <Loader2 className="animate-spin text-brand-blue" size={24} />
                <p className="text-xs text-gray-500">Loading mappings...</p>
              </div>
            ) : connections.length === 0 ? (
              <p className="text-xs text-gray-500 py-6 text-center italic">No connection mappings configured yet.</p>
            ) : (
              <div className="space-y-4">
                {connections.map(conn => (
                  <div key={conn.id} className="bg-white/[0.01] border border-white/5 rounded-2xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] text-gray-500 font-mono block">Channel: {conn.id}</span>
                        <span className="text-xs font-bold text-white block mt-0.5">{conn.client_name}</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setConnectionId(conn.id);
                            setClientName(conn.client_name);
                            setSchemaHint(conn.schema_hint || '');
                            setSuccess(`Loaded configuration. Re-enter the PostgreSQL URL to update.`);
                          }}
                          className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                          title="Edit Connection"
                        >
                          <Edit size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteConnection(conn.id)}
                          className="p-1.5 hover:bg-white/5 text-gray-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                          title="Delete Connection"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    <div className="flex gap-2 border-t border-white/5 pt-3">
                      <button
                        onClick={() => handleTestConnection(conn.id)}
                        disabled={testingId !== null}
                        className="w-full py-1.5 bg-dark-bg hover:bg-white/5 text-gray-300 font-semibold rounded-lg text-[10px] flex items-center justify-center gap-1 cursor-pointer transition-colors border border-white/5"
                      >
                        {testingId === conn.id ? <Loader2 className="animate-spin" size={10} /> : <Play size={10} />}
                        <span>Test connection</span>
                      </button>
                    </div>

                    {testResult && testResult.id === conn.id && (
                      <div className={`p-2 rounded-lg text-[9px] flex items-start gap-1 border ${
                        testResult.success ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                        <div>
                          <div className="font-bold">{testResult.success ? '✓ Connection Active' : '✗ Connection Failed'}</div>
                          <div className="opacity-90 font-mono mt-0.5 break-all leading-normal">{testResult.message}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* UPI Plan Upgrade Modal */}
      {isUpiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6">
          <Card className="max-w-md w-full bg-dark-surface border border-white/10 p-6 md:p-8 rounded-3xl text-left space-y-6">
            <div className="flex justify-between items-center border-b border-white/5 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-1.5">
                <Sparkles className="text-brand-orange" size={18} /> Upgrade Slack Workspace
              </h3>
              <button 
                onClick={() => setIsUpiModalOpen(false)}
                className="text-gray-400 hover:text-white text-sm font-bold bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Select Subscription Plan</label>
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => { setSelectedUpiPlan('pro'); setUpiVerifyError(''); }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      selectedUpiPlan === 'pro' ? 'border-brand-blue bg-brand-blue/5' : 'border-white/5 bg-dark-bg hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Pro Plan</span>
                    <span className="text-[10px] text-gray-400">₹999/mo (1,000 queries)</span>
                  </button>
                  <button 
                    onClick={() => { setSelectedUpiPlan('business'); setUpiVerifyError(''); }}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between h-20 transition-all cursor-pointer ${
                      selectedUpiPlan === 'business' ? 'border-brand-blue bg-brand-blue/5' : 'border-white/5 bg-dark-bg hover:border-white/10'
                    }`}
                  >
                    <span className="text-xs font-bold text-white">Business Plan</span>
                    <span className="text-[10px] text-gray-400">₹3,999/mo (Unlimited queries)</span>
                  </button>
                </div>
              </div>

              {/* QR Scan checkout */}
              <div className="bg-dark-bg border border-white/5 rounded-2xl p-4 flex flex-col items-center py-5">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Scan & Pay via UPI</span>
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Code" 
                  className="w-36 h-36 bg-white p-2 rounded-xl object-contain mb-3"
                />
                <span className="text-sm font-black text-emerald-400 font-mono">{planLabel}</span>
                <span className="text-[9px] text-gray-500 font-mono mt-1 break-all select-all">UPI ID: {UPI_ID}</span>
              </div>

              {/* Upload screenshot proof */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment Verification</span>
                  <button 
                    onClick={() => setShowManualUtrInput(!showManualUtrInput)} 
                    className="text-[9px] text-brand-blue hover:underline font-bold"
                  >
                    {showManualUtrInput ? "Switch to AI scan screenshot" : "Enter UTR manually"}
                  </button>
                </div>

                {upiVerifyError && (
                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-2.5 rounded-lg text-[10px] flex items-center gap-1 leading-normal font-semibold">
                    <XCircle size={12} className="shrink-0" />
                    <span>{upiVerifyError}</span>
                  </div>
                )}
                {upiVerifySuccess && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-2.5 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                    <CheckCircle size={12} className="shrink-0" />
                    <span>{upiVerifySuccess}</span>
                  </div>
                )}

                {showManualUtrInput ? (
                  <input 
                    type="text"
                    maxLength={12}
                    placeholder="Enter 12-Digit UPI UTR No"
                    className="w-full bg-dark-bg border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-blue font-mono text-center tracking-widest"
                    value={manualUtr}
                    onChange={(e) => setManualUtr(e.target.value.replace(/[^0-9]/g, ""))}
                    disabled={isVerifyingUpi}
                  />
                ) : (
                  <div className="border border-white/10 hover:border-brand-blue/30 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                    <input 
                      type="file" 
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      onChange={handleScreenshotChange}
                      disabled={isVerifyingUpi}
                    />
                    <Upload size={16} className="text-gray-500 mx-auto mb-1.5" />
                    <span className="text-[10px] text-gray-400 block truncate font-medium">
                      {upiScreenshotName ? upiScreenshotName : "Upload payment screenshot"}
                    </span>
                  </div>
                )}

                <button 
                  onClick={handleVerifyUpiPayment}
                  disabled={isVerifyingUpi}
                  className="w-full bg-brand-orange hover:bg-orange-500 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-mono tracking-wider cursor-pointer shadow-[0_0_15px_rgba(249,115,22,0.2)]"
                >
                  {isVerifyingUpi ? (
                    <>
                      <Loader2 className="animate-spin" size={12} />
                      <span>VERIFYING DEPOSIT...</span>
                    </>
                  ) : (
                    <>
                      <span>SUBMIT PROOF</span>
                      <ArrowRight size={12} />
                    </>
                  )}
                </button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Super Admin Override controls list (Admin only) */}
      {isSuperAdmin && allWorkspaces.length > 0 && (
        <Card className="bg-white/[0.01] border-red-500/10 border p-6 text-left space-y-6 mt-10">
          <h3 className="text-lg font-bold text-red-400 flex items-center gap-2 font-outfit">
            <ShieldAlert size={20} /> Super Admin overrides
          </h3>

          {adminMessage && (
            <div className="bg-white/5 border border-white/10 text-brand-orange p-3 rounded-xl text-xs font-mono">
              {adminMessage}
            </div>
          )}

          <div className="overflow-x-auto border border-white/5 rounded-xl">
            <table className="w-full text-xs text-left whitespace-nowrap">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10 font-bold uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Team Name</th>
                  <th className="px-4 py-3">Team ID</th>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Plan Tier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300 font-mono">
                {isLoadingAllWorkspaces ? (
                  <tr>
                    <td colSpan="5" className="p-4 text-center text-gray-500">Loading workspaces...</td>
                  </tr>
                ) : (
                  allWorkspaces.map(ws => (
                    <tr key={ws.team_id}>
                      <td className="px-4 py-3 font-sans font-semibold text-white">{ws.team_name || 'Slack Workspace'}</td>
                      <td className="px-4 py-3">{ws.team_id}</td>
                      <td className="px-4 py-3 truncate max-w-[120px]" title={ws.user_id}>{ws.user_id}</td>
                      <td className="px-4 py-3">
                        <select
                          value={ws.tier || 'Starter'}
                          onChange={(e) => handleAdminWorkspaceUpdate(ws.team_id, { tier: e.target.value })}
                          className="bg-dark-bg border border-white/10 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none"
                        >
                          <option value="Starter">Starter</option>
                          <option value="pro">Pro (₹999)</option>
                          <option value="business">Business (₹3,999)</option>
                        </select>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          onClick={() => handleAdminWorkspaceUpdate(ws.team_id, { token: null })}
                          className="text-[9px] bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 px-2 py-1 rounded transition-colors font-bold uppercase tracking-wider"
                        >
                          Reset Token
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

    </div>
  );
}

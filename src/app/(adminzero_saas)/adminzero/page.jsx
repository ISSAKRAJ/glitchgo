"use client";

import React, { useState, useEffect } from 'react';
import { Database, Shield, Play, Plus, RefreshCw, CheckCircle, XCircle, Terminal, HelpCircle, Loader2 } from 'lucide-react';

export default function AdminZeroPage() {
  // Connection Form State
  const [connectionId, setConnectionId] = useState('');
  const [clientName, setClientName] = useState('');
  const [pgUrl, setPgUrl] = useState('');
  const [schemaHint, setSchemaHint] = useState('');
  
  // List & UI State
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [testingId, setTestingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [redirectUri, setRedirectUri] = useState('');

  // Fetch registered connections
  const fetchConnections = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/adminzero/connections');
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

  useEffect(() => {
    fetchConnections();

    // Check for Slack OAuth redirect status in URL query params
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/slack/oauth`);
      const params = new URLSearchParams(window.location.search);
      if (params.get('installed') === 'true') {
        const teamId = params.get('team_id');
        setSuccess(`Successfully authorized AdminZero for workspace ID: ${teamId || 'unknown'}. You can now map database connections for this workspace's channels!`);
        // Clean URL parameters cleanly without reloading the page
        window.history.replaceState({}, document.title, window.location.pathname);
      } else if (params.get('error')) {
        setError(`Slack authorization failed: ${params.get('error')}`);
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, []);

  // Handle connection test
  const handleTestConnection = async (idToTest = null, rawUrl = '') => {
    const activeId = idToTest || 'raw-test';
    setTestingId(activeId);
    setTestResult(null);
    try {
      const payload = idToTest ? { id: idToTest } : { pg_url: rawUrl };
      const res = await fetch('/api/adminzero/connections/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
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
        fetchConnections();
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
    setPgUrl(''); // Leave blank for security, user can re-enter to overwrite
    setSuccess(`Loaded configuration for Slack Channel ${conn.id}. Re-enter the PostgreSQL URL to update it.`);
  };

  return (
    <div className="space-y-10 animate-fade-in">
      {/* Title & Introduction */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-200 to-gray-400">
            AdminZero ChatOps Config
          </h1>
          <p className="text-gray-400 mt-2 max-w-2xl text-sm leading-relaxed">
            Link Slack channels to target database connections. Chat requests will be translated to SQL, verified for safety, and run against the mapped databases securely.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3.5 shrink-0">
          {/* Add to Slack Button */}
          <a
            href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '11352040316962.11349992784470'}&scope=app_mentions:read,chat:write&redirect_uri=${encodeURIComponent(redirectUri)}`}
            className="flex items-center gap-2 bg-[#4A154B] hover:bg-[#381039] text-white font-bold px-4 py-2.5 rounded-xl border border-[#4A154B]/30 transition-all shadow-md shadow-[#4A154B]/15 text-sm shrink-0 active:scale-95 duration-150"
          >
            <svg className="w-4 h-4 fill-white" viewBox="0 0 122.8 122.8">
              <path d="M25.8 77.6c0-7.1-5.8-12.9-12.9-12.9S0 70.5 0 77.6s5.8 12.9 12.9 12.9h12.9v-12.9zm6.4 0c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9v-38.7c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7zM45.2 12.9c0 7.1 5.8 12.9 12.9 12.9S71 20 71 12.9 65.2 0 58.1 0s-12.9 5.8-12.9 12.9zm0 6.4c7.1 0 12.9 5.8 12.9 12.9v38.7c0 7.1-5.8 12.9-12.9 12.9S32.3 97 32.3 89.9V51.2c0-7.1 5.8-12.9 12.9-12.9zM97 45.2c7.1 0 12.9-5.8 12.9-12.9S104.1 19.4 97 19.4s-12.9 5.8-12.9 12.9v12.9H97zm-6.4 0c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9V45.2zM77.6 109.9c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9h-12.9v-12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9V51.8c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v51.2c0 7.1-5.8 12.9-12.9 12.9z" />
            </svg>
            Add to Slack
          </a>

          <div className="glass px-5 py-3 rounded-2xl flex items-center gap-3 border border-white/10 shrink-0">
            <div className="w-8 h-8 rounded-full bg-brand-blue/10 flex items-center justify-center border border-brand-blue/30 text-brand-blue">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider">Security State</div>
              <div className="text-xs font-bold text-emerald-400">AES-256 Enabled</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Form Left, Mappings Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Mapped Connections Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-blue/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
            
            <h2 className="text-xl font-bold flex items-center gap-2 mb-6 text-white">
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
              <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-3 rounded-xl text-sm flex items-center gap-2 mb-6">
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
                <span className="text-[10px] text-gray-500 block mt-1.5 leading-normal">
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
                  className="flex-1 bg-gradient-to-r from-brand-blue to-brand-blue-dark hover:from-blue-500 hover:to-blue-600 text-white font-medium py-3 rounded-xl transition-all shadow-lg shadow-brand-blue/10 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
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

        {/* Right Column: Registered Mappings List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass p-6 rounded-3xl border border-white/10 relative overflow-hidden">
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Shield className="text-brand-orange" size={18} />
                Registered Channels
              </h2>
              <button
                onClick={fetchConnections}
                disabled={isLoading}
                className="text-gray-400 hover:text-white transition-colors p-1"
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
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-1">
                {connections.map((conn) => (
                  <div
                    key={conn.id}
                    className="p-4 rounded-2xl bg-dark-surface border border-white/5 hover:border-white/10 transition-all group flex flex-col gap-3.5"
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
                          onClick={() => handleTestConnection(conn.id)}
                          disabled={testingId === conn.id}
                          className="text-xs text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 px-2.5 py-1 rounded-md border border-white/5 flex items-center gap-1 transition-colors"
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
          <div className="glass p-6 rounded-3xl border border-white/10 space-y-4">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Terminal className="text-brand-blue" size={16} />
              Slack Setup Guide
            </h2>
            <ul className="text-xs text-gray-400 space-y-3 list-decimal list-inside leading-relaxed">
              <li>Click the <b>Add to Slack</b> button above to authorize AdminZero for your Slack workspace.</li>
              <li>Configure Slack event subscriptions to point to your proxy URL: <code className="text-brand-blue bg-white/5 px-1 py-0.5 rounded">https://9e6ee049c2bd83.lhr.life/api/slack/events</code>.</li>
              <li>Under Slack App Redirect URLs, configure: <code className="text-brand-blue bg-white/5 px-1 py-0.5 rounded">https://9e6ee049c2bd83.lhr.life/api/slack/oauth</code>.</li>
              <li>Copy the Slack Channel ID from Slack (right click on channel &gt; copy link / details).</li>
              <li>On the left, map that Slack Channel ID to your PostgreSQL connection URL and provide a schema hint.</li>
              <li>Invite the bot to the channel via <code className="text-white bg-white/5 px-1 py-0.5 rounded">/invite @AdminZero</code>, mention it, and query your database!</li>
            </ul>
          </div>
        </div>
        
      </div>
    </div>
  );
}

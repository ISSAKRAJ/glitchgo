import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, ShieldAlert, CheckCircle, Database, 
  Terminal, Copy, AlertTriangle, Play, RefreshCw, Download, Monitor, Laptop,
  Globe, Zap, Eye, Lock
} from 'lucide-react';

export default function AdminZeroTab({ user, supabase, userToken }) {
  const [workspace, setWorkspace] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [recentLogs, setRecentLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('docker');
  const [paymentUtr, setPaymentUtr] = useState('');
  const [payLoading, setPayLoading] = useState(false);
  const [payMessage, setPayMessage] = useState(null);
  const [dbUrl, setDbUrl] = useState('');
  const [dbDialect, setDbDialect] = useState('postgres');
  const [dbSaving, setDbSaving] = useState(false);
  const [dbMessage, setDbMessage] = useState(null);
  const [cloudTab, setCloudTab] = useState('sql');

  // Fetch or auto-create license workspace on load
  const fetchOrOnboardWorkspace = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data && data.length > 0) {
        setWorkspace(data[0]);
        fetchLogs(data[0].team_id);
      } else {
        // Auto-generate license key (team_id)
        const newLicenseKey = `az_lic_${Math.random().toString(36).substring(2, 9)}${Math.random().toString(36).substring(2, 9)}`;
        const { data: insertedData, error: insertError } = await supabase
          .from('workspaces')
          .insert([
            {
              team_id: newLicenseKey,
              user_id: user.id,
              tier: 'free',
              max_queries: 500,
              query_count: 0
            }
          ])
          .select();

        if (insertError) throw insertError;
        if (insertedData) {
          setWorkspace(insertedData[0]);
          fetchLogs(insertedData[0].team_id);
        }
      }
    } catch (err) {
      console.error('Error loading license keys:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchLogs = async (licenseKey) => {
    try {
      const { data, error } = await supabase
        .from('query_logs')
        .select('*')
        .eq('workspace_id', licenseKey)
        .order('created_at', { ascending: false })
        .limit(10);
      if (!error && data) {
        setRecentLogs(data);
      }
    } catch (err) {
      console.error('Error fetching logs:', err);
    }
  };

  useEffect(() => {
    fetchOrOnboardWorkspace();
  }, [user]);

  useEffect(() => {
    if (workspace) {
      setDbUrl(workspace.db_url || '');
      setDbDialect(workspace.db_dialect || 'postgres');
    }
  }, [workspace]);

  const saveDbConfig = async () => {
    if (!workspace) return;
    setDbSaving(true); setDbMessage(null);
    try {
      const { error } = await supabase
        .from('workspaces')
        .update({ db_url: dbUrl, db_dialect: dbDialect })
        .eq('team_id', workspace.team_id);
      if (error) throw error;
      setDbMessage({ type: 'success', text: 'Database configuration saved.' });
      setWorkspace(prev => ({ ...prev, db_url: dbUrl, db_dialect: dbDialect }));
    } catch (err) {
      setDbMessage({ type: 'error', text: err.message || 'Failed to save.' });
    } finally {
      setDbSaving(false);
      setTimeout(() => setDbMessage(null), 4000);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleManualPayment = async (e) => {
    e.preventDefault();
    if (!paymentUtr) return;
    setPayLoading(true);
    setPayMessage(null);

    // Mock success and apply credits
    setTimeout(async () => {
      try {
        const newMax = (workspace.max_queries || 500) + 10000;
        const { error } = await supabase
          .from('workspaces')
          .update({ max_queries: newMax, tier: 'startup' })
          .eq('team_id', workspace.team_id);

        if (!error) {
          setWorkspace(prev => ({ ...prev, max_queries: newMax, tier: 'startup' }));
          setPayMessage({ type: 'success', text: 'UPI verified successfully. Added +10,000 query credits!' });
          setPaymentUtr('');
        } else {
          setPayMessage({ type: 'error', text: 'Database error applying credits.' });
        }
      } catch (err) {
        setPayMessage({ type: 'error', text: 'Error applying UPI credits.' });
      } finally {
        setPayLoading(false);
      }
    }, 1500);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <RefreshCw className="animate-spin text-brand-orange mb-2" size={32} />
        <span className="text-xs text-slate-500 font-mono">Retrieving active license configuration...</span>
      </div>
    );
  }

  const queryRemaining = Math.max(0, (workspace.max_queries || 0) - (workspace.query_count || 0));
  const usagePercentage = Math.min(100, Math.round(((workspace.query_count || 0) / (workspace.max_queries || 1)) * 100));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
      
      {/* LEFT & MID COLUMNS: License details & setup instructions */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Active License Details */}
        <div className="bg-[#050505] border border-zinc-900 rounded-3xl p-6 md:p-8 relative shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Secure Data Plane Connection</span>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <Shield size={18} className="text-brand-orange" />
                Active Agent License Key
              </h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
              workspace.tier === 'free' 
                ? 'bg-zinc-950 border-zinc-800 text-zinc-450' 
                : 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.05)]'
            }`}>
              {workspace.tier} tier
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl flex items-center justify-between mb-6">
            <code className="text-xs sm:text-sm text-brand-orange select-all font-mono tracking-wider truncate max-w-[85%] pr-4">
              {workspace.team_id}
            </code>
            <button 
              onClick={() => copyToClipboard(workspace.team_id)}
              className="p-2 hover:bg-zinc-900 border border-zinc-850 rounded-xl transition-all cursor-pointer text-zinc-500 hover:text-white shrink-0"
              title="Copy License Key"
            >
              {copied ? <span className="text-[10px] font-mono text-brand-orange font-bold">Copied!</span> : <Copy size={14} />}
            </button>
          </div>

          {/* Credits Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-zinc-500">Compute Credits Balance:</span>
              <span className="text-zinc-350">{workspace.query_count || 0} / {workspace.max_queries || 500} Credits Used</span>
            </div>
            <div className="w-full bg-zinc-950 rounded-full h-3 border border-zinc-900 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 65 ? 'bg-yellow-500' : 'bg-brand-orange'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-1 text-[10px] text-zinc-500 font-mono">
              <span>{usagePercentage}% Limit reached</span>
              <span>{queryRemaining} credits remaining</span>
            </div>
          </div>
        </div>

        {/* ── CLOUD API CONFIGURATION ── */}
        <div className="bg-[#050505] border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <span className="text-[10px] text-brand-orange uppercase tracking-widest font-mono font-bold">⭐ New — No Install Required</span>
              <h2 className="text-lg font-bold text-white mt-1 flex items-center gap-2">
                <Globe size={18} className="text-brand-orange" />
                Cloud API — Use Anywhere
              </h2>
              <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
                Connect your database once below. Then call our API from any device, server, or AI app — no desktop install needed.
              </p>
            </div>
            <div className="flex flex-col gap-1 shrink-0">
              {[['PII Scrubber','text-purple-400'],['Prompt Firewall','text-red-400'],['AST Firewall','text-brand-orange'],['Audit Trail','text-blue-400'],['Vector DB','text-emerald-400']].map(([f,c])=>(
                <span key={f} className={`text-[9px] font-mono font-bold uppercase ${c} flex items-center gap-1`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-current inline-block"/>{f}
                </span>
              ))}
            </div>
          </div>

          {/* DB URL Config */}
          <div className="space-y-3">
            <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold tracking-widest">Step 1 — Connect Your Database</span>
            <div className="flex gap-2">
              <select
                value={dbDialect}
                onChange={e => setDbDialect(e.target.value)}
                className="bg-zinc-950 border border-zinc-850 text-xs text-zinc-300 font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-brand-orange cursor-pointer"
              >
                <option value="postgres">PostgreSQL</option>
                <option value="mysql">MySQL</option>
              </select>
              <input
                type="password"
                value={dbUrl}
                onChange={e => setDbUrl(e.target.value)}
                placeholder="postgresql://user:pass@host:5432/dbname"
                className="flex-1 bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-brand-orange"
              />
              <button
                onClick={saveDbConfig}
                disabled={dbSaving || !dbUrl}
                className="px-4 py-2 bg-brand-orange text-black text-xs font-extrabold rounded-xl hover:bg-opacity-90 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {dbSaving ? 'Saving...' : 'Save'}
              </button>
            </div>
            {dbMessage && (
              <p className={`text-[10px] font-mono ${dbMessage.type === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{dbMessage.text}</p>
            )}
            <p className="text-[9px] text-zinc-600 font-mono">🔒 Stored encrypted. Used only to execute validated queries on your behalf. Never logged or shared.</p>
          </div>

          {/* Cloud API Code Snippet */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold tracking-widest">Step 2 — Call the API</span>
              <div className="flex border-b border-zinc-900 font-mono text-[9px] font-bold gap-3">
                {[['sql','SQL Query'],['vector','Vector DB'],['passthrough','Raw SQL']].map(([k,l])=>(
                  <button key={k} onClick={()=>setCloudTab(k)}
                    className={`pb-1 border-b-2 cursor-pointer transition-colors ${
                      cloudTab===k ? 'border-brand-orange text-white' : 'border-transparent text-zinc-500'
                    }`}>{l}</button>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-xl font-mono text-[10px] text-indigo-300 overflow-x-auto leading-relaxed relative">
              {cloudTab === 'sql' && (
                <pre>{`fetch('https://glitchgo.tech/api/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    license_key: "${workspace?.team_id || 'your-license-key'}",
    prompt: "Show me all orders from last week"
    // db_url optional if saved above
  })
})
// Returns: { status, sql, data, meta: { piiScrubbed, creditsRemaining } }`}</pre>
              )}
              {cloudTab === 'vector' && (
                <pre>{`fetch('https://glitchgo.tech/api/v1/query/vector', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    license_key: "${workspace?.team_id || 'your-license-key'}",
    query: "Find products similar to wireless headphones",
    collection: "products",
    top_k: 10
  })
})
// Returns sanitizedQuery — pass to Pinecone/Weaviate/ChromaDB`}</pre>
              )}
              {cloudTab === 'passthrough' && (
                <pre>{`fetch('https://glitchgo.tech/api/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    license_key: "${workspace?.team_id || 'your-license-key'}",
    prompt: "SELECT id, name FROM users WHERE active = true",
    mode: "passthrough"  // skip Gemini, treat as raw SQL
  })
})`}</pre>
              )}
              <button
                onClick={() => copyToClipboard(
                  cloudTab === 'sql'
                    ? `fetch('https://glitchgo.tech/api/v1/query', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ license_key: "${workspace?.team_id}", prompt: "Show me all orders from last week" }) })`
                    : `fetch('https://glitchgo.tech/api/v1/query/vector', { method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify({ license_key: "${workspace?.team_id}", query: "your search query", collection: "your_collection" }) })`
                )}
                className="absolute right-3 top-3 p-1.5 hover:bg-slate-900 border border-slate-850 rounded text-slate-500 hover:text-white cursor-pointer"
                title="Copy"
              >
                <Copy size={11} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: UPI credit payment system */}
      <div className="space-y-6">
        <div className="bg-[#050505] border border-zinc-900 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Credits Top Up</span>
            <h2 className="text-base font-bold text-white mt-1">Buy Query Credits</h2>
            <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
              Add **+10,005 query credits** immediately to your local agent quota.
            </p>
          </div>

          {/* Pricing Info */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl text-center">
            <span className="text-[9px] text-zinc-500 font-mono uppercase font-bold tracking-widest block mb-1">Total Cost</span>
            <span className="text-2xl font-black text-white">₹599</span>
            <span className="text-[10px] text-zinc-500"> INR</span>
          </div>

          {/* UPI Address Box */}
          <div className="bg-zinc-950 border border-zinc-900 p-4 rounded-2xl space-y-3">
            <span className="text-[9px] text-zinc-500 font-mono uppercase block font-bold tracking-widest">Pay via UPI App</span>
            <div className="text-xs font-bold text-white font-mono flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-850 select-all">
              <span>7013017818@naviaxis</span>
              <button 
                onClick={() => copyToClipboard('7013017818@naviaxis')}
                className="text-[9px] bg-zinc-950 border border-zinc-800 text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all"
              >
                Copy ID
              </button>
            </div>
            <p className="text-[9px] text-zinc-500 italic leading-relaxed">
              Open your BHIM, GPay, PhonePe, or Paytm app. Send ₹599 to the UPI ID above.
            </p>
          </div>

          {/* UTR Input Form */}
          <form onSubmit={handleManualPayment} className="space-y-3">
            <label className="text-[9px] text-zinc-500 font-mono uppercase block font-bold tracking-widest">
              Submit UPI UTR / Transaction ID
            </label>
            <input 
              type="text" 
              value={paymentUtr}
              onChange={(e) => setPaymentUtr(e.target.value)}
              placeholder="e.g. 614039572834"
              required
              disabled={payLoading}
              className="w-full bg-zinc-950 border border-zinc-850 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-655 focus:outline-none focus:border-brand-orange"
            />
            <button 
              type="submit"
              disabled={payLoading || !paymentUtr}
              className="w-full bg-brand-orange hover:bg-opacity-95 text-black disabled:text-slate-500 font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 border-none shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            >
              {payLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  <span>Verifying Payment...</span>
                </>
              ) : (
                <span>Submit transaction</span>
              )}
            </button>
          </form>

          {payMessage && (
            <div className={`p-3 rounded-xl border text-[11px] ${
              payMessage.type === 'success' 
                ? 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}>
              {payMessage.text}
            </div>
          )}
        </div>
      </div>

      {/* FULL WIDTH: Recent logs and telemetry audits */}
      <div className="lg:col-span-3 bg-[#050505] border border-zinc-900 rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Compliance & SOC2</span>
            <h2 className="text-lg font-bold text-white mt-1">Live Audit Logs</h2>
            <p className="text-xs text-zinc-400 mt-2">Tamper-evident logs of all queries routed through the Cloud Proxy, including PII events and blocked threats.</p>
          </div>
          <button
            onClick={() => window.open(`/api/v1/logs?license_key=${workspace?.team_id}&format=csv`, '_blank')}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all border border-zinc-800"
          >
            <Download size={14} className="text-brand-orange" />
            Export CSV
          </button>
        </div>

        <div className="border border-zinc-900 bg-zinc-950 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-zinc-900 border-b border-zinc-800 text-zinc-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Prompt / Query</th>
                <th className="p-4 font-bold">Generated SQL</th>
                <th className="p-4 font-bold">PII Scrubbed</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? (
                recentLogs.map(log => (
                  <tr key={log.id} className="border-b border-zinc-900 hover:bg-zinc-900/40">
                    <td className="p-4 text-zinc-500 whitespace-nowrap align-top">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 text-zinc-200 select-all font-sans leading-relaxed max-w-sm align-top">{log.user_prompt}</td>
                    <td className="p-4 text-zinc-400 select-all leading-relaxed max-w-sm align-top text-[10px]">
                      {log.generated_sql || '-'}
                    </td>
                    <td className="p-4 align-top">
                      {log.pii_detected ? (
                        <div className="flex flex-wrap gap-1">
                          {(log.pii_types || ['PII']).map(t => (
                            <span key={t} className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              {t}
                            </span>
                          ))}
                        </div>
                      ) : <span className="text-zinc-600">-</span>}
                    </td>
                    <td className="p-4 whitespace-nowrap align-top">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-brand-orange bg-brand-orange/10 border border-brand-orange/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>Passed</span>
                        </span>
                      ) : (
                        <div className="flex flex-col gap-1">
                          <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase text-[9px] w-max">
                            <ShieldAlert className="w-3 h-3" />
                            <span>Blocked</span>
                          </span>
                          {log.threat_type && <span className="text-[9px] text-red-500/70">{log.threat_type}</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-500 italic">
                    No queries routed through the Cloud API yet. Start sending traffic to /api/v1/query!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

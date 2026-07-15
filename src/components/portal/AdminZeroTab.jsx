import React, { useState, useEffect } from 'react';
import { 
  Key, Shield, ShieldAlert, CheckCircle, Database, 
  Terminal, Copy, AlertTriangle, Play, RefreshCw, Download, Monitor, Laptop
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
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 relative">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Secure Data Plane Connection</span>
              <h2 className="text-xl font-bold text-white mt-1 flex items-center gap-2">
                <Shield size={18} className="text-brand-blue" />
                Active Agent License Key
              </h2>
            </div>
            <span className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase border self-start sm:self-auto ${
              workspace.tier === 'free' 
                ? 'bg-slate-950 border-slate-800 text-slate-400' 
                : 'bg-brand-orange/10 border-brand-orange/30 text-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.05)]'
            }`}>
              {workspace.tier} tier
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl flex items-center justify-between mb-6">
            <code className="text-xs sm:text-sm text-brand-orange select-all font-mono tracking-wider truncate max-w-[85%] pr-4">
              {workspace.team_id}
            </code>
            <button 
              onClick={() => copyToClipboard(workspace.team_id)}
              className="p-2 hover:bg-slate-900 border border-slate-850 rounded-xl transition-all cursor-pointer text-slate-400 hover:text-white shrink-0"
              title="Copy License Key"
            >
              {copied ? <span className="text-[10px] font-mono text-brand-orange font-bold">Copied!</span> : <Copy size={14} />}
            </button>
          </div>

          {/* Credits Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Query Quota Balance:</span>
              <span className="text-slate-350">{workspace.query_count || 0} / {workspace.max_queries || 500} queries used</span>
            </div>
            <div className="w-full bg-slate-950 rounded-full h-3 border border-slate-850 overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  usagePercentage > 90 ? 'bg-red-500' : usagePercentage > 65 ? 'bg-yellow-500' : 'bg-brand-orange'
                }`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex justify-between items-center pt-1 text-[10px] text-slate-500 font-mono">
              <span>{usagePercentage}% Limit reached</span>
              <span>{queryRemaining} credits remaining</span>
            </div>
          </div>
        </div>

        {/* Desktop Client App Installer Downloads */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Client Download Manager</span>
            <h2 className="text-lg font-bold text-white mt-1">Download Dedicated Desktop Client</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Install the AdminZero GUI application on your host machine to secure database connections locally.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Windows */}
            <button 
              onClick={() => alert('Downloading AdminZero Setup.exe installer...')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-brand-blue p-4 rounded-2xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <Monitor size={20} className="text-brand-blue mx-auto group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-white block">Windows (.exe)</span>
            </button>
            
            {/* macOS */}
            <button 
              onClick={() => alert('Downloading AdminZero macOS.dmg app installer...')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-brand-orange p-4 rounded-2xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <Laptop size={20} className="text-brand-orange mx-auto group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-white block">macOS (.dmg)</span>
            </button>

            {/* Linux */}
            <button 
              onClick={() => alert('Downloading AdminZero Linux.AppImage file...')}
              className="bg-slate-950 hover:bg-slate-900 border border-slate-850 hover:border-indigo-500 p-4 rounded-2xl text-center space-y-2 transition-all cursor-pointer group"
            >
              <Terminal size={20} className="text-indigo-400 mx-auto group-hover:scale-105 transition-transform" />
              <span className="text-xs font-bold text-white block">Linux (.AppImage)</span>
            </button>
          </div>
        </div>

        {/* Local Agent setup instructions */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Alternative deployment Options</span>
            <h2 className="text-base font-bold text-white mt-1">Spin up Local Proxy CLI</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Prefer headless deployment? Run the security gateway daemon in your terminal or background docker pools.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-800 font-mono text-xs font-semibold gap-4">
            <button 
              onClick={() => setActiveTab('docker')}
              className={`pb-2 border-b-2 cursor-pointer transition-colors ${activeTab === 'docker' ? 'border-brand-orange text-white' : 'border-transparent text-slate-500'}`}
            >
              Docker
            </button>
            <button 
              onClick={() => setActiveTab('cli')}
              className={`pb-2 border-b-2 cursor-pointer transition-colors ${activeTab === 'cli' ? 'border-brand-orange text-white' : 'border-transparent text-slate-500'}`}
            >
              CLI / Daemon
            </button>
          </div>

          {/* Code Snippets */}
          {activeTab === 'docker' ? (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Run the official AdminZero local container. Replace target database connection string variables:
              </p>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed relative">
                <pre>
{`docker run -d \\
  -p 5001:5001 \\
  -e ADMINZERO_LICENSE_KEY="${workspace.team_id}" \\
  -e LOCAL_DB_URI="postgresql://user:pass@localhost:5432/db" \\
  -e GEMINI_API_KEY="your-gemini-api-key" \\
  adminzero/agent:latest`}
                </pre>
                <button 
                  onClick={() => copyToClipboard(`docker run -d -p 5001:5001 -e ADMINZERO_LICENSE_KEY="${workspace.team_id}" -e LOCAL_DB_URI="postgresql://user:pass@localhost:5432/db" -e GEMINI_API_KEY="your-gemini-api-key" adminzero/agent:latest`)}
                  className="absolute right-3 top-3 p-1.5 hover:bg-slate-900 border border-slate-850 rounded text-slate-500 hover:text-white"
                  title="Copy command"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-slate-400 leading-relaxed">
                Install and run the local gateway binary daemon via Node.js CLI tool:
              </p>
              <div className="bg-slate-950 border border-slate-850 p-4 rounded-xl font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed relative space-y-3">
                <div>
                  <span className="text-slate-500"># Install the proxy client</span>
                  <pre className="text-white mt-1">$ npm install -g @adminzero/agent</pre>
                </div>
                <hr className="border-slate-850" />
                <div>
                  <span className="text-slate-500"># Start local proxy engine</span>
                  <pre className="text-white mt-1">{`$ adminzero start --key="${workspace.team_id}" --db="postgresql://user:pass@localhost:5432/db"`}</pre>
                </div>
                <button 
                  onClick={() => copyToClipboard(`npm install -g @adminzero/agent && adminzero start --key="${workspace.team_id}"`)}
                  className="absolute right-3 top-3 p-1.5 hover:bg-slate-900 border border-slate-850 rounded text-slate-500 hover:text-white"
                  title="Copy command"
                >
                  <Copy size={12} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: UPI credit payment system */}
      <div className="space-y-6">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6">
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Credits Top Up</span>
            <h2 className="text-base font-bold text-white mt-1">Buy Query Credits</h2>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Add **+10,000 query credits** immediately to your local agent quota.
            </p>
          </div>

          {/* Pricing Info */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl text-center">
            <span className="text-[9px] text-slate-500 font-mono uppercase font-bold tracking-widest block mb-1">Total Cost</span>
            <span className="text-2xl font-black text-white">₹599</span>
            <span className="text-[10px] text-slate-500"> INR</span>
          </div>

          {/* UPI Address Box */}
          <div className="bg-slate-950 border border-slate-850 p-4 rounded-2xl space-y-3">
            <span className="text-[9px] text-slate-500 font-mono uppercase block font-bold tracking-widest">Pay via UPI App</span>
            <div className="text-xs font-bold text-white font-mono flex items-center justify-between bg-slate-900 p-2.5 rounded-xl border border-slate-850 select-all">
              <span>7013017818@naviaxis</span>
              <button 
                onClick={() => copyToClipboard('7013017818@naviaxis')}
                className="text-[9px] bg-slate-950 border border-slate-800 text-slate-400 hover:text-white px-2 py-0.5 rounded cursor-pointer transition-all"
              >
                Copy ID
              </button>
            </div>
            <p className="text-[9px] text-slate-500 italic leading-relaxed">
              Open your BHIM, GPay, PhonePe, or Paytm app. Send ₹599 to the UPI ID above.
            </p>
          </div>

          {/* UTR Input Form */}
          <form onSubmit={handleManualPayment} className="space-y-3">
            <label className="text-[9px] text-slate-500 font-mono uppercase block font-bold tracking-widest">
              Submit UPI UTR / Transaction ID
            </label>
            <input 
              type="text" 
              value={paymentUtr}
              onChange={(e) => setPaymentUtr(e.target.value)}
              placeholder="e.g. 614039572834"
              required
              disabled={payLoading}
              className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder-slate-655 focus:outline-none focus:border-brand-orange"
            />
            <button 
              type="submit"
              disabled={payLoading || !paymentUtr}
              className="w-full bg-brand-orange hover:bg-opacity-95 text-white disabled:text-slate-500 font-extrabold py-2.5 rounded-xl text-xs transition-all cursor-pointer flex items-center justify-center space-x-2 border-none shadow-[0_0_15px_rgba(249,115,22,0.15)]"
            >
              {payLoading ? (
                <>
                  <div className="h-3 w-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
      <div className="lg:col-span-3 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div>
          <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold">Control Plane Audits</span>
          <h2 className="text-lg font-bold text-white mt-1">Live Intercept Telemetry</h2>
          <p className="text-xs text-slate-400 mt-2">Telemetry logs streamed from your local agent instances to the cloud firewall monitor.</p>
        </div>

        <div className="border border-slate-800 bg-slate-950 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">Timestamp</th>
                <th className="p-4 font-bold">Query / Prompt</th>
                <th className="p-4 font-bold">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentLogs.length > 0 ? (
                recentLogs.map(log => (
                  <tr key={log.id} className="border-b border-slate-850 hover:bg-slate-900/40">
                    <td className="p-4 text-slate-500 whitespace-nowrap">{new Date(log.created_at).toLocaleString()}</td>
                    <td className="p-4 text-slate-200 select-all font-sans leading-relaxed max-w-lg">{log.user_prompt}</td>
                    <td className="p-4 whitespace-nowrap">
                      {log.status === 'success' ? (
                        <span className="inline-flex items-center gap-1 text-brand-orange bg-brand-orange/10 border border-brand-orange/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                          <CheckCircle className="w-3 h-3" />
                          <span>success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-400 bg-red-500/10 border border-red-500/30 px-2 py-0.5 rounded font-bold uppercase text-[9px]">
                          <ShieldAlert className="w-3 h-3" />
                          <span>blocked</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-500 italic">
                    No query logs reported from local agent yet. Start your local container to stream telemetry!
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

import React, { useState, useEffect } from 'react';
import { 
  Users, Key, ShieldCheck, Database, RefreshCw, Edit2, Save, X, PlusCircle, AlertCircle
} from 'lucide-react';

export default function AdminTab({ user, supabase, userToken }) {
  const [workspaces, setWorkspaces] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [editingId, setEditingId] = useState(null);
  
  // Edit Form Fields
  const [editTier, setEditTier] = useState('free');
  const [editMaxQueries, setEditMaxQueries] = useState(500);
  const [editQueryCount, setEditQueryCount] = useState(0);
  const [saveLoading, setSaveLoading] = useState(false);

  const fetchWorkspaces = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workspaces`, {
        headers: { 'Authorization': `Bearer ${userToken}` }
      });
      const result = await res.json();
      if (result.success) {
        setWorkspaces(result.workspaces || []);
      } else {
        setErrorMsg(result.error || 'Failed to retrieve license keys.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error connecting to admin APIs.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userToken) {
      fetchWorkspaces();
    }
  }, [userToken]);

  const startEdit = (ws) => {
    setEditingId(ws.team_id);
    setEditTier(ws.tier || 'free');
    setEditMaxQueries(ws.max_queries || 500);
    setEditQueryCount(ws.query_count || 0);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const handleUpdate = async (teamId) => {
    setSaveLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000'}/api/admin/workspaces/update`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${userToken}`
        },
        body: JSON.stringify({
          teamId,
          tier: editTier,
          maxQueries: editMaxQueries,
          queryCount: editQueryCount
        })
      });
      
      const result = await res.json();
      if (result.success) {
        setEditingId(null);
        fetchWorkspaces();
      } else {
        alert(result.error || 'Failed to update license.');
      }
    } catch (err) {
      alert('Network error updating license: ' + err.message);
    } finally {
      setSaveLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <RefreshCw className="animate-spin text-red-500 mb-2" size={32} />
        <span className="text-xs text-slate-500 font-mono">Loading client user registry...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <Users size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Total Accounts</span>
            <span className="text-xl font-bold text-white mt-1 block">{workspaces.length}</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <Key size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Active Licenses</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {workspaces.filter(ws => (ws.query_count || 0) < (ws.max_queries || 500)).length}
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono font-bold block">Total Telemetry Queries</span>
            <span className="text-xl font-bold text-white mt-1 block">
              {workspaces.reduce((acc, curr) => acc + (curr.query_count || 0), 0)}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono rounded-xl flex items-center space-x-2">
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Registry Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Client Registry Ledger</h3>
          <button 
            onClick={fetchWorkspaces}
            className="flex items-center space-x-2 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-400 hover:text-white transition-all cursor-pointer font-mono"
          >
            <RefreshCw size={12} />
            <span>Refresh</span>
          </button>
        </div>

        <div className="border border-slate-850 bg-slate-950 rounded-2xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs font-mono">
            <thead>
              <tr className="bg-slate-900 border-b border-slate-850 text-slate-400 uppercase tracking-wider text-[10px]">
                <th className="p-4 font-bold">User Email</th>
                <th className="p-4 font-bold">License Key (Team ID)</th>
                <th className="p-4 font-bold">Plan Tier</th>
                <th className="p-4 font-bold">Usage / Limit</th>
                <th className="p-4 font-bold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {workspaces.length > 0 ? (
                workspaces.map(ws => (
                  <tr key={ws.team_id} className="border-b border-slate-850 hover:bg-slate-900/30">
                    <td className="p-4 text-slate-200 font-semibold select-all max-w-[200px] truncate" title={ws.email}>
                      {ws.email}
                    </td>
                    <td className="p-4 text-slate-400 select-all font-mono">
                      {ws.team_id}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {editingId === ws.team_id ? (
                        <select 
                          value={editTier}
                          onChange={(e) => setEditTier(e.target.value)}
                          className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white"
                        >
                          <option value="free">free</option>
                          <option value="startup">startup</option>
                          <option value="scale">scale</option>
                          <option value="enterprise">enterprise</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase border ${
                          ws.tier === 'free' 
                            ? 'bg-slate-950 border-slate-800 text-slate-500' 
                            : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        }`}>
                          {ws.tier || 'free'}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {editingId === ws.team_id ? (
                        <div className="flex items-center space-x-2">
                          <input 
                            type="number" 
                            value={editQueryCount}
                            onChange={(e) => setEditQueryCount(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-20 text-center"
                            placeholder="Usage"
                          />
                          <span className="text-slate-600">/</span>
                          <input 
                            type="number" 
                            value={editMaxQueries}
                            onChange={(e) => setEditMaxQueries(Number(e.target.value))}
                            className="bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs text-white w-20 text-center"
                            placeholder="Limit"
                          />
                        </div>
                      ) : (
                        <span className="text-slate-350 font-bold">
                          {ws.query_count || 0} / {ws.max_queries || 500}
                        </span>
                      )}
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      {editingId === ws.team_id ? (
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleUpdate(ws.team_id)}
                            disabled={saveLoading}
                            className="p-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded cursor-pointer"
                            title="Save Changes"
                          >
                            <Save size={12} />
                          </button>
                          <button 
                            onClick={cancelEdit}
                            className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded cursor-pointer"
                            title="Cancel"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => startEdit(ws)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded cursor-pointer flex items-center space-x-1"
                        >
                          <Edit2 size={12} />
                          <span className="text-[10px]">Edit</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500 italic">
                    No workspaces or licenses found in database.
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

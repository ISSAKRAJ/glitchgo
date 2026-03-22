import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Lock, Users, Briefcase, Calendar, ChevronLeft, LogOut, AlertCircle, Paperclip } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function Dashboard() {
  const [accessCode, setAccessCode] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [role, setRole] = useState(null); // 'admin' or 'employee'
  const [employeeCode, setEmployeeCode] = useState('');
  
  const [leads, setLeads] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);

  // Handle Login
  const handleLogin = (e) => {
    e.preventDefault();
    if (!accessCode.trim()) return;

    const masterPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'glitchgo_admin';
    
    if (accessCode === masterPassword) {
      setRole('admin');
    } else {
      setRole('employee');
      setEmployeeCode(accessCode.trim().toUpperCase());
    }
    
    setIsLoggedIn(true);
  };

  // Fetch Data
  useEffect(() => {
    if (!isLoggedIn) return;

    const fetchLeads = async () => {
      setIsLoading(true);
      setError('');
      try {
        let query = supabase
          .from('client_requests')
          .select('*')
          .order('created_at', { ascending: false });

        // If employee, only fetch leads that match their code
        if (role === 'employee') {
          query = query.eq('referral_code', employeeCode);
        }

        const { data, error } = await query;
        if (error) throw error;
        
        setLeads(data || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load leads. Check your database connection.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [isLoggedIn, role, employeeCode]);

  // Mark as Delivered
  const handleMarkDelivered = async (id, currentStatus) => {
    if (currentStatus === 'delivered') return; // Cannot undo
    try {
      const { error } = await supabase
        .from('client_requests')
        .update({ status: 'delivered' })
        .eq('id', id);
        
      if (error) throw error;
      
      setLeads(leads.map(lead => lead.id === id ? { ...lead, status: 'delivered' } : lead));
      setConfirmingId(null);
    } catch (err) {
      console.error(err);
      setError('Failed to update status. Did you run the SQL command to add the "status" column?');
    }
  };

  // Logout
  const handleLogout = () => {
    setIsLoggedIn(false);
    setAccessCode('');
    setRole(null);
    setEmployeeCode('');
  };

  // Render Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-dark-bg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass max-w-md w-full p-8 rounded-3xl text-center border border-white/10"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-dark-surface border border-white/10 flex items-center justify-center">
              <Lock className="text-brand-blue" size={28} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Access Portal</h2>
          <p className="text-gray-400 text-sm mb-8">Enter the master admin password or your employee referral code to view leads.</p>
          
          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <Input 
                type="password"
                placeholder="Enter Access Code..."
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full">
              Login securely
            </Button>
            <Button type="button" variant="secondary" className="w-full" onClick={() => window.location.href='/'}>
              <ChevronLeft size={16} className="mr-2" /> Back to Home
            </Button>
          </form>
        </motion.div>
      </div>
    );
  }

  // Render Dashboard
  return (
    <div className="min-h-screen bg-dark-bg">
      {/* Topbar */}
      <header className="border-b border-white/10 bg-dark-surface py-4 px-6 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 cursor-pointer group" onClick={() => window.location.href='/'}>
            <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[2px] rounded-xl shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all duration-300">
              <div className="bg-dark-bg px-3 py-1 rounded-[10px] flex items-center gap-0.5">
                <span className="font-extrabold text-xl text-white tracking-tighter">Glitch</span>
                <span className="font-extrabold text-xl text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
              </div>
            </div>
            <span className="text-gray-500 font-medium">| {role === 'admin' ? 'Admin' : 'Employee'}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-400">
              {role === 'employee' ? `Code: ${employeeCode}` : 'All Access'}
            </span>
            <button onClick={handleLogout} className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm bg-white/5 py-2 px-4 rounded-lg">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Client Leads</h1>
            <p className="text-gray-400">
              {role === 'admin' 
                ? "Showing all leads referred by everyone across the entire platform."
                : `Showing leads specifically referred by ${employeeCode}.`
              }
            </p>
          </div>
          
          <div className="glass px-6 py-4 rounded-xl flex flex-col items-center">
            <span className="text-3xl font-bold text-brand-blue">{leads.length}</span>
            <span className="text-xs text-gray-400 uppercase tracking-widest font-semibold mt-1">Total Leads</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded-xl mb-6 flex items-center gap-2">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        <div className="glass rounded-2xl overflow-hidden border border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-white/5 text-gray-400 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><Calendar size={16} /> Date</div></th>
                  <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><Users size={16} /> Client</div></th>
                  <th className="px-6 py-4 font-medium min-w-[200px]">Problem</th>
                  <th className="px-6 py-4 font-medium"><div className="flex items-center gap-2"><Briefcase size={16} /> Details</div></th>
                  {role === 'admin' && <th className="px-6 py-4 font-medium text-brand-orange">Referral</th>}
                  <th className="px-6 py-4 font-medium text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {isLoading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">Loading leads...</td>
                  </tr>
                ) : leads.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Users size={24} className="text-gray-400" />
                      </div>
                      <p className="text-lg">No leads found.</p>
                      <p className="text-sm">When clients submit the form, they'll appear here.</p>
                    </td>
                  </tr>
                ) : (
                  leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="px-6 py-4">
                        {new Date(lead.created_at).toLocaleDateString()}
                        <div className="text-xs text-gray-500">{new Date(lead.created_at).toLocaleTimeString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{lead.name}</div>
                        <div className="text-xs text-brand-blue">{lead.contact}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-normal">
                        <p className="line-clamp-2 text-sm">{lead.problem}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full border mb-1 ${
                          lead.deadline === 'urgent' ? 'border-red-500/30 text-red-400 bg-red-500/10' : 'border-white/10 text-gray-400 bg-white/5'
                        }`}>
                          {lead.deadline}
                        </span>
                        {lead.budget && <div className="text-xs text-gray-400 mt-1">Budget: {lead.budget}</div>}
                        {lead.file_url && (
                          <div className="mt-2">
                            <a href={lead.file_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-brand-blue hover:text-blue-400 transition-colors bg-brand-blue/10 hover:bg-brand-blue/20 px-2.5 py-1.5 rounded-md font-medium border border-brand-blue/20 shadow-sm">
                              <Paperclip size={12} /> View Attachment
                            </a>
                          </div>
                        )}
                      </td>
                      {role === 'admin' && (
                        <td className="px-6 py-4 font-mono text-brand-orange text-xs">
                          {lead.referral_code || '---'}
                        </td>
                      )}
                      <td className="px-6 py-4 text-right">
                        {lead.status === 'delivered' ? (
                          <div className="inline-flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/30 cursor-default opacity-80">
                            <div className="w-2 h-2 rounded-full bg-emerald-400" />
                            Delivered
                          </div>
                        ) : confirmingId === lead.id ? (
                          <div className="flex items-center justify-end gap-2 animate-in fade-in zoom-in duration-200">
                            <span className="text-xs text-gray-400 mr-1">Sure?</span>
                            <button
                              onClick={() => setConfirmingId(null)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/5 text-gray-300 border-white/20 hover:bg-white/10 transition-colors"
                            >
                              No
                            </button>
                            <button
                              onClick={() => handleMarkDelivered(lead.id, lead.status)}
                              className="px-3 py-1.5 rounded-full text-xs font-semibold border bg-brand-orange/20 text-brand-orange border-brand-orange/50 hover:bg-brand-orange hover:text-white transition-all shadow-[0_0_10px_rgba(249,115,22,0.3)]"
                            >
                              Yes, Deliver
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setConfirmingId(lead.id)}
                            className="inline-flex items-center justify-end gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-white/5 text-gray-300 border-white/20 hover:border-brand-blue/50 hover:bg-brand-blue/10 hover:text-white cursor-pointer transition-all"
                          >
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            Mark Delivered
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

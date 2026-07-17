"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, Search, Loader2, CheckCircle2, ChevronRight, FileText, Download, 
  CreditCard, ShieldCheck, AlertCircle, Upload, ArrowRight, Zap, QrCode
} from 'lucide-react';
import Card from '../ui/Card';

const STEPS = [
  { id: 'Received', label: 'Received', icon: Clock },
  { id: 'Estimating', label: 'Estimating', icon: Search },
  { id: 'In Progress', label: 'Coding Fix', icon: Loader2 },
  { id: 'Completed', label: 'Delivered', icon: CheckCircle2 },
];

export default function DashboardTab({ user, supabase }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Checkout & Pay state
  const [activeCheckoutTicket, setActiveCheckoutTicket] = useState(null);
  const [uploadMode, setUploadMode] = useState("scan"); // "scan" | "manual"
  const [file, setFile] = useState(null);
  const [manualUtr, setManualUtr] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [payError, setPayError] = useState("");
  const [paySuccess, setPaySuccess] = useState("");

  const fetchTickets = useCallback(async () => {
    if (!user?.email) return;
    setLoading(true);
    setError('');
    try {
      const { data, error: fetchErr } = await supabase
        .from('client_requests')
        .select('*')
        .eq('contact', user.email.trim())
        .order('created_at', { ascending: false });

      if (fetchErr) throw fetchErr;
      setTickets(data || []);
    } catch (err) {
      console.error('Error fetching client tickets:', err);
      setError('Failed to fetch your service tickets. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 3 * 1024 * 1024) {
        setPayError("File size exceeds 3MB limit.");
        return;
      }
      setFile(selectedFile);
      setPayError("");
    }
  };

  const handleVerifyPayment = async (e, ticketId) => {
    e.preventDefault();
    setPayError("");
    setPaySuccess("");
    setSubmitting(true);

    try {
      const payload = { ticket_id: ticketId };

      if (uploadMode === "manual") {
        if (!manualUtr.trim() || manualUtr.trim().length !== 12 || isNaN(Number(manualUtr))) {
          throw new Error("UTR must be a 12-digit number.");
        }
        payload.manual_utr = manualUtr.trim();
      } else {
        if (!file) {
          throw new Error("Please upload your payment receipt screenshot first.");
        }

        const base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(file);
          reader.onload = () => {
            const base64String = reader.result.toString().replace("data:", "").replace(/^.+,/, "");
            resolve(base64String);
          };
          reader.onerror = (error) => reject(error);
        });

        payload.image = base64Data;
        payload.mime_type = file.type;
      }

      const res = await fetch("/api/adminzero/services/verify-upi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Verification failed.");
      }

      setPaySuccess(data.message || "Payment verified successfully!");
      setFile(null);
      setManualUtr("");
      
      // Close checkout modal/drawer after brief delay and refresh
      setTimeout(() => {
        setActiveCheckoutTicket(null);
        setPaySuccess("");
        fetchTickets();
      }, 1500);

    } catch (err) {
      setPayError(err.message || "Verification failed. Check your UTR/Receipt image.");
    } finally {
      setSubmitting(false);
    }
  };

  const getStepIndex = (status) => {
    const s = status ? status.toLowerCase() : 'received';
    if (s.includes('complet') || s.includes('deliver')) return 3;
    if (s.includes('progress')) return 2;
    if (s.includes('estimat')) return 1;
    return 0;
  };

  return (
    <div className="space-y-10">
      
      {/* Overview stats header */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="bg-white/[0.01] border-white/5 p-6 text-left">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Total Tickets</span>
          <h4 className="text-3xl font-mono font-black mt-2 text-white">{loading ? '...' : tickets.length}</h4>
        </Card>
        <Card className="bg-white/[0.01] border-white/5 p-6 text-left">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Active Rescues</span>
          <h4 className="text-3xl font-mono font-black mt-2 text-brand-orange">
            {loading ? '...' : tickets.filter(t => t.status !== 'Completed').length}
          </h4>
        </Card>
        <Card className="bg-white/[0.01] border-white/5 p-6 text-left">
          <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">Completed Fixes</span>
          <h4 className="text-3xl font-mono font-black mt-2 text-emerald-400">
            {loading ? '...' : tickets.filter(t => t.status === 'Completed').length}
          </h4>
        </Card>
      </div>

      {/* Ticket List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold font-outfit text-white">Your Service Requests</h2>
          <button 
            onClick={fetchTickets}
            className="text-xs text-gray-400 hover:text-white flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 transition-colors cursor-pointer"
          >
            <RefreshIcon className="w-3.5 h-3.5" /> Refresh List
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl text-sm font-medium">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-brand-blue" size={32} />
            <p className="text-gray-500 text-sm">Fetching service tickets...</p>
          </div>
        ) : tickets.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-white/10 bg-transparent flex flex-col items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 text-gray-400">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-white mb-1">No requests found</h3>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              You haven't ordered any bug-fix patches or retainer services yet.
            </p>
            <button 
              onClick={() => {
                // Dispatch click/change event or rely on parent tab toggle
                window.dispatchEvent(new CustomEvent('change-portal-tab', { detail: 'order' }));
              }}
              className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
            >
              Order Your First Service
            </button>
          </Card>
        ) : (
          <div className="space-y-6">
            {tickets.map(ticket => {
              const stepIndex = getStepIndex(ticket.status);
              const isPaid = ticket.status === 'Paid' || ticket.status === 'Completed' || !!ticket.delivery_link;
              const hasQuote = !!ticket.quoted_price;

              return (
                <div key={ticket.id} className="glass border border-white/5 rounded-3xl p-6 md:p-8 relative overflow-hidden transition-all hover:bg-dark-surface/40">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-4 mb-8">
                    <div>
                      <div className="text-[10px] text-brand-orange font-mono uppercase tracking-widest mb-1.5">
                        Ref Reference: #{ticket.id.slice(0, 8)}
                      </div>
                      <h3 className="text-xl font-bold text-white tracking-tight leading-snug">{ticket.problem}</h3>
                      <p className="text-xs text-gray-500 mt-1">Submitted on {new Date(ticket.created_at).toLocaleDateString()}</p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                        isPaid 
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                          : "bg-brand-orange/10 border-brand-orange/20 text-brand-orange"
                      }`}>
                        {isPaid ? "✅ Paid / Active" : `📥 ${ticket.status || 'Received'}`}
                      </span>
                    </div>
                  </div>

                  {/* Horizontal visual progress tracker */}
                  <div className="relative mb-8 max-w-2xl">
                    <div className="absolute top-4 left-[8%] right-[8%] h-[2px] bg-white/5 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-brand-blue to-brand-orange transition-all duration-550"
                        style={{ width: `${(stepIndex / 3) * 100}%` }}
                      />
                    </div>
                    <div className="relative flex justify-between z-10">
                      {STEPS.map((step, idx) => {
                        const done = idx <= stepIndex;
                        const curr = idx === stepIndex;
                        const StepIcon = step.icon;
                        return (
                          <div key={step.id} className="flex flex-col items-center gap-2 w-1/4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center border transition-all duration-300 ${
                              done 
                                ? 'bg-dark-card border-brand-orange text-brand-orange shadow-[0_0_10px_rgba(249,115,22,0.2)]' 
                                : 'bg-dark-bg border-white/5 text-gray-600'
                            }`}>
                              {curr && idx !== 3 ? <Loader2 size={12} className="animate-spin" /> : <StepIcon size={12} />}
                            </div>
                            <span className={`text-[10px] font-semibold ${done ? 'text-white' : 'text-gray-600'}`}>
                              {step.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions & Context Footer */}
                  <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    {/* Price Quote Panel */}
                    <div className="text-left w-full md:w-auto">
                      {hasQuote ? (
                        <div className="flex items-center gap-3">
                          <div>
                            <span className="text-[10px] uppercase text-gray-500 font-bold block">Quoted Estimate</span>
                            <span className="text-lg font-black text-emerald-400 font-mono">{ticket.quoted_price}</span>
                          </div>
                          {isPaid && (
                            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider block h-fit mt-3">
                              Payment Settled
                            </span>
                          )}
                        </div>
                      ) : (
                        <div>
                          <span className="text-[10px] uppercase text-gray-500 font-bold block">Price Estimation</span>
                          <span className="text-xs text-gray-400 italic block mt-0.5">Engineers reviewing complexity...</span>
                        </div>
                      )}
                    </div>

                    {/* Conditional Action Buttons */}
                    <div className="w-full md:w-auto flex justify-end">
                      {ticket.delivery_link ? (
                        /* Case 1: Completed Delivery Available */
                        <div className="w-full flex flex-col items-end gap-2">
                          <a 
                            href={ticket.delivery_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-brand-blue hover:bg-blue-600 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(59,130,246,0.2)] transition-all text-xs w-full sm:w-auto"
                          >
                            <Download size={14} /> Download Final Code Assets
                          </a>
                          <span className="text-[9px] text-red-400 font-mono text-right mt-1 block">
                            ⚠️ Deletes automatically from our servers in 7 days. Download now.
                          </span>
                        </div>
                      ) : hasQuote && !isPaid ? (
                        /* Case 2: Quoted but Unpaid (Show Checkout Form Trigger) */
                        <button
                          onClick={() => {
                            setActiveCheckoutTicket(activeCheckoutTicket?.id === ticket.id ? null : ticket);
                            setPayError("");
                            setPaySuccess("");
                          }}
                          className="bg-brand-orange hover:bg-orange-500 text-white font-bold py-2.5 px-6 rounded-xl flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.2)] transition-all text-xs w-full sm:w-auto cursor-pointer"
                        >
                          <CreditCard size={14} /> 
                          {activeCheckoutTicket?.id === ticket.id ? "Close Payment Panel" : "Pay Securely via UPI"}
                        </button>
                      ) : (
                        /* Case 3: Waiting or coding */
                        <div className="text-xs text-gray-500 italic px-4 py-2 border border-white/5 rounded-xl bg-white/[0.01]">
                          {isPaid ? "🚀 Coding patch updates in sandbox..." : "🕒 Awaiting price review approval..."}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expandable Payment Portal Drawer */}
                  <AnimatePresence>
                    {activeCheckoutTicket?.id === ticket.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden mt-6 border-t border-white/5 pt-6"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                          {/* Scan QR Column */}
                          <div className="md:col-span-3 bg-dark-bg/60 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-2">1. Scan UPI QR Code</h4>
                            <img 
                              src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                                `upi://pay?pa=7013017818@naviaxis&pn=GlitchGo&am=${parseFloat(ticket.quoted_price.replace(/[^0-9.]/g, ''))}&tn=Ticket_${ticket.id.slice(0,8)}&cu=INR`
                              )}`}
                              alt="UPI QR Code" 
                              className="w-40 h-40 bg-white p-2 rounded-xl object-contain mb-3.5 shadow-md"
                            />
                            <div className="text-center">
                              <span className="text-[10px] text-gray-500 block">UPI ID: 7013017818@naviaxis</span>
                              <span className="text-xs font-bold text-brand-blue block mt-1">Amount Due: {ticket.quoted_price}</span>
                            </div>
                          </div>

                          {/* Submit Proof Column */}
                          <div className="md:col-span-2 flex flex-col justify-between">
                            <div>
                              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3">2. Submit Verification</h4>
                              
                              {/* Toggle verification method */}
                              <div className="grid grid-cols-2 bg-dark-bg p-1 rounded-lg border border-white/5 mb-4 text-[10px]">
                                <button 
                                  onClick={() => { setUploadMode("scan"); setPayError(""); }}
                                  className={`py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    uploadMode === "scan" ? "bg-brand-blue text-white" : "text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  AI Scan Receipt
                                </button>
                                <button 
                                  onClick={() => { setUploadMode("manual"); setPayError(""); }}
                                  className={`py-1.5 rounded-md font-bold transition-colors cursor-pointer ${
                                    uploadMode === "manual" ? "bg-brand-blue text-white" : "text-gray-500 hover:text-gray-300"
                                  }`}
                                >
                                  Manual UTR
                                </button>
                              </div>

                              <form onSubmit={(e) => handleVerifyPayment(e, ticket.id)} className="space-y-3">
                                {payError && (
                                  <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-3 py-2 rounded-lg text-[10px] flex items-center gap-1 leading-normal">
                                    <AlertCircle size={12} className="shrink-0" />
                                    <span>{payError}</span>
                                  </div>
                                )}
                                {paySuccess && (
                                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-2 rounded-lg text-[10px] flex items-center gap-1 font-semibold">
                                    <CheckCircle2 size={12} className="shrink-0" />
                                    <span>{paySuccess}</span>
                                  </div>
                                )}

                                {uploadMode === "scan" ? (
                                  <div className="space-y-1.5">
                                    <div className="border border-white/5 hover:border-brand-blue/30 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors relative">
                                      <input 
                                        type="file" 
                                        accept="image/*"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileChange}
                                        disabled={submitting}
                                      />
                                      <Upload size={16} className="text-gray-500 mx-auto mb-1.5" />
                                      <span className="text-[10px] text-gray-400 block truncate font-medium">
                                        {file ? file.name : "Choose Receipt Screenshot"}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="space-y-1">
                                    <input 
                                      type="text"
                                      maxLength={12}
                                      placeholder="12-Digit Reference No (UTR)"
                                      className="w-full bg-dark-surface border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-brand-blue font-mono text-center tracking-widest"
                                      value={manualUtr}
                                      onChange={(e) => setManualUtr(e.target.value.replace(/[^0-9]/g, ""))}
                                      disabled={submitting}
                                    />
                                  </div>
                                )}

                                <button 
                                  type="submit"
                                  disabled={submitting}
                                  className="w-full bg-brand-orange hover:bg-orange-500 text-white font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-mono tracking-wider cursor-pointer"
                                >
                                  {submitting ? (
                                    <>
                                      <Loader2 className="animate-spin" size={12} />
                                      <span>AUDITING PROOF...</span>
                                    </>
                                  ) : (
                                    <>
                                      <span>VERIFY PAYMENT</span>
                                      <ArrowRight size={12} />
                                    </>
                                  )}
                                </button>
                              </form>
                            </div>

                            <div className="border-t border-white/5 pt-3 mt-4 text-[9px] text-gray-500 flex items-center gap-1 font-mono">
                              <ShieldCheck size={12} className="text-brand-blue" />
                              <span>Verified instantly by Gemini Vision receipt auditor.</span>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

// Simple internal helper SVG icon component
function RefreshIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, CheckCircle2, Circle, Clock, Loader2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const STEPS = [
  { id: 'Received', label: 'Ticket Received', icon: Clock },
  { id: 'Estimating', label: 'Estimating Cost/Time', icon: Search },
  { id: 'In Progress', label: 'Engineers Working', icon: Loader2 },
  { id: 'Completed', label: 'Ready for You', icon: CheckCircle2 },
];

export default function Status() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [tickets, setTickets] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const { data, error } = await supabase
        .from('client_requests')
        .select('*')
        .eq('contact', email.trim())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      if (data.length === 0) {
        setError("We couldn't find any tickets associated with that email or phone number.");
        setTickets(null);
      } else {
        setTickets(data);
      }
    } catch (err) {
      setError('Database connection error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStepIndex = (status) => {
    const s = status ? status.toLowerCase() : 'received';
    if (s.includes('complet') || s.includes('deliver')) return 3;
    if (s.includes('progress')) return 2;
    if (s.includes('estimat')) return 1;
    return 0; // default received
  };

  return (
    <div className="min-h-screen pt-24 px-6 relative">
      <div className="max-w-3xl mx-auto">
        <button onClick={() => window.location.href='/'} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Track Your Ticket</h1>
          <p className="text-gray-400">Enter your email or phone number below to check the live status of your GlitchGo service request.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 rounded-3xl border border-white/5"
        >
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input 
                placeholder="john@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <Button type="submit" isLoading={loading} className="whitespace-nowrap">
              Check Status
            </Button>
          </form>

          {error && (
            <div className="mt-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
              {error}
            </div>
          )}
        </motion.div>

        <AnimatePresence>
          {tickets && tickets.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-12 space-y-8"
            >
              <h2 className="text-2xl font-bold border-b border-white/10 pb-4">Your Recent Requests</h2>
              {tickets.map((ticket) => {
                const currentIndex = getStepIndex(ticket.status);
                
                return (
                  <div key={ticket.id} className="glass p-6 md:p-8 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="text-xs text-brand-orange font-mono mb-1">{new Date(ticket.created_at).toLocaleDateString()}</div>
                        <h3 className="font-bold text-xl line-clamp-1">{ticket.problem}</h3>
                      </div>
                      <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-semibold uppercase tracking-wider text-gray-400">
                        {STEPS[currentIndex].id}
                      </span>
                    </div>

                    {/* Timeline Tracker */}
                    <div className="relative">
                      {/* Progress Bar Background */}
                      <div className="absolute top-5 left-[10%] right-[10%] h-1 bg-dark-bg rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
                          transition={{ duration: 1, delay: 0.2 }}
                          className="absolute top-0 left-0 bottom-0 bg-gradient-to-r from-brand-blue to-brand-orange"
                        />
                      </div>

                      <div className="relative flex justify-between z-10">
                        {STEPS.map((step, idx) => {
                          const isCompleted = idx <= currentIndex;
                          const isCurrent = idx === currentIndex;
                          const StepIcon = step.icon;
                          
                          return (
                            <div key={step.id} className="flex flex-col items-center gap-3 w-1/4">
                              <div 
                                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-500 ${
                                  isCompleted 
                                    ? 'bg-dark-card border-brand-orange text-brand-orange shadow-[0_0_15px_rgba(249,115,22,0.3)]' 
                                    : 'bg-dark-bg border-white/10 text-gray-500'
                                }`}
                              >
                                {isCompleted && !isCurrent ? <CheckCircle2 size={18} /> : 
                                 isCurrent && idx !== 3 ? <Loader2 size={18} className="animate-spin" /> : 
                                 <StepIcon size={18} />}
                              </div>
                              <span className={`text-xs font-medium text-center ${isCompleted ? 'text-white' : 'text-gray-500'}`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Payment Stripe Checkout Button */}
                    {(ticket.payment_link || ticket.quoted_price) && (
                      <div className="mt-8 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 bg-emerald-500/5 -mx-6 md:-mx-8 px-6 md:px-8 pb-6 md:pb-8 rounded-b-3xl -mb-6 md:-mb-8">
                        <div>
                          <h4 className="font-bold text-white mb-1 flex items-center gap-2">
                            Invoice Ready
                          </h4>
                          <p className="text-sm text-gray-400 mb-3">Your project is ready to begin. Secure checkout via Stripe.</p>
                          {ticket.quoted_price && (
                            <div className="inline-block px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-md">
                              <span className="text-emerald-400 font-bold tracking-wide">Amount Due: {ticket.quoted_price}</span>
                            </div>
                          )}
                        </div>
                        {ticket.payment_link ? (
                          <a 
                            href={ticket.payment_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all whitespace-nowrap"
                          >
                            💳 Pay Securely
                          </a>
                        ) : (
                          <div className="px-4 py-2 border border-white/10 rounded-lg text-gray-500 text-sm italic">
                            Awaiting Payment Link...
                          </div>
                        )}
                      </div>
                    )}

                    {/* Delivery Link Handoff */}
                    {ticket.delivery_link && (
                      <div className="mt-8 pt-8 border-t border-brand-blue/20 flex flex-col items-center text-center gap-4 bg-brand-blue/5 -mx-6 md:-mx-8 px-6 md:px-8 pb-6 md:pb-8 rounded-b-3xl -mb-6 md:-mb-8">
                        <div className="flex flex-col items-center">
                          <h4 className="font-bold text-white text-xl mb-2 flex items-center gap-2">
                            📦 Project Delivery Ready
                          </h4>
                          <p className="text-sm text-gray-400 mb-6 max-w-md">
                            Your final files are ready. Please download them immediately to secure your assets.
                          </p>
                          <a 
                            href={ticket.delivery_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-brand-blue hover:bg-blue-500 text-white font-bold py-3 px-8 rounded-xl flex items-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] hover:shadow-[0_0_30px_rgba(59,130,246,0.5)] transition-all whitespace-nowrap mb-6"
                          >
                            Download Final Project
                          </a>
                          
                          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 max-w-lg">
                            <p className="text-xs text-red-400/90 leading-relaxed font-mono">
                              <strong>⚠️ SECURITY NOTICE:</strong> For your privacy and liability protection, GlitchGo does not permanently store client source code. These files will be permanently deleted from our temporary servers in 7 days. Ensure local backups are created immediately upon download.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

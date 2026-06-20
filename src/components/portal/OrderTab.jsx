"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Paperclip, Send } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';

export default function OrderTab({ user, supabase, onOrderSuccess }) {
  const [formData, setFormData] = useState({
    name: user?.user_metadata?.full_name || '',
    contact: user?.email || '',
    problem: '',
    deadline: 'urgent',
    budget: '',
    referralCode: '',
    botcheck: ''
  });

  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading_file, submitting, success, error
  const [serverError, setServerError] = useState('');

  // Prefill user details if auth state updates
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name || '',
        contact: user.email || prev.contact || ''
      }));
    }
  }, [user]);

  // Listen to select-service custom event (if a service card was clicked on the landing page)
  useEffect(() => {
    const handleSelectService = (e) => {
      const { title, price, billingCycle } = e.detail;
      const isMonthly = billingCycle === 'monthly';
      setFormData(prev => ({
        ...prev,
        problem: isMonthly
          ? `I would like to subscribe to the "${title}" (${price} Monthly Retainer).\n\nHere are our company & project details: `
          : `I would like to book the "${title}" service.\n\nHere are my project details: `,
        budget: price
      }));
    };
    window.addEventListener('select-service', handleSelectService);
    return () => window.removeEventListener('select-service', handleSelectService);
  }, []);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Please enter your full name';
    }
    if (!formData.problem.trim() || formData.problem.trim().length < 20) {
      newErrors.problem = 'Please provide more details (at least 20 characters)';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    
    // Honeypot spam check
    if (formData.botcheck) {
      setStatus('success');
      setTimeout(() => {
        if (onOrderSuccess) onOrderSuccess();
      }, 2000);
      return;
    }

    setStatus('submitting');

    try {
      let fileUrl = null;
      if (file) {
        setStatus('uploading_file');
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${formData.name.replace(/[^a-zA-Z0-9]/g, '')}_${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('client_files')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error("File Upload Failed. Please verify public 'client_files' bucket is created in Supabase.");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('client_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      setStatus('submitting');

      // Insert request ticket into client_requests
      const { error: insertErr } = await supabase
        .from('client_requests')
        .insert([
          { 
            name: formData.name, 
            contact: formData.contact, 
            problem: formData.problem, 
            deadline: formData.deadline, 
            budget: formData.budget,
            referral_code: formData.referralCode.trim().toUpperCase(),
            file_url: fileUrl
          }
        ]);

      if (insertErr) throw insertErr;

      // Send email alert via Web3Forms
      const web3FormsKey = process.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (web3FormsKey && web3FormsKey !== 'YOUR_WEB3FORMS_KEY_HERE') {
        try {
          await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify({
              access_key: web3FormsKey,
              subject: `New Portal Lead: ${formData.name} - GlitchGo`,
              from_name: "GlitchGo Portal",
              name: formData.name,
              email: formData.contact,
              message: `Problem: ${formData.problem}\nDeadline: ${formData.deadline}\nBudget: ${formData.budget || 'N/A'}\nReferral Code: ${formData.referralCode || 'None'}`
            })
          });
        } catch (fetchErr) {
          console.error("Failed to submit Web3Forms alert:", fetchErr);
        }
      }

      setStatus('success');
      setFormData(prev => ({ ...prev, problem: '', budget: '', referralCode: '' }));
      setFile(null);
      
      // Auto switch back to dashboard tab after 2 seconds
      setTimeout(() => {
        setStatus('idle');
        if (onOrderSuccess) onOrderSuccess();
      }, 2000);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setServerError(err.message || 'Failed to submit request. Please try again.');
    }
  };

  return (
    <div className="max-w-3xl mx-auto relative">
      <div className="text-left mb-8">
        <h2 className="text-2xl font-bold text-white font-outfit">Book a New Service</h2>
        <p className="text-sm text-gray-400 mt-1">Submit your bug fix, rescue project, or retainer subscription details below.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-3xl p-6 md:p-10 relative overflow-hidden border border-white/5"
      >
        <AnimatePresence>
          {status === 'success' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-dark-card/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
            >
              <CheckCircle2 size={56} className="text-emerald-500 mb-4 animate-bounce" />
              <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
              <p className="text-gray-300 text-sm max-w-sm">We've added your request ticket and notified our engineers. Redirecting to your dashboard...</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="space-y-6 text-left">
          {/* Honeypot spam bot check */}
          <input 
            type="checkbox" 
            name="botcheck" 
            className="hidden" 
            style={{ display: 'none' }}
            checked={!!formData.botcheck}
            onChange={(e) => setFormData({...formData, botcheck: e.target.checked})}
          />

          {status === 'error' && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-4 rounded-xl text-xs font-semibold">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Your Name *</label>
              <Input 
                placeholder="John Doe" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                error={errors.name}
                disabled={status === 'submitting'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Registered Email Address</label>
              <Input 
                value={formData.contact}
                error={errors.contact}
                readOnly
                className="bg-dark-bg/50 border-white/5 opacity-80 cursor-not-allowed select-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Describe the Problem or Scope *</label>
            <Textarea 
              placeholder="Provide a detailed description of the error, bug environment, or retainer project features..." 
              value={formData.problem}
              onChange={(e) => setFormData({...formData, problem: e.target.value})}
              error={errors.problem}
              disabled={status === 'submitting'}
              className="h-36"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Requested Urgency *</label>
              <select 
                className="w-full bg-dark-surface border border-white/10 rounded-lg px-4 py-3 text-xs text-white focus:outline-none focus:border-brand-blue cursor-pointer"
                value={formData.deadline}
                onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                disabled={status === 'submitting'}
              >
                <option value="urgent">🔥 Urgent (ASAP)</option>
                <option value="24h">⏱️ Within 24 Hours</option>
                <option value="2-3days">📅 2–3 Days</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Target Budget (Optional)</label>
              <Input 
                placeholder="e.g. ₹999, ₹19,999/mo" 
                type="text"
                value={formData.budget}
                onChange={(e) => setFormData({...formData, budget: e.target.value})}
                disabled={status === 'submitting'}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Referral Code</label>
              <Input 
                placeholder="e.g. AGENT2026" 
                type="text"
                value={formData.referralCode}
                onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                disabled={status === 'submitting'}
              />
            </div>
          </div>

          {/* Attachment upload */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 border-dashed hover:border-brand-blue/50 transition-colors">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0 text-brand-blue">
                <Paperclip size={18} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-white">Attach project assets or screenshots (Optional)</p>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {file ? file.name : "Select an image, screenshot, or PDF under 2MB."}
                </p>
              </div>
              <input 
                type="file" 
                className="hidden" 
                accept="image/*,.pdf,.doc,.docx"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  if (selectedFile && selectedFile.size > 2 * 1024 * 1024) {
                    setServerError("File is too large! Please upload a file under 2MB.");
                    setTimeout(() => setServerError(''), 4000);
                    return;
                  }
                  if (selectedFile) setFile(selectedFile);
                }}
                disabled={status === 'submitting'}
              />
            </label>
            {file && (
              <div className="mt-3 flex justify-between items-center text-[10px] bg-dark-bg p-2 rounded-lg border border-white/5 font-mono">
                <span className="text-brand-blue font-semibold truncate flex-1">{file.name}</span>
                <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 ml-2 font-bold uppercase tracking-wider">Remove</button>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              size="lg" 
              className="w-full flex items-center justify-center gap-2" 
              isLoading={status === 'submitting' || status === 'uploading_file'}
            >
              <Send size={16} />
              <span>{status === 'uploading_file' ? 'Uploading Attachment...' : 'Submit Request Ticket'}</span>
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

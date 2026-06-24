import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Paperclip } from 'lucide-react';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Button from '../ui/Button';
import { supabase } from '../../lib/supabase';

export default function ClientForm() {
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    problem: '', // Will store notes/details
    deadline: 'enterprise_demo',
    budget: '', // Will store company size
    referralCode: '',
    botcheck: '' // Honeypot field for spam bots
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null); // File tracking state
  const [status, setStatus] = useState('idle'); // idle, uploading_file, submitting, success, error
  const [serverError, setServerError] = useState('');

  const [user, setUser] = useState(null);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || prev.name || '',
          contact: session.user.email || prev.contact || ''
        }));
      }
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setUser(session.user);
        setFormData(prev => ({
          ...prev,
          name: session.user.user_metadata?.full_name || prev.name || '',
          contact: session.user.email || prev.contact || ''
        }));
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handleSelectService = (e) => {
      const { title } = e.detail;
      setFormData(prev => ({
        ...prev,
        problem: `Interested in custom implementation for: "${title}".`
      }));
      setTimeout(() => {
        document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    };
    window.addEventListener('select-service', handleSelectService);
    return () => window.removeEventListener('select-service', handleSelectService);
  }, []);

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!formData.name.trim() || formData.name.length < 2) {
      newErrors.name = 'Please enter your full name';
    }
    if (!formData.contact.trim()) {
      newErrors.contact = 'Work email is required';
    } else if (!emailRegex.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid work email address';
    }
    if (!formData.budget) {
      newErrors.budget = 'Please select your company size';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    
    setStatus('submitting');
    
    // HONEYPOT: If a bot filled out the hidden field, silently reject them
    if (formData.botcheck) {
      console.log('Spam bot detected and blocked.');
      setStatus('success'); // Pretend it worked to trick the bot
      setTimeout(() => setStatus('idle'), 5000);
      return;
    }

    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
      if (supabaseUrl === 'YOUR_SUPABASE_URL_HERE' || !supabaseUrl) {
        throw new Error("Supabase is not configured! Please set up your environment variables.");
      }

      // Handle File Upload to Supabase Storage if attached
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
          throw new Error("File Upload Failed. Please check your Supabase Storage configurations.");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('client_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      setStatus('submitting');

      // Insert to Supabase (Mapping Company Size to budget, and formatting problem description)
      const formattedProblem = `Company Size: ${formData.budget}\nNotes: ${formData.problem || 'No extra notes provided.'}`;
      
      const { error } = await supabase
        .from('client_requests')
        .insert([
          { 
            name: formData.name, 
            contact: formData.contact, 
            problem: formattedProblem, 
            deadline: 'enterprise_demo', 
            budget: formData.budget,
            referral_code: formData.referralCode.trim().toUpperCase(),
            file_url: fileUrl
          }
        ]);

      if (error) throw error;

      // Send Email Notification via Web3Forms
      const web3FormsKey = process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY || process.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (web3FormsKey && web3FormsKey !== 'YOUR_WEB3FORMS_KEY_HERE') {
        const emailPayload = {
          access_key: web3FormsKey,
          subject: `New Enterprise Demo Lead: ${formData.name}`,
          from_name: "AdminZero Enterprise Intake",
          name: formData.name,
          email: formData.contact,
          message: `Company Size: ${formData.budget}\nNotes/Requirements: ${formData.problem || 'None'}\nReferral Code: ${formData.referralCode || 'None'}`
        };

        try {
          const res = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(emailPayload)
          });
          const resData = await res.json();
          if (!res.ok || !resData.success) {
            console.error("Web3Forms submission failed:", resData.message || "Unknown error");
          } else {
            console.log("Web3Forms email notification sent successfully.");
          }
        } catch (fetchErr) {
          console.error("Failed to connect to Web3Forms API:", fetchErr);
        }
      } else {
        console.warn("Web3Forms Access Key is missing or default. Email notification skipped.");
      }

      setStatus('success');

      setFormData({ name: '', contact: '', problem: '', deadline: 'enterprise_demo', budget: '', referralCode: '' });
      setFile(null);
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact-form" className="py-24 bg-dark-surface border-y border-white/5 relative">
      {/* Glow ambient background elements */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-brand-blue/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold uppercase tracking-widest text-brand-orange mb-4"
          >
            🛡️ Secure Solution Design
          </motion.div>
          <h2 className="text-3xl md:text-5xl font-black font-outfit tracking-tight mb-4 text-white">Request an Enterprise Demo</h2>
          <p className="text-gray-400 max-w-xl mx-auto text-base md:text-lg">Get in touch with our solutions engineering team for a customized implementation of the Smart Enterprise Hub.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 relative overflow-hidden border border-white/5 bg-dark-surface/40 backdrop-blur-md"
        >
          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-dark-card/95 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
              >
                <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                <p className="text-gray-300 max-w-md">Our enterprise solutions team will review your database architecture needs and get back to you within 24 hours.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot Field */}
            <input 
              type="checkbox" 
              name="botcheck" 
              className="hidden" 
              style={{ display: 'none' }}
              checked={!!formData.botcheck}
              onChange={(e) => setFormData({...formData, botcheck: e.target.checked})}
            />

            {status === 'error' && (
              <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg text-sm text-center">
                {serverError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Full Name *</label>
                <Input 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  error={errors.name}
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Work Email *</label>
                <Input 
                  placeholder="john@company.com" 
                  type="email"
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  error={errors.contact}
                  readOnly={!!user && !!user.email}
                  className={user ? 'bg-dark-bg/50 border-white/5 opacity-80 select-none cursor-not-allowed' : ''}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Company Size *</label>
                <select 
                  className={`w-full bg-dark-bg border rounded-xl px-4 py-3.5 text-white text-sm focus:outline-none focus:border-brand-blue/50 ${
                    errors.budget ? 'border-red-500' : 'border-white/10'
                  }`}
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                >
                  <option value="">Select Company Size...</option>
                  <option value="1-10">🚀 1 - 10 Employees</option>
                  <option value="11-50">⚡ 11 - 50 Employees</option>
                  <option value="51-250">🏢 51 - 250 Employees</option>
                  <option value="250+">👑 250+ Employees</option>
                </select>
                {errors.budget && (
                  <p className="mt-1 text-xs text-red-500">{errors.budget}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Referral Code (Optional)</label>
                <Input 
                  placeholder="e.g. PARTNER2026" 
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Requirements & Database Notes (Optional)</label>
              <Textarea 
                placeholder="Tell us about your tech stack, security compliance requirements, or custom integrations you need built..." 
                value={formData.problem}
                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                error={errors.problem}
              />
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 md:p-6 border-dashed hover:border-brand-blue/30 transition-colors">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-xl bg-brand-blue/10 border border-brand-blue/20 flex items-center justify-center flex-shrink-0 text-brand-blue">
                  <Paperclip size={18} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white mb-0.5">Attach Architecture Diagram or RFP (Optional)</p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {file ? file.name : "Upload architectural details, screenshots, or documents max 2MB."}
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
                      setErrors({...errors, file: 'Too large'});
                      setTimeout(() => setServerError(''), 4000);
                      return;
                    }
                    if (selectedFile) setFile(selectedFile);
                  }}
                />
              </label>
              {file && (
                <div className="mt-3 flex justify-between items-center text-xs bg-dark-bg p-2 rounded-lg border border-white/5">
                  <span className="text-brand-blue font-medium line-clamp-1 flex-1">{file.name}</span>
                  <button type="button" onClick={() => setFile(null)} className="text-gray-500 hover:text-red-400 ml-2">Remove</button>
                </div>
              )}
            </div>

            <div className="pt-4">
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                isLoading={status === 'submitting' || status === 'uploading_file'}
              >
                {status === 'uploading_file' ? 'Uploading Attachment...' : 'Request Enterprise Demo'}
              </Button>
              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1.5 font-medium tracking-wide">
                🛡️ AES-256 encrypted endpoints. All client data and requests are kept confidential.
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

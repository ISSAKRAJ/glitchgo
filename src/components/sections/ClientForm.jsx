import React, { useState } from 'react';
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
    problem: '',
    deadline: 'urgent',
    budget: '',
    referralCode: '',
    botcheck: '' // Honeypot field for spam bots
  });
  const [errors, setErrors] = useState({});
  const [file, setFile] = useState(null); // File tracking state
  const [status, setStatus] = useState('idle'); // idle, uploading_file, submitting, success, error
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const newErrors = {};
    // Strict Email / Phone Regex (Must be a valid email format OR a valid 10+ digit phone number)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    
    if (!formData.name.trim() || formData.name.length < 2) newErrors.name = 'Please enter your full real name';
    if (!formData.contact.trim()) {
      newErrors.contact = 'Email or Phone is required';
    } else if (!emailRegex.test(formData.contact) && !phoneRegex.test(formData.contact)) {
      newErrors.contact = 'Please enter a valid email address or phone number';
    }
    
    // Strict Length Validation to prevent single-word spam
    if (!formData.problem.trim() || formData.problem.trim().length < 20) {
      newErrors.problem = 'Please provide more details (at least 20 characters) so we can help you properly';
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
      // Basic check for placeholder configuration
      if (import.meta.env.VITE_SUPABASE_URL === 'YOUR_SUPABASE_URL_HERE' || !import.meta.env.VITE_SUPABASE_URL) {
        throw new Error("Supabase is not configured! Please set up your .env.local file with real database keys.");
      }

      // Handle File Upload to Supabase Storage if attached
      let fileUrl = null;
      if (file) {
        setStatus('uploading_file');
        
        // Generate unique filename
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
        const filePath = `${formData.name.replace(/[^a-zA-Z0-9]/g, '')}_${fileName}`;
        
        const { error: uploadError } = await supabase.storage
          .from('client_files')
          .upload(filePath, file);

        if (uploadError) {
          throw new Error("File Upload Failed. Please check if you created a public 'client_files' bucket in your Supabase Storage.");
        }
        
        const { data: { publicUrl } } = supabase.storage
          .from('client_files')
          .getPublicUrl(filePath);
          
        fileUrl = publicUrl;
      }

      setStatus('submitting');

      // Insert to Supabase
      const { error } = await supabase
        .from('client_requests')
        .insert([
          { 
            name: formData.name, 
            contact: formData.contact, 
            problem: formData.problem, 
            deadline: formData.deadline, 
            budget: formData.budget,
            referral_code: formData.referralCode.trim().toUpperCase(),
            file_url: fileUrl // Link to the uploaded file
          }
        ]);

      if (error) throw error;

      // Send Email Notification via Web3Forms
      const web3FormsKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      if (web3FormsKey && web3FormsKey !== 'YOUR_WEB3FORMS_KEY_HERE') {
        const emailPayload = {
          access_key: web3FormsKey,
          subject: `New Lead: ${formData.name} - GlitchGo`,
          from_name: "GlitchGo Intake",
          name: formData.name,
          email: formData.contact,
          message: `Problem: ${formData.problem}\nDeadline: ${formData.deadline}\nBudget: ${formData.budget || 'N/A'}\nReferral Code: ${formData.referralCode || 'None'}`
        };

        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(emailPayload)
        });
      }

      setStatus('success');
      
      // Telegram Handoff Configuration
      const tgUsername = import.meta.env.VITE_TELEGRAM_USERNAME;
      if (tgUsername) {
        const textMessage = encodeURIComponent(`Hi GlitchGo! I just submitted an urgent ticket on your website.\n\n*Name:* ${formData.name}\n*Problem:* ${formData.problem}\n\nCan we discuss the exact price and the initial UPI deposit?`);
        window.open(`https://t.me/${tgUsername.replace('@', '')}?text=${textMessage}`, '_blank');
      }

      setFormData({ name: '', contact: '', problem: '', deadline: 'urgent', budget: '', referralCode: '' });
      setFile(null);
      
      // Reset after 5 seconds
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setServerError(err.message || 'Something went wrong. Please try again.');
    }
  };

  return (
    <section id="contact-form" className="py-24 bg-dark-surface border-y border-white/5 relative">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Request Immediate Help</h2>
          <p className="text-gray-400">Fill out the details below and an expert will get back to you in minutes.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-2xl p-8 md:p-12 relative overflow-hidden"
        >
          <AnimatePresence>
            {status === 'success' && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-dark-card/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center"
              >
                <CheckCircle2 size={64} className="text-emerald-500 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Request Received!</h3>
                <p className="text-gray-300">We received your request. We'll contact you soon.</p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Honeypot Field (Hidden from humans, bots will fill it) */}
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
                <label className="block text-sm font-medium text-gray-300 mb-2">Name *</label>
                <Input 
                  placeholder="John Doe" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  error={errors.name}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Email or Phone *</label>
                <Input 
                  placeholder="john@example.com / +1234..." 
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  error={errors.contact}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Problem Description *</label>
              <Textarea 
                placeholder="Describe the bug, issue, or feature you need built..." 
                value={formData.problem}
                onChange={(e) => setFormData({...formData, problem: e.target.value})}
                error={errors.problem}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Deadline *</label>
                <select 
                  className="w-full bg-dark-surface border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-blue"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                >
                  <option value="urgent">🔥 Urgent (ASAP)</option>
                  <option value="24h">⏱️ Within 24 Hours</option>
                  <option value="2-3days">📅 2–3 Days</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Budget (Optional)</label>
                <Input 
                  placeholder="$50, $100+" 
                  type="text"
                  value={formData.budget}
                  onChange={(e) => setFormData({...formData, budget: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Referral Code</label>
                <Input 
                  placeholder="e.g. JOHN2026" 
                  type="text"
                  value={formData.referralCode}
                  onChange={(e) => setFormData({...formData, referralCode: e.target.value})}
                />
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-xl p-4 md:p-6 border-dashed hover:border-brand-blue/50 transition-colors">
              <label className="flex items-center gap-3 cursor-pointer">
                <div className="w-10 h-10 rounded-full bg-brand-blue/20 flex items-center justify-center flex-shrink-0 text-brand-blue">
                  <Paperclip size={20} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white mb-0.5">Attach a file (Optional)</p>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {file ? file.name : "Upload images, screenshots, or documents max 2MB."}
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
                {status === 'uploading_file' ? 'Uploading Attachment...' : 'Submit Request'}
              </Button>
              <p className="text-center text-xs text-gray-500 mt-4 flex items-center justify-center gap-1">
                <AlertCircle size={14} /> 100% Secure & Confidential
              </p>
            </div>
          </form>
        </motion.div>
      </div>
    </section>
  );
}

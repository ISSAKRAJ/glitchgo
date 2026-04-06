import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, ShieldAlert, CheckCircle2, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

export default function LeaveReview() {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Form State
  const [author, setAuthor] = useState('');
  const [role, setRole] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { error: dbError } = await supabase
        .from('client_reviews')
        .insert([{ author, role, text, rating }]);

      if (dbError) throw dbError;
      
      setSuccess(true);
      setAuthor('');
      setRole('');
      setText('');
      setRating(5);
      
      // Reset success message after 5 seconds
      setTimeout(() => setSuccess(false), 5000);
      
    } catch (err) {
      console.error(err);
      setError('Failed to save review. Ensure the client_reviews table exists.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen pt-24 px-6 relative">
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      
      <div className="max-w-xl mx-auto relative z-10">
        <button onClick={() => window.location.href='/'} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to Home
        </button>

        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-6">
            <Star size={16} className="text-brand-orange fill-brand-orange" />
            <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Client Feedback</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Leave a Review</h1>
          <p className="text-gray-400">Tell us about your experience! Your 5-star review will be featured directly on our Wall of Love.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-8 md:p-10 rounded-3xl border border-brand-orange/20 shadow-[0_0_30px_rgba(249,115,22,0.1)] relative"
        >
          {success ? (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center mb-6 border border-emerald-500/20">
                <CheckCircle2 size={40} className="text-emerald-500" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Review Published!</h2>
              <p className="text-gray-400">The Wall of Love has been instantly updated.</p>
              <Button onClick={() => window.location.href='/'} variant="outline" className="mt-8">
                Return to Homepage
              </Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmitReview} className="space-y-6">
              
              <div className="flex gap-2 mb-8 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                    key={star} 
                    type="button" 
                    onClick={() => setRating(star)}
                    className="focus:outline-none hover:scale-110 transition-transform"
                  >
                    <Star size={32} className={`transition-colors ${star <= rating ? 'text-brand-orange fill-brand-orange' : 'text-gray-600'}`} />
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Name <span className="text-brand-orange">*</span></label>
                  <Input 
                    placeholder="e.g. Sarah Jenkins" 
                    value={author}
                    onChange={(e) => setAuthor(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Your Role or Company <span className="text-brand-orange">*</span></label>
                  <Input 
                    placeholder="e.g. Startup Founder" 
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Review Text <span className="text-brand-orange">*</span></label>
                <textarea
                  required
                  placeholder='"GlitchGo completely saved our deadline..."'
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  rows={5}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-blue focus:ring-1 focus:ring-brand-blue transition-all resize-none"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm text-center">
                  {error}
                </div>
              )}

              <Button type="submit" isLoading={loading} className="w-full h-12 text-lg">
                Submit Review
              </Button>
            </form>
          )}

        </motion.div>
      </div>
    </div>
  );
}

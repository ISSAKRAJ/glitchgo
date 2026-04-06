import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Star, Quote } from 'lucide-react';
import { supabase } from '../../lib/supabase';

// Fallback reviews to showcase the design even if the database is empty
const MOCK_REVIEWS = [
  { id: 'm1', author: 'Sarah Jenkins', role: 'Startup Founder', text: 'GlitchGo saved our launch. We had a crushing API bug 12 hours before our product went live, and their engineers fixed it perfectly overnight.', rating: 5 },
  { id: 'm2', author: 'David Chen', role: 'E-commerce Owner', text: 'I hired them to automate our inventory syncing with Shopify. The AI script they wrote saves me 15 hours a week. Best investment period.', rating: 5 },
  { id: 'm3', author: 'Michael R.', role: 'App Developer', text: 'The React Native bug was driving my team crazy for weeks. GlitchGo isolated and patched it within 24 hours. Unreal speed and professionalism.', rating: 4 },
  { id: 'm4', author: 'Elena Rodriguez', role: 'Agency Director', text: 'We outsource our overflow database tasks to GlitchGo. They are fast, completely transparent with pricing, and the code is always clean.', rating: 5 },
  { id: 'm5', author: 'James W.', role: 'SaaS Builder', text: 'If you are stuck on a weird backend glitch, do not waste 3 days trying to fix it yourself. Just pay GlitchGo. Worth every penny.', rating: 4 },
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const { data, error } = await supabase
          .from('client_reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;
        
        // Show actual data if it exists, otherwise use the beautiful mock data
        if (data && data.length > 0) {
          setReviews([...data, ...data]); // Duplicate for smooth looping
        } else {
          setReviews([...MOCK_REVIEWS, ...MOCK_REVIEWS]); 
        }
      } catch (err) {
        console.warn("Could not load reviews form Supabase, using defaults.", err);
        setReviews([...MOCK_REVIEWS, ...MOCK_REVIEWS]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReviews();
  }, []);

  if (isLoading) return null;

  return (
    <section className="py-24 relative overflow-hidden bg-dark-bg/50 border-y border-white/5">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/4 w-[500px] h-[500px] bg-brand-blue/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-[120px] -translate-y-1/2 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6 mb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/10 mb-6">
          <Star size={16} className="text-brand-orange fill-brand-orange" />
          <span className="text-sm font-semibold text-gray-300 tracking-wide uppercase">Wall of Love</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white tracking-tight">
          Don't just take our word for it.
        </h2>
        <p className="text-gray-400 max-w-2xl mx-auto text-lg">
          See why founders and developers trust GlitchGo's elite engineers to solve their most complex technical headaches.
        </p>
      </div>

      {/* Infinite Marquee Container */}
      <div className="relative w-full flex overflow-hidden group">
        
        {/* Left/Right Fade Masks so it seamlessly enters/exits the screen */}
        <div className="absolute top-0 left-0 bottom-0 w-32 bg-gradient-to-r from-dark-bg to-transparent z-10 pointer-events-none" />
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-dark-bg to-transparent z-10 pointer-events-none" />

        <motion.div
          animate={{ x: ["0%", "-50%"] }}
          transition={{ ease: "linear", duration: 45, repeat: Infinity }}
          className="flex whitespace-nowrap gap-6 px-6 cursor-grab active:cursor-grabbing hover:[animation-play-state:paused]"
        >
          {reviews.map((review, i) => (
            <div 
              key={`${review.id}-${i}`} 
              className="glass p-8 rounded-3xl border border-white/5 w-[350px] md:w-[450px] flex-shrink-0 flex flex-col justify-between hover:border-brand-blue/30 transition-all group/card"
            >
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, idx) => (
                      <Star key={idx} size={16} className={`transition-colors ${idx < (review.rating || 5) ? 'text-brand-orange fill-brand-orange' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <Quote size={20} className="text-white/10 group-hover/card:text-brand-blue/30 transition-colors" />
                </div>
                <p className="text-gray-300 text-[15px] leading-relaxed mb-8 whitespace-normal font-medium">
                  "{review.text}"
                </p>
              </div>
              
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-blue to-dark-surface p-0.5 shadow-lg">
                  <div className="w-full h-full rounded-full bg-dark-bg flex items-center justify-center font-bold text-sm text-brand-blue">
                    {review.author.charAt(0)}
                  </div>
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">{review.author}</h4>
                  <p className="text-xs text-brand-blue tracking-wide">{review.role}</p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Button to submit a review */}
      <div className="mt-16 text-center z-10 relative max-w-7xl mx-auto px-6">
        <a href="/leave-review" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl glass border-white/10 hover:border-brand-orange/40 hover:bg-brand-orange/5 transition-all text-sm font-bold tracking-wide text-gray-300 hover:text-white group">
          Leave a Review
          <span className="text-brand-orange group-hover:translate-x-1 transition-transform">→</span>
        </a>
      </div>

    </section>
  );
}

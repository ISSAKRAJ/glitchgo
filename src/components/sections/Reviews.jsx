import React, { useState, useEffect } from 'react';

// Stack Class to manage reviews (LIFO structure)
class ReviewStack {
  constructor(items = []) {
    this.items = [...items];
  }

  // Push new review to the top of the stack (unshift)
  push(item) {
    this.items.unshift(item);
  }

  // Pop the top review from the stack
  pop() {
    return this.items.shift();
  }

  // Get the size of the stack
  size() {
    return this.items.length;
  }

  // Return the stack items as an array
  toArray() {
    return [...this.items];
  }
}

const INITIAL_REVIEWS = [
  {
    id: 'init-1',
    name: 'Alex T.',
    role: 'Technical Founder & CTO, HyperScale AI',
    rating: 5,
    comment: 'Absolutely bulletproof. The zero-trust AST parser prevents any dangerous queries before execution, and the Gemini 2.5 Pro escalation repairs any bad syntax on the fly. The PowerBI-style visual progress bars in Slack and the viral share loop are fantastic additions!',
    date: '2026-06-25T12:00:00.000Z'
  },
  {
    id: 'init-2',
    name: 'Sarah M.',
    role: 'Lead Data Engineer, FinFlow',
    rating: 5,
    comment: "We were worried about query security, but AdminZero's AST checks blocked column access to password/ssn immediately. The Lead Analyst synthesis layer makes raw DB rows extremely readable for non-tech teams. Highly recommend!",
    date: '2026-06-24T10:15:00.000Z'
  },
  {
    id: 'init-3',
    name: 'David K.',
    role: 'Head of Operations, LogiQuest',
    rating: 5,
    comment: 'Piped our DB to Slack in under a minute. Our sales reps are querying production metrics without bothering developers. A complete game-changer for data-driven decisions.',
    date: '2026-06-23T08:30:00.000Z'
  }
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: '', rating: 5, comment: '' });
  const [hoverRating, setHoverRating] = useState(0);

  // Initialize reviews from localStorage or initial state
  useEffect(() => {
    const saved = localStorage.getItem('adminzero_reviews');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setReviews(parsed);
        } else {
          setReviews(INITIAL_REVIEWS);
        }
      } catch (e) {
        setReviews(INITIAL_REVIEWS);
      }
    } else {
      setReviews(INITIAL_REVIEWS);
    }
  }, []);

  // Handle Review Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.comment) return;

    const newReview = {
      id: `rev-${Date.now()}`,
      name: formData.name,
      role: formData.role || 'User',
      rating: formData.rating,
      comment: formData.comment,
      date: new Date().toISOString()
    };

    // Instantiate Stack, push new review (LIFO behavior), and write to state + storage
    const stack = new ReviewStack(reviews);
    stack.push(newReview);
    
    const updatedArray = stack.toArray();
    setReviews(updatedArray);
    localStorage.setItem('adminzero_reviews', JSON.stringify(updatedArray));

    // Reset Form & Close Modal
    setFormData({ name: '', role: '', rating: 5, comment: '' });
    setIsModalOpen(false);
  };

  const renderStars = (rating) => {
    return (
      <div className="flex items-center space-x-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <span key={i} className={`text-xl ${i < rating ? 'text-amber-400' : 'text-slate-600'}`}>
            ★
          </span>
        ))}
      </div>
    );
  };

  const formatReviewDate = (dateVal) => {
    if (!dateVal) return 'Recently';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return 'Recently';
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <section id="reviews" className="relative py-24 bg-[#0a0a0f] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
              What Teams Say About <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AdminZero</span>
            </h2>
            <p className="text-slate-400 max-w-xl text-lg">
              See how modern development and database teams are using zero-trust query routing to decentralize data answers.
            </p>
          </div>
          <div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-300 transform hover:-translate-y-0.5"
            >
              ✍️ Leave a Review
            </button>
          </div>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group"
            >
              <div className="flex items-center justify-between mb-4">
                {renderStars(rev.rating)}
                <span className="text-xs text-slate-500">
                  {formatReviewDate(rev.date)}
                </span>
              </div>
              
              <p className="text-slate-300 text-sm leading-relaxed mb-6 flex-1 italic">
                "{rev.comment}"
              </p>

              <div className="border-t border-white/[0.05] pt-4 mt-auto">
                <h4 className="font-bold text-white group-hover:text-indigo-400 transition-colors duration-300">
                  {rev.name}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  {rev.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Leave a Review Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            onClick={() => setIsModalOpen(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          />

          {/* Modal Content */}
          <div className="relative w-full max-w-md bg-[#12121a] border border-white/[0.08] rounded-2xl shadow-2xl overflow-hidden p-6 z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">Share Your Review</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Your Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Alex T."
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/[0.08] focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Role / Company
                </label>
                <input
                  type="text"
                  placeholder="e.g. CTO, HyperScale AI"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/[0.08] focus:border-indigo-500 rounded-xl text-white outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Rating
                </label>
                <div className="flex items-center space-x-1.5 py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setFormData({ ...formData, rating: star })}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="text-2xl outline-none focus:outline-none transition-transform active:scale-95"
                    >
                      <span
                        className={`${
                          star <= (hoverRating || formData.rating)
                            ? 'text-amber-400'
                            : 'text-slate-600'
                        }`}
                      >
                        ★
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Your Review
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Write your review here..."
                  value={formData.comment}
                  onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
                  className="w-full px-4 py-3 bg-[#0a0a0f] border border-white/[0.08] focus:border-indigo-500 rounded-xl text-white outline-none transition-colors resize-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-white/[0.04] hover:bg-white/[0.08] text-slate-300 font-semibold rounded-xl border border-white/[0.06] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-indigo-500/10"
                >
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}

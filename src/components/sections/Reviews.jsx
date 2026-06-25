import React from 'react';

const REVIEWS = [
  {
    id: 'rev-1',
    name: 'Alex T.',
    role: 'Technical Founder & CTO, HyperScale AI',
    rating: 5,
    comment: 'Absolutely bulletproof. The zero-trust AST parser prevents any dangerous queries before execution, and the Gemini 2.5 Pro escalation repairs any bad syntax on the fly. The PowerBI-style visual progress bars in Slack and the viral share loop are fantastic additions!',
    date: 'Jun 25, 2026'
  },
  {
    id: 'rev-2',
    name: 'Sarah M.',
    role: 'Lead Data Engineer, FinFlow',
    rating: 5,
    comment: "We were worried about query security, but AdminZero's AST checks blocked column access to password/ssn immediately. The Lead Analyst synthesis layer makes raw DB rows extremely readable for non-tech teams. Highly recommend!",
    date: 'Jun 24, 2026'
  },
  {
    id: 'rev-3',
    name: 'David K.',
    role: 'Head of Operations, LogiQuest',
    rating: 5,
    comment: 'Piped our DB to Slack in under a minute. Our sales reps are querying production metrics without bothering developers. A complete game-changer for data-driven decisions.',
    date: 'Jun 23, 2026'
  }
];

export default function Reviews() {
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

  return (
    <section id="reviews" className="relative py-24 bg-[#0a0a0f] overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="mb-16">
          <h2 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none mb-4">
            What Teams Say About <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">AdminZero</span>
          </h2>
          <p className="text-slate-400 max-w-xl text-lg">
            See how modern development and database teams are using zero-trust query routing to decentralize data answers.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {REVIEWS.map((rev) => (
            <div
              key={rev.id}
              className="flex flex-col bg-white/[0.03] backdrop-blur-md border border-white/[0.06] hover:border-indigo-500/30 rounded-2xl p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 group"
            >
              <div className="flex items-center justify-between mb-4">
                {renderStars(rev.rating)}
                <span className="text-xs text-slate-500">
                  {rev.date}
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
    </section>
  );
}

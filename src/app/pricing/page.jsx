"use client";
import React from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

export default function PricingPage() {
  const plans = [
    {
      n: 'Developer',
      p: '₹0',
      pd: 'forever',
      desc: 'Perfect for local development, prototyping, and testing security safeguards.',
      f: [
        'Local DB Support',
        '2,500 free credits / mo',
        'Core AST Query Guard',
        'Community Discord Access',
        'Real-time Telemetry Dashboard'
      ],
      cta: 'Get Started Free',
      href: '/signup?next=/portal',
      hot: false
    },
    {
      n: 'Startup',
      p: '₹2,999',
      pd: '/ month',
      desc: 'For growing applications requiring production-grade protection for PostgreSQL & MySQL.',
      f: [
        'Full Postgres & MySQL Support',
        '250,000 credits / mo',
        'Custom AST Blocklists',
        'Standard Email Support',
        'API Key Management (Multiple Keys)',
        'PII Redaction Engine'
      ],
      cta: 'Choose Startup',
      href: '/portal',
      hot: true
    },
    {
      n: 'Scale',
      p: '₹14,999',
      pd: '/ month',
      desc: 'Designed for high-traffic platforms needing complete database protection and priority operations.',
      f: [
        'All Supported Databases',
        '1,250,000 credits / mo',
        'Priority Slack/Email Support',
        'Advanced Prompt Guard',
        'Custom Whitelist Policies',
        'Detailed Audit Logs'
      ],
      cta: 'Choose Scale',
      href: '/portal',
      hot: false
    },
    {
      n: 'Enterprise',
      p: 'Custom',
      pd: 'annual billing',
      desc: 'Tailored options for critical infrastructure, strict compliance mandates, and absolute scale.',
      f: [
        'Unlimited Credits / Queries',
        'Private VPC Deployments',
        'Dedicated 24/7 Support SLA',
        'Advanced Risk Assessment Report',
        'Custom Security Gateways'
      ],
      cta: 'Contact Sales',
      href: 'mailto:issakrajraj@gmail.com',
      hot: false
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#040404] text-white font-sans relative overflow-hidden">
      <Navbar />

      {/* Background aesthetics */}
      <style>{`
        .bg-wrap { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
        .orb { position: absolute; border-radius: 50%; will-change: transform; }
        .o1 {
          width: 800px; height: 800px; top: -250px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(234,108,18,0.07) 0%, transparent 65%);
          filter: blur(100px); animation: f1 16s ease-in-out infinite;
        }
        .o2 {
          width: 600px; height: 600px; bottom: 5%; right: -100px;
          background: radial-gradient(circle, rgba(59,130,246,0.07) 0%, transparent 65%);
          filter: blur(120px); animation: f2 20s ease-in-out infinite;
        }
        .o3 {
          width: 450px; height: 450px; top: 45%; left: -80px;
          background: radial-gradient(circle, rgba(234,108,18,0.05) 0%, transparent 65%);
          filter: blur(100px); animation: f3 24s ease-in-out infinite;
        }
        @keyframes f1 { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(-30px);} }
        @keyframes f2 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(-30px,-40px);} }
        @keyframes f3 { 0%,100%{transform:translate(0,0);} 50%{transform:translate(20px,-30px);} }
        .bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.014) 1px,transparent 1px),
                            linear-gradient(90deg,rgba(255,255,255,0.014) 1px,transparent 1px);
          background-size: 72px 72px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 20%, transparent 100%);
        }
        .price-card {
          background: rgba(8,8,8,0.7);
          border: 1px solid rgba(255,255,255,0.04);
          border-radius: 24px;
          padding: 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .price-card:hover {
          border-color: rgba(234,108,18,0.25);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.8);
        }
        .price-card-hot {
          border-color: rgba(234,108,18,0.45);
          background: linear-gradient(180deg, rgba(234,108,18,0.04) 0%, rgba(8,8,8,0.8) 100%);
          box-shadow: 0 8px 32px rgba(234,108,18,0.04);
        }
        .price-card-hot:hover {
          border-color: rgba(234,108,18,0.7);
          box-shadow: 0 12px 48px rgba(234,108,18,0.12);
        }
      `}</style>

      <div className="bg-wrap">
        <div className="orb o1"></div>
        <div className="orb o2"></div>
        <div className="orb o3"></div>
        <div className="bg-grid"></div>
      </div>

      <main className="flex-1 w-full pt-36 pb-24 relative z-10">
        <div className="max-w-6xl mx-auto px-6 text-center">
          {/* Header */}
          <div className="mb-16 space-y-4">
            <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest font-mono bg-brand-orange/10 border border-brand-orange/20 px-3 py-1 rounded-full">
              Flexible Compute Credit Plans
            </span>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
              Predictable Pricing for <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">AI Database Security</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl mx-auto leading-relaxed">
              No hidden fees. Compute Credits scale based on your security parameters. A base safe query costs 1 credit. Add AST protection or PII scrubbing as needed.
            </p>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto text-left items-stretch">
            {plans.map((p) => (
              <div key={p.n} className={`price-card ${p.hot ? 'price-card-hot' : ''}`}>
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-[10px] font-bold tracking-wider uppercase text-zinc-500">
                      {p.n}
                    </span>
                    {p.hot && (
                      <span className="text-[8px] bg-brand-orange text-white px-2 py-0.5 rounded-md uppercase font-mono font-bold tracking-wider">
                        Popular
                      </span>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-3xl font-extrabold text-white font-mono">{p.p}</span>
                    <span className="text-xs text-zinc-500">{p.pd}</span>
                  </div>

                  <p className="text-xs text-zinc-400 mb-6 leading-relaxed min-h-[48px]">
                    {p.desc}
                  </p>

                  <div className="w-full h-px bg-zinc-900 mb-6" />

                  <ul className="space-y-3 mb-8">
                    {p.f.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5 text-xs text-zinc-300">
                        <span className="text-brand-orange shrink-0 mt-0.5">✓</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={p.href}
                  className={`w-full py-2.5 rounded-xl text-center text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
                    p.hot
                      ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-lg shadow-orange-950/20'
                      : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800'
                  }`}
                >
                  {p.cta}
                </a>
              </div>
            ))}
          </div>

          {/* Compute Credit Details */}
          <div className="mt-20 max-w-3xl mx-auto bg-zinc-950/40 border border-zinc-900 rounded-3xl p-8 text-left">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              💡 Understanding the Compute Credit System
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Unlike static request counters, AdminZero dynamically allocates computing power based on the security layers you enable:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-900">
                <div className="font-bold text-brand-orange mb-1">AST Query Guard</div>
                <div className="text-[10px] text-zinc-500">Consumes +2 Credits per query. Scans query syntax to block dangerous commands (DROP, DELETE, TRUNCATE).</div>
              </div>
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-900">
                <div className="font-bold text-brand-orange mb-1">Prompt Firewall</div>
                <div className="text-[10px] text-zinc-500">Consumes +1 Credit per query. Blocks adversarial LLM jailbreaks and role-playing prompts.</div>
              </div>
              <div className="bg-zinc-900/60 p-4 rounded-xl border border-zinc-900">
                <div className="font-bold text-brand-orange mb-1">PII Scrubber</div>
                <div className="text-[10px] text-zinc-500">Consumes +1 Credit per query. Automatically masks private info (emails, credentials, credit cards).</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

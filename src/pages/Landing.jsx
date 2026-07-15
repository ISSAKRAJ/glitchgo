"use client";
import React, { useEffect, useRef } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Landing() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        :root {
          --orange: #f97316;
          --orange-bright: #fb923c;
          --orange-glow: rgba(249,115,22,0.18);
          --blue: #3b82f6;
          --blue-bright: #60a5fa;
          --blue-glow: rgba(59,130,246,0.15);
          --gold: #fbbf24;
          --surface: rgba(255,255,255,0.028);
          --surface-hover: rgba(255,255,255,0.05);
          --border: rgba(255,255,255,0.06);
          --border-bright: rgba(255,255,255,0.12);
        }

        .landing-root * { box-sizing: border-box; }
        .landing-root { font-family: 'Inter', sans-serif; background: #030303; color: #e4e4e7; overflow-x: hidden; }

        /* ── ANIMATED BACKGROUND ── */
        .bg-canvas {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden;
        }
        .orb {
          position: absolute; border-radius: 50%; filter: blur(120px); will-change: transform;
        }
        .orb-1 {
          width: 700px; height: 700px; top: -200px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(249,115,22,0.12) 0%, rgba(234,88,12,0.04) 50%, transparent 70%);
          animation: float1 14s ease-in-out infinite;
        }
        .orb-2 {
          width: 600px; height: 600px; bottom: 10%; right: -150px;
          background: radial-gradient(circle, rgba(59,130,246,0.10) 0%, rgba(99,102,241,0.04) 50%, transparent 70%);
          animation: float2 18s ease-in-out infinite;
        }
        .orb-3 {
          width: 500px; height: 500px; top: 40%; left: -100px;
          background: radial-gradient(circle, rgba(249,115,22,0.07) 0%, transparent 70%);
          animation: float3 22s ease-in-out infinite;
        }
        .orb-4 {
          width: 400px; height: 400px; top: 60%; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%);
          animation: float1 16s ease-in-out infinite reverse;
        }

        @keyframes float1 {
          0%,100% { transform: translateX(-50%) translateY(0px) scale(1); }
          33% { transform: translateX(-45%) translateY(-40px) scale(1.05); }
          66% { transform: translateX(-55%) translateY(20px) scale(0.97); }
        }
        @keyframes float2 {
          0%,100% { transform: translate(0,0) scale(1); }
          50% { transform: translate(-40px, -60px) scale(1.08); }
        }
        @keyframes float3 {
          0%,100% { transform: translate(0,0); }
          50% { transform: translate(30px, -50px); }
        }

        /* Grid */
        .bg-grid {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.018) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.018) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%);
        }

        /* Noise overlay */
        .bg-noise {
          position: fixed; inset: 0; z-index: 0; pointer-events: none; opacity: 0.025;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
          background-repeat: repeat; background-size: 200px;
        }

        /* ── SECTIONS ── */
        .section { position: relative; z-index: 10; }

        /* ── GLASS CARD ── */
        .glass {
          background: var(--surface);
          border: 1px solid var(--border);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          transition: border-color 0.3s ease, background 0.3s ease, transform 0.3s ease;
        }
        .glass::before {
          content: '';
          position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.35), rgba(59,130,246,0.2), transparent);
        }
        .glass:hover {
          background: var(--surface-hover);
          border-color: rgba(255,255,255,0.10);
          transform: translateY(-2px);
        }

        .glass-featured {
          background: rgba(249,115,22,0.055);
          border: 1.5px solid rgba(249,115,22,0.28);
          backdrop-filter: blur(24px);
          border-radius: 20px;
          position: relative;
          overflow: hidden;
          box-shadow: 0 0 80px rgba(249,115,22,0.08), 0 0 160px rgba(249,115,22,0.03);
        }
        .glass-featured::before {
          content: '';
          position: absolute; top: 0; left: 5%; right: 5%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.8), transparent);
        }

        /* ── GRADIENT TEXT ── */
        .grad-text-orange {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 40%, #fbbf24 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .grad-text-blue {
          background: linear-gradient(135deg, #60a5fa 0%, #818cf8 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .grad-text-mixed {
          background: linear-gradient(135deg, #f97316 0%, #fb923c 35%, #818cf8 70%, #60a5fa 100%);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        /* ── GLOW BORDER ANIMATION ── */
        @keyframes borderGlow {
          0%,100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        .animate-glow { animation: borderGlow 3s ease-in-out infinite; }

        /* ── MARQUEE ── */
        .marquee-track {
          display: flex; gap: 48px; width: max-content;
          animation: marquee 30s linear infinite;
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .marquee-item {
          display: flex; align-items: center; gap: 10px;
          color: rgba(255,255,255,0.22); font-size: 11px; font-weight: 700;
          letter-spacing: 0.15em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace;
          white-space: nowrap;
        }
        .marquee-dot { width: 4px; height: 4px; border-radius: 50%; background: var(--orange); opacity: 0.6; }

        /* ── FADE IN ── */
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-up { animation: fadeUp 0.8s ease forwards; }
        .delay-1 { animation-delay: 0.1s; opacity: 0; }
        .delay-2 { animation-delay: 0.25s; opacity: 0; }
        .delay-3 { animation-delay: 0.4s; opacity: 0; }
        .delay-4 { animation-delay: 0.55s; opacity: 0; }

        /* ── BADGE PULSE ── */
        @keyframes pulse-ring {
          0% { transform: scale(0.9); box-shadow: 0 0 0 0 rgba(249,115,22,0.5); }
          70% { transform: scale(1); box-shadow: 0 0 0 8px rgba(249,115,22,0); }
          100% { transform: scale(0.9); }
        }
        .pulse-dot { animation: pulse-ring 2s ease-out infinite; }

        /* ── PRIMARY BUTTON ── */
        .btn-primary {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 32px; border-radius: 14px;
          background: linear-gradient(135deg, #f97316, #fb923c);
          color: #000; font-weight: 800; font-size: 13px; letter-spacing: 0.08em;
          text-transform: uppercase; text-decoration: none;
          box-shadow: 0 0 40px rgba(249,115,22,0.4), 0 2px 0 rgba(255,255,255,0.12) inset;
          transition: all 0.25s ease; border: none; cursor: pointer; position: relative; overflow: hidden;
        }
        .btn-primary::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          opacity: 0; transition: opacity 0.25s;
        }
        .btn-primary:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 60px rgba(249,115,22,0.55), 0 8px 30px rgba(0,0,0,0.4); }
        .btn-primary:hover::after { opacity: 1; }
        .btn-primary:active { transform: scale(0.98); }

        .btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 16px 32px; border-radius: 14px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #e4e4e7; font-weight: 600; font-size: 13px; letter-spacing: 0.05em;
          text-decoration: none; transition: all 0.25s ease; cursor: pointer;
          backdrop-filter: blur(12px);
        }
        .btn-ghost:hover {
          background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.14);
          transform: translateY(-1px); color: #fff;
        }

        /* ── ICON BOX ── */
        .icon-box {
          display: flex; align-items: center; justify-content: center;
          width: 44px; height: 44px; border-radius: 12px;
          background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.15);
          color: #f97316;
        }
        .icon-box-blue {
          background: rgba(59,130,246,0.08); border-color: rgba(59,130,246,0.15);
          color: #60a5fa;
        }

        /* ── STEP NUMBER ── */
        .step-num {
          width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center;
          font-family: 'JetBrains Mono', monospace; font-size: 11px; font-weight: 700;
          color: #f97316; background: rgba(249,115,22,0.08); border: 1px solid rgba(249,115,22,0.18);
        }

        /* ── DOWNLOAD CARD ── */
        .dl-card {
          padding: 36px 28px; border-radius: 24px; display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 24px;
          backdrop-filter: blur(24px); position: relative; overflow: hidden;
          background: rgba(255,255,255,0.025); border: 1px solid rgba(255,255,255,0.07);
          transition: all 0.35s cubic-bezier(0.34,1.56,0.64,1);
        }
        .dl-card:hover {
          transform: translateY(-6px) scale(1.01);
          border-color: rgba(249,115,22,0.25);
          background: rgba(249,115,22,0.04);
          box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(249,115,22,0.07);
        }
        .dl-card::before {
          content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent);
        }
        .dl-card-featured {
          background: rgba(249,115,22,0.06); border: 1.5px solid rgba(249,115,22,0.25);
          box-shadow: 0 0 80px rgba(249,115,22,0.09), 0 0 160px rgba(249,115,22,0.03);
        }
        .dl-card-featured::before {
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.7), transparent);
        }

        .dl-icon-wrap {
          width: 72px; height: 72px; border-radius: 22px; display: flex; align-items: center; justify-content: center;
          position: relative;
        }
        .dl-icon-wrap::after {
          content: ''; position: absolute; inset: -1px; border-radius: 23px;
          background: linear-gradient(135deg, rgba(249,115,22,0.4), rgba(59,130,246,0.2), transparent);
          z-index: -1;
        }

        .dl-btn {
          width: 100%; padding: 13px 20px; border-radius: 12px; display: flex; align-items: center;
          justify-content: center; gap: 8px; font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.08em; text-decoration: none; transition: all 0.25s ease; cursor: pointer;
        }
        .dl-btn-primary {
          background: linear-gradient(135deg, #f97316, #fb923c); color: #000;
          box-shadow: 0 0 24px rgba(249,115,22,0.25);
        }
        .dl-btn-primary:hover { box-shadow: 0 0 40px rgba(249,115,22,0.45); transform: scale(1.02); }
        .dl-btn-ghost {
          background: rgba(0,0,0,0.35); color: #e4e4e7;
          border: 1px solid rgba(255,255,255,0.08);
        }
        .dl-btn-ghost:hover { background: rgba(255,255,255,0.05); border-color: rgba(249,115,22,0.25); color: #fb923c; }

        /* ── FEATURE CARD ── */
        .feat-card {
          padding: 28px 24px; border-radius: 20px;
          background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px); position: relative; overflow: hidden;
          transition: all 0.3s ease;
        }
        .feat-card::before {
          content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.25), rgba(59,130,246,0.15), transparent);
        }
        .feat-card:hover {
          background: rgba(255,255,255,0.04); border-color: rgba(249,115,22,0.18);
          transform: translateY(-4px);
          box-shadow: 0 12px 48px rgba(0,0,0,0.4), 0 0 24px rgba(249,115,22,0.06);
        }

        /* ── STAT BOX ── */
        .stat-box {
          padding: 28px 24px; border-radius: 18px; text-align: center;
          background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px); position: relative; overflow: hidden;
        }
        .stat-box::before {
          content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent);
        }

        /* ── PRICING CARD ── */
        .price-card {
          padding: 32px 28px; border-radius: 22px; display: flex; flex-direction: column;
          background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px); position: relative; overflow: hidden;
          transition: all 0.3s ease;
        }
        .price-card::before {
          content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
        .price-card:hover {
          background: rgba(255,255,255,0.04); transform: translateY(-4px);
          box-shadow: 0 16px 64px rgba(0,0,0,0.4);
        }
        .price-card-featured {
          background: rgba(249,115,22,0.055); border: 1.5px solid rgba(249,115,22,0.25);
          box-shadow: 0 0 100px rgba(249,115,22,0.07);
        }
        .price-card-featured::before {
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.65), transparent);
        }

        /* ── TESTIMONIAL ── */
        .testi-card {
          padding: 28px; border-radius: 18px;
          background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(20px);
        }

        /* ── CHECK ITEM ── */
        .check-item { display: flex; align-items: center; gap: 10px; font-size: 12px; color: #a1a1aa; }
        .check-dot { width: 16px; height: 16px; border-radius: 50%; background: rgba(249,115,22,0.1);
          border: 1px solid rgba(249,115,22,0.25); display: flex; align-items: center; justify-content: center;
          flex-shrink: 0; }
        .check-dot svg { width: 8px; height: 8px; color: #f97316; }

        /* ── DIVIDER ── */
        .divider {
          height: 1px; width: 100%; position: relative; overflow: hidden;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.1), rgba(59,130,246,0.08), transparent);
        }

        /* ── LABEL ── */
        .section-label {
          display: inline-flex; align-items: center; gap: 8px; margin-bottom: 16px;
          padding: 6px 14px; border-radius: 100px;
          background: rgba(249,115,22,0.06); border: 1px solid rgba(249,115,22,0.14);
          color: #f97316; font-size: 10px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .section-label-blue {
          background: rgba(59,130,246,0.06); border-color: rgba(59,130,246,0.14); color: #60a5fa;
        }

        /* ── SHIMMER ── */
        @keyframes shimmer {
          from { background-position: -400px 0; }
          to { background-position: 400px 0; }
        }
        .shimmer {
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          background-size: 400px 100%; animation: shimmer 3s infinite linear;
        }

        /* responsive */
        @media (max-width: 768px) {
          .hero-grid { grid-template-columns: 1fr; }
          .features-grid { grid-template-columns: 1fr; }
          .dl-grid { grid-template-columns: 1fr; }
          .pricing-grid { grid-template-columns: 1fr; }
          .stats-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="landing-root">
        {/* ── BACKGROUNDS ── */}
        <div className="bg-canvas">
          <div className="orb orb-1" />
          <div className="orb orb-2" />
          <div className="orb orb-3" />
          <div className="orb orb-4" />
        </div>
        <div className="bg-grid" />
        <div className="bg-noise" />

        <Navbar />

        {/* ────────────────────────────────────────────
            HERO
        ──────────────────────────────────────────── */}
        <section className="section" style={{maxWidth:'1160px', margin:'0 auto', padding:'160px 24px 80px', textAlign:'center'}}>

          {/* Live badge */}
          <div className="fade-up delay-1" style={{display:'flex', justifyContent:'center', marginBottom:'28px'}}>
            <div style={{display:'inline-flex', alignItems:'center', gap:'10px', padding:'8px 18px', borderRadius:'100px', background:'rgba(249,115,22,0.07)', border:'1px solid rgba(249,115,22,0.18)', backdropFilter:'blur(12px)'}}>
              <span className="pulse-dot" style={{width:'8px', height:'8px', borderRadius:'50%', background:'#f97316', display:'block'}} />
              <span style={{fontFamily:"'JetBrains Mono', monospace", fontSize:'10px', fontWeight:700, color:'#f97316', letterSpacing:'0.15em', textTransform:'uppercase'}}>
                AdminZero v2.4 — Now Live · Windows · macOS · Linux
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="fade-up delay-2" style={{
            fontFamily:"'Space Grotesk', Inter, sans-serif",
            fontSize:'clamp(42px, 7vw, 88px)',
            fontWeight:800, lineHeight:1.0,
            letterSpacing:'-0.03em', margin:'0 0 24px',
            color:'#fff'
          }}>
            The <span className="grad-text-orange">Firewall</span> That<br />
            <span className="grad-text-mixed">Thinks Before</span><br />
            Your AI Does.
          </h1>

          {/* Sub */}
          <p className="fade-up delay-3" style={{
            fontSize:'clamp(14px, 2vw, 17px)', color:'#71717a', maxWidth:'520px',
            margin:'0 auto 40px', lineHeight:1.75, fontWeight:400
          }}>
            AdminZero installs on your machine and acts as an intelligent security gateway — blocking every SQL injection and dangerous AI query before it reaches your database.
          </p>

          {/* CTAs */}
          <div className="fade-up delay-4" style={{display:'flex', gap:'14px', justifyContent:'center', flexWrap:'wrap', marginBottom:'56px'}}>
            <a href="#download" className="btn-primary">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
            <a href="/guide" className="btn-ghost">
              How It Works
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
            </a>
          </div>

          {/* Trust badges */}
          <div className="fade-up delay-4" style={{display:'flex', alignItems:'center', justifyContent:'center', gap:'28px', flexWrap:'wrap'}}>
            {['100% Local — Your data never leaves your machine', 'Free forever tier included', 'Sub-4ms query interception'].map(t => (
              <div key={t} style={{display:'flex', alignItems:'center', gap:'7px', fontSize:'11px', color:'#52525b', fontWeight:500}}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {t}
              </div>
            ))}
          </div>
        </section>

        {/* ── MARQUEE ── */}
        <div style={{overflow:'hidden', borderTop:'1px solid rgba(255,255,255,0.04)', borderBottom:'1px solid rgba(255,255,255,0.04)', padding:'18px 0', position:'relative', zIndex:10, background:'rgba(0,0,0,0.3)', backdropFilter:'blur(8px)'}}>
          <div className="marquee-track">
            {[...Array(2)].fill(['SQL Injection Blocked','Zero-Knowledge Vault','AST Query Parsing','Real-Time Monitoring','Offline-First Architecture','Sub-4ms Latency','AES-256 Encryption','Enterprise Ready','Cross-Platform']).flat().map((t,i) => (
              <div key={i} className="marquee-item">
                <span className="marquee-dot" />
                {t}
              </div>
            ))}
          </div>
        </div>

        {/* ── STATS ── */}
        <section className="section" style={{maxWidth:'960px', margin:'0 auto', padding:'80px 24px'}}>
          <div className="stats-grid" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px'}}>
            {[
              { val:'< 4ms', label:'Query Interception', color:'#f97316' },
              { val:'100%', label:'Local Processing', color:'#60a5fa' },
              { val:'27/27', label:'Edge Case Tests Passed', color:'#f97316' },
              { val:'0 Leaks', label:'Cloud Data Access', color:'#60a5fa' },
            ].map(({ val, label, color }) => (
              <div key={label} className="stat-box">
                <div style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'32px', fontWeight:800, color, letterSpacing:'-0.03em', marginBottom:'6px'}}>{val}</div>
                <div style={{fontSize:'11px', color:'#52525b', fontWeight:500, lineHeight:1.5}}>{label}</div>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{margin:'0 24px'}} />

        {/* ── HOW IT WORKS ── */}
        <section className="section" style={{maxWidth:'1100px', margin:'0 auto', padding:'96px 24px'}}>
          <div style={{textAlign:'center', marginBottom:'64px'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'16px'}}>
              <span className="section-label">// How It Works</span>
            </div>
            <h2 style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 14px'}}>
              Setup in <span className="grad-text-orange">Under 2 Minutes</span>
            </h2>
            <p style={{fontSize:'14px', color:'#52525b', maxWidth:'380px', margin:'0 auto', lineHeight:1.8}}>
              AdminZero runs completely locally. No complex cloud setup. No DevOps required.
            </p>
          </div>

          <div style={{display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'20px', maxWidth:'860px', margin:'0 auto'}}>
            {[
              { n:'01', title:'Download & Install', desc:'Grab the installer for your OS — Windows, macOS, or Linux. Double-click to install. Takes under 2 minutes.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> },
              { n:'02', title:'Connect Your Database', desc:"Paste your DB credentials into AdminZero's secure vault. They're encrypted with your OS keychain and never sent anywhere.", icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
              { n:'03', title:'Activate the Gateway', desc:'AdminZero now intercepts every query your AI sends. Dangerous queries are blocked in real-time before they execute.', icon:<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
            ].map(({ n, title, desc, icon }) => (
              <div key={n} className="glass" style={{padding:'28px', position:'relative'}}>
                {/* Step indicator + icon */}
                <div style={{display:'flex', alignItems:'center', gap:'12px', marginBottom:'20px'}}>
                  <div className="step-num">{n}</div>
                  <div className="icon-box" style={{width:'36px', height:'36px', borderRadius:'10px'}}>{icon}</div>
                </div>
                <h3 style={{fontSize:'14px', fontWeight:700, color:'#f4f4f5', marginBottom:'10px', fontFamily:"'Space Grotesk', sans-serif"}}>{title}</h3>
                <p style={{fontSize:'12px', color:'#52525b', lineHeight:1.8}}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{margin:'0 24px'}} />

        {/* ── DOWNLOAD CENTER ── */}
        <section id="download" className="section" style={{maxWidth:'1100px', margin:'0 auto', padding:'96px 24px'}}>
          <div style={{textAlign:'center', marginBottom:'64px'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'16px'}}>
              <span className="section-label">// Download Center</span>
            </div>
            <h2 style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 14px'}}>
              Pick Your <span className="grad-text-mixed">Platform</span>
            </h2>
            <p style={{fontSize:'14px', color:'#52525b', maxWidth:'360px', margin:'0 auto', lineHeight:1.8}}>
              All versions include the full AST security firewall, local credential vault, and real-time threat dashboard.
            </p>
          </div>

          <div className="dl-grid" style={{display:'grid', gridTemplateColumns:'1fr 1.1fr 1fr', gap:'20px', maxWidth:'900px', margin:'0 auto'}}>
            {/* Windows */}
            <div className="dl-card">
              <div className="dl-icon-wrap" style={{background:'rgba(249,115,22,0.08)', border:'1px solid rgba(249,115,22,0.15)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <h3 style={{fontFamily:"'JetBrains Mono', monospace", fontSize:'13px', fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>Windows</h3>
                <p style={{fontSize:'11px', color:'#52525b', marginBottom:'3px'}}>Windows 10 / 11 · x64</p>
                <p style={{fontSize:'10px', color:'#3f3f46', fontFamily:"'JetBrains Mono', monospace"}}>.NET Runtime included</p>
              </div>
              <a href="/downloads/AdminZero-Setup.exe" download="AdminZero-Setup.exe" className="dl-btn dl-btn-ghost" style={{width:'100%'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download .EXE
              </a>
            </div>

            {/* macOS — featured */}
            <div className="dl-card dl-card-featured" style={{transform:'scale(1.03)'}}>
              <div style={{position:'absolute', top:'-13px', right:'20px', padding:'5px 14px', borderRadius:'100px', background:'linear-gradient(135deg,#f97316,#fb923c)', color:'#000', fontSize:'9px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.15em'}}>
                Most Popular
              </div>
              <div className="dl-icon-wrap" style={{background:'rgba(249,115,22,0.10)', border:'1px solid rgba(249,115,22,0.22)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
              </div>
              <div>
                <h3 style={{fontFamily:"'JetBrains Mono', monospace", fontSize:'13px', fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>macOS</h3>
                <p style={{fontSize:'11px', color:'#71717a', marginBottom:'3px'}}>Apple Silicon + Intel · Universal</p>
                <p style={{fontSize:'10px', color:'#3f3f46', fontFamily:"'JetBrains Mono', monospace"}}>macOS 12 Monterey+</p>
              </div>
              <a href="/downloads/AdminZero-Mac.dmg" download="AdminZero-Mac.dmg" className="dl-btn dl-btn-primary" style={{width:'100%'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download .DMG
              </a>
            </div>

            {/* Linux */}
            <div className="dl-card">
              <div className="dl-icon-wrap" style={{background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.14)'}}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
              </div>
              <div>
                <h3 style={{fontFamily:"'JetBrains Mono', monospace", fontSize:'13px', fontWeight:700, color:'#fff', letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:'6px'}}>Linux</h3>
                <p style={{fontSize:'11px', color:'#52525b', marginBottom:'3px'}}>Ubuntu / Debian / Arch</p>
                <p style={{fontSize:'10px', color:'#3f3f46', fontFamily:"'JetBrains Mono', monospace"}}>AppImage — no install needed</p>
              </div>
              <a href="/downloads/AdminZero-Linux.AppImage" download="AdminZero-Linux.AppImage" className="dl-btn dl-btn-ghost" style={{width:'100%', borderColor:'rgba(59,130,246,0.2)', color:'#60a5fa'}}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download .AppImage
              </a>
            </div>
          </div>

          {/* SmartScreen note */}
          <div style={{textAlign:'center', marginTop:'32px', padding:'14px 20px', borderRadius:'12px', background:'rgba(251,191,36,0.04)', border:'1px solid rgba(251,191,36,0.1)', maxWidth:'580px', margin:'32px auto 0'}}>
            <p style={{fontSize:'11px', color:'#71717a', fontFamily:"'JetBrains Mono', monospace", lineHeight:1.8}}>
              <span style={{color:'#fbbf24'}}>⚠ Windows SmartScreen:</span> If a warning appears, click <strong style={{color:'#a1a1aa'}}>"More info" → "Run anyway"</strong>. This is standard for new unsigned apps. AdminZero is fully safe.
            </p>
          </div>
        </section>

        <div className="divider" style={{margin:'0 24px'}} />

        {/* ── FEATURES ── */}
        <section className="section" style={{maxWidth:'1100px', margin:'0 auto', padding:'96px 24px'}}>
          <div style={{textAlign:'center', marginBottom:'64px'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'16px'}}>
              <span className="section-label-blue section-label">// Security Engine</span>
            </div>
            <h2 style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 14px'}}>
              Enterprise Security.<br /><span className="grad-text-blue">Zero Cloud Risk.</span>
            </h2>
          </div>

          <div className="features-grid" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px'}}>
            {[
              { title:'AST Firewall', desc:"Parses every query's abstract syntax tree before it executes — catching injections that regex can't see.", icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, accent:'orange' },
              { title:'Zero-Knowledge Vault', desc:'Credentials stored in your OS keychain. AdminZero itself cannot read your own passwords.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, accent:'blue' },
              { title:'Live Threat Monitor', desc:'See every blocked and allowed query in your local real-time dashboard with severity ratings.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, accent:'orange' },
              { title:'Offline First', desc:'AdminZero runs 100% offline. No telemetry. No cloud calls. Your data stays entirely on your machine.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, accent:'blue' },
              { title:'Stacked Query Guard', desc:'Detects and blocks multi-statement attacks — semicolon-stacked transactions that slip past basic filters.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, accent:'orange' },
              { title:'Metadata Table Shield', desc:'Automatically blocks queries targeting system tables like pg_tables, information_schema, and sqlite_master.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>, accent:'blue' },
              { title:'CTE Attack Detection', desc:'Blocks recursive WITH clause exploits that attackers use to exfiltrate row-level data.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f97316" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, accent:'orange' },
              { title:'Sub-4ms Latency', desc:'Firewall checking adds less than 4 milliseconds to any query. Completely invisible to end users.', icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>, accent:'blue' },
            ].map(({ title, desc, icon, accent }) => (
              <div key={title} className="feat-card">
                <div className="icon-box" style={accent === 'blue' ? {background:'rgba(59,130,246,0.07)', border:'1px solid rgba(59,130,246,0.14)', marginBottom:'18px'} : {marginBottom:'18px'}}>
                  {icon}
                </div>
                <h3 style={{fontSize:'13px', fontWeight:700, color:'#f4f4f5', marginBottom:'8px', fontFamily:"'Space Grotesk', sans-serif"}}>{title}</h3>
                <p style={{fontSize:'11px', color:'#52525b', lineHeight:1.8}}>{desc}</p>
              </div>
            ))}
          </div>
        </section>

        <div className="divider" style={{margin:'0 24px'}} />

        {/* ── PRICING ── */}
        <section className="section" style={{maxWidth:'1100px', margin:'0 auto', padding:'96px 24px'}}>
          <div style={{textAlign:'center', marginBottom:'64px'}}>
            <div style={{display:'flex', justifyContent:'center', marginBottom:'16px'}}>
              <span className="section-label">// Pricing</span>
            </div>
            <h2 style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'clamp(28px, 4vw, 44px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 14px'}}>
              Start Free. <span className="grad-text-orange">Scale When Ready.</span>
            </h2>
            <p style={{fontSize:'14px', color:'#52525b', maxWidth:'360px', margin:'0 auto', lineHeight:1.8}}>
              No credit card needed. Cancel anytime.
            </p>
          </div>

          <div className="pricing-grid" style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', maxWidth:'1000px', margin:'0 auto'}}>
            {[
              { name:'Developer', price:'₹0', period:'forever', badge:null, features:['Local DB support','500 queries / month','AST Firewall Core','Community Discord'], cta:'Download Free', href:'#download', featured:false },
              { name:'Startup', price:'₹2,999', period:'/ month', badge:'Popular', features:['Postgres & MySQL','50,000 queries / month','Custom blocklists','Priority email support'], cta:'Get Started', href:'/portal', featured:true },
              { name:'Scale', price:'₹14,999', period:'/ month', badge:null, features:['All databases','250,000 queries / month','Team dashboard','Dedicated support'], cta:'Upgrade Now', href:'/portal', featured:false },
              { name:'Enterprise', price:'Custom', period:'annual quote', badge:null, features:['Unlimited queries','Private VPC deployment','SLA guarantee','White-glove onboarding'], cta:'Contact Us', href:'mailto:issakrajraj@gmail.com', featured:false },
            ].map(({ name, price, period, badge, features, cta, href, featured }) => (
              <div key={name} className={`price-card ${featured ? 'price-card-featured' : ''}`} style={{gap:'24px'}}>
                {badge && (
                  <div style={{position:'absolute', top:'-12px', right:'20px', padding:'4px 12px', borderRadius:'100px', background:'linear-gradient(135deg,#f97316,#fb923c)', color:'#000', fontSize:'9px', fontWeight:900, textTransform:'uppercase', letterSpacing:'0.15em'}}>
                    {badge}
                  </div>
                )}
                <div>
                  <div style={{fontFamily:"'JetBrains Mono', monospace", fontSize:'11px', fontWeight:700, color: featured ? '#f97316' : '#52525b', letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:'12px'}}>{name}</div>
                  <div style={{display:'flex', alignItems:'baseline', gap:'6px', marginBottom:'20px'}}>
                    <span style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'28px', fontWeight:800, color:'#fff', letterSpacing:'-0.03em'}}>{price}</span>
                    <span style={{fontSize:'11px', color:'#3f3f46'}}>{period}</span>
                  </div>
                  <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:'10px', marginBottom:'24px'}}>
                    {features.map(f => (
                      <li key={f} className="check-item">
                        <div className="check-dot">
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </div>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <a href={href} className="dl-btn" style={featured ? {
                  background:'linear-gradient(135deg,#f97316,#fb923c)', color:'#000',
                  boxShadow:'0 0 24px rgba(249,115,22,0.25)', fontWeight:800
                } : {
                  background:'rgba(255,255,255,0.04)', color:'#e4e4e7',
                  border:'1px solid rgba(255,255,255,0.08)', fontWeight:700
                }}>
                  {cta}
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="section" style={{maxWidth:'840px', margin:'0 auto 96px', padding:'0 24px', textAlign:'center'}}>
          <div style={{padding:'72px 48px', borderRadius:'28px', position:'relative', overflow:'hidden', background:'rgba(249,115,22,0.05)', border:'1px solid rgba(249,115,22,0.18)', backdropFilter:'blur(24px)', boxShadow:'0 0 120px rgba(249,115,22,0.06)'}}>
            <div style={{position:'absolute', top:0, left:'20%', right:'20%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(249,115,22,0.7),transparent)'}} />
            <div style={{position:'absolute', bottom:0, left:'20%', right:'20%', height:'1px', background:'linear-gradient(90deg,transparent,rgba(59,130,246,0.4),transparent)'}} />
            {/* Big glow */}
            <div style={{position:'absolute', top:'-80px', left:'50%', transform:'translateX(-50%)', width:'400px', height:'400px', background:'radial-gradient(circle, rgba(249,115,22,0.08) 0%, transparent 70%)', pointerEvents:'none'}} />
            <div style={{position:'relative'}}>
              <h2 style={{fontFamily:"'Space Grotesk', sans-serif", fontSize:'clamp(26px, 4vw, 42px)', fontWeight:800, color:'#fff', letterSpacing:'-0.02em', margin:'0 0 16px', lineHeight:1.1}}>
                Ready to Secure Your<br /><span className="grad-text-orange">AI Database Access?</span>
              </h2>
              <p style={{fontSize:'14px', color:'#52525b', marginBottom:'36px', lineHeight:1.8}}>
                Join hundreds of developers who protect their databases with AdminZero every day. Free to start. No credit card.
              </p>
              <a href="#download" className="btn-primary" style={{margin:'0 auto', display:'inline-flex'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download AdminZero Free
              </a>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
}

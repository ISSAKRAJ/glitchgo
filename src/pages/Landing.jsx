"use client";
import React, { useState, useEffect } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { supabase } from '../lib/supabase';

export default function Landing() {
  const [reviewForm, setReviewForm] = useState({ name: '', role: '', text: '', rating: 5 });
  const [reviews, setReviews] = useState([]);
  const [submitState, setSubmitState] = useState('idle'); // idle | loading | success | error
  const [reviewMsg, setReviewMsg] = useState('');

  // Load reviews from Supabase on mount
  useEffect(() => {
    loadReviews();
  }, []);

  const loadReviews = async () => {
    try {
      const { data, error } = await supabase
        .from('reviews')
        .select('*')
        .eq('approved', true)
        .order('created_at', { ascending: false })
        .limit(6);
      if (!error && data) setReviews(data);
    } catch (e) {
      // silently fail if table doesn't exist yet
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewForm.text.trim() || reviewForm.text.trim().length < 20) {
      setReviewMsg('Please write at least 20 characters.');
      return;
    }
    setSubmitState('loading');
    setReviewMsg('');
    try {
      const { error } = await supabase.from('reviews').insert([{
        name: reviewForm.name.trim() || 'Anonymous',
        role: reviewForm.role.trim() || '',
        text: reviewForm.text.trim(),
        rating: reviewForm.rating,
        approved: false, // admin must approve
      }]);
      if (error) throw error;
      setSubmitState('success');
      setReviewMsg('Thank you! Your review is pending approval and will appear shortly.');
      setReviewForm({ name: '', role: '', text: '', rating: 5 });
    } catch {
      setSubmitState('error');
      setReviewMsg('Something went wrong. Please try again.');
    }
  };

  const starLabel = ['', 'Poor', 'Fair', 'Good', 'Great', 'Excellent'];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .lr * { box-sizing: border-box; margin: 0; padding: 0; }
        .lr {
          font-family: 'Inter', sans-serif;
          background: #040404;
          color: #d4d4d8;
          overflow-x: hidden;
          min-height: 100vh;
        }

        /* ── PALETTE — dimmed orange ── */
        :root {
          --o: #ea6c12;         /* primary orange — dimmer */
          --o2: #f08030;        /* hover orange */
          --og: rgba(234,108,18,0.10);
          --og-glow: rgba(234,108,18,0.14);
          --b: #3b82f6;
          --bg: rgba(59,130,246,0.08);
          --surf: rgba(255,255,255,0.022);
          --surf-h: rgba(255,255,255,0.042);
          --bdr: rgba(255,255,255,0.055);
          --bdr-h: rgba(255,255,255,0.09);
        }

        /* ── BACKGROUND ── */
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

        /* ── SECTION WRAPPER ── */
        .sec { position: relative; z-index: 10; }
        .inner { max-width: 1100px; margin: 0 auto; padding: 0 24px; }

        /* ── DIVIDER ── */
        .div-line {
          height: 1px; background: linear-gradient(90deg, transparent, rgba(234,108,18,0.08), rgba(59,130,246,0.06), transparent);
          margin: 0 24px;
        }

        /* ── SECTION LABEL ── */
        .sec-label {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 5px 12px; border-radius: 100px;
          background: var(--og); border: 1px solid rgba(234,108,18,0.15);
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700; letter-spacing: 0.16em;
          text-transform: uppercase; color: var(--o2);
        }
        .sec-label-b { background: var(--bg); border-color: rgba(59,130,246,0.15); color: #60a5fa; }

        /* ── HEADINGS ── */
        .h2 {
          font-family: 'Space Grotesk', sans-serif;
          font-size: clamp(26px, 3.5vw, 40px);
          font-weight: 800; color: #fff; letter-spacing: -0.025em; line-height: 1.1;
        }
        .grad-o {
          background: linear-gradient(120deg, #ea6c12, #f08030, #f5a050);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .grad-b { background: linear-gradient(120deg, #60a5fa, #818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .grad-m { background: linear-gradient(120deg, #ea6c12, #f08030, #818cf8, #60a5fa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* ── GLASS CARD ── */
        .glass {
          background: var(--surf); border: 1px solid var(--bdr);
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border-radius: 18px; position: relative; overflow: hidden;
          transition: border-color 0.3s, background 0.3s, transform 0.3s, box-shadow 0.3s;
        }
        .glass::before {
          content: ''; position: absolute; top: 0; left: 12%; right: 12%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,108,18,0.2), rgba(59,130,246,0.12), transparent);
        }
        .glass:hover {
          background: var(--surf-h); border-color: var(--bdr-h);
          transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,0,0,0.35);
        }

        /* ── PRIMARY BTN ── */
        .btn-p {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px; border-radius: 13px;
          background: linear-gradient(135deg, #ea6c12, #f08030);
          color: #fff; font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em;
          text-decoration: none; border: none; cursor: pointer;
          box-shadow: 0 0 28px rgba(234,108,18,0.22), 0 2px 0 rgba(255,255,255,0.1) inset;
          transition: all 0.25s ease; position: relative; overflow: hidden;
        }
        .btn-p::after { content: ''; position: absolute; inset: 0; background: linear-gradient(135deg,rgba(255,255,255,0.12),transparent); opacity: 0; transition: opacity 0.2s; }
        .btn-p:hover { transform: translateY(-2px) scale(1.02); box-shadow: 0 0 44px rgba(234,108,18,0.38), 0 8px 24px rgba(0,0,0,0.4); }
        .btn-p:hover::after { opacity: 1; }
        .btn-p:active { transform: scale(0.97); }

        .btn-g {
          display: inline-flex; align-items: center; gap: 9px;
          padding: 14px 28px; border-radius: 13px;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07);
          color: #a1a1aa; font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em;
          text-decoration: none; cursor: pointer; backdrop-filter: blur(10px);
          transition: all 0.2s;
        }
        .btn-g:hover { background: rgba(255,255,255,0.055); border-color: rgba(255,255,255,0.11); color: #fff; }

        /* ── ICON BOX ── */
        .ib { display: flex; align-items: center; justify-content: center; border-radius: 11px; }
        .ib-o { background: var(--og); border: 1px solid rgba(234,108,18,0.15); color: var(--o2); }
        .ib-b { background: var(--bg); border: 1px solid rgba(59,130,246,0.14); color: #60a5fa; }

        /* ── MARQUEE ── */
        .mq-wrap { overflow: hidden; }
        .mq-track { display: flex; gap: 56px; width: max-content; animation: mq 32s linear infinite; }
        @keyframes mq { from { transform:translateX(0); } to { transform:translateX(-50%); } }
        .mq-item {
          display: inline-flex; align-items: center; gap: 8px; white-space: nowrap;
          font-family: 'JetBrains Mono', monospace; font-size: 10px; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.14em; color: rgba(255,255,255,0.18);
        }
        .mq-dot { width: 3px; height: 3px; border-radius: 50%; background: var(--o); opacity: 0.5; flex-shrink: 0; }

        /* ── FADE UP ── */
        @keyframes fu { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        .fu { animation: fu 0.7s ease forwards; }
        .d1{animation-delay:0.05s;opacity:0;} .d2{animation-delay:0.18s;opacity:0;}
        .d3{animation-delay:0.3s;opacity:0;} .d4{animation-delay:0.42s;opacity:0;}

        /* ── PULSE DOT ── */
        @keyframes pd { 0%,100%{box-shadow:0 0 0 0 rgba(234,108,18,0.4);} 70%{box-shadow:0 0 0 7px rgba(234,108,18,0);} }
        .pdot { animation: pd 2.2s ease-out infinite; }

        /* ── DOWNLOAD CARDS ── */
        .dl-card {
          padding: 32px 24px; border-radius: 22px; display: flex; flex-direction: column;
          align-items: center; text-align: center; gap: 20px;
          backdrop-filter: blur(24px); position: relative; overflow: hidden;
          background: var(--surf); border: 1px solid var(--bdr);
          transition: all 0.35s cubic-bezier(0.34,1.3,0.64,1);
        }
        .dl-card::before {
          content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg,transparent,rgba(234,108,18,0.25),transparent);
        }
        .dl-card:hover {
          transform: translateY(-5px);
          border-color: rgba(234,108,18,0.18);
          background: rgba(234,108,18,0.03);
          box-shadow: 0 16px 48px rgba(0,0,0,0.45), 0 0 28px rgba(234,108,18,0.05);
        }
        .dl-icon {
          width: 68px; height: 68px; border-radius: 20px;
          display: flex; align-items: center; justify-content: center;
          background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06);
        }
        .dl-btn {
          width: 100%; padding: 12px 18px; border-radius: 11px;
          display: flex; align-items: center; justify-content: center; gap: 7px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em;
          text-decoration: none; cursor: pointer; transition: all 0.22s ease;
          border: none;
        }
        .dl-btn-p { background: linear-gradient(135deg,#ea6c12,#f08030); color: #fff; box-shadow: 0 0 18px rgba(234,108,18,0.2); }
        .dl-btn-p:hover { box-shadow: 0 0 32px rgba(234,108,18,0.35); transform: scale(1.02); }
        .dl-btn-s { background: rgba(0,0,0,0.3); color: #a1a1aa; border: 1px solid var(--bdr); }
        .dl-btn-s:hover { background: rgba(255,255,255,0.04); border-color: rgba(234,108,18,0.2); color: #f08030; }

        /* ── FEATURE CARD ── */
        .feat {
          padding: 24px 22px; border-radius: 18px;
          background: var(--surf); border: 1px solid var(--bdr);
          backdrop-filter: blur(18px); position: relative; overflow: hidden;
          transition: all 0.28s ease;
        }
        .feat::before {
          content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg,transparent,rgba(234,108,18,0.18),rgba(59,130,246,0.1),transparent);
        }
        .feat:hover { background: var(--surf-h); border-color: rgba(234,108,18,0.14); transform: translateY(-3px); box-shadow: 0 10px 40px rgba(0,0,0,0.35); }

        /* ── STAT ── */
        .stat {
          padding: 24px 20px; border-radius: 16px; text-align: center;
          background: var(--surf); border: 1px solid var(--bdr);
          backdrop-filter: blur(18px); position: relative; overflow: hidden;
        }
        .stat::before { content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg,transparent,rgba(234,108,18,0.2),transparent); }

        /* ── PRICING CARD ── */
        .price {
          padding: 30px 26px; border-radius: 20px; display: flex; flex-direction: column;
          gap: 20px; background: var(--surf); border: 1px solid var(--bdr);
          backdrop-filter: blur(20px); position: relative; overflow: hidden;
          transition: all 0.28s ease;
        }
        .price::before { content: ''; position: absolute; top: 0; left: 10%; right: 10%; height: 1px; background: linear-gradient(90deg,transparent,rgba(255,255,255,0.07),transparent); }
        .price:hover { transform: translateY(-3px); box-shadow: 0 12px 48px rgba(0,0,0,0.4); }
        .price-hot { background: rgba(234,108,18,0.042); border: 1.5px solid rgba(234,108,18,0.2); }
        .price-hot::before { background: linear-gradient(90deg,transparent,rgba(234,108,18,0.5),transparent); }

        /* ── CHECK LIST ── */
        .chk { display: flex; align-items: center; gap: 9px; font-size: 11px; color: #71717a; }
        .chk-dot { width: 15px; height: 15px; border-radius: 50%; background: var(--og); border: 1px solid rgba(234,108,18,0.2); display: flex; align-items: center; justify-content: center; flex-shrink: 0; }

        /* ── REVIEW SECTION ── */
        .review-card {
          padding: 26px; border-radius: 18px;
          background: var(--surf); border: 1px solid var(--bdr);
          backdrop-filter: blur(18px); position: relative; overflow: hidden;
        }
        .review-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg,transparent,rgba(234,108,18,0.2),transparent); }

        .review-form-wrap {
          padding: 36px; border-radius: 22px; position: relative; overflow: hidden;
          background: rgba(234,108,18,0.03); border: 1px solid rgba(234,108,18,0.12);
          backdrop-filter: blur(24px);
          box-shadow: 0 0 80px rgba(234,108,18,0.04);
        }
        .review-form-wrap::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px; background: linear-gradient(90deg,transparent,rgba(234,108,18,0.4),transparent); }

        .form-input {
          width: 100%; padding: 12px 16px; border-radius: 11px;
          background: rgba(0,0,0,0.35); border: 1px solid var(--bdr);
          color: #e4e4e7; font-family: 'Inter', sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .form-input:focus { border-color: rgba(234,108,18,0.35); box-shadow: 0 0 0 3px rgba(234,108,18,0.07); }
        .form-input::placeholder { color: #3f3f46; }

        .form-label {
          display: block; font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.12em; color: #52525b; margin-bottom: 6px;
          font-family: 'JetBrains Mono', monospace;
        }

        .star-btn {
          background: none; border: none; cursor: pointer; padding: 3px;
          font-size: 22px; transition: transform 0.15s;
        }
        .star-btn:hover { transform: scale(1.2); }

        /* ── EMPTY REVIEWS STATE ── */
        .empty-state {
          text-align: center; padding: 48px 24px;
          color: #3f3f46; font-size: 13px;
        }
        .empty-state svg { margin: 0 auto 14px; display: block; opacity: 0.25; }

        /* ── CTA SECTION ── */
        .cta-box {
          padding: 64px 48px; border-radius: 26px; text-align: center;
          position: relative; overflow: hidden;
          background: rgba(234,108,18,0.04); border: 1px solid rgba(234,108,18,0.14);
          backdrop-filter: blur(24px); box-shadow: 0 0 100px rgba(234,108,18,0.04);
        }
        .cta-box::before { content: ''; position: absolute; top: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg,transparent,rgba(234,108,18,0.5),transparent); }
        .cta-box::after { content: ''; position: absolute; bottom: 0; left: 20%; right: 20%; height: 1px; background: linear-gradient(90deg,transparent,rgba(59,130,246,0.25),transparent); }
      `}</style>

      <div className="lr">
        {/* BACKGROUNDS */}
        <div className="bg-wrap">
          <div className="orb o1" /><div className="orb o2" /><div className="orb o3" />
        </div>
        <div className="bg-grid" />

        <Navbar />

        {/* ══════════════════════════════════════
            HERO
        ══════════════════════════════════════ */}
        <section className="sec" style={{paddingTop:'156px', paddingBottom:'72px', textAlign:'center'}}>
          <div className="inner">

            {/* Badge */}
            <div className="fu d1" style={{display:'flex', justifyContent:'center', marginBottom:'26px'}}>
              <div style={{display:'inline-flex', alignItems:'center', gap:'9px', padding:'7px 16px', borderRadius:'100px', background:'rgba(234,108,18,0.06)', border:'1px solid rgba(234,108,18,0.14)', backdropFilter:'blur(10px)'}}>
                <span className="pdot" style={{width:'7px',height:'7px',borderRadius:'50%',background:'var(--o)',display:'block',flexShrink:0}} />
                <span style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',fontWeight:700,color:'var(--o2)',letterSpacing:'0.16em',textTransform:'uppercase'}}>
                  AdminZero v2.4 — Windows · macOS · Linux
                </span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="fu d2" style={{
              fontFamily:"'Space Grotesk',sans-serif",
              fontSize:'clamp(40px,6.5vw,82px)',
              fontWeight:800, lineHeight:1.0, letterSpacing:'-0.03em',
              color:'#fff', margin:'0 0 22px'
            }}>
              The Firewall That<br />
              <span className="grad-m">Thinks Before Your AI.</span>
            </h1>

            <p className="fu d3" style={{fontSize:'clamp(13px,1.8vw,16px)',color:'#52525b',maxWidth:'480px',margin:'0 auto 36px',lineHeight:1.8,fontWeight:400}}>
              AdminZero runs locally on your machine — intercepting every query your AI sends and blocking injections before they reach your database.
            </p>

            <div className="fu d4" style={{display:'flex',gap:'12px',justifyContent:'center',flexWrap:'wrap',marginBottom:'52px'}}>
              <a href="#download" className="btn-p">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Download Free
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
              <a href="/guide" className="btn-g">
                How It Works
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </a>
            </div>

            {/* Trust row */}
            <div style={{display:'flex',alignItems:'center',justifyContent:'center',gap:'28px',flexWrap:'wrap'}}>
              {['100% Local — data never leaves your machine','Free tier — no credit card','Sub-4ms query interception'].map(t => (
                <div key={t} style={{display:'flex',alignItems:'center',gap:'6px',fontSize:'11px',color:'#3f3f46',fontWeight:500}}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="var(--o)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Marquee */}
        <div className="mq-wrap" style={{borderTop:'1px solid rgba(255,255,255,0.035)',borderBottom:'1px solid rgba(255,255,255,0.035)',padding:'16px 0',background:'rgba(0,0,0,0.28)',backdropFilter:'blur(8px)',position:'relative',zIndex:10}}>
          <div className="mq-track">
            {[...Array(2)].fill(['AST Query Firewall','Zero-Knowledge Vault','Sub-4ms Latency','Offline-First','AES-256 Encryption','Stacked Query Guard','Live Threat Monitor','CTE Attack Shield','Enterprise Ready']).flat().map((t,i)=>(
              <div key={i} className="mq-item"><span className="mq-dot"/>{t}<span className="mq-dot"/></div>
            ))}
          </div>
        </div>

        {/* ══ STATS ══ */}
        <section className="sec" style={{padding:'72px 0'}}>
          <div className="inner">
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
              {[
                {v:'< 4ms',l:'Query Interception',c:'var(--o2)'},
                {v:'100%',l:'Local Processing',c:'#60a5fa'},
                {v:'27/27',l:'Security Tests Passed',c:'var(--o2)'},
                {v:'0 Leaks',l:'Cloud Data Exposure',c:'#60a5fa'},
              ].map(({v,l,c})=>(
                <div key={l} className="stat">
                  <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'30px',fontWeight:800,color:c,letterSpacing:'-0.03em',marginBottom:'6px'}}>{v}</div>
                  <div style={{fontSize:'10px',color:'#3f3f46',fontWeight:500,lineHeight:1.5,fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.04em'}}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ HOW IT WORKS ══ */}
        <section className="sec" style={{padding:'88px 0'}}>
          <div className="inner">
            <div style={{textAlign:'center',marginBottom:'56px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><span className="sec-label">// How It Works</span></div>
              <h2 className="h2">Setup in <span className="grad-o">Under 2 Minutes</span></h2>
              <p style={{fontSize:'13px',color:'#3f3f46',marginTop:'12px',maxWidth:'340px',margin:'12px auto 0',lineHeight:1.8}}>No cloud setup. No DevOps. Just install, connect, and protect.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'16px',maxWidth:'840px',margin:'0 auto'}}>
              {[
                {n:'01',t:'Download & Install',d:'Grab the installer for your OS. Double-click to install in under 2 minutes.',
                  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>},
                {n:'02',t:'Connect Your Database',d:'Paste your DB credentials. They are encrypted by your OS keychain and never leave your machine.',
                  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>},
                {n:'03',t:'Activate the Gateway',d:'AdminZero now intercepts every query your AI sends — blocking dangerous ones in real-time.',
                  icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>},
              ].map(({n,t,d,icon})=>(
                <div key={n} className="glass" style={{padding:'26px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'18px'}}>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'10px',fontWeight:700,color:'rgba(234,108,18,0.45)',padding:'5px 9px',borderRadius:'8px',background:'var(--og)',border:'1px solid rgba(234,108,18,0.14)'}}>{n}</div>
                    <div className="ib ib-o" style={{width:'34px',height:'34px'}}>{icon}</div>
                  </div>
                  <h3 style={{fontSize:'13px',fontWeight:700,color:'#f4f4f5',marginBottom:'9px',fontFamily:"'Space Grotesk',sans-serif"}}>{t}</h3>
                  <p style={{fontSize:'11px',color:'#3f3f46',lineHeight:1.8}}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ DOWNLOAD CENTER ══ */}
        <section id="download" className="sec" style={{padding:'88px 0'}}>
          <div className="inner">
            <div style={{textAlign:'center',marginBottom:'56px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><span className="sec-label">// Download</span></div>
              <h2 className="h2">Choose Your <span className="grad-m">Platform</span></h2>
              <p style={{fontSize:'13px',color:'#3f3f46',marginTop:'12px',maxWidth:'400px',margin:'12px auto 0',lineHeight:1.8}}>Create a free account to download. Your license key is auto-generated and usage is tracked from day one.</p>
            </div>

            <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'18px',maxWidth:'860px',margin:'0 auto'}}>
              {/* Windows */}
              <div className="dl-card">
                <div className="dl-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--o2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>
                </div>
                <div>
                  <h3 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'5px'}}>Windows</h3>
                  <p style={{fontSize:'10px',color:'#3f3f46',marginBottom:'2px'}}>Windows 10 / 11 · x64</p>
                  <p style={{fontSize:'9px',color:'#27272a',fontFamily:"'JetBrains Mono',monospace"}}>.NET Runtime included</p>
                </div>
                <a href="/signup?next=/portal" className="dl-btn dl-btn-s" style={{width:'100%'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Sign Up to Download
                </a>
              </div>

              {/* macOS */}
              <div className="dl-card">
                <div className="dl-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="var(--o2)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>
                </div>
                <div>
                  <h3 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'5px'}}>macOS</h3>
                  <p style={{fontSize:'10px',color:'#3f3f46',marginBottom:'2px'}}>Apple Silicon + Intel · Universal</p>
                  <p style={{fontSize:'9px',color:'#27272a',fontFamily:"'JetBrains Mono',monospace"}}>macOS 12 Monterey+</p>
                </div>
                <a href="/signup?next=/portal" className="dl-btn dl-btn-p" style={{width:'100%'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Sign Up to Download
                </a>
              </div>

              {/* Linux */}
              <div className="dl-card">
                <div className="dl-icon">
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 17 10 11 4 5"/><line x1="12" y1="19" x2="20" y2="19"/></svg>
                </div>
                <div>
                  <h3 style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'12px',fontWeight:700,color:'#fff',letterSpacing:'0.08em',textTransform:'uppercase',marginBottom:'5px'}}>Linux</h3>
                  <p style={{fontSize:'10px',color:'#3f3f46',marginBottom:'2px'}}>Ubuntu / Debian / Arch</p>
                  <p style={{fontSize:'9px',color:'#27272a',fontFamily:"'JetBrains Mono',monospace"}}>AppImage — no install needed</p>
                </div>
                <a href="/signup?next=/portal" className="dl-btn dl-btn-s" style={{width:'100%',borderColor:'rgba(59,130,246,0.16)',color:'#60a5fa'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
                  Sign Up to Download
                </a>
              </div>
            </div>

            {/* Auth gate note */}
            <div style={{textAlign:'center',marginTop:'28px',padding:'16px 20px',borderRadius:'12px',background:'rgba(234,108,18,0.04)',border:'1px solid rgba(234,108,18,0.1)',maxWidth:'540px',margin:'28px auto 0'}}>
              <p style={{fontSize:'11px',color:'#52525b',fontFamily:"'JetBrains Mono',monospace",lineHeight:1.9}}>
                <span style={{color:'rgba(234,108,18,0.7)'}}>🔑 Free account required.</span> Sign up in 30 seconds — your license key and download links appear instantly in your <a href="/portal" style={{color:'#ea6c12',textDecoration:'none',fontWeight:700}}>Client Portal</a>.
              </p>
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ FEATURES ══ */}
        <section className="sec" style={{padding:'88px 0'}}>
          <div className="inner">
            <div style={{textAlign:'center',marginBottom:'56px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><span className="sec-label sec-label-b">// Security Engine</span></div>
              <h2 className="h2">Enterprise Security.<br /><span className="grad-b">Zero Cloud Risk.</span></h2>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px'}}>
              {[
                {t:'AST Firewall',d:"Parses every query's abstract syntax tree — catching injections regex can't see.",ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,b:false},
                {t:'Zero-Knowledge Vault',d:'Credentials stored in your OS keychain. AdminZero itself cannot read your passwords.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>,b:true},
                {t:'Live Threat Monitor',d:'Every blocked injection logged in real-time with severity rating and query details.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>,b:false},
                {t:'Offline First',d:'100% offline operation. No telemetry, no cloud calls. Your data stays on your machine.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,b:true},
                {t:'Stacked Query Guard',d:'Detects semicolon-stacked transaction attacks that slip past basic query filters.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,b:false},
                {t:'Metadata Shield',d:'Blocks queries targeting system tables — pg_tables, information_schema, sqlite_master.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,b:true},
                {t:'CTE Attack Detection',d:'Blocks recursive WITH clause exploits used to exfiltrate row-level data.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>,b:false},
                {t:'Sub-4ms Latency',d:'Firewall check adds under 4ms to any query — completely invisible to end users.',ic:<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>,b:true},
              ].map(({t,d,ic,b})=>(
                <div key={t} className="feat">
                  <div className={`ib ${b?'ib-b':'ib-o'}`} style={{width:'38px',height:'38px',marginBottom:'16px'}}>{ic}</div>
                  <h3 style={{fontSize:'12px',fontWeight:700,color:'#f4f4f5',marginBottom:'7px',fontFamily:"'Space Grotesk',sans-serif"}}>{t}</h3>
                  <p style={{fontSize:'10px',color:'#3f3f46',lineHeight:1.8}}>{d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ PRICING ══ */}
        <section className="sec" style={{padding:'88px 0'}}>
          <div className="inner">
            <div style={{textAlign:'center',marginBottom:'56px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><span className="sec-label">// Pricing</span></div>
              <h2 className="h2">Start Free. <span className="grad-o">Scale When Ready.</span></h2>
              <p style={{fontSize:'13px',color:'#3f3f46',marginTop:'12px'}}>No credit card. Cancel anytime.</p>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'14px',maxWidth:'980px',margin:'0 auto'}}>
              {[
                {n:'Developer',p:'₹0',pd:'forever',f:['Local DB support','500 queries / mo','AST Firewall Core','Community Discord'],cta:'Download Free',href:'#download',hot:false},
                {n:'Startup',p:'₹2,999',pd:'/ month',f:['Postgres & MySQL','50,000 queries / mo','Custom blocklists','Email support'],cta:'Get Started',href:'/portal',hot:true},
                {n:'Scale',p:'₹14,999',pd:'/ month',f:['All databases','250,000 queries / mo','Team dashboard','Priority support'],cta:'Upgrade Now',href:'/portal',hot:false},
                {n:'Enterprise',p:'Custom',pd:'annual quote',f:['Unlimited queries','Private VPC deploy','SLA guarantee','Dedicated support'],cta:'Contact Us',href:'mailto:issakrajraj@gmail.com',hot:false},
              ].map(({n,p,pd,f,cta,href,hot})=>(
                <div key={n} className={`price ${hot?'price-hot':''}`}>
                  <div>
                    <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',fontWeight:700,letterSpacing:'0.14em',textTransform:'uppercase',color:hot?'var(--o2)':'#3f3f46',marginBottom:'10px'}}>{n}</div>
                    <div style={{display:'flex',alignItems:'baseline',gap:'5px',marginBottom:'18px'}}>
                      <span style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'26px',fontWeight:800,color:'#fff',letterSpacing:'-0.03em'}}>{p}</span>
                      <span style={{fontSize:'10px',color:'#27272a'}}>{pd}</span>
                    </div>
                    <ul style={{listStyle:'none',display:'flex',flexDirection:'column',gap:'9px',marginBottom:'20px'}}>
                      {f.map(i=>(
                        <li key={i} className="chk">
                          <div className="chk-dot"><svg viewBox="0 0 24 24" width="8" height="8" fill="none" stroke="var(--o2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></div>
                          {i}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <a href={href} className="dl-btn" style={hot?{background:'linear-gradient(135deg,#ea6c12,#f08030)',color:'#fff',boxShadow:'0 0 18px rgba(234,108,18,0.2)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:800,fontSize:'11px',letterSpacing:'0.07em',textTransform:'uppercase',textDecoration:'none',justifyContent:'center'}:{background:'rgba(255,255,255,0.03)',color:'#71717a',border:'1px solid var(--bdr)',fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:'11px',letterSpacing:'0.07em',textTransform:'uppercase',textDecoration:'none',justifyContent:'center'}}>
                    {cta}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ REVIEWS ══ */}
        <section className="sec" style={{padding:'88px 0'}}>
          <div className="inner">
            <div style={{textAlign:'center',marginBottom:'56px'}}>
              <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}><span className="sec-label sec-label-b">// Community</span></div>
              <h2 className="h2">What Developers <span className="grad-o">Are Saying</span></h2>
              <p style={{fontSize:'13px',color:'#3f3f46',marginTop:'12px',maxWidth:'360px',margin:'12px auto 0',lineHeight:1.8}}>Real reviews from real users. No paid placements, no fake quotes.</p>
            </div>

            {/* Approved reviews grid */}
            {reviews.length > 0 ? (
              <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:'14px',marginBottom:'56px'}}>
                {reviews.map(r => (
                  <div key={r.id} className="review-card">
                    {/* Stars */}
                    <div style={{display:'flex',gap:'2px',marginBottom:'12px'}}>
                      {[1,2,3,4,5].map(s=>(
                        <span key={s} style={{fontSize:'14px',color:s<=r.rating?'#f59e0b':'#27272a'}}>★</span>
                      ))}
                    </div>
                    {/* Review text */}
                    <p style={{fontSize:'12px',color:'#71717a',lineHeight:1.8,marginBottom:'16px',fontStyle:'italic'}}>"{r.text}"</p>
                    {/* Author */}
                    <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                      <div style={{width:'32px',height:'32px',borderRadius:'50%',background:'var(--og)',border:'1px solid rgba(234,108,18,0.15)',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:"'Space Grotesk',sans-serif",fontSize:'12px',fontWeight:700,color:'var(--o2)',flexShrink:0}}>
                        {(r.name||'A')[0].toUpperCase()}
                      </div>
                      <div>
                        <div style={{fontSize:'11px',fontWeight:700,color:'#d4d4d8'}}>{r.name || 'Anonymous'}</div>
                        {r.role && <div style={{fontSize:'9px',color:'#3f3f46',fontFamily:"'JetBrains Mono',monospace",letterSpacing:'0.06em'}}>{r.role}</div>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state" style={{marginBottom:'56px'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                <p style={{fontSize:'13px',color:'#3f3f46',marginBottom:'4px'}}>No reviews yet — be the first!</p>
                <p style={{fontSize:'11px',color:'#27272a'}}>Your review goes live after a quick approval.</p>
              </div>
            )}

            {/* ── REVIEW FORM ── */}
            <div style={{maxWidth:'600px',margin:'0 auto'}}>
              <div className="review-form-wrap">
                <div style={{marginBottom:'28px'}}>
                  <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'18px',fontWeight:800,color:'#fff',marginBottom:'6px'}}>Leave a Review</h3>
                  <p style={{fontSize:'12px',color:'#3f3f46',lineHeight:1.7}}>Share your honest experience with AdminZero. Reviews are checked before going live — usually within 24 hours.</p>
                </div>

                <form onSubmit={handleReviewSubmit} style={{display:'flex',flexDirection:'column',gap:'18px'}}>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
                    <div>
                      <label className="form-label">Your Name <span style={{color:'#27272a'}}>(optional)</span></label>
                      <input className="form-input" placeholder="e.g. Rahul M." value={reviewForm.name} onChange={e=>setReviewForm(f=>({...f,name:e.target.value}))} maxLength={60} />
                    </div>
                    <div>
                      <label className="form-label">Your Role <span style={{color:'#27272a'}}>(optional)</span></label>
                      <input className="form-input" placeholder="e.g. Backend Developer" value={reviewForm.role} onChange={e=>setReviewForm(f=>({...f,role:e.target.value}))} maxLength={80} />
                    </div>
                  </div>

                  {/* Star rating */}
                  <div>
                    <label className="form-label">Rating</label>
                    <div style={{display:'flex',alignItems:'center',gap:'4px'}}>
                      {[1,2,3,4,5].map(s=>(
                        <button key={s} type="button" className="star-btn" onClick={()=>setReviewForm(f=>({...f,rating:s}))}>
                          <span style={{color:s<=reviewForm.rating?'#f59e0b':'#27272a',fontSize:'24px'}}>★</span>
                        </button>
                      ))}
                      <span style={{fontSize:'11px',color:'#52525b',marginLeft:'8px',fontFamily:"'JetBrains Mono',monospace"}}>{starLabel[reviewForm.rating]}</span>
                    </div>
                  </div>

                  {/* Text */}
                  <div>
                    <label className="form-label">Your Review <span style={{color:'#ea6c12'}}>*</span></label>
                    <textarea
                      className="form-input"
                      rows={4}
                      placeholder="Tell us how AdminZero has helped you, what you liked, or what could be improved..."
                      value={reviewForm.text}
                      onChange={e=>setReviewForm(f=>({...f,text:e.target.value}))}
                      maxLength={600}
                      style={{resize:'vertical',minHeight:'100px'}}
                      required
                    />
                    <div style={{textAlign:'right',fontSize:'9px',color:'#27272a',marginTop:'4px',fontFamily:"'JetBrains Mono',monospace"}}>{reviewForm.text.length}/600</div>
                  </div>

                  {/* Message */}
                  {reviewMsg && (
                    <div style={{padding:'11px 14px',borderRadius:'10px',fontSize:'11px',lineHeight:1.7,
                      background: submitState==='success'?'rgba(34,197,94,0.05)':'rgba(239,68,68,0.05)',
                      border: `1px solid ${submitState==='success'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'}`,
                      color: submitState==='success'?'#4ade80':'#f87171'
                    }}>
                      {reviewMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="btn-p"
                    disabled={submitState==='loading'||submitState==='success'}
                    style={{alignSelf:'flex-start',opacity:(submitState==='loading'||submitState==='success')?0.6:1,cursor:(submitState==='loading'||submitState==='success')?'not-allowed':'pointer'}}
                  >
                    {submitState==='loading' ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{animation:'spin 1s linear infinite'}}><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>Submitting...</>
                    ) : submitState==='success' ? (
                      <><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>Submitted!</>
                    ) : (
                      <>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
                        Submit Review
                      </>
                    )}
                  </button>
                </form>

                <p style={{fontSize:'10px',color:'#27272a',marginTop:'16px',fontFamily:"'JetBrains Mono',monospace",lineHeight:1.7}}>
                  🔒 Reviews are moderated. No spam, no fake entries — only real user experiences are published.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="div-line" />

        {/* ══ FINAL CTA ══ */}
        <section className="sec" style={{padding:'88px 0'}}>
          <div className="inner" style={{maxWidth:'760px'}}>
            <div className="cta-box">
              <div style={{position:'absolute',top:'-60px',left:'50%',transform:'translateX(-50%)',width:'360px',height:'360px',background:'radial-gradient(circle,rgba(234,108,18,0.06) 0%,transparent 70%)',pointerEvents:'none'}} />
              <div style={{position:'relative'}}>
                <h2 className="h2" style={{marginBottom:'14px'}}>
                  Secure Your Database.<br /><span className="grad-o">Start Free Today.</span>
                </h2>
                <p style={{fontSize:'13px',color:'#3f3f46',marginBottom:'32px',lineHeight:1.8}}>
                  Join developers who trust AdminZero to protect their databases from AI-driven attacks. No cloud. No subscription required to start.
                </p>
                <a href="#download" className="btn-p" style={{margin:'0 auto',display:'inline-flex'}}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  Download AdminZero Free
                </a>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </div>

      <style>{`@keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }`}</style>
    </>
  );
}

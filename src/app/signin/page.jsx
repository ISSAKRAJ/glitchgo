"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SigninPage() {
  const router = useRouter();

  const next = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('next') || '/portal'
    : '/portal';

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) router.push(next);
    });
  }, [router, next]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setIsLoading(true);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) { setError(signInError.message); }
      else { setSuccess('Authenticated! Redirecting…'); setTimeout(() => router.push(next), 900); }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally { setIsLoading(false); }
  };

  const handleGoogle = async () => {
    setError(''); setIsLoading(true);
    try {
      const origin = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://www.glitchgo.tech')
        : 'https://www.glitchgo.tech';
      const { error: oErr } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (oErr) throw oErr;
    } catch (err) {
      setError(err.message || 'Failed to initialize Google login.');
      setIsLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .auth-root {
          min-height: 100vh; background: #040404; display: flex;
          align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; padding: 24px; overflow: hidden;
          position: relative;
        }
        .auth-root * { box-sizing: border-box; margin: 0; padding: 0; }

        /* BG orbs */
        .a-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .a-orb1 { width: 700px; height: 700px; top: -200px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(234,108,18,0.07) 0%, transparent 65%);
          filter: blur(100px); }
        .a-orb2 { width: 500px; height: 500px; bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%);
          filter: blur(110px); }
        .a-orb3 { width: 350px; height: 350px; bottom: -80px; left: -80px;
          background: radial-gradient(circle, rgba(234,108,18,0.05) 0%, transparent 65%);
          filter: blur(90px); }
        .a-grid { position: fixed; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 10%, transparent 100%); }

        /* CARD */
        .auth-card {
          width: 100%; max-width: 420px; position: relative; z-index: 10;
          background: rgba(255,255,255,0.022);
          border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border-radius: 24px; padding: 36px 32px;
          box-shadow: 0 0 0 1px rgba(234,108,18,0.06), 0 24px 80px rgba(0,0,0,0.6);
          animation: cardIn 0.4s cubic-bezier(0.34,1.2,0.64,1);
        }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
        .auth-card::before {
          content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,108,18,0.35), rgba(59,130,246,0.15), transparent);
          border-radius: 1px;
        }

        /* LOGO */
        .auth-logo { display: inline-flex; margin-bottom: 6px; text-decoration: none; }
        .auth-logo-badge { padding: 1.5px; border-radius: 11px; background: linear-gradient(135deg, rgba(234,108,18,0.7), rgba(59,130,246,0.4)); }
        .auth-logo-inner { background: #040404; padding: 6px 13px; border-radius: 9px; display: flex; align-items: center; }
        .auth-logo-g { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
        .auth-logo-o { font-family: 'Space Grotesk', sans-serif; font-size: 18px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ea6c12, #f08030);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        /* LABELS */
        .auth-form-label {
          display: block; font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700; letter-spacing: 0.14em;
          text-transform: uppercase; color: #3f3f46; margin-bottom: 7px;
        }

        /* INPUTS */
        .auth-input-wrap { position: relative; }
        .auth-input-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #3f3f46; pointer-events: none; display: flex; }
        .auth-input-toggle { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: #3f3f46; display: flex; padding: 2px; transition: color 0.15s; }
        .auth-input-toggle:hover { color: #71717a; }
        .auth-input {
          width: 100%; padding: 11px 40px 11px 40px;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 11px; color: #e4e4e7; font-family: 'Inter', sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .auth-input:focus { border-color: rgba(234,108,18,0.35); box-shadow: 0 0 0 3px rgba(234,108,18,0.07); }
        .auth-input::placeholder { color: #27272a; }
        .auth-input:disabled { opacity: 0.5; cursor: not-allowed; }

        /* GOOGLE BTN */
        .auth-google {
          width: 100%; padding: 11px 16px; border-radius: 11px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a1a1aa; font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 700; cursor: pointer; display: flex;
          align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; letter-spacing: 0.02em;
        }
        .auth-google:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); color: #fff; }
        .auth-google:disabled { opacity: 0.5; cursor: not-allowed; }

        /* DIVIDER */
        .auth-divider { display: flex; align-items: center; gap: 10px; margin: 4px 0; }
        .auth-divider-line { flex: 1; height: 1px; background: rgba(255,255,255,0.045); }
        .auth-divider-text { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #27272a; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }

        /* SUBMIT BTN */
        .auth-submit {
          width: 100%; padding: 12px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #ea6c12, #f08030);
          color: #fff; font-family: 'Space Grotesk', sans-serif;
          font-size: 13px; font-weight: 800; letter-spacing: 0.04em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 24px rgba(234,108,18,0.22), 0 2px 0 rgba(255,255,255,0.1) inset;
          transition: all 0.22s; position: relative; overflow: hidden;
        }
        .auth-submit:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 38px rgba(234,108,18,0.38), 0 6px 20px rgba(0,0,0,0.4); }
        .auth-submit:active:not(:disabled) { transform: scale(0.98); }
        .auth-submit:disabled { opacity: 0.6; cursor: not-allowed; }

        /* ALERTS */
        .auth-error {
          padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 9px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.14);
          font-size: 12px; color: #f87171; line-height: 1.6;
        }
        .auth-success {
          padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 9px;
          background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.14);
          font-size: 12px; color: #4ade80; font-weight: 600;
        }

        /* SPIN */
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="auth-root">
        <div className="a-orb a-orb1" /><div className="a-orb a-orb2" /><div className="a-orb a-orb3" />
        <div className="a-grid" />

        <div style={{width:'100%',maxWidth:'420px',display:'flex',flexDirection:'column',alignItems:'center',gap:'28px',position:'relative',zIndex:10}}>

          {/* LOGO + HEADING */}
          <div style={{textAlign:'center'}}>
            <a href="/" className="auth-logo">
              <div className="auth-logo-badge">
                <div className="auth-logo-inner">
                  <span className="auth-logo-g">Glitch</span>
                  <span className="auth-logo-o">Go</span>
                </div>
              </div>
            </a>
            <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'22px',fontWeight:800,color:'#fff',letterSpacing:'-0.025em',marginTop:'16px',marginBottom:'6px'}}>
              Welcome back
            </h1>
            <p style={{fontSize:'12px',color:'#3f3f46',lineHeight:1.7}}>
              Sign in to access your AdminZero portal
            </p>
          </div>

          {/* CARD */}
          <div className="auth-card">

            {/* Alerts */}
            {error && (
              <div className="auth-error" style={{marginBottom:'20px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}
            {success && (
              <div className="auth-success" style={{marginBottom:'20px'}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                {success}
              </div>
            )}

            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>

              {/* Google */}
              <button className="auth-google" onClick={handleGoogle} disabled={isLoading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.883-6.435-6.435s2.88-6.435 6.435-6.435c1.638 0 3.136.612 4.28 1.62l3.05-3.05C19.23 2.38 15.93 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.53 0 11.24-4.59 11.24-11.24 0-.785-.09-1.54-.25-2.285H12.24z"/></svg>
                Continue with Google
              </button>

              {/* Divider */}
              <div className="auth-divider">
                <div className="auth-divider-line" />
                <span className="auth-divider-text">or with email</span>
                <div className="auth-divider-line" />
              </div>

              {/* Form */}
              <form onSubmit={handleSignin} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
                {/* Email */}
                <div>
                  <label className="auth-form-label">Email Address</label>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    </span>
                    <input className="auth-input" type="email" placeholder="you@company.com" value={email} onChange={e=>setEmail(e.target.value)} disabled={isLoading} autoComplete="email" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'7px'}}>
                    <label className="auth-form-label" style={{margin:0}}>Password</label>
                  </div>
                  <div className="auth-input-wrap">
                    <span className="auth-input-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                    </span>
                    <input className="auth-input" type={showPass?'text':'password'} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)} disabled={isLoading} autoComplete="current-password" />
                    <button type="button" className="auth-input-toggle" onClick={()=>setShowPass(s=>!s)} tabIndex={-1}>
                      {showPass
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <button type="submit" className="auth-submit" disabled={isLoading} style={{marginTop:'4px'}}>
                  {isLoading && !success
                    ? <><svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>Signing in…</>
                    : <>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                        Sign In to AdminZero
                      </>
                  }
                </button>
              </form>

              {/* Switch to signup */}
              <div style={{borderTop:'1px solid rgba(255,255,255,0.045)',paddingTop:'16px',textAlign:'center'}}>
                <span style={{fontSize:'12px',color:'#3f3f46'}}>Don't have an account? </span>
                <Link href={next !== '/' ? `/signup?next=${encodeURIComponent(next)}` : '/signup'} style={{fontSize:'12px',fontWeight:700,color:'#ea6c12',textDecoration:'none',transition:'color 0.15s'}}
                  onMouseOver={e=>e.target.style.color='#f08030'} onMouseOut={e=>e.target.style.color='#ea6c12'}>
                  Create one free →
                </Link>
              </div>
            </div>
          </div>

          {/* Bottom links */}
          <div style={{display:'flex',gap:'20px',fontSize:'11px',color:'#27272a'}}>
            <Link href="/privacy" style={{color:'#27272a',textDecoration:'none',transition:'color 0.15s'}} onMouseOver={e=>e.target.style.color='#52525b'} onMouseOut={e=>e.target.style.color='#27272a'}>Privacy Policy</Link>
            <span>·</span>
            <Link href="/terms" style={{color:'#27272a',textDecoration:'none',transition:'color 0.15s'}} onMouseOver={e=>e.target.style.color='#52525b'} onMouseOut={e=>e.target.style.color='#27272a'}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </>
  );
}

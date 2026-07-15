"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const router = useRouter();

  const next = typeof window !== 'undefined'
    ? new URLSearchParams(window.location.search).get('next') || '/portal'
    : '/portal';

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [confirmPassword, setConfirm] = useState('');
  const [isLoading, setIsLoading]     = useState(false);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [showPass, setShowPass]       = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setIsLoading(true);
    try {
      const origin = typeof window !== 'undefined'
        ? (window.location.hostname === 'localhost' ? window.location.origin : 'https://www.glitchgo.tech')
        : 'https://www.glitchgo.tech';
      const { data, error: signUpError } = await supabase.auth.signUp({
        email, password,
        options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` }
      });
      if (signUpError) { setError(signUpError.message); }
      else if (data?.session) {
        setSuccess('Account created! Redirecting to your portal…');
        setTimeout(() => router.push(next), 900);
      } else {
        setSuccess('Account created! Check your email to confirm, then sign in.');
        setEmail(''); setPassword(''); setConfirm('');
      }
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
      setError(err.message || 'Failed to initialize Google signup.');
      setIsLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 6 ? 1
    : password.length < 10 ? 2
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabel = ['', 'Too short', 'Weak', 'Good', 'Strong'];
  const strengthColor = ['', '#ef4444', '#f59e0b', '#22c55e', '#3b82f6'];
  const confirmOk = confirmPassword.length > 0 && confirmPassword === password;
  const confirmBad = confirmPassword.length > 0 && confirmPassword !== password;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Grotesk:wght@600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .su-root {
          min-height: 100vh; background: #040404;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Inter', sans-serif; padding: 24px;
          overflow: hidden; position: relative; color: #d4d4d8;
        }
        .su-orb { position: fixed; border-radius: 50%; pointer-events: none; }
        .su-orb1 { width: 700px; height: 700px; top: -200px; left: 50%; transform: translateX(-50%);
          background: radial-gradient(circle, rgba(234,108,18,0.07) 0%, transparent 65%); filter: blur(100px); }
        .su-orb2 { width: 500px; height: 500px; bottom: -100px; right: -100px;
          background: radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%); filter: blur(110px); }
        .su-orb3 { width: 350px; height: 350px; bottom: -80px; left: -80px;
          background: radial-gradient(circle, rgba(234,108,18,0.05) 0%, transparent 65%); filter: blur(90px); }
        .su-grid { position: fixed; inset: 0; pointer-events: none;
          background-image: linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px);
          background-size: 64px 64px;
          mask-image: radial-gradient(ellipse 80% 60% at 50% 20%, black 10%, transparent 100%); }

        .su-wrap { width: 100%; max-width: 420px; display: flex; flex-direction: column; align-items: center; gap: 28px; position: relative; z-index: 10; }

        .su-logo { display: inline-flex; text-decoration: none; }
        .su-logo-badge { padding: 1.5px; border-radius: 11px; background: linear-gradient(135deg, rgba(234,108,18,0.8), rgba(59,130,246,0.5)); }
        .su-logo-inner { background: #040404; padding: 6px 14px; border-radius: 9px; display: flex; align-items: center; }
        .su-logo-g { font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 800; color: #fff; letter-spacing: -0.03em; }
        .su-logo-o { font-family: 'Space Grotesk', sans-serif; font-size: 19px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ea6c12, #f08030);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }

        .su-card {
          width: 100%; background: rgba(255,255,255,0.022); border: 1px solid rgba(255,255,255,0.06);
          backdrop-filter: blur(28px); -webkit-backdrop-filter: blur(28px);
          border-radius: 24px; padding: 36px 32px;
          box-shadow: 0 0 0 1px rgba(234,108,18,0.06), 0 24px 80px rgba(0,0,0,0.6);
          position: relative; overflow: hidden;
          animation: cardIn 0.4s cubic-bezier(0.34,1.2,0.64,1);
        }
        .su-card::before { content: ''; position: absolute; top: 0; left: 15%; right: 15%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,108,18,0.4), rgba(59,130,246,0.15), transparent); }
        @keyframes cardIn { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }

        .su-inner { display: flex; flex-direction: column; gap: 14px; }

        .su-err { padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 9px;
          background: rgba(239,68,68,0.06); border: 1px solid rgba(239,68,68,0.14);
          font-size: 12px; color: #f87171; line-height: 1.6; margin-bottom: 4px; }
        .su-ok  { padding: 11px 14px; border-radius: 10px; display: flex; align-items: center; gap: 9px;
          background: rgba(34,197,94,0.06); border: 1px solid rgba(34,197,94,0.14);
          font-size: 12px; color: #4ade80; font-weight: 600; margin-bottom: 4px; }

        .su-google { width: 100%; padding: 11px 16px; border-radius: 11px;
          background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08);
          color: #a1a1aa; font-family: 'Space Grotesk', sans-serif; font-size: 12px; font-weight: 700;
          cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 10px;
          transition: all 0.2s; letter-spacing: 0.02em; }
        .su-google:hover { background: rgba(255,255,255,0.07); border-color: rgba(255,255,255,0.12); color: #fff; }
        .su-google:disabled { opacity: 0.5; cursor: not-allowed; }

        .su-div { display: flex; align-items: center; gap: 10px; }
        .su-div-line { flex: 1; height: 1px; background: rgba(255,255,255,0.045); }
        .su-div-txt { font-family: 'JetBrains Mono', monospace; font-size: 9px; color: #27272a; letter-spacing: 0.12em; text-transform: uppercase; white-space: nowrap; }

        .su-lbl { display: block; font-family: 'JetBrains Mono', monospace; font-size: 9px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: #3f3f46; margin-bottom: 7px; }

        .su-field { position: relative; }
        .su-icon { position: absolute; left: 13px; top: 50%; transform: translateY(-50%); color: #3f3f46; pointer-events: none; display: flex; }
        .su-eye { position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: #3f3f46; display: flex; padding: 2px; transition: color 0.15s; }
        .su-eye:hover { color: #71717a; }
        .su-input { width: 100%; padding: 11px 40px;
          background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.06);
          border-radius: 11px; color: #e4e4e7; font-family: 'Inter', sans-serif; font-size: 13px;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        .su-input:focus { border-color: rgba(234,108,18,0.35); box-shadow: 0 0 0 3px rgba(234,108,18,0.07); }
        .su-input::placeholder { color: #27272a; }
        .su-input:disabled { opacity: 0.5; cursor: not-allowed; }
        .su-input-ok  { border-color: rgba(34,197,94,0.3) !important; }
        .su-input-bad { border-color: rgba(239,68,68,0.3) !important; }

        .su-btn { width: 100%; padding: 12px; border-radius: 11px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #ea6c12, #f08030); color: #fff;
          font-family: 'Space Grotesk', sans-serif; font-size: 13px; font-weight: 800; letter-spacing: 0.04em;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          box-shadow: 0 0 24px rgba(234,108,18,0.22), 0 2px 0 rgba(255,255,255,0.1) inset;
          transition: all 0.22s; margin-top: 4px; }
        .su-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 0 38px rgba(234,108,18,0.4), 0 8px 24px rgba(0,0,0,0.4); }
        .su-btn:active:not(:disabled) { transform: scale(0.98); }
        .su-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .su-switch { border-top: 1px solid rgba(255,255,255,0.045); padding-top: 16px; text-align: center; font-size: 12px; color: #3f3f46; }
        .su-switch a { color: #ea6c12; text-decoration: none; font-weight: 700; }
        .su-switch a:hover { color: #f08030; }

        .su-footer { display: flex; gap: 20px; font-size: 11px; }
        .su-footer a { color: #27272a; text-decoration: none; }
        .su-footer a:hover { color: #52525b; }

        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>

      <div className="su-root">
        <div className="su-orb su-orb1" />
        <div className="su-orb su-orb2" />
        <div className="su-orb su-orb3" />
        <div className="su-grid" />

        <div className="su-wrap">
          <div style={{ textAlign: 'center' }}>
            <a href="/" className="su-logo">
              <div className="su-logo-badge">
                <div className="su-logo-inner">
                  <span className="su-logo-g">Glitch</span>
                  <span className="su-logo-o">Go</span>
                </div>
              </div>
            </a>
            <h1 style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '22px', fontWeight: 800, color: '#fff', letterSpacing: '-0.025em', marginTop: '16px', marginBottom: '6px' }}>
              Create your account
            </h1>
            <p style={{ fontSize: '12px', color: '#3f3f46', lineHeight: 1.7 }}>
              Free forever — no credit card required
            </p>
          </div>

          <div className="su-card">
            {error   && <div className="su-err"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{error}</div>}
            {success && <div className="su-ok"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>{success}</div>}

            <div className="su-inner">
              <button className="su-google" onClick={handleGoogle} disabled={isLoading}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.883-6.435-6.435s2.88-6.435 6.435-6.435c1.638 0 3.136.612 4.28 1.62l3.05-3.05C19.23 2.38 15.93 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.53 0 11.24-4.59 11.24-11.24 0-.785-.09-1.54-.25-2.285H12.24z"/></svg>
                Continue with Google
              </button>

              <div className="su-div"><div className="su-div-line"/><span className="su-div-txt">or register with email</span><div className="su-div-line"/></div>

              <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {/* Email */}
                <div>
                  <label className="su-lbl">Email Address</label>
                  <div className="su-field">
                    <span className="su-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></span>
                    <input className="su-input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} disabled={isLoading} autoComplete="email" />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="su-lbl">Password</label>
                  <div className="su-field">
                    <span className="su-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg></span>
                    <input className="su-input" type={showPass ? 'text' : 'password'} placeholder="Minimum 6 characters" value={password} onChange={e => setPassword(e.target.value)} disabled={isLoading} autoComplete="new-password" />
                    <button type="button" className="su-eye" onClick={() => setShowPass(s => !s)} tabIndex={-1} aria-label="Toggle password">
                      {showPass
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                  {password.length > 0 && (
                    <div style={{ marginTop: '7px' }}>
                      <div style={{ display: 'flex', gap: '3px', marginBottom: '4px' }}>
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: i <= strength ? strengthColor[strength] : 'rgba(255,255,255,0.07)', transition: 'background 0.25s' }} />
                        ))}
                      </div>
                      <span style={{ fontSize: '9px', fontFamily: "'JetBrains Mono',monospace", color: strengthColor[strength], letterSpacing: '0.1em' }}>{strengthLabel[strength]}</span>
                    </div>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="su-lbl">Confirm Password</label>
                  <div className="su-field">
                    <span className="su-icon"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></span>
                    <input
                      className={`su-input ${confirmOk ? 'su-input-ok' : ''} ${confirmBad ? 'su-input-bad' : ''}`}
                      type={showConfirm ? 'text' : 'password'}
                      placeholder="Re-enter password"
                      value={confirmPassword}
                      onChange={e => setConfirm(e.target.value)}
                      disabled={isLoading}
                      autoComplete="new-password"
                    />
                    <button type="button" className="su-eye" onClick={() => setShowConfirm(s => !s)} tabIndex={-1} aria-label="Toggle confirm password">
                      {showConfirm
                        ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                        : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                      }
                    </button>
                  </div>
                </div>

                <button type="submit" className="su-btn" disabled={isLoading}>
                  {isLoading && !success
                    ? <><svg className="spin" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>Creating account…</>
                    : <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>Create Free Account</>
                  }
                </button>
              </form>

              <div className="su-switch">
                Already have an account?{' '}
                <Link href={next !== '/' ? `/signin?next=${encodeURIComponent(next)}` : '/signin'}>Sign in →</Link>
              </div>
            </div>
          </div>

          <div className="su-footer">
            <Link href="/privacy">Privacy Policy</Link>
            <span style={{ color: '#27272a' }}>·</span>
            <Link href="/terms">Terms of Service</Link>
          </div>
        </div>
      </div>
    </>
  );
}

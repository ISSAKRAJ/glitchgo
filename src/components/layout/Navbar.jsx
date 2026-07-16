"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';

export default function Navbar() {
  const [user, setUser] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) setUser(session.user);
    };
    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session ? session.user : null);
    });

    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  const isSuperAdmin = user?.email === 'issakrajraj@gmail.com';

  const navLinks = [
    { label: 'Product', href: '/' },
    { label: 'Guide', href: '/guide' },
    { label: 'Console', href: '/adminzero' },
  ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        /* ── ANNOUNCEMENT BANNER ── */
        .nav-banner {
          position: relative; z-index: 60;
          background: linear-gradient(90deg, rgba(249,115,22,0.08) 0%, rgba(9,9,9,0.95) 20%, rgba(9,9,9,0.95) 80%, rgba(59,130,246,0.06) 100%);
          border-bottom: 1px solid rgba(249,115,22,0.1);
          overflow: hidden; padding: 9px 0;
        }
        .nav-banner::before {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, rgba(249,115,22,0.06), transparent 30%, transparent 70%, rgba(59,130,246,0.04));
          pointer-events: none;
        }
        .banner-track {
          display: flex; gap: 64px; width: max-content;
          animation: bannerScroll 28s linear infinite;
        }
        @keyframes bannerScroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .banner-item {
          display: inline-flex; align-items: center; gap: 10px;
          font-family: 'JetBrains Mono', monospace; font-size: 10px;
          font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase;
          white-space: nowrap; color: rgba(255,255,255,0.28);
        }
        .banner-item .label {
          color: #f97316;
          display: flex; align-items: center; gap: 6px;
        }
        .banner-sep { width: 3px; height: 3px; border-radius: 50%; background: rgba(249,115,22,0.4); }

        /* ── MAIN NAV ── */
        .main-nav {
          position: fixed; top: 0; left: 0; right: 0; z-index: 50;
          transition: all 0.35s cubic-bezier(0.4,0,0.2,1);
        }
        .nav-inner {
          position: relative;
          background: rgba(3,3,3,0.75);
          backdrop-filter: blur(28px) saturate(180%);
          -webkit-backdrop-filter: blur(28px) saturate(180%);
          border-bottom: 1px solid rgba(255,255,255,0.055);
          transition: all 0.35s ease;
        }
        .nav-inner.scrolled {
          background: rgba(3,3,3,0.92);
          border-bottom-color: rgba(249,115,22,0.1);
          box-shadow: 0 1px 0 rgba(249,115,22,0.08), 0 8px 32px rgba(0,0,0,0.6);
        }
        /* Subtle top glow line */
        .nav-inner::after {
          content: '';
          position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(249,115,22,0.3), rgba(59,130,246,0.15), transparent);
          pointer-events: none;
        }

        .nav-container {
          max-width: 1200px; margin: 0 auto;
          padding: 0 28px; height: 72px;
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px;
        }

        /* ── LOGO ── */
        .nav-logo {
          display: flex; align-items: center; gap: 12px;
          cursor: pointer; text-decoration: none; flex-shrink: 0;
          user-select: none;
        }
        .logo-badge {
          position: relative; padding: 1.5px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(249,115,22,0.7), rgba(59,130,246,0.5));
          transition: all 0.3s ease;
        }
        .logo-badge:hover {
          background: linear-gradient(135deg, #f97316, #60a5fa);
          box-shadow: 0 0 20px rgba(249,115,22,0.35), 0 0 40px rgba(59,130,246,0.15);
        }
        .logo-inner {
          background: #030303; padding: 6px 12px; border-radius: 9px;
          display: flex; align-items: center; gap: 1px;
        }
        .logo-glitch {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px; font-weight: 800; color: #fff; letter-spacing: -0.03em;
        }
        .logo-go {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 17px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #f97316, #fb923c);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }
        .logo-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700; color: rgba(255,255,255,0.2);
          letter-spacing: 0.18em; text-transform: uppercase;
          padding-left: 10px; border-left: 1px solid rgba(255,255,255,0.08);
          transition: color 0.3s;
        }
        .nav-logo:hover .logo-sub { color: rgba(249,115,22,0.5); }

        /* ── NAV LINKS ── */
        .nav-links {
          display: flex; align-items: center; gap: 2px;
          flex: 1; justify-content: center;
        }
        .nav-link {
          position: relative; padding: 8px 14px; border-radius: 10px;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 12px; font-weight: 600; letter-spacing: 0.04em;
          color: rgba(255,255,255,0.45); text-decoration: none;
          transition: all 0.2s ease; cursor: pointer;
          text-transform: uppercase;
        }
        .nav-link:hover { color: #fff; background: rgba(255,255,255,0.05); }
        .nav-link::after {
          content: ''; position: absolute; bottom: 4px; left: 50%; right: 50%;
          height: 1.5px; border-radius: 2px;
          background: linear-gradient(90deg, #f97316, #fb923c);
          transition: all 0.25s ease; opacity: 0;
        }
        .nav-link:hover::after { left: 14px; right: 14px; opacity: 1; }

        .nav-link-orange {
          color: #f97316; font-weight: 700;
        }
        .nav-link-orange:hover { color: #fb923c; background: rgba(249,115,22,0.06); }
        .nav-link-orange::after { background: linear-gradient(90deg, #f97316, #fbbf24); }

        .nav-link-red {
          color: rgba(248,113,113,0.8); font-weight: 700;
        }
        .nav-link-red:hover { color: #f87171; background: rgba(248,113,113,0.06); }
        .nav-link-red::after { background: #f87171; }

        /* ── DIVIDER ── */
        .nav-divider {
          width: 1px; height: 20px;
          background: linear-gradient(180deg, transparent, rgba(255,255,255,0.1), transparent);
          flex-shrink: 0;
        }

        /* ── USER EMAIL ── */
        .user-email {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: rgba(255,255,255,0.2);
          max-width: 110px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
          letter-spacing: 0.04em;
        }

        /* ── SIGN OUT BTN ── */
        .btn-signout {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 10px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.1em; color: rgba(255,255,255,0.3);
          background: none; border: none; cursor: pointer; padding: 6px 10px;
          border-radius: 8px; transition: all 0.2s ease;
        }
        .btn-signout:hover { color: #f87171; background: rgba(248,113,113,0.06); }

        /* ── AUTH LINKS ── */
        .btn-signin {
          font-family: 'Space Grotesk', sans-serif;
          font-size: 11px; font-weight: 600; text-transform: uppercase;
          letter-spacing: 0.08em; color: rgba(255,255,255,0.4);
          text-decoration: none; padding: 7px 12px; border-radius: 8px;
          transition: all 0.2s ease;
        }
        .btn-signin:hover { color: #fff; background: rgba(255,255,255,0.05); }

        /* ── DOWNLOAD BUTTON ── */
        .btn-download {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 20px; border-radius: 12px;
          background: linear-gradient(135deg, #f97316, #fb923c);
          color: #000; font-family: 'Space Grotesk', sans-serif;
          font-size: 11px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.08em; text-decoration: none;
          box-shadow: 0 0 28px rgba(249,115,22,0.3), 0 2px 0 rgba(255,255,255,0.12) inset;
          border: none; cursor: pointer; flex-shrink: 0;
          transition: all 0.25s cubic-bezier(0.34,1.56,0.64,1);
          position: relative; overflow: hidden;
        }
        .btn-download::before {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.18), transparent);
          opacity: 0; transition: opacity 0.2s;
        }
        .btn-download:hover {
          transform: translateY(-2px) scale(1.03);
          box-shadow: 0 0 48px rgba(249,115,22,0.5), 0 8px 24px rgba(0,0,0,0.4);
        }
        .btn-download:hover::before { opacity: 1; }
        .btn-download:active { transform: scale(0.97); }

        /* ── MOBILE MENU TOGGLE ── */
        .mobile-toggle {
          display: none; background: none; border: 1px solid rgba(255,255,255,0.08);
          border-radius: 10px; width: 38px; height: 38px;
          align-items: center; justify-content: center;
          cursor: pointer; color: rgba(255,255,255,0.5);
          transition: all 0.2s; flex-shrink: 0;
          backdrop-filter: blur(8px);
        }
        .mobile-toggle:hover { border-color: rgba(249,115,22,0.3); color: #f97316; background: rgba(249,115,22,0.05); }

        /* ── MOBILE MENU ── */
        .mobile-menu {
          display: none; flex-direction: column; gap: 4px;
          padding: 16px 20px 20px; border-top: 1px solid rgba(255,255,255,0.05);
          background: rgba(3,3,3,0.97); backdrop-filter: blur(28px);
        }
        .mobile-menu.open { display: flex; }
        .mobile-link {
          padding: 11px 14px; border-radius: 10px; font-family: 'Space Grotesk', sans-serif;
          font-size: 13px; font-weight: 600; color: rgba(255,255,255,0.5);
          text-decoration: none; letter-spacing: 0.04em; transition: all 0.2s;
          border: 1px solid transparent;
        }
        .mobile-link:hover { color: #fff; background: rgba(255,255,255,0.04); border-color: rgba(255,255,255,0.07); }

        /* ── NAV BADGE (PORTAL) ── */
        .nav-badge {
          display: inline-flex; align-items: center; justify-content: center;
          width: 6px; height: 6px; border-radius: 50%;
          background: #f97316; margin-left: 4px;
          animation: navPulse 2s ease-in-out infinite;
        }
        @keyframes navPulse {
          0%,100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* responsive */
        @media (max-width: 900px) {
          .nav-links { display: none; }
          .nav-right { display: none; }
          .mobile-toggle { display: flex; }
        }
      `}</style>

      {/* ── WRAPPER (pushes content down) ── */}
      <div style={{height: '109px'}} /> {/* banner(38px) + navbar(72px) */}

      {/* ────────────────────────────────────────
          ANNOUNCEMENT BANNER
      ──────────────────────────────────────── */}
      <div className="nav-banner" style={{position:'fixed', top:0, left:0, right:0, zIndex:60}}>
        <div className="banner-track">
          {[...Array(2)].fill([
            { label: '🚀 AdminZero v2.4', text: 'Now live on Windows, macOS & Linux' },
            { label: '⚡ Sub-4ms Firewall', text: 'Real-time AST query protection' },
            { label: '🔒 Zero-Knowledge', text: 'Your credentials never leave your machine' },
            { label: '🆓 Free to Start', text: 'No credit card required' },
          ]).flat().map((item, i) => (
            <div key={i} className="banner-item">
              <span className="label">{item.label}</span>
              <span className="banner-sep" />
              <span>{item.text}</span>
              <span className="banner-sep" />
            </div>
          ))}
        </div>
      </div>

      {/* ────────────────────────────────────────
          MAIN NAV
      ──────────────────────────────────────── */}
      <nav className="main-nav" style={{top:'37px'}}>
        <div className={`nav-inner ${scrolled ? 'scrolled' : ''}`}>
          <div className="nav-container">

            {/* LOGO */}
            <a className="nav-logo" href="/" onClick={e => { e.preventDefault(); window.location.href='/'; }}>
              <div className="logo-badge">
                <div className="logo-inner">
                  <span className="logo-glitch">Glitch</span>
                  <span className="logo-go">Go</span>
                </div>
              </div>
              <span className="logo-sub">AdminZero</span>
            </a>

            {/* CENTER LINKS */}
            <div className="nav-links">
              {navLinks.map(({ label, href }) => (
                <a key={label} href={href} className="nav-link">{label}</a>
              ))}

              {user ? (
                <a href="/portal" className="nav-link nav-link-orange">
                  Portal
                  <span className="nav-badge" />
                </a>
              ) : (
                <a href="/signin?next=/portal" className="nav-link">Portal</a>
              )}

              {isSuperAdmin && (
                <a href="/portal?tab=admin" className="nav-link nav-link-red">Admin</a>
              )}
            </div>

            {/* RIGHT SIDE */}
            <div className="nav-right" style={{display:'flex', alignItems:'center', gap:'10px', flexShrink:0}}>
              <div className="nav-divider" />

              {user ? (
                <>
                  <span className="user-email">{user.email}</span>
                  <button className="btn-signout" onClick={handleSignOut}>Sign Out</button>
                </>
              ) : (
                <>
                  <a href="/signin" className="btn-signin">Sign In</a>
                </>
              )}

              <a
                href="/signup?next=/portal"
                className="btn-download"
                onClick={e => {
                  if (window.location.pathname === '/') {
                    e.preventDefault();
                    document.getElementById('download')?.scrollIntoView({ behavior: 'smooth' });
                  } else {
                    window.location.href = '/signup?next=/portal';
                  }
                }}
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Download App
              </a>
            </div>

            {/* MOBILE TOGGLE */}
            <button className="mobile-toggle" onClick={() => setMobileOpen(o => !o)} aria-label="Menu">
              {mobileOpen ? (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
              )}
            </button>
          </div>

          {/* MOBILE MENU */}
          <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`}>
            {navLinks.map(({ label, href }) => (
              <a key={label} href={href} className="mobile-link">{label}</a>
            ))}
            <a href={user ? '/portal' : '/signin?next=/portal'} className="mobile-link" style={{color:'#f97316'}}>
              Client Portal {user && '↗'}
            </a>
            {isSuperAdmin && <a href="/portal?tab=admin" className="mobile-link" style={{color:'#f87171'}}>Admin Panel</a>}
            <div style={{height:'1px', background:'rgba(255,255,255,0.05)', margin:'8px 0'}} />
            {user ? (
              <button className="mobile-link btn-signout" style={{textAlign:'left', width:'100%', display:'block', color:'#f87171'}} onClick={handleSignOut}>Sign Out</button>
            ) : (
              <a href="/signin" className="mobile-link">Sign In</a>
            )}
            <a href="/signup?next=/portal" className="btn-download" style={{marginTop:'8px', justifyContent:'center'}}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Download Free
            </a>
          </div>
        </div>
      </nav>
    </>
  );
}

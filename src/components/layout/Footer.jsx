import React from 'react';
import Link from 'next/link';

export default function Footer() {
  const year = new Date().getFullYear();

  const links = {
    Product: [
      { label: 'How It Works', href: '/guide' },
      { label: 'Test Console', href: '/adminzero' },
    ],
    Company: [
      { label: 'About GlitchGo', href: '/' },
      { label: 'Client Portal', href: '/portal' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
    Contact: [
      { label: 'teamglitchgo@gmail.com', href: 'mailto:teamglitchgo@gmail.com' },
      { label: 'issakrajraj@gmail.com', href: 'mailto:issakrajraj@gmail.com' },
    ],
  };

  return (
    <>
      <style>{`
        .footer-root {
          position: relative; z-index: 10;
          background: #030303;
          border-top: 1px solid rgba(255,255,255,0.045);
          font-family: 'Inter', sans-serif;
        }

        /* top glow line */
        .footer-root::before {
          content: '';
          position: absolute; top: 0; left: 20%; right: 20%; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(234,108,18,0.18), rgba(59,130,246,0.1), transparent);
          pointer-events: none;
        }

        .footer-inner {
          max-width: 1100px; margin: 0 auto;
          padding: 72px 28px 0;
        }

        /* ── TOP GRID ── */
        .footer-grid {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr;
          gap: 48px;
          padding-bottom: 56px;
          border-bottom: 1px solid rgba(255,255,255,0.045);
        }

        /* Brand column */
        .footer-brand {}
        .footer-logo {
          display: inline-flex; align-items: center; margin-bottom: 20px;
          cursor: pointer; text-decoration: none;
        }
        .footer-logo-badge {
          padding: 1.5px; border-radius: 10px;
          background: linear-gradient(135deg, rgba(234,108,18,0.6), rgba(59,130,246,0.4));
        }
        .footer-logo-inner {
          background: #030303; padding: 5px 11px; border-radius: 9px;
          display: flex; align-items: center; gap: 1px;
        }
        .footer-logo-glitch {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 16px; font-weight: 800; color: #fff; letter-spacing: -0.03em;
        }
        .footer-logo-go {
          font-family: 'Space Grotesk', 'Inter', sans-serif;
          font-size: 16px; font-weight: 800; letter-spacing: -0.03em;
          background: linear-gradient(135deg, #ea6c12, #f08030);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
        }

        .footer-tagline {
          font-size: 12px; color: #3f3f46; line-height: 1.8; max-width: 240px; margin-bottom: 24px;
        }

        /* MSME badge */
        .msme-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 8px 12px; border-radius: 10px;
          background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.045);
          transition: border-color 0.2s;
        }
        .msme-badge:hover { border-color: rgba(234,108,18,0.15); }
        .msme-flag { font-size: 14px; }
        .msme-text { display: flex; flex-direction: column; gap: 1px; }
        .msme-top { font-size: 8px; font-weight: 700; color: rgba(234,108,18,0.6); letter-spacing: 0.12em; text-transform: uppercase; font-family: 'JetBrains Mono', monospace; }
        .msme-num { font-size: 8px; color: #27272a; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em; }

        /* Link columns */
        .footer-col-title {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; font-weight: 700; letter-spacing: 0.18em;
          text-transform: uppercase; color: rgba(255,255,255,0.18);
          margin-bottom: 18px;
        }
        .footer-col-links {
          display: flex; flex-direction: column; gap: 11px;
          list-style: none; padding: 0;
        }
        .footer-link {
          font-size: 12px; color: #52525b; text-decoration: none;
          transition: color 0.18s; font-weight: 500; line-height: 1;
        }
        .footer-link:hover { color: #d4d4d8; }
        .footer-link-orange:hover { color: #ea6c12; }



        /* ── BOTTOM BAR ── */
        .footer-bottom {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 0 28px; flex-wrap: wrap; gap: 14px;
        }
        .footer-copy {
          font-size: 11px; color: #27272a; font-family: 'JetBrains Mono', monospace;
        }
        .footer-bottom-links {
          display: flex; align-items: center; gap: 20px;
        }
        .footer-bottom-link {
          font-size: 11px; color: #3f3f46; text-decoration: none; transition: color 0.18s;
        }
        .footer-bottom-link:hover { color: #71717a; }

        /* status dot */
        .status-dot {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 10px; color: #27272a; font-family: 'JetBrains Mono', monospace;
        }
        .status-dot::before {
          content: ''; width: 5px; height: 5px; border-radius: 50%;
          background: #22c55e; display: block;
          box-shadow: 0 0 4px rgba(34,197,94,0.5);
          animation: sp 2.5s ease-in-out infinite;
        }
        @keyframes sp { 0%,100%{opacity:1;} 50%{opacity:0.4;} }

        @media (max-width: 860px) {
          .footer-grid { grid-template-columns: 1fr 1fr; gap: 36px; }
          .footer-brand { grid-column: 1 / -1; }
        }
        @media (max-width: 520px) {
          .footer-grid { grid-template-columns: 1fr; }
          .footer-brand { grid-column: auto; }
          .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
      `}</style>

      <footer className="footer-root">
        <div className="footer-inner">

          {/* ── TOP GRID ── */}
          <div className="footer-grid">

            {/* Brand Column */}
            <div className="footer-brand">
              <a className="footer-logo" href="/">
                <div className="footer-logo-badge">
                  <div className="footer-logo-inner">
                    <span className="footer-logo-glitch">Glitch</span>
                    <span className="footer-logo-go">Go</span>
                  </div>
                </div>
              </a>

              <p className="footer-tagline">
                Cloud API Security Gateway that intercepts and blocks dangerous SQL injections from AI agents before they reach your database.
              </p>

              {/* MSME Badge */}
              <div className="msme-badge">
                <span className="msme-flag">🇮🇳</span>
                <div className="msme-text">
                  <span className="msme-top">Govt of India · MSME Registered</span>
                  <span className="msme-num">UDYAM-AP-17-0080333</span>
                </div>
              </div>


            </div>

            {/* Link Columns */}
            {Object.entries(links).map(([col, items]) => (
              <div key={col}>
                <p className="footer-col-title">{col}</p>
                <ul className="footer-col-links">
                  {items.map(({ label, href }) => (
                    <li key={label}>
                      <a
                        href={href}
                        className={`footer-link ${col === 'Contact' ? 'footer-link-orange' : ''}`}
                      >
                        {col === 'Contact' && (
                          <svg style={{display:'inline',marginRight:'5px',verticalAlign:'middle'}} width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                        )}
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── BOTTOM BAR ── */}
          <div className="footer-bottom">
            <span className="footer-copy">
              © {year} GlitchGo. All rights reserved.
            </span>

            <span className="status-dot">All systems operational</span>

            <div className="footer-bottom-links">
              <Link href="/privacy" className="footer-bottom-link">Privacy</Link>
              <Link href="/terms" className="footer-bottom-link">Terms</Link>
              <a href="mailto:teamglitchgo@gmail.com" className="footer-bottom-link">Contact</a>
            </div>
          </div>

        </div>
      </footer>
    </>
  );
}

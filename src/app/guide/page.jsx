"use client";
import React, { useState } from 'react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';

const NAV = [
  { id: 'overview',     label: 'What is AdminZero?' },
  { id: 'howitworks',  label: 'How It Works' },
  { id: 'install', label: 'Integration' },
  
  { id: 'firewall',    label: 'Cloud Security Features' },
  { id: 'threats',     label: 'Threats We Block' },
  { id: 'dashboard',   label: 'Client Portal' },
  { id: 'faq',         label: 'FAQ' },
];

export default function GuidePage() {
  const [active, setActive] = useState('overview');
  const [demoQuery, setDemoQuery] = useState("SELECT * FROM users WHERE id = 1;");
  const [demoResult, setDemoResult] = useState(null);
  const [demoLoading, setDemoLoading] = useState(false);

  const runDemo = () => {
    setDemoLoading(true);
    setDemoResult(null);
    setTimeout(() => {
      setDemoLoading(false);
      const q = demoQuery.trim().toUpperCase();
      const blocked =
        /DELETE\s|DROP\s|INSERT\s|UPDATE\s|TRUNCATE\s|ALTER\s/i.test(q) ||
        /pg_tables|information_schema|sqlite_master|pg_shadow/i.test(demoQuery) ||
        /;\s*SELECT|;\s*DROP|;\s*DELETE/i.test(demoQuery) ||
        /WITH\s+RECURSIVE/i.test(demoQuery);
      setDemoResult(blocked ? 'blocked' : 'allowed');
    }, 1100);
  };

  const threats = [
    { name: 'DELETE / DROP / TRUNCATE', ex: 'DELETE FROM users WHERE 1=1', why: 'Wipes entire tables. No AI agent should ever be able to do this.' },
    { name: 'Stacked Semicolon Attacks', ex: "SELECT 1; DROP TABLE users;", why: 'Attacker appends a destructive statement after a safe one using a semicolon.' },
    { name: 'System Table Scans', ex: 'SELECT * FROM pg_tables', why: 'Reveals your entire database schema to an attacker.' },
    { name: 'Recursive CTE Exploits', ex: 'WITH RECURSIVE x AS (...) SELECT ...', why: 'Used to exfiltrate deeply nested relational data row by row.' },
    { name: 'UNION-Based Injection', ex: "' UNION SELECT username, password FROM admins--", why: 'Merges a malicious query with a safe one to leak sensitive rows.' },
    { name: 'Metadata Exfiltration', ex: 'SELECT * FROM information_schema.tables', why: 'Maps every table and column name — first step of any serious attack.' },
  ];

  const faqs = [
    { q: 'Does AdminZero send my database credentials to the cloud?', a: 'No. Your credentials are encrypted and stored in your operating system\'s native keychain (Windows Credential Manager / macOS Keychain / Linux Secret Service). AdminZero itself cannot read them in plaintext.' },
    { q: 'Does AdminZero slow down my queries?', a: 'AdminZero adds less than 5 milliseconds of overhead (excluding LLM generation time) to any query. In practice, this is completely invisible to end users and well within acceptable latency budgets.' },
    { q: 'Will AdminZero work with my database?', a: 'AdminZero currently supports PostgreSQL, MySQL, and SQLite. Support for MSSQL and MongoDB is on the roadmap for v2.6.' },
    { q: 'What happens when a query is blocked?', a: 'The query never reaches your database. AdminZero returns a structured error response to the AI agent, logs the incident in your local threat dashboard with a timestamp and threat type, and (if configured) sends you an alert.' },
    { q: 'Can I whitelist certain query types?', a: 'Yes. The Startup and Scale plans allow you to define custom whitelist rules — for example, allowing INSERT on specific tables or specific column patterns.' },
    { q: 'Does AdminZero need an internet connection?', a: 'No. AdminZero operates as a fast Cloud API. It requires an internet connection to send queries to the Gateway. An internet connection is only needed to activate your license key on the first run.' },
      ];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Grotesk:wght@500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

        .guide-root { font-family:'Inter',sans-serif; background:#040404; color:#d4d4d8; min-height:100vh; overflow-x:hidden; }
        .guide-root * { box-sizing:border-box; margin:0; padding:0; }

        /* BG */
        .g-bg { position:fixed; inset:0; z-index:0; pointer-events:none; }
        .g-orb1 { position:absolute; width:700px; height:700px; top:-180px; left:50%; transform:translateX(-50%); background:radial-gradient(circle, rgba(234,108,18,0.06) 0%, transparent 65%); filter:blur(110px); border-radius:50%; }
        .g-orb2 { position:absolute; width:500px; height:500px; bottom:10%; right:-100px; background:radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 65%); filter:blur(100px); border-radius:50%; }
        .g-grid { position:fixed; inset:0; z-index:0; pointer-events:none; background-image:linear-gradient(rgba(255,255,255,0.013) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.013) 1px,transparent 1px); background-size:72px 72px; mask-image:radial-gradient(ellipse 80% 50% at 50% 15%, black 20%, transparent 100%); }

        /* LAYOUT */
        .guide-layout { display:grid; grid-template-columns:220px 1fr; max-width:1100px; margin:0 auto; padding:0 24px; gap:40px; position:relative; z-index:10; }

        /* SIDEBAR */
        .guide-sidebar { position:sticky; top:120px; height:fit-content; padding:24px 0; }
        .sidebar-label { font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700; letter-spacing:0.18em; text-transform:uppercase; color:#27272a; margin-bottom:12px; padding-left:12px; }
        .sidebar-link {
          display:flex; align-items:center; gap:8px; width:100%;
          padding:9px 12px; border-radius:9px; border:none; background:none; cursor:pointer;
          font-family:'Inter',sans-serif; font-size:12px; font-weight:500; color:#52525b;
          text-align:left; transition:all 0.18s; text-decoration:none;
        }
        .sidebar-link:hover { color:#d4d4d8; background:rgba(255,255,255,0.03); }
        .sidebar-link.active { color:#ea6c12; background:rgba(234,108,18,0.06); font-weight:700; }
        .sidebar-link.active::before { content:''; display:block; width:3px; height:3px; border-radius:50%; background:#ea6c12; flex-shrink:0; }

        /* CONTENT */
        .guide-content { padding:48px 0 96px; }
        .guide-section { display:none; }
        .guide-section.visible { display:block; }

        /* SECTION HEADER */
        .sec-badge { display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:100px; background:rgba(234,108,18,0.06); border:1px solid rgba(234,108,18,0.14); font-family:'JetBrains Mono',monospace; font-size:8px; font-weight:700; letter-spacing:0.16em; text-transform:uppercase; color:#ea6c12; margin-bottom:14px; }
        .sec-badge-b { background:rgba(59,130,246,0.06); border-color:rgba(59,130,246,0.14); color:#60a5fa; }
        .sec-h1 { font-family:'Space Grotesk',sans-serif; font-size:clamp(26px,3vw,36px); font-weight:800; color:#fff; letter-spacing:-0.025em; line-height:1.1; margin-bottom:14px; }
        .sec-lead { font-size:14px; color:#52525b; line-height:1.85; max-width:600px; margin-bottom:36px; }

        /* CARDS */
        .card { background:rgba(255,255,255,0.022); border:1px solid rgba(255,255,255,0.055); backdrop-filter:blur(18px); border-radius:16px; position:relative; overflow:hidden; }
        .card::before { content:''; position:absolute; top:0; left:12%; right:12%; height:1px; background:linear-gradient(90deg,transparent,rgba(234,108,18,0.18),rgba(59,130,246,0.1),transparent); }
        .card-orange { background:rgba(234,108,18,0.04); border-color:rgba(234,108,18,0.14); }
        .card-orange::before { background:linear-gradient(90deg,transparent,rgba(234,108,18,0.35),transparent); }
        .card-blue { background:rgba(59,130,246,0.04); border-color:rgba(59,130,246,0.14); }
        .card-blue::before { background:linear-gradient(90deg,transparent,rgba(59,130,246,0.35),transparent); }
        .card-red { background:rgba(239,68,68,0.04); border-color:rgba(239,68,68,0.12); }
        .card-red::before { background:linear-gradient(90deg,transparent,rgba(239,68,68,0.3),transparent); }

        /* CODE BLOCK */
        .code-block { background:#000; border:1px solid rgba(255,255,255,0.06); border-radius:12px; padding:20px 22px; font-family:'JetBrains Mono',monospace; font-size:12px; line-height:1.8; color:#d4d4d8; overflow-x:auto; position:relative; }
        .code-block .comment { color:#3f3f46; }
        .code-block .keyword { color:#60a5fa; }
        .code-block .string { color:#a3e635; }
        .code-block .value { color:#f08030; }
        .code-block .label { color:#c084fc; }

        /* STEP CARDS */
        .step-grid { display:grid; gap:14px; }
        .step-card { padding:22px 24px; border-radius:14px; background:rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.055); display:flex; gap:16px; align-items:flex-start; }
        .step-num { width:30px; height:30px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-family:'JetBrains Mono',monospace; font-size:10px; font-weight:700; color:#ea6c12; background:rgba(234,108,18,0.08); border:1px solid rgba(234,108,18,0.14); flex-shrink:0; }
        .step-title { font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:700; color:#f4f4f5; margin-bottom:5px; }
        .step-desc { font-size:12px; color:#52525b; line-height:1.8; }

        /* ICON BOX */
        .ib { display:flex; align-items:center; justify-content:center; border-radius:10px; flex-shrink:0; }
        .ib-o { background:rgba(234,108,18,0.08); border:1px solid rgba(234,108,18,0.14); color:#f08030; }
        .ib-b { background:rgba(59,130,246,0.08); border:1px solid rgba(59,130,246,0.14); color:#60a5fa; }
        .ib-r { background:rgba(239,68,68,0.08); border:1px solid rgba(239,68,68,0.12); color:#f87171; }
        .ib-g { background:rgba(34,197,94,0.08); border:1px solid rgba(34,197,94,0.12); color:#4ade80; }

        /* THREAT CARDS */
        .threat-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .threat-card { padding:20px; border-radius:14px; background:rgba(239,68,68,0.03); border:1px solid rgba(239,68,68,0.1); }

        /* DEMO */
        .demo-wrap { border-radius:18px; overflow:hidden; background:rgba(0,0,0,0.5); border:1px solid rgba(255,255,255,0.06); }
        .demo-topbar { display:flex; align-items:center; gap:8px; padding:12px 16px; background:rgba(255,255,255,0.03); border-bottom:1px solid rgba(255,255,255,0.06); }
        .demo-dot { width:10px; height:10px; border-radius:50%; }
        .demo-title { font-family:'JetBrains Mono',monospace; font-size:10px; color:#3f3f46; margin-left:8px; }
        .demo-body { padding:20px; }
        .demo-textarea { width:100%; padding:12px 14px; background:rgba(0,0,0,0.4); border:1px solid rgba(255,255,255,0.07); border-radius:10px; color:#d4d4d8; font-family:'JetBrains Mono',monospace; font-size:12px; resize:vertical; outline:none; min-height:80px; transition:border-color 0.2s; }
        .demo-textarea:focus { border-color:rgba(234,108,18,0.3); }
        .demo-run { display:inline-flex; align-items:center; gap:7px; margin-top:12px; padding:10px 20px; border-radius:10px; background:linear-gradient(135deg,#ea6c12,#f08030); color:#fff; font-family:'Space Grotesk',sans-serif; font-size:11px; font-weight:700; text-transform:uppercase; letter-spacing:0.07em; border:none; cursor:pointer; transition:all 0.2s; box-shadow:0 0 20px rgba(234,108,18,0.18); }
        .demo-run:hover { box-shadow:0 0 32px rgba(234,108,18,0.32); transform:translateY(-1px); }
        .demo-run:disabled { opacity:0.6; cursor:not-allowed; transform:none; }
        .demo-result { margin-top:16px; padding:16px; border-radius:12px; display:flex; align-items:center; gap:12px; }
        .demo-result.allowed { background:rgba(34,197,94,0.06); border:1px solid rgba(34,197,94,0.15); }
        .demo-result.blocked { background:rgba(239,68,68,0.06); border:1px solid rgba(239,68,68,0.15); }

        /* FAQ */
        .faq-item { border-bottom:1px solid rgba(255,255,255,0.045); }
        .faq-q { display:flex; align-items:center; justify-content:space-between; width:100%; padding:18px 0; background:none; border:none; cursor:pointer; text-align:left; color:#d4d4d8; font-family:'Space Grotesk',sans-serif; font-size:13px; font-weight:600; gap:16px; }
        .faq-q:hover { color:#fff; }
        .faq-a { font-size:12px; color:#52525b; line-height:1.85; padding-bottom:18px; }
        .faq-icon { flex-shrink:0; transition:transform 0.25s; color:#3f3f46; }
        .faq-icon.open { transform:rotate(45deg); color:#ea6c12; }

        /* GRAD */
        .grad-o { background:linear-gradient(120deg,#ea6c12,#f08030,#f5a050); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .grad-b { background:linear-gradient(120deg,#60a5fa,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }

        /* DIVIDER */
        .sec-divider { height:1px; background:linear-gradient(90deg,transparent,rgba(234,108,18,0.08),rgba(59,130,246,0.06),transparent); margin:36px 0; }

        /* @keyframes spin */
        @keyframes spin { from{transform:rotate(0deg);} to{transform:rotate(360deg);} }

        @media (max-width:780px) {
          .guide-layout { grid-template-columns:1fr; }
          .guide-sidebar { position:static; display:flex; flex-wrap:wrap; gap:6px; padding:16px 0; }
          .threat-grid { grid-template-columns:1fr; }
        }
      `}</style>

      <div className="guide-root">
        <div className="g-bg"><div className="g-orb1"/><div className="g-orb2"/></div>
        <div className="g-grid"/>

        <Navbar />

        {/* PAGE HERO */}
        <div style={{position:'relative',zIndex:10,textAlign:'center',padding:'148px 24px 56px',maxWidth:'700px',margin:'0 auto'}}>
          <div style={{display:'flex',justifyContent:'center',marginBottom:'14px'}}>
            <span className="sec-badge">// Developer Guide</span>
          </div>
          <h1 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'clamp(32px,5vw,52px)',fontWeight:800,color:'#fff',letterSpacing:'-0.03em',lineHeight:1.05,marginBottom:'16px'}}>
            The Complete Guide to<br /><span className="grad-o">AdminZero</span>
          </h1>
          <p style={{fontSize:'14px',color:'#52525b',lineHeight:1.8,maxWidth:'480px',margin:'0 auto'}}>
            Everything you need to install, configure, and understand how AdminZero protects your database from AI-generated SQL injection attacks.
          </p>
        </div>

        {/* MAIN LAYOUT */}
        <div className="guide-layout">

          {/* ── SIDEBAR ── */}
          <aside className="guide-sidebar">
            <p className="sidebar-label">Contents</p>
            {NAV.map(n => (
              <button key={n.id} className={`sidebar-link ${active===n.id?'active':''}`} onClick={()=>setActive(n.id)}>
                {n.label}
              </button>
            ))}
            </aside>

          {/* ── CONTENT ── */}
          <main className="guide-content">

            {/* ══════════════ OVERVIEW ══════════════ */}
            <div className={`guide-section ${active==='overview'?'visible':''}`}>
              <span className="sec-badge">01 / Overview</span>
              <h2 className="sec-h1">What is <span className="grad-o">AdminZero?</span></h2>
              <p className="sec-lead">AdminZero is a Cloud API Security Gateway that sits between your AI agents (like ChatGPT plugins, LangChain agents, or custom LLMs) and your database. It intercepts every SQL query before it reaches your DB and validates it against a set of hardened security rules.</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'32px'}}>
                {[
                  {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>, t:'AST-Based Firewall', d:'Parses query abstract syntax trees — not just regex patterns. Catches deeply nested injection structures.', b:false},
                  {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>, t:'Zero-Knowledge Vault', d:'Your DB credentials never leave your machine. Stored in your OS keychain with AES-256 encryption.', b:true},
                  {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, t:'Real-Time Dashboard', d:'Every blocked and allowed query logged locally — with severity, timestamp, and query content.', b:false},
                  {icon:<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>, t:"Flexible Feature Flags", d:"Toggle PII scrubbing, Prompt Injection, and AST firewalls on a per-request basis.", b:true},
                ].map(({icon,t,d,b})=>(
                  <div key={t} className="card" style={{padding:'22px'}}>
                    <div className={`ib ${b?'ib-b':'ib-o'}`} style={{width:'38px',height:'38px',marginBottom:'14px'}}>{icon}</div>
                    <h3 style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'13px',fontWeight:700,color:'#f4f4f5',marginBottom:'7px'}}>{t}</h3>
                    <p style={{fontSize:'11px',color:'#3f3f46',lineHeight:1.8}}>{d}</p>
                  </div>
                ))}
              </div>

              {/* Architecture diagram */}
              <div className="card card-orange" style={{padding:'28px'}}>
                <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',fontWeight:700,color:'rgba(234,108,18,0.5)',letterSpacing:'0.16em',textTransform:'uppercase',marginBottom:'20px'}}>// Architecture Flow</p>
                <div style={{display:'flex',alignItems:'center',gap:'0',flexWrap:'wrap',justifyContent:'center'}}>
                  {[
                    {l:'Your AI Agent',s:'LLM / LangChain / Plugin',c:'ib-b'},
                    {l:'AdminZero',s:'AST Firewall Layer',c:'ib-o'},
                    {l:'Your Database',s:'Postgres / MySQL / SQLite',c:'ib-g'},
                  ].map((item,i)=>(
                    <React.Fragment key={item.l}>
                      <div style={{textAlign:'center',padding:'16px'}}>
                        <div className={`ib ${item.c}`} style={{width:'52px',height:'52px',margin:'0 auto 10px'}}>
                          {i===0 && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>}
                          {i===1 && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>}
                          {i===2 && <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>}
                        </div>
                        <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:'11px',fontWeight:700,color:'#f4f4f5',marginBottom:'3px'}}>{item.l}</div>
                        <div style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',color:'#27272a',letterSpacing:'0.06em'}}>{item.s}</div>
                      </div>
                      {i<2 && <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'0 4px'}}>
                        <div style={{width:'40px',height:'1px',background:'linear-gradient(90deg,rgba(234,108,18,0.3),rgba(59,130,246,0.3))'}}/>
                        <div style={{fontSize:'9px',fontFamily:"'JetBrains Mono',monospace",color:'#27272a',letterSpacing:'0.08em'}}>{i===0?'SQL Query →':'✓ Safe Only →'}</div>
                      </div>}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {/* ══════════════ HOW IT WORKS ══════════════ */}
            <div className={`guide-section ${active==='howitworks'?'visible':''}`}>
              <span className="sec-badge">02 / Mechanism</span>
              <h2 className="sec-h1">How <span className="grad-o">It Works</span></h2>
              <p className="sec-lead">AdminZero runs as a low-latency Cloud API Gateway. Your AI agent sends SQL queries to AdminZero instead of directly to your database. AdminZero then validates, filters, and only forwards safe queries.</p>

              <div className="step-grid" style={{marginBottom:'32px'}}>
                {[
                  {n:'01',t:'Query Received',d:"Your AI agent sends a natural language prompt to AdminZero's API endpoint. The query never directly touches your database at this stage."},
                  {n:'02',t:'AST Parsing',d:'AdminZero uses Gemini text-to-SQL to generate queries, then parses them into an Abstract Syntax Tree (AST) of the query — a structural map of every clause, table reference, and operation type.'},
                  {n:'03',t:'Security Rule Checks',d:'The AST is checked against hardened rules: no DML (DELETE/INSERT/UPDATE/DROP), no stacked statements, no system table access, no recursive CTEs, no UNION-based exfiltration patterns.'},
                  {n:'04',t:'Decision',d:'BLOCKED: The query is rejected. AdminZero logs the threat and returns a structured error. The DB is never touched. ALLOWED: The query is forwarded to your database and the result is returned to the AI agent.'},
                  {n:'05',t:'Incident Logged',d:'Every decision — blocked or allowed — is written to your local encrypted threat log with a timestamp, query content (sanitized), threat type, and severity level.'},
                ].map(({n,t,d})=>(
                  <div key={n} className="step-card">
                    <div className="step-num">{n}</div>
                    <div>
                      <div className="step-title">{t}</div>
                      <div className="step-desc">{d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════ INTEGRATION ══════════════ */}
            <div className={`guide-section ${active==='install'?'visible':''}`}>
              <span className="sec-badge">03 / Integration</span>
              <h2 className="sec-h1">API <span className="grad-o">Integration</span></h2>
              <p className="sec-lead">AdminZero is a REST API. You don't need to install anything. Just send a POST request with your prompt, database credentials, and license key.</p>

              <div className="code-block" style={{marginBottom:'20px'}}>
                <span className="comment">// POST https://adminzero-backend.onrender.com/api/v1/query</span>{'\n'}
                <span className="keyword">const</span> response = <span className="keyword">await</span> fetch(<span className="string">'https://adminzero-backend.onrender.com/api/v1/query'</span>, {'{\n'}
                {'  '}method: <span className="string">'POST'</span>,{'\n'}
                {'  '}headers: {'{'} <span className="string">'Content-Type'</span>: <span className="string">'application/json'</span> {'}'},{'\n'}
                {'  '}body: JSON.stringify({'{\n'}
                {'    '}license_key: <span className="string">'YOUR_LICENSE_KEY'</span>,{'\n'}
                {'    '}prompt: <span className="string">'Show me the top 5 users by revenue'</span>,{'\n'}
                {'    '}db_url: <span className="string">'postgres://user:pass@host:5432/db'</span>,{'\n'}
                {'    '}db_dialect: <span className="string">'postgres'</span>,{'\n'}
                {'    '}features: {'{\n'}
                {'      '}use_prompt_firewall: <span className="value">true</span>,{'\n'}
                {'      '}use_pii_scrubber: <span className="value">true</span>,{'\n'}
                {'      '}use_ast_firewall: <span className="value">true</span>{'\n'}
                {'    }'}
                {'  }'}){'\n'}
                {'}'});{'\n'}
                <span className="keyword">const</span> result = <span className="keyword">await</span> response.json();
              </div>

              <div className="card card-blue" style={{padding:'20px', marginBottom: '32px'}}>
                <p style={{fontSize:'12px',fontWeight:700,color:'#60a5fa',marginBottom:'6px'}}>Flexible Feature Flags</p>
                <p style={{fontSize:'11px',color:'#d4d4d8',lineHeight:1.8}}>You can turn off specific firewalls if you don't need them. For example, if you want to allow PII in queries, set <code>use_pii_scrubber: false</code>.</p>
              </div>
            </div>

            {/* ══════════════ CONNECT DB ══════════════ */}
            {/* ══════════════ FIREWALL ══════════════ */}
            <div className={`guide-section ${active==='firewall'?'visible':''}`}>
              <span className="sec-badge">05 / Security Features</span>
              <h2 className="sec-h1">Cloud <span className="grad-o">Security Features</span></h2>
              <p className="sec-lead">AdminZero isn't just a basic regex filter. It provides three layers of deterministic protection for your database, configured dynamically based on your security needs.</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr',gap:'14px', marginBottom: '28px'}}>
                {[
                  {t:'AST SQL Guard (+2 Credits)',d:'Parses the full Abstract Syntax Tree (AST) of the generated SQL to block structural anomalies like DML (DELETE, DROP, INSERT), Stacked Semicolons, and Metadata Table Snooping. Protects against attacks that regex misses.',c:'ib-r'},
                  {t:'Prompt Injection Firewall (+1 Credit)',d:'Scans the raw natural language prompt from the end-user *before* it even reaches the SQL generator. Blocks malicious instructions and role hijacks ("Ignore previous instructions...").',c:'ib-o'},
                  {t:'PII Scrubber (+1 Credit)',d:'Intercepts the returned JSON data and automatically redacts sensitive Personal Identifiable Information (PII) like emails, phone numbers, and credit cards before it reaches the AI agent.',c:'ib-b'},
                  {t:'Base Compute Query (1 Credit)',d:'The baseline cost to route and translate a natural language prompt into a safe, read-only SELECT query.',c:'ib-g'},
                ].map(({t,d,c})=>(
                  <div key={t} className="card" style={{padding:'18px'}}>
                    <div className={`ib ${c}`} style={{width:'32px',height:'32px',marginBottom:'12px'}}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <div style={{fontSize:'14px',fontWeight:700,color:'#f4f4f5',marginBottom:'6px',fontFamily:"'Space Grotesk',sans-serif"}}>{t}</div>
                    <div style={{fontSize:'12px',color:'#a1a1aa',lineHeight:1.8}}>{d}</div>
                  </div>
                ))}
              </div>

              {/* Link to Playground */}
              <div className="demo-wrap" style={{marginBottom:'28px', padding: '24px', textAlign: 'center'}}>
                <h3 style={{fontSize:'16px',fontWeight:700,color:'#fff',marginBottom:'12px',fontFamily:"'Space Grotesk',sans-serif"}}>Want to see these features in action?</h3>
                <p style={{fontSize:'13px',color:'#a1a1aa',marginBottom:'20px'}}>Test all edge cases and threat interceptions in our Sandbox Simulator.</p>
                <a href="/adminzero" style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'12px 24px',background:'#10b981',color:'#022c22',fontWeight:'bold',fontSize:'13px',borderRadius:'8px',textDecoration:'none',fontFamily:"'Inter',sans-serif"}}>
                  Launch Interactive Playground
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </a>
              </div>
            </div>

            {/* ══════════════ THREATS ══════════════ */}
            <div className={`guide-section ${active==='threats'?'visible':''}`}>
              <span className="sec-badge sec-badge-b">06 / Threats</span>
              <h2 className="sec-h1">Threats We <span className="grad-b">Block</span></h2>
              <p className="sec-lead">These are the most common attack vectors that AI agents introduce into database-connected applications. AdminZero blocks all of these at the AST level before they execute.</p>
              <div className="threat-grid">
                {threats.map(({name,ex,why})=>(
                  <div key={name} className="threat-card">
                    <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'10px'}}>
                      <div className="ib ib-r" style={{width:'28px',height:'28px'}}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                      </div>
                      <span style={{fontSize:'12px',fontWeight:700,color:'#f87171',fontFamily:"'Space Grotesk',sans-serif"}}>{name}</span>
                    </div>
                    <div className="code-block" style={{marginBottom:'10px',padding:'10px 14px',fontSize:'11px'}}>
                      {ex}
                    </div>
                    <p style={{fontSize:'11px',color:'#52525b',lineHeight:1.75}}>{why}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ══════════════ DASHBOARD ══════════════ */}
            <div className={`guide-section ${active==='dashboard'?'visible':''}`}>
              <span className="sec-badge">07 / Dashboard</span>
              <h2 className="sec-h1">Threat <span className="grad-o">Dashboard</span></h2>
              <p className="sec-lead">AdminZero includes a local threat monitoring dashboard — a real-time view of every query that passes through the firewall.</p>

              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px',marginBottom:'28px'}}>
                {[
                  {t:'Live Query Log',d:'Every query — blocked and allowed — appears in real-time with timestamp and severity badge.',ic:'ib-o'},
                  {t:'Threat Types',d:'Each blocked query is tagged with the attack category: DML, Stacked, Metadata, CTE, or UNION.',ic:'ib-r'},
                  {t:'Query Inspector',d:'Click any entry to view the full original query, the AST structure, and the rule that triggered the block.',ic:'ib-b'},
                  {t:'Export Logs',d:'Export your threat log as JSON or CSV for audit trails, compliance reports, or security reviews.',ic:'ib-g'},
                ].map(({t,d,ic})=>(
                  <div key={t} className="card" style={{padding:'20px'}}>
                    <div className={`ib ${ic}`} style={{width:'36px',height:'36px',marginBottom:'12px'}}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
                    </div>
                    <div style={{fontSize:'12px',fontWeight:700,color:'#f4f4f5',marginBottom:'6px',fontFamily:"'Space Grotesk',sans-serif"}}>{t}</div>
                    <div style={{fontSize:'11px',color:'#3f3f46',lineHeight:1.8}}>{d}</div>
                  </div>
                ))}
              </div>

              <div className="card card-blue" style={{padding:'24px'}}>
                <p style={{fontFamily:"'JetBrains Mono',monospace",fontSize:'9px',fontWeight:700,color:'rgba(96,165,250,0.5)',letterSpacing:'0.14em',textTransform:'uppercase',marginBottom:'14px'}}>// Sample Threat Log Entry</p>
                <div className="code-block">
                  <span className="label">timestamp</span>: <span className="string">"2025-07-15T08:34:12Z"</span>{'\n'}
                  <span className="label">type</span>:      <span className="value">"BLOCKED"</span>{'\n'}
                  <span className="label">threat</span>:    <span className="string">"STACKED_QUERY"</span>{'\n'}
                  <span className="label">severity</span>:  <span className="value">"HIGH"</span>{'\n'}
                  <span className="label">query</span>:     <span className="string">"SELECT 1; DROP TABLE users;"</span>{'\n'}
                  <span className="label">source</span>:    <span className="string">"langchain-agent-session-4f2a"</span>{'\n'}
                  <span className="label">action</span>:    <span className="value">"REJECTED — DB never contacted"</span>
                </div>
              </div>
            </div>

            {/* ══════════════ FAQ ══════════════ */}
            <div className={`guide-section ${active==='faq'?'visible':''}`}>
              <span className="sec-badge">08 / FAQ</span>
              <h2 className="sec-h1">Frequently Asked <span className="grad-o">Questions</span></h2>
              <p className="sec-lead">Common questions about security, performance, and compatibility.</p>

              <div className="card" style={{padding:'8px 24px'}}>
                {faqs.map((f,i)=>(
                  <FaqItem key={i} q={f.q} a={f.a} />
                ))}
              </div>

              <div style={{marginTop:'32px',padding:'28px',borderRadius:'18px',textAlign:'center',background:'rgba(234,108,18,0.04)',border:'1px solid rgba(234,108,18,0.12)'}}>
                <p style={{fontSize:'14px',fontWeight:700,color:'#fff',marginBottom:'8px',fontFamily:"'Space Grotesk',sans-serif"}}>Still have questions?</p>
                <p style={{fontSize:'12px',color:'#3f3f46',marginBottom:'16px',lineHeight:1.8}}>Reach out and we'll get back to you within 24 hours.</p>
                <a href="mailto:teamglitchgo@gmail.com" style={{display:'inline-flex',alignItems:'center',gap:'7px',padding:'10px 20px',borderRadius:'10px',background:'linear-gradient(135deg,#ea6c12,#f08030)',color:'#fff',fontFamily:"'Space Grotesk',sans-serif",fontSize:'11px',fontWeight:700,textTransform:'uppercase',letterSpacing:'0.07em',textDecoration:'none',boxShadow:'0 0 20px rgba(234,108,18,0.18)'}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  Email Us
                </a>
              </div>
            </div>

          </main>
        </div>

        <Footer />
      </div>
    </>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-q" onClick={() => setOpen(o => !o)}>
        {q}
        <svg className={`faq-icon ${open ? 'open' : ''}`} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      </button>
      {open && <p className="faq-a">{a}</p>}
    </div>
  );
}

"use client";
import React, { useState, useRef, useEffect } from 'react';

// ─────────────────────────────────────────────
// KNOWLEDGE BASE — AdminZero & GlitchGo
// ─────────────────────────────────────────────
const KB = {
  greet: {
    triggers: ['hi', 'hello', 'hey', 'sup', 'start', 'help'],
    reply: () => `👋 Hey! I'm **Zero** — your AdminZero assistant.\n\nI can help you with:\n• 🛡️ What AdminZero does\n• ⚙️ How the AST Firewall works\n• 💾 Supported databases\n• 💰 Pricing & plans\n• 📥 How to download & install\n• 🔒 Security & privacy\n\nWhat would you like to know?`
  },
  what: {
    triggers: ['what is', 'what does', 'explain', 'about adminzero', 'about glitchgo', 'tell me', 'overview', 'adminzero'],
    reply: () => `**AdminZero** is a local AI database security gateway built by **GlitchGo**.\n\nIt sits between your AI agents (LangChain, ChatGPT plugins, custom LLMs) and your database — intercepting every SQL query in real-time.\n\n🔑 **Core idea:**\nYour AI generates SQL → AdminZero validates it → Only safe queries reach your DB.\n\n✅ Blocks SQL injections\n✅ Runs as a REST API\n✅ Under 4ms overhead\n✅ No cloud access to your data\n\nWant to know about pricing, installation, or the firewall?`
  },
  firewall: {
    triggers: ['firewall', 'ast', 'how does it work', 'how it works', 'block', 'detect', 'injection', 'security', 'protection', 'prevent'],
    reply: () => `**The AST Firewall** is AdminZero's core engine.\n\nUnlike regex filters, it parses the full **Abstract Syntax Tree** of every SQL query — understanding query *structure*, not just text patterns.\n\n🔴 **What it blocks:**\n• DELETE / DROP / TRUNCATE / INSERT / UPDATE\n• Stacked semicolon attacks (SELECT 1; DROP TABLE users)\n• System table scans (pg_tables, information_schema)\n• Recursive CTE exploits (WITH RECURSIVE...)\n• UNION-based data exfiltration\n\n⚡ **Speed:** < 4ms per query\n🧠 **Intelligence:** Structural AST analysis — not just keyword matching\n\nYour database is never contacted when a query is blocked.`
  },
  install: {
    triggers: ['install', 'download', 'setup', 'get started', 'start', 'how to install', 'exe', 'dmg', 'appimage'],
    reply: () => `**Integrating AdminZero is free — but requires a free account.**\n\n🔑 **Step 1:** Create your free account at **glitchgo.tech/signup**\n📥 **Step 2:** Your API License Key will appear in the **Client Portal** the moment you sign up\n🚀 **Step 3:** Use the key in your API requests:\n\nJust send a POST request to "https://adminzero-backend.onrender.com/api/v1/query" with your prompt and license key!\n\nSign up free → **glitchgo.tech/signup**`
  },
  pricing: {
    triggers: ['price', 'pricing', 'plan', 'cost', 'how much', 'free', 'paid', 'subscription', 'rupee', 'inr', '₹', 'startup', 'enterprise', 'scale'],
    reply: () => `**AdminZero Pricing Plans:**\n\n🆓 **Developer** — ₹0 forever\n• Local DB support\n• 500 queries / month\n• AST Firewall Core\n• Community Discord\n\n🚀 **Startup** — ₹2,999 / month\n• Postgres & MySQL\n• 50,000 queries / month\n• Custom blocklists\n• Email support\n\n📈 **Scale** — ₹14,999 / month\n• All databases\n• 250,000 queries / month\n• Team dashboard\n• Priority support\n\n🏢 **Enterprise** — Custom pricing\n• Unlimited queries\n• Private VPC deployment\n• SLA guarantee\n• Dedicated onboarding\n\nAll plans include the full AST Firewall. No credit card needed to start!`
  },
  database: {
    triggers: ['database', 'postgres', 'mysql', 'sqlite', 'db', 'connect', 'connection', 'credentials', 'supported'],
    reply: () => `**Supported Databases:**\n\n✅ PostgreSQL 12+\n✅ MySQL 8+\n✅ SQLite 3+\n🔜 MS SQL Server (v2.6)\n🔜 MongoDB (v2.6)\n\n**Connecting is simple:**\n1. Get your License Key from the portal\n2. Send a POST request to our API with your DB credentials (db_url) and prompt\n3. Your credentials are used ephemerally to execute the query and are never stored\n4. Your AI receives the clean database results directly!\n\n💡 **Tip:** Create a read-only DB user for AdminZero for maximum security — even if a query somehow slips through, the DB itself won't allow writes.`
  },
  privacy: {
    triggers: ['privacy', 'safe', 'data', 'cloud', 'send', 'offline', 'local', 'encrypt', 'secure', 'keychain'],
    reply: () => `**AdminZero is built privacy-first:**\n\n🔒 **Ephemeral Execution** — Your DB credentials are only used in memory for the duration of the query. We do not store your credentials.\n\n⚡ **Fast Edge Network** — AdminZero operates as a fast Cloud API.\n\n🚫 **No telemetry** — We don't collect query logs, usage stats, or any analytics.\n\n🛡️ **API Security** — All firewall checks happen on our secure high-speed cluster.\n\nYour data is 100% yours, always.`
  },
  glitchgo: {
    triggers: ['glitchgo', 'company', 'who made', 'team', 'built by', 'india', 'msme', 'founder'],
    reply: () => `**About GlitchGo**\n\nGlitchGo is an Indian startup building security infrastructure for the AI era.\n\n🇮🇳 **MSME Registered** — Government of India (UDYAM-AP-17-0080333)\n\n**Our mission:** Make AI-powered applications safe by default — without requiring developers to become security experts.\n\n**AdminZero** is our flagship product — a local AI database firewall that any developer can install in 2 minutes.\n\n📧 teamglitchgo@gmail.com\n🌐 glitchgo.tech`
  },
  portal: {
    triggers: ['portal', 'dashboard', 'client', 'login', 'sign in', 'account', 'license', 'key'],
    reply: () => `**The Client Portal** gives you access to:\n\n📊 License & Telemetry dashboard\n⚙️ Account Settings\n🔑 License key management\n\nTo access:\n1. Click **"Portal"** in the top navbar\n2. Sign in with your email\n3. You're in!\n\nIf you're on the free Developer plan, you can still access the portal — it's free forever.\n\nNeed help signing in? Email us at teamglitchgo@gmail.com`
  },
  threats: {
    triggers: ['threat', 'attack', 'hack', 'sql injection', 'drop table', 'delete', 'dangerous', 'malicious', 'risk'],
    reply: () => `**Threats AdminZero Blocks:**\n\n🔴 **DELETE/DROP/TRUNCATE** — Wipes entire tables. Blocked unconditionally.\n\n🔴 **Stacked Semicolons** — "SELECT 1; DROP TABLE users;" — attacker hides a destructive command after a safe one.\n\n🔴 **System Table Scans** — "SELECT * FROM pg_tables" reveals your entire schema.\n\n🔴 **Recursive CTE Exploits** — "WITH RECURSIVE x AS (...)" used to exfiltrate nested data row by row.\n\n🔴 **UNION Injection** — "UNION SELECT username, password FROM admins" merges malicious data into a safe query.\n\n🔴 **Metadata Dumps** — information_schema, sqlite_master, pg_shadow — maps your entire DB structure.\n\nAll blocked at the AST level — your DB is never contacted.`
  },
  speed: {
    triggers: ['fast', 'slow', 'latency', 'performance', 'speed', '4ms', 'overhead'],
    reply: () => `**AdminZero adds less than 4 milliseconds** to any query.\n\nTo put that in perspective:\n• Average human blink: ~150ms\n• Typical DB query: 10–200ms\n• AdminZero firewall: **< 4ms**\n\nThis overhead is completely invisible to end users. The AST parsing is done in-memory with a highly optimized parser — no network round trips, no disk I/O.\n\nYou get enterprise-grade security at zero perceptible cost.`
  },
  contact: {
    triggers: ['contact', 'email', 'reach', 'support', 'talk', 'human'],
    reply: () => `**Reach the GlitchGo team:**\n\n📧 **General:** teamglitchgo@gmail.com\n📧 **Founder:** issakrajraj@gmail.com\n🌐 **Website:** glitchgo.tech\n\nWe typically reply within **24 hours**.\n\nFor enterprise inquiries, pricing discussions, or bulk licensing — email us directly and we'll set up a call.`
  },
};

// ─────────────────────────────────────────────
// MATCH ENGINE
// ─────────────────────────────────────────────
const SUGGESTED = [
  'What is AdminZero?',
  'How does the firewall work?',
  'Show me pricing',
  'How do I install it?',
  'Is my data safe?',
];

function getReply(input) {
  const lower = input.toLowerCase().trim();
  // check each category
  for (const [, cat] of Object.entries(KB)) {
    if (cat.triggers.some(t => lower.includes(t))) {
      return cat.reply();
    }
  }
  // fallback
  return `I'm not sure about that specific question, but I can tell you about:\n\n• 🛡️ What AdminZero does\n• ⚙️ The AST Firewall\n• 💰 Pricing plans\n• 📥 Installation steps\n• 🔒 Privacy & security\n• 🏢 About GlitchGo\n\nTry asking something like *"How does AdminZero protect my database?"* or *"What are the pricing plans?"*`;
}

// ─────────────────────────────────────────────
// MARKDOWN RENDERER (simple)
// ─────────────────────────────────────────────
function Md({ text }) {
  const html = text
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#f4f4f5;font-weight:700">$1</strong>')
    .replace(/\*(.+?)\*/g, '<em style="color:#a1a1aa">$1</em>')
    .replace(/\n/g, '<br/>');
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

// ─────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────
export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'bot',
      text: `👋 Hi! I'm **Zero**, AdminZero's AI assistant.\n\nAsk me anything about AdminZero, GlitchGo, pricing, or how to get started!`,
      id: 0,
    },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  const send = (text) => {
    const msg = (text || input).trim();
    if (!msg) return;
    setInput('');

    const userMsg = { role: 'user', text: msg, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setTyping(true);

    // Simulate typing delay
    const delay = 600 + Math.random() * 600;
    setTimeout(() => {
      const reply = getReply(msg);
      setTyping(false);
      setMessages(prev => [...prev, { role: 'bot', text: reply, id: Date.now() + 1 }]);
      if (!open) setUnread(u => u + 1);
    }, delay);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  return (
    <>
      <style>{`
        /* ── WIDGET ── */
        .az-widget { position:fixed; bottom:28px; right:28px; z-index:9999; font-family:'Inter',sans-serif; }

        /* FAB */
        .az-fab {
          width:56px; height:56px; border-radius:50%; border:none; cursor:pointer;
          background:linear-gradient(135deg,#ea6c12,#f08030);
          box-shadow:0 0 28px rgba(234,108,18,0.4), 0 4px 16px rgba(0,0,0,0.5);
          display:flex; align-items:center; justify-content:center;
          transition:all 0.3s cubic-bezier(0.34,1.56,0.64,1); position:relative;
          color:#fff;
        }
        .az-fab:hover { transform:scale(1.1); box-shadow:0 0 44px rgba(234,108,18,0.55), 0 8px 24px rgba(0,0,0,0.6); }
        .az-fab:active { transform:scale(0.95); }

        /* Unread badge */
        .az-badge {
          position:absolute; top:-4px; right:-4px;
          width:18px; height:18px; border-radius:50%;
          background:#ef4444; color:#fff;
          font-size:10px; font-weight:800;
          display:flex; align-items:center; justify-content:center;
          border:2px solid #040404;
          animation:badgePop 0.3s cubic-bezier(0.34,1.56,0.64,1);
        }
        @keyframes badgePop { from{transform:scale(0);} to{transform:scale(1);} }

        /* Pulse ring on FAB */
        .az-fab::before {
          content:''; position:absolute; inset:-6px; border-radius:50%;
          border:2px solid rgba(234,108,18,0.25);
          animation:fabPulse 3s ease-in-out infinite;
        }
        @keyframes fabPulse { 0%,100%{opacity:0.4;transform:scale(1);} 50%{opacity:0;transform:scale(1.3);} }

        /* CHAT WINDOW */
        .az-window {
          position:absolute; bottom:72px; right:0;
          width:360px; border-radius:20px; overflow:hidden;
          background:rgba(8,8,8,0.97);
          border:1px solid rgba(255,255,255,0.07);
          backdrop-filter:blur(32px);
          box-shadow:0 24px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(234,108,18,0.08), 0 0 60px rgba(234,108,18,0.05);
          display:flex; flex-direction:column;
          max-height:520px;
          animation:windowIn 0.3s cubic-bezier(0.34,1.3,0.64,1);
          transform-origin:bottom right;
        }
        @keyframes windowIn { from{opacity:0;transform:scale(0.85) translateY(10px);} to{opacity:1;transform:scale(1) translateY(0);} }

        /* Header */
        .az-header {
          padding:16px 18px; display:flex; align-items:center; gap:12px;
          border-bottom:1px solid rgba(255,255,255,0.055); flex-shrink:0;
          background:rgba(234,108,18,0.04);
          position:relative;
        }
        .az-header::before {
          content:''; position:absolute; bottom:0; left:15%; right:15%; height:1px;
          background:linear-gradient(90deg,transparent,rgba(234,108,18,0.3),transparent);
        }
        .az-avatar {
          width:36px; height:36px; border-radius:12px; flex-shrink:0;
          background:linear-gradient(135deg,#ea6c12,#f08030);
          display:flex; align-items:center; justify-content:center; color:#fff;
          box-shadow:0 0 14px rgba(234,108,18,0.3);
          font-size:16px;
        }
        .az-header-info {}
        .az-name { font-size:13px; font-weight:800; color:#fff; font-family:'Space Grotesk',sans-serif; line-height:1; }
        .az-status { display:flex; align-items:center; gap:5px; margin-top:3px; }
        .az-status-dot { width:6px; height:6px; border-radius:50%; background:#22c55e; box-shadow:0 0 6px rgba(34,197,94,0.5); animation:stPulse 2.5s ease-in-out infinite; }
        @keyframes stPulse { 0%,100%{opacity:1;} 50%{opacity:0.5;} }
        .az-status-text { font-size:10px; color:#3f3f46; font-family:'JetBrains Mono',monospace; }
        .az-close { margin-left:auto; background:none; border:none; cursor:pointer; color:#3f3f46; padding:4px; border-radius:6px; transition:all 0.15s; display:flex; align-items:center; }
        .az-close:hover { color:#d4d4d8; background:rgba(255,255,255,0.04); }

        /* Messages */
        .az-messages { flex:1; overflow-y:auto; padding:16px 14px; display:flex; flex-direction:column; gap:10px; scroll-behavior:smooth; }
        .az-messages::-webkit-scrollbar { width:3px; }
        .az-messages::-webkit-scrollbar-track { background:transparent; }
        .az-messages::-webkit-scrollbar-thumb { background:rgba(255,255,255,0.07); border-radius:2px; }

        /* Bubbles */
        .az-msg { display:flex; gap:8px; max-width:90%; }
        .az-msg.user { flex-direction:row-reverse; align-self:flex-end; }
        .az-msg.bot { align-self:flex-start; }

        .az-bubble {
          padding:10px 14px; border-radius:14px; font-size:12px; line-height:1.75;
          animation:bubbleIn 0.25s ease;
        }
        @keyframes bubbleIn { from{opacity:0;transform:translateY(6px);} to{opacity:1;transform:translateY(0);} }

        .az-msg.bot .az-bubble {
          background:rgba(255,255,255,0.045);
          border:1px solid rgba(255,255,255,0.07);
          border-bottom-left-radius:4px;
          color:#c4c4c8;
        }
        .az-msg.user .az-bubble {
          background:linear-gradient(135deg,rgba(234,108,18,0.18),rgba(240,128,48,0.12));
          border:1px solid rgba(234,108,18,0.2);
          border-bottom-right-radius:4px;
          color:#f4f4f5;
        }

        .az-bot-mini { width:24px; height:24px; border-radius:8px; background:rgba(234,108,18,0.1); border:1px solid rgba(234,108,18,0.15); flex-shrink:0; display:flex; align-items:center; justify-content:center; font-size:12px; }

        /* Typing */
        .az-typing { display:flex; align-items:center; gap:4px; padding:10px 14px; border-radius:14px; border-bottom-left-radius:4px; background:rgba(255,255,255,0.045); border:1px solid rgba(255,255,255,0.07); }
        .az-dot { width:5px; height:5px; border-radius:50%; background:#52525b; animation:typingDot 1.4s ease-in-out infinite; }
        .az-dot:nth-child(2) { animation-delay:0.2s; }
        .az-dot:nth-child(3) { animation-delay:0.4s; }
        @keyframes typingDot { 0%,60%,100%{transform:translateY(0);opacity:0.4;} 30%{transform:translateY(-4px);opacity:1;} }

        /* Suggestions */
        .az-suggestions { padding:8px 14px; display:flex; gap:6px; flex-wrap:wrap; flex-shrink:0; border-top:1px solid rgba(255,255,255,0.04); }
        .az-chip {
          padding:5px 10px; border-radius:100px; font-size:10px; font-weight:600;
          background:rgba(234,108,18,0.06); border:1px solid rgba(234,108,18,0.14);
          color:rgba(234,108,18,0.8); cursor:pointer; white-space:nowrap;
          transition:all 0.18s; font-family:'JetBrains Mono',monospace;
        }
        .az-chip:hover { background:rgba(234,108,18,0.12); color:#f08030; border-color:rgba(234,108,18,0.25); }

        /* Input */
        .az-input-row {
          padding:12px 14px; display:flex; gap:8px; align-items:flex-end;
          border-top:1px solid rgba(255,255,255,0.055); flex-shrink:0;
          background:rgba(0,0,0,0.2);
        }
        .az-input {
          flex:1; background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.07);
          border-radius:11px; padding:9px 13px; color:#d4d4d8;
          font-family:'Inter',sans-serif; font-size:12px; outline:none; resize:none;
          max-height:80px; min-height:36px; transition:border-color 0.18s;
          line-height:1.5;
        }
        .az-input:focus { border-color:rgba(234,108,18,0.3); }
        .az-input::placeholder { color:#27272a; }
        .az-send {
          width:36px; height:36px; border-radius:10px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#ea6c12,#f08030);
          color:#fff; display:flex; align-items:center; justify-content:center;
          flex-shrink:0; transition:all 0.2s;
          box-shadow:0 0 14px rgba(234,108,18,0.2);
        }
        .az-send:hover { box-shadow:0 0 22px rgba(234,108,18,0.38); transform:scale(1.05); }
        .az-send:disabled { opacity:0.4; cursor:not-allowed; transform:none; }

        /* Footer brand */
        .az-footer-brand {
          padding:8px 14px; text-align:center; flex-shrink:0;
          font-family:'JetBrains Mono',monospace; font-size:9px;
          color:#1c1c1c; letter-spacing:0.1em;
        }
        .az-footer-brand span { color:#2a2a2a; }

        @media (max-width:420px) {
          .az-window { width:calc(100vw - 32px); right:-14px; }
        }
      `}</style>

      <div className="az-widget">
        {/* CHAT WINDOW */}
        {open && (
          <div className="az-window">
            {/* Header */}
            <div className="az-header">
              <div className="az-avatar">🛡️</div>
              <div className="az-header-info">
                <div className="az-name">Zero — AdminZero AI</div>
                <div className="az-status">
                  <div className="az-status-dot" />
                  <span className="az-status-text">Online · GlitchGo Assistant</span>
                </div>
              </div>
              <button className="az-close" onClick={() => setOpen(false)} aria-label="Close">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Messages */}
            <div className="az-messages">
              {messages.map(m => (
                <div key={m.id} className={`az-msg ${m.role}`}>
                  {m.role === 'bot' && <div className="az-bot-mini">🛡️</div>}
                  <div className="az-bubble">
                    <Md text={m.text} />
                  </div>
                </div>
              ))}
              {typing && (
                <div className="az-msg bot">
                  <div className="az-bot-mini">🛡️</div>
                  <div className="az-typing">
                    <div className="az-dot" /><div className="az-dot" /><div className="az-dot" />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Suggestion chips */}
            <div className="az-suggestions">
              {SUGGESTED.map(s => (
                <button key={s} className="az-chip" onClick={() => send(s)}>{s}</button>
              ))}
            </div>

            {/* Input */}
            <div className="az-input-row">
              <textarea
                ref={inputRef}
                className="az-input"
                rows={1}
                placeholder="Ask about AdminZero..."
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKey}
              />
              <button className="az-send" onClick={() => send()} disabled={!input.trim() || typing} aria-label="Send">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              </button>
            </div>

            <div className="az-footer-brand">Powered by <span>GlitchGo</span></div>
          </div>
        )}

        {/* FAB */}
        <button className="az-fab" onClick={() => setOpen(o => !o)} aria-label="Open AdminZero Assistant">
          {open ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
          )}
          {unread > 0 && !open && <div className="az-badge">{unread}</div>}
        </button>
      </div>
    </>
  );
}

import React, { useState } from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Shield, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Code,
  Key,
  Network,
  Activity,
  ShieldAlert,
  Download,
  Monitor,
  Laptop
} from 'lucide-react';

export default function Landing() {
  const [activeCodeLang, setActiveCodeLang] = useState('js');

  const codeSnippets = {
    js: `// AdminZero Local Desktop Gateway runs on port 5001.
// Route your agent prompts directly to localhost instead of your database.
const response = await fetch('http://localhost:5001/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Get regional transaction statistics, blocking any schema drops.'
  })
});
const { data, error } = await response.json();`,
    curl: `# Query the local security gateway via standard cURL requests
curl -X POST http://localhost:5001/v1/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Get regional transaction statistics, blocking any schema drops."
  }'`,
    python: `# Secure your agent database execution pipelines in Python
import requests

response = requests.post(
    "http://localhost:5001/v1/query",
    json={"prompt": "Get regional transaction statistics, blocking any schema drops."}
)
result = response.json()`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-orange selection:text-white relative overflow-hidden w-full">
      <Navbar />

      {/* Premium Visual Elements: Backdrop Glow System */}
      <div className="absolute top-[8%] left-1/2 -translate-x-1/2 w-[850px] h-[400px] bg-gradient-to-r from-brand-blue/15 to-brand-orange/10 rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[40%] right-[-10%] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[10%] left-[-10%] w-[500px] h-[500px] bg-brand-blue/5 rounded-full blur-[140px] pointer-events-none -z-10" />

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_60%,transparent_100%)] pointer-events-none -z-10" />

      {/* PART 1: HERO SECTION */}
      <section className="max-w-5xl mx-auto px-6 pt-48 pb-20 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/60 border border-slate-800/80 text-brand-orange text-xs font-mono font-bold mb-8 shadow-[0_0_20px_rgba(249,115,22,0.05)] backdrop-blur-sm">
          <Activity size={12} className="animate-pulse" />
          <span>AdminZero v2.4 — Downloadable Local Gateway Available</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] font-sans">
          The Local Gateway for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-indigo-400 to-brand-orange">
            AI-to-Database Security.
          </span>
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mt-8 leading-relaxed font-normal">
          Outsource database security liabilities. AdminZero runs as a dedicated application locally inside your infrastructure, intercepting malicious injections and query anomalies in under 4 milliseconds before execution.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-12">
          <a
            href="#download-center"
            className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-orange hover:opacity-95 text-white text-xs font-black uppercase tracking-wider py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(59,130,246,0.25)] active:scale-[0.98] cursor-pointer"
          >
            <Download size={14} />
            <span>Download Desktop App</span>
          </a>
          <a
            href="/guide"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800/80 hover:bg-slate-800 text-slate-350 text-xs font-bold uppercase tracking-wider py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Read Integration Guide</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* PART 2: THE OS DOWNLOAD CENTER */}
      <section id="download-center" className="max-w-6xl mx-auto px-6 py-24 relative z-10 border-t border-slate-900/60">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-mono">// GET THE APP</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Compatible With All Platforms</h2>
          <p className="text-slate-400 text-xs mt-2 max-w-md mx-auto leading-relaxed">
            Install AdminZero directly on your local system to run your query validations. Zero data ever leaves your computer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {/* Windows Download */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-brand-blue/30 transition-all relative group backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Monitor size={26} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Windows Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Windows 10 / 11 (x64)</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero Setup.exe installer...'); }}
              className="w-full bg-slate-950/80 hover:bg-slate-900/60 border border-slate-850 hover:border-brand-blue/50 text-slate-350 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer shadow-inner"
            >
              <Download size={12} />
              <span>Download .EXE</span>
            </a>
          </div>

          {/* macOS Download */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-brand-orange/30 transition-all relative group backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Laptop size={26} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">macOS Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Apple Silicon / Intel</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero macOS.dmg app installer...'); }}
              className="w-full bg-slate-950/80 hover:bg-slate-900/60 border border-slate-850 hover:border-brand-orange/50 text-slate-355 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer shadow-inner"
            >
              <Download size={12} />
              <span>Download .DMG</span>
            </a>
          </div>

          {/* Linux Download */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-indigo-500/30 transition-all relative group backdrop-blur-md">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Terminal size={26} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider">Linux Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">AppImage / Tarball</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero Linux.AppImage file...'); }}
              className="w-full bg-slate-950/80 hover:bg-slate-900/60 border border-slate-850 hover:border-indigo-500/50 text-slate-350 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer shadow-inner"
            >
              <Download size={12} />
              <span>Download .AppImage</span>
            </a>
          </div>
        </div>
      </section>

      {/* PART 3: THE FEATURE MOATS */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900/60">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-brand-blue uppercase tracking-widest font-mono">// SECURITY PILLARS</span>
          <h2 className="text-3xl font-extrabold text-white mt-1">Local AST Compiler Protection</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Card 1: Cryptographic Vault */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl space-y-4 hover:border-brand-blue/30 transition-all text-left backdrop-blur-sm">
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center">
              <Key size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Local Credentials Encryption</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                Connection string hashes are encrypted on-the-fly and stored locally using standard OS credential managers (Windows Credential Vault, macOS Keychain).
              </p>
            </div>
          </div>

          {/* Card 2: Isolated Execution Context */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl space-y-4 hover:border-brand-orange/30 transition-all text-left backdrop-blur-sm">
            <div className="p-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl w-11 h-11 flex items-center justify-center">
              <Network size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Air-Gapped Proxy Daemon</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                The security firewall runs in local sandbox memory, verifying AST statement nodes in under 4ms on your hardware without leaking data telemetry.
              </p>
            </div>
          </div>

          {/* Card 3: AST Security Firewall */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl space-y-4 hover:border-brand-blue/30 transition-all text-left backdrop-blur-sm">
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center">
              <Shield size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Hardened AST Parser</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                Recursively checks AST statement arrays, preventing stacked semicolon batches, administrative schema queries, and sleep injection exploits.
              </p>
            </div>
          </div>

          {/* Card 4: Failsafe Closed Logging */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl space-y-4 hover:border-brand-orange/30 transition-all text-left backdrop-blur-sm">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-405 rounded-xl w-11 h-11 flex items-center justify-center">
              <ShieldAlert size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wide">Failsafe Closed Engine</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed font-sans">
                Any query that cannot be parsed successfully is automatically blocked. Obfuscated attack payloads are intercepted at the compiler driver boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PART 4: LOCAL INTEGRATION CODE SPEC */}
      <section id="integration" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900/60">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center max-w-4xl mx-auto">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-bold uppercase tracking-wider font-mono">
              <Code size={12} />
              <span>Developer-First</span>
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">
              Secure Your AI Queries in 3 Lines of Code.
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              Route your generated query prompts through the localhost daemon. The local proxy will inspect, validate, and execute it securely on the connected database.
            </p>
          </div>

          <div className="bg-slate-950/80 border border-slate-850/80 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-md">
            <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex space-x-2 text-[10px] font-mono">
                <button 
                  onClick={() => setActiveCodeLang('js')} 
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeCodeLang === 'js' ? 'bg-slate-800 text-brand-orange font-bold' : 'text-slate-500'}`}
                >
                  Node.js
                </button>
                <button 
                  onClick={() => setActiveCodeLang('curl')} 
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeCodeLang === 'curl' ? 'bg-slate-800 text-brand-orange font-bold' : 'text-slate-500'}`}
                >
                  cURL
                </button>
                <button 
                  onClick={() => setActiveCodeLang('python')} 
                  className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${activeCodeLang === 'python' ? 'bg-slate-800 text-brand-orange font-bold' : 'text-slate-500'}`}
                >
                  Python
                </button>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">POST :5001/v1/query</span>
            </div>
            <pre className="p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed max-h-[220px]">
              <code>{codeSnippets[activeCodeLang]}</code>
            </pre>
          </div>
        </div>
      </section>

      {/* PART 5: PRICING MATRIX */}
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900/60">
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-brand-orange uppercase tracking-widest font-mono">// LICENSING MODELS</span>
          <h3 className="text-3xl font-bold text-white mb-3">Scale Your Secure Integrations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-5xl mx-auto">
          {/* Developer */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-white text-base">Developer</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-405 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Local SQLite Support</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>500 queries/mo</span></li>
              </ul>
            </div>
            <a href="/portal" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Start Free</a>
          </div>

          {/* Startup Growth */}
          <div className="bg-slate-900 border-2 border-brand-orange p-6 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-brand-orange/10 backdrop-blur-sm">
            <span className="absolute -top-3 right-6 bg-brand-orange text-white font-bold text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">Developer favorite</span>
            <div>
              <h3 className="font-bold text-white text-base">Startup Growth</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹2,999</span>
                <span className="text-xs text-slate-400"> / month</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-350 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Postgres & MySQL Gateway</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Custom AST Blacklists</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>50,000 queries/mo</span></li>
              </ul>
            </div>
            <a href="/portal" className="w-full bg-brand-orange hover:bg-opacity-95 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer border-none shadow-[0_0_15px_rgba(249,115,22,0.15)]">Activate Startup</a>
          </div>

          {/* Scale Team */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-white text-base">Scale Team</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹14,999</span>
                <span className="text-xs text-slate-500"> / month</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Snowflake & BigQuery Gateway</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>250,000 queries/mo</span></li>
              </ul>
            </div>
            <a href="/portal" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Upgrade Team</a>
          </div>

          {/* Enterprise */}
          <div className="bg-slate-900/10 border border-slate-850/60 p-6 rounded-2xl flex flex-col justify-between backdrop-blur-sm">
            <div>
              <h3 className="font-bold text-white text-base">Enterprise</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">Custom</span>
                <span className="text-xs text-slate-500"> / annual quote</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Air-Gapped Private VPC</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Unlimited local queries</span></li>
              </ul>
            </div>
            <a href="mailto:issakrajraj@gmail.com" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Contact Sales</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

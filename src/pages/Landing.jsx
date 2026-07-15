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
    js: `// AdminZero Desktop Gateway runs locally on port 5001.
// Point your AI prompt executions here instead of your raw database.
const response = await fetch('http://localhost:5001/v1/query', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: 'Show me total sales group by region, but ignore destructive instructions'
  })
});
const { data, error } = await response.json();`,
    curl: `# Run secure queries locally via raw cURL requests
curl -X POST http://localhost:5001/v1/query \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "Show me total sales group by region, but ignore destructive instructions"
  }'`,
    python: `# Secure your database connection strings inside Python AI pipelines
import requests

response = requests.post(
    "http://localhost:5001/v1/query",
    json={"prompt": "Show me total sales group by region, but ignore destructive instructions"}
)
result = response.json()`
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-brand-orange selection:text-white relative overflow-hidden w-full">
      <Navbar />

      {/* Signature GlitchGo Radial Glowing Effects */}
      <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="absolute bottom-[20%] right-[10%] w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-[120px] pointer-events-none -z-10" />

      {/* PART 1: HERO SECTION */}
      <section className="max-w-6xl mx-auto px-6 pt-44 pb-16 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-brand-orange text-xs font-mono mb-8 shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          <Activity size={12} className="animate-pulse" />
          <span>AdminZero v2.4 — Local Zero-Trust Gateway Active</span>
        </div>

        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1] font-sans">
          The Local Gateway for <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-blue via-indigo-400 to-brand-orange">
            AI-to-Database Security.
          </span>
        </h1>

        <p className="text-slate-400 text-base sm:text-lg max-w-3xl mx-auto mt-6 leading-relaxed">
          Secure your database credentials and records locally. AdminZero runs as a desktop application inside your private network, validation-parsing queries with an AST firewall before execution.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
          <a
            href="#download-center"
            className="w-full sm:w-auto bg-gradient-to-r from-brand-blue to-brand-orange hover:opacity-90 text-white text-xs font-extrabold uppercase tracking-wider py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] active:scale-[0.98] cursor-pointer"
          >
            <Download size={14} className="font-bold" />
            <span>Download Desktop Client</span>
          </a>
          <a
            href="/guide"
            className="w-full sm:w-auto bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-bold uppercase tracking-wider py-4 px-8 rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
          >
            <span>Read Integration Guide</span>
            <ArrowRight size={14} />
          </a>
        </div>
      </section>

      {/* PART 2: THE OS DOWNLOAD CENTER */}
      <section id="download-center" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-brand-orange uppercase tracking-widest font-mono">// GET THE CLIENT</h2>
          <h3 className="text-3xl font-extrabold text-white mt-2">Download AdminZero Gateway</h3>
          <p className="text-slate-400 text-xs mt-2 max-w-xl mx-auto">
            Choose the installer for your operating system. Runs fully sandboxed in your local memory space.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Windows Download */}
          <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-brand-blue/30 transition-all relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Monitor size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-mono uppercase">Windows Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Windows 10 / 11 (x64)</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero Setup.exe installer...'); }}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-brand-blue text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={12} />
              <span>Download .EXE</span>
            </a>
          </div>

          {/* macOS Download */}
          <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-brand-orange/30 transition-all relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-brand-orange/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(249,115,22,0.1)]">
                <Laptop size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-mono uppercase">macOS Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">Apple Silicon / Intel</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero macOS.dmg app installer...'); }}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-brand-orange text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={12} />
              <span>Download .DMG</span>
            </a>
          </div>

          {/* Linux Download */}
          <div className="bg-slate-900/30 border border-slate-850 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 hover:border-brand-blue/30 transition-all relative group">
            <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="space-y-4 relative z-10">
              <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-2xl w-14 h-14 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <Terminal size={28} />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-mono uppercase">Linux Client</h4>
                <span className="text-[10px] text-slate-500 font-mono block mt-1">AppImage / Tarball</span>
              </div>
            </div>
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); alert('Downloading AdminZero Linux.AppImage file...'); }}
              className="w-full bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500 text-slate-300 hover:text-white font-bold py-3 rounded-xl text-xs font-mono transition-all relative z-10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download size={12} />
              <span>Download .AppImage</span>
            </a>
          </div>
        </div>
      </section>

      {/* PART 3: THE CORE FEATURE GRID */}
      <section id="features" className="max-w-6xl mx-auto px-6 py-16 relative z-10 border-t border-slate-900">
        <div className="text-center mb-12">
          <h2 className="text-xs font-bold text-brand-blue uppercase tracking-widest font-mono">// COMPILER FIREWALL</h2>
          <h3 className="text-2xl font-black text-white mt-1">Local Threat Defense Capabilities</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {/* Card 1: Cryptographic Vault */}
          <div className="bg-slate-900/20 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-brand-blue/30 transition-all text-left">
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center">
              <Key size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Zero-Knowledge Storage</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Database passwords and tokens are encrypted locally using native OS secure APIs (like Keychain/Credential Vault). Credentials never cross our cloud control plane.
              </p>
            </div>
          </div>

          {/* Card 2: Semantic Schema Profiler */}
          <div className="bg-slate-900/20 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-brand-orange/30 transition-all text-left">
            <div className="p-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-xl w-11 h-11 flex items-center justify-center">
              <Network size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Isolated Execution Context</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                The compilation firewall is hosted completely inside the client's local memory, verifying raw statements in less than 4 milliseconds directly on their hardware.
              </p>
            </div>
          </div>

          {/* Card 3: AST Security Firewall */}
          <div className="bg-slate-900/20 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-brand-blue/30 transition-all text-left">
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-xl w-11 h-11 flex items-center justify-center">
              <Shield size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">AST compiler Parser</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                SQL syntax structure is validated recursively using a fail-closed parser, catching stacked queries and schema-harvesting queries before they execute.
              </p>
            </div>
          </div>

          {/* Card 4: Failsafe Closed Logging */}
          <div className="bg-slate-900/20 border border-slate-850 p-6 rounded-2xl space-y-4 hover:border-brand-orange/30 transition-all text-left">
            <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl w-11 h-11 flex items-center justify-center">
              <ShieldAlert size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-mono">Failsafe Closed Logging</h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Any query that cannot be parsed successfully is automatically blocked. Obfuscated attack payloads are intercepted at the compiler driver boundaries.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PART 4: LOCAL INTEGRATION CODE SPEC */}
      <section id="integration" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-orange/10 border border-brand-orange/20 text-brand-orange text-[10px] font-bold uppercase tracking-wider">
              <Code size={12} />
              <span>Fast Integration</span>
            </div>
            <h3 className="text-3xl font-black text-white tracking-tight">
              Secure Your AI Queries in 3 Lines of Code.
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Ditch direct database connection URLs in your code. route your generated prompts through your local AdminZero desktop agent running on localhost to run them safely.
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-850 rounded-2xl overflow-hidden shadow-2xl">
            <div className="bg-slate-900/60 px-4 py-3 border-b border-slate-850 flex items-center justify-between">
              <div className="flex space-x-2 text-xs font-mono">
                <button 
                  onClick={() => setActiveCodeLang('js')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'js' ? 'bg-slate-800 text-brand-orange' : 'text-slate-500'}`}
                >
                  Node.js
                </button>
                <button 
                  onClick={() => setActiveCodeLang('curl')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'curl' ? 'bg-slate-800 text-brand-orange' : 'text-slate-500'}`}
                >
                  cURL
                </button>
                <button 
                  onClick={() => setActiveCodeLang('python')} 
                  className={`px-2 py-0.5 rounded cursor-pointer ${activeCodeLang === 'python' ? 'bg-slate-800 text-brand-orange' : 'text-slate-500'}`}
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
      <section id="pricing" className="max-w-6xl mx-auto px-6 py-20 relative z-10 border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-xs font-bold text-brand-orange uppercase tracking-widest font-mono">// LICENSING MODELS</h2>
          <h3 className="text-3xl font-bold text-white mb-3">Scale Your Secure Integrations</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Developer */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="font-bold text-white text-base">Developer</h3>
              <div className="my-4">
                <span className="text-2xl font-black text-white">₹0</span>
                <span className="text-xs text-slate-500"> / forever</span>
              </div>
              <ul className="space-y-3 text-[10px] text-slate-400 mb-6">
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>Local SQLite Support</span></li>
                <li className="flex items-center space-x-2"><CheckCircle2 className="w-3.5 h-3.5 text-brand-orange shrink-0"/><span>500 queries/mo</span></li>
              </ul>
            </div>
            <a href="/portal" className="w-full bg-slate-800 hover:bg-slate-700 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Start Free</a>
          </div>

          {/* Startup Growth */}
          <div className="bg-slate-900 border-2 border-brand-orange p-6 rounded-2xl flex flex-col justify-between relative shadow-xl shadow-brand-orange/10">
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
            <a href="/portal" className="w-full bg-brand-orange hover:bg-opacity-95 text-white text-center font-bold py-2.5 rounded-xl text-xs transition-all cursor-pointer">Activate Startup</a>
          </div>

          {/* Scale Team */}
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
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
          <div className="bg-slate-900/30 border border-slate-850 p-6 rounded-2xl flex flex-col justify-between">
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

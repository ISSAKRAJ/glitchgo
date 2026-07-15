import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { 
  Shield, 
  Terminal, 
  CheckCircle2, 
  ArrowRight, 
  Key,
  Network,
  Activity,
  ShieldAlert,
  Download,
  Monitor,
  Laptop,
  Zap,
  Lock,
  Eye,
  Server
} from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-[#020202] text-zinc-100 font-sans selection:bg-orange-500 selection:text-black relative overflow-hidden w-full">
      <Navbar />

      {/* === AMBIENT LIGHTING SYSTEM === */}
      {/* Primary orange light source — top center */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-radial from-orange-500/8 via-orange-500/3 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />
      {/* Secondary warm accent — bottom right */}
      <div className="fixed bottom-0 right-0 w-[700px] h-[700px] bg-gradient-radial from-amber-500/4 to-transparent rounded-full blur-[180px] pointer-events-none z-0" />
      {/* Cool contrast — left mid */}
      <div className="fixed top-1/2 left-0 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-radial from-indigo-600/3 to-transparent rounded-full blur-[160px] pointer-events-none z-0" />

      {/* Grid Pattern */}
      <div className="fixed inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black_40%,transparent_100%)] pointer-events-none z-0" />

      {/* ================================================
          PART 1: HERO
      ================================================ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-52 pb-28 text-center">
        {/* Live badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-10 backdrop-blur-xl" style={{background: 'rgba(249,115,22,0.06)', border: '1px solid rgba(249,115,22,0.15)'}}>
          <span className="h-1.5 w-1.5 rounded-full bg-orange-400 animate-pulse" />
          <span className="text-orange-400 text-[10px] font-bold font-mono tracking-widest uppercase">AdminZero v2.4 — Now Available for All Platforms</span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl sm:text-7xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.05] mb-6">
          Stop AI from
          <br />
          <span className="relative">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500">
              Destroying Your Database.
            </span>
            {/* Glow under text */}
            <span className="absolute inset-0 text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-orange-500 blur-2xl opacity-30 select-none" aria-hidden>
              Destroying Your Database.
            </span>
          </span>
        </h1>

        {/* Sub-headline */}
        <p className="text-zinc-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-12">
          AdminZero installs locally on your computer and acts as an intelligent firewall between your AI models and your database — blocking injections before they execute.
        </p>

        {/* CTA Row */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <a
            href="#download"
            className="group relative inline-flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-extrabold text-black uppercase tracking-wider transition-all active:scale-[0.97] cursor-pointer overflow-hidden"
            style={{background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 40px rgba(249,115,22,0.35), 0 2px 0 rgba(255,255,255,0.1) inset'}}
          >
            <Download size={16} className="stroke-[3]" />
            Download Free — All Platforms
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform stroke-[3]" />
          </a>
          <a
            href="/guide"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold text-zinc-300 hover:text-white transition-all cursor-pointer backdrop-blur-xl"
            style={{background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)'}}
          >
            How It Works
            <ArrowRight size={14} />
          </a>
        </div>

        {/* Social proof row */}
        <div className="flex items-center justify-center gap-6 mt-12 text-[11px] text-zinc-500 font-mono">
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-orange-400" /> Free to start</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-orange-400" /> No cloud access to your DB</span>
          <span className="flex items-center gap-1.5"><CheckCircle2 size={12} className="text-orange-400" /> Windows, macOS & Linux</span>
        </div>
      </section>

      {/* ================================================
          PART 2: HOW IT WORKS — visual architecture
      ================================================ */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 py-20 border-t" style={{borderColor: 'rgba(255,255,255,0.04)'}}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">// How It Works</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Install Once. Protect Forever.</h2>
        </div>

        {/* 3-step flow */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { step: '01', icon: Download, title: 'Download & Install', desc: 'Install AdminZero on your Windows, Mac or Linux machine in under 2 minutes.' },
            { step: '02', icon: Key, title: 'Connect Your Database', desc: 'Paste your database credentials securely. They are encrypted locally and never leave your machine.' },
            { step: '03', icon: Shield, title: 'Activate the Gateway', desc: 'AdminZero now sits between your AI agent and database, blocking every dangerous query automatically.' },
          ].map(({ step, icon: Icon, title, desc }) => (
            <div key={step} className="relative p-6 rounded-2xl backdrop-blur-xl text-left group" style={{background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)'}}>
              {/* Top edge highlight */}
              <div className="absolute top-0 left-8 right-8 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.3), transparent)'}} />
              <span className="text-[10px] text-orange-400/60 font-black font-mono tracking-widest">{step}</span>
              <div className="my-4 p-2.5 w-10 h-10 rounded-xl flex items-center justify-center" style={{background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.12)'}}>
                <Icon size={18} className="text-orange-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
              <p className="text-xs text-zinc-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================
          PART 3: DOWNLOAD CENTER — Rich Glass Cards
      ================================================ */}
      <section id="download" className="relative z-10 max-w-6xl mx-auto px-6 py-24 border-t" style={{borderColor: 'rgba(255,255,255,0.04)'}}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">// Download</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Choose Your Platform</h2>
          <p className="text-zinc-500 text-xs mt-2 max-w-sm mx-auto">All versions include the full AST security firewall and local credential vault.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {/* Windows */}
          <div className="relative p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 group transition-all duration-300 backdrop-blur-xl overflow-hidden"
            style={{background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)'}}>
            <div className="absolute top-0 left-8 right-8 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)'}} />
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'radial-gradient(ellipse at top, rgba(249,115,22,0.05) 0%, transparent 70%)'}} />
            <div className="relative z-10 space-y-4">
              <div className="p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto" style={{background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.12)'}}>
                <Monitor size={28} className="text-orange-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">Windows</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Windows 10 / 11 · x64</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">.NET 4.8 Runtime included</p>
              </div>
            </div>
            <a href="/downloads/AdminZero-Setup.exe" download="AdminZero-Setup.exe" target="_self"
              className="relative z-10 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer group-hover:text-orange-300 group-hover:border-orange-500/30"
              style={{background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <Download size={13} className="stroke-[2.5]" />
              Download .EXE
            </a>
          </div>

          {/* macOS — featured */}
          <div className="relative p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 backdrop-blur-xl overflow-hidden"
            style={{background: 'rgba(249,115,22,0.06)', border: '1.5px solid rgba(249,115,22,0.25)', boxShadow: '0 0 60px rgba(249,115,22,0.08)'}}>
            <div className="absolute top-0 left-8 right-8 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.7), transparent)'}} />
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full text-black text-[9px] font-black uppercase tracking-widest" style={{background: 'linear-gradient(135deg, #f97316, #fb923c)'}}>
              Most Popular
            </div>
            <div className="relative z-10 space-y-4">
              <div className="p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto" style={{background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.2)'}}>
                <Laptop size={28} className="text-orange-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">macOS</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Apple Silicon + Intel · Universal</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">macOS 12 Monterey+</p>
              </div>
            </div>
            <a href="/downloads/AdminZero-Mac.dmg" download="AdminZero-Mac.dmg" target="_self"
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-extrabold text-black transition-all cursor-pointer"
              style={{background: 'linear-gradient(135deg, #f97316, #fb923c)', boxShadow: '0 0 20px rgba(249,115,22,0.2)'}}>
              <Download size={13} className="stroke-[2.5]" />
              Download .DMG
            </a>
          </div>

          {/* Linux */}
          <div className="relative p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-6 group transition-all duration-300 backdrop-blur-xl overflow-hidden"
            style={{background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)'}}>
            <div className="absolute top-0 left-8 right-8 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.4), transparent)'}} />
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'radial-gradient(ellipse at top, rgba(249,115,22,0.05) 0%, transparent 70%)'}} />
            <div className="relative z-10 space-y-4">
              <div className="p-4 rounded-2xl w-16 h-16 flex items-center justify-center mx-auto" style={{background: 'rgba(249,115,22,0.07)', border: '1px solid rgba(249,115,22,0.12)'}}>
                <Terminal size={28} className="text-orange-400" />
              </div>
              <div>
                <h4 className="text-base font-extrabold text-white tracking-wide uppercase font-mono">Linux</h4>
                <p className="text-[10px] text-zinc-500 mt-1">Ubuntu / Debian / Arch</p>
                <p className="text-[10px] text-zinc-600 mt-0.5 font-mono">AppImage — no install needed</p>
              </div>
            </div>
            <a href="/downloads/AdminZero-Linux.AppImage" download="AdminZero-Linux.AppImage" target="_self"
              className="relative z-10 w-full flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer group-hover:text-orange-300 group-hover:border-orange-500/30"
              style={{background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.08)'}}>
              <Download size={13} className="stroke-[2.5]" />
              Download .AppImage
            </a>
          </div>
        </div>

        {/* SmartScreen notice */}
        <p className="text-center text-zinc-600 text-[10px] font-mono mt-8 max-w-lg mx-auto leading-relaxed">
          <span className="text-zinc-500">⚠ Windows Users:</span> If SmartScreen shows a warning, click <span className="text-zinc-400 font-bold">"More info" → "Run anyway"</span>. This is normal for new apps that aren't yet signed with a Microsoft certificate. AdminZero is completely safe to run.
        </p>
      </section>

      {/* ================================================
          PART 4: SECURITY FEATURES — Glassmorphic grid
      ================================================ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t" style={{borderColor: 'rgba(255,255,255,0.04)'}}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">// Protection Engine</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Enterprise-Grade Security, Locally.</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
          {[
            { icon: Lock, title: 'Zero-Knowledge Vault', desc: 'Credentials encrypted by your OS. AdminZero cannot see your passwords.' },
            { icon: Zap, title: '< 4ms Firewall', desc: 'Every query is checked in under 4 milliseconds before it ever reaches your DB.' },
            { icon: Eye, title: 'Live Threat Monitor', desc: 'See every blocked injection in real-time inside your local dashboard.' },
            { icon: Server, title: 'Offline-First', desc: 'AdminZero works entirely offline. Your data never touches our cloud.' },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="relative p-6 rounded-2xl backdrop-blur-xl group hover:scale-[1.02] transition-transform duration-300"
              style={{background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)'}}>
              <div className="absolute top-0 left-6 right-6 h-px" style={{background: 'linear-gradient(90deg, transparent, rgba(249,115,22,0.25), transparent)'}} />
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{background: 'radial-gradient(ellipse at top, rgba(249,115,22,0.04) 0%, transparent 70%)'}} />
              <div className="relative z-10">
                <div className="mb-4 p-2 w-9 h-9 rounded-lg flex items-center justify-center" style={{background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.1)'}}>
                  <Icon size={16} className="text-orange-400" />
                </div>
                <h3 className="text-xs font-extrabold text-white uppercase tracking-wider font-mono mb-2">{title}</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================
          PART 5: PRICING — Glassmorphic Tiers
      ================================================ */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 py-20 border-t" style={{borderColor: 'rgba(255,255,255,0.04)'}}>
        <div className="text-center mb-16">
          <span className="text-[10px] font-bold text-orange-400 uppercase tracking-widest font-mono">// Plans</span>
          <h2 className="text-3xl font-extrabold text-white mt-2">Simple, Transparent Pricing</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
          {[
            { name: 'Developer', price: '₹0', period: 'forever', features: ['Local DB support', '500 queries/mo', 'AST Firewall', 'Community support'], cta: 'Download Free', href: '#download', featured: false },
            { name: 'Startup', price: '₹2,999', period: 'per month', features: ['Postgres & MySQL', '50,000 queries/mo', 'Custom blocklists', 'Email support'], cta: 'Get Started', href: '/portal', featured: true },
            { name: 'Scale', price: '₹14,999', period: 'per month', features: ['All databases', '250,000 queries/mo', 'Team dashboard', 'Priority support'], cta: 'Upgrade', href: '/portal', featured: false },
            { name: 'Enterprise', price: 'Custom', period: 'annual quote', features: ['Unlimited queries', 'Private VPC deploy', 'SLA guarantee', 'Dedicated support'], cta: 'Contact Us', href: 'mailto:issakrajraj@gmail.com', featured: false },
          ].map(({ name, price, period, features, cta, href, featured }) => (
            <div key={name} className="relative p-6 rounded-2xl flex flex-col justify-between backdrop-blur-xl overflow-hidden transition-all duration-300"
              style={{
                background: featured ? 'rgba(249,115,22,0.07)' : 'rgba(255,255,255,0.025)',
                border: featured ? '1.5px solid rgba(249,115,22,0.3)' : '1px solid rgba(255,255,255,0.06)',
                boxShadow: featured ? '0 0 50px rgba(249,115,22,0.07)' : 'none'
              }}>
              <div className="absolute top-0 left-6 right-6 h-px" style={{background: featured ? 'linear-gradient(90deg, transparent, rgba(249,115,22,0.6), transparent)' : 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)'}} />
              {featured && (
                <div className="absolute -top-3 right-4 px-2.5 py-0.5 rounded-full text-black text-[9px] font-black uppercase tracking-widest" style={{background: 'linear-gradient(135deg, #f97316, #fb923c)'}}>
                  Popular
                </div>
              )}
              <div>
                <h3 className="font-extrabold text-white text-sm font-mono uppercase tracking-wider">{name}</h3>
                <div className="my-4">
                  <span className="text-2xl font-black text-white">{price}</span>
                  <span className="text-[10px] text-zinc-500 ml-1">/ {period}</span>
                </div>
                <ul className="space-y-2.5 mb-6">
                  {features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-[11px] text-zinc-400">
                      <CheckCircle2 className="w-3 h-3 text-orange-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <a href={href} className="w-full text-center py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer block"
                style={featured ? {
                  background: 'linear-gradient(135deg, #f97316, #fb923c)',
                  color: '#000',
                  boxShadow: '0 0 15px rgba(249,115,22,0.2)'
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  color: '#fff',
                  border: '1px solid rgba(255,255,255,0.08)'
                }}>
                {cta}
              </a>
            </div>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}

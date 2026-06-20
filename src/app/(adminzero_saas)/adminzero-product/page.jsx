"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bot, Shield, Database, Check, Terminal, Play, MessageSquare, ArrowRight } from 'lucide-react';
import Card from '../../../components/ui/Card';
import Button from '../../../components/ui/Button';

export default function AdminZeroProductPage() {
  const [redirectUri, setRedirectUri] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setRedirectUri(`${window.location.origin}/api/slack/oauth`);
    }
  }, []);

  return (
    <div className="space-y-20 pb-20 animate-fade-in">
      
      {/* 1. Hero Section */}
      <div className="text-center max-w-4xl mx-auto space-y-6 pt-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider"
        >
          <Bot size={14} />
          <span>SaaS Product Feature</span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight"
        >
          Ask your database questions. <br />
          Get answers in <span className="text-gradient">Slack.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 text-base sm:text-xl max-w-2xl mx-auto leading-relaxed"
        >
          AdminZero is a secure ChatOps bot that translates plain English into read-only SQL, runs it against your PostgreSQL database, and formats the output into clean Slack messages.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 pt-4"
        >
          <a
            href={`https://slack.com/oauth/v2/authorize?client_id=${process.env.NEXT_PUBLIC_SLACK_CLIENT_ID || '11352040316962.11349992784470'}&scope=app_mentions:read,chat:write&redirect_uri=${encodeURIComponent(redirectUri)}`}
            className="flex items-center gap-2 bg-[#4A154B] hover:bg-[#381039] text-white font-bold px-6 py-3.5 rounded-xl border border-[#4A154B]/30 transition-all shadow-lg shadow-[#4A154B]/15 text-sm shrink-0 active:scale-95 duration-150"
          >
            <svg className="w-5 h-5 fill-white" viewBox="0 0 122.8 122.8">
              <path d="M25.8 77.6c0-7.1-5.8-12.9-12.9-12.9S0 70.5 0 77.6s5.8 12.9 12.9 12.9h12.9v-12.9zm6.4 0c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9v-38.7c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7zM45.2 12.9c0 7.1 5.8 12.9 12.9 12.9S71 20 71 12.9 65.2 0 58.1 0s-12.9 5.8-12.9 12.9zm0 6.4c7.1 0 12.9 5.8 12.9 12.9v38.7c0 7.1-5.8 12.9-12.9 12.9S32.3 97 32.3 89.9V51.2c0-7.1 5.8-12.9 12.9-12.9zM97 45.2c7.1 0 12.9-5.8 12.9-12.9S104.1 19.4 97 19.4s-12.9 5.8-12.9 12.9v12.9H97zm-6.4 0c0-7.1-5.8-12.9-12.9-12.9s-12.9 5.8-12.9 12.9v38.7c0 7.1 5.8 12.9 12.9 12.9s12.9-5.8 12.9-12.9V45.2zM77.6 109.9c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9-5.8 12.9-12.9 12.9h-12.9v-12.9zm0-6.4c-7.1 0-12.9-5.8-12.9-12.9V51.8c0-7.1 5.8-12.9 12.9-12.9s12.9 5.8 12.9 12.9v51.2c0 7.1-5.8 12.9-12.9 12.9z" />
            </svg>
            Add to Slack
          </a>
          <Button
            size="lg"
            onClick={() => window.location.href = '/adminzero'}
            className="w-full sm:w-auto flex items-center justify-center gap-2"
          >
            <span>Configure Mappings</span>
            <ArrowRight size={20} />
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => document.getElementById('slack-mockup')?.scrollIntoView({ behavior: 'smooth' })}
            className="w-full sm:w-auto"
          >
            See Live Demo
          </Button>
        </motion.div>
      </div>

      {/* 2. Interactive Slack Thread Mockup */}
      <div id="slack-mockup" className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative"
        >
          {/* Slack Window Header */}
          <div className="bg-[#1A1D21] px-6 py-3 border-b border-white/5 flex items-center gap-3">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500/80 inline-block" />
            </div>
            <div className="text-xs text-gray-500 font-mono flex-1 text-center truncate">
              # C0BA9UHE4NA - database-alerts
            </div>
            <div className="w-4 h-4 rounded-full bg-white/5" />
          </div>

          {/* Slack Feed Content */}
          <div className="bg-[#1F2326] p-6 space-y-6 text-left font-sans text-sm">
            
            {/* User Message */}
            <div className="flex gap-3.5">
              <div className="w-10 h-10 rounded-lg bg-[#E01E5A] flex items-center justify-center text-white font-bold shrink-0 shadow-md">
                IR
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">Issak Raj</span>
                  <span className="text-[10px] text-gray-500">4:15 PM</span>
                </div>
                <div className="text-gray-300">
                  <span className="text-brand-blue bg-brand-blue/10 px-1 py-0.5 rounded">@AdminZero</span> how many client requests
                </div>
              </div>
            </div>

            {/* Bot Response 1: Translating status */}
            <div className="flex gap-3.5 border-l-2 border-brand-blue/30 pl-4 py-0.5">
              <div className="w-10 h-10 rounded-lg bg-dark-bg border border-white/10 flex items-center justify-center text-brand-blue shrink-0 shadow-md text-xl">
                🤖
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">AdminZero</span>
                  <span className="text-[10px] text-brand-blue uppercase tracking-wider font-bold bg-brand-blue/10 px-1.5 py-0.2 rounded border border-brand-blue/20">APP</span>
                  <span className="text-[10px] text-gray-500">4:15 PM</span>
                </div>
                <div className="text-gray-400 italic flex items-center gap-1.5">
                  🔍 Translating query for database: "Supabase Main"...
                </div>
              </div>
            </div>

            {/* Bot Response 2: Executing Query status */}
            <div className="flex gap-3.5 border-l-2 border-brand-blue/30 pl-4 py-0.5">
              <div className="w-10 h-10 rounded-lg bg-dark-bg border border-white/10 flex items-center justify-center text-brand-blue shrink-0 shadow-md text-xl">
                🤖
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">AdminZero</span>
                  <span className="text-[10px] text-brand-blue uppercase tracking-wider font-bold bg-brand-blue/10 px-1.5 py-0.2 rounded border border-brand-blue/20">APP</span>
                  <span className="text-[10px] text-gray-500">4:15 PM</span>
                </div>
                <div className="text-gray-400 italic">
                  ⚙️ Executing generated query:
                </div>
                <div className="bg-[#121416] p-3 rounded-lg border border-white/5 font-mono text-xs text-brand-blue-light max-w-full overflow-x-auto">
                  SELECT COUNT(*) FROM client_requests
                </div>
              </div>
            </div>

            {/* Bot Response 3: Execution Result */}
            <div className="flex gap-3.5 border-l-2 border-emerald-500/30 pl-4 py-0.5">
              <div className="w-10 h-10 rounded-lg bg-dark-bg border border-white/10 flex items-center justify-center text-emerald-400 shrink-0 shadow-md text-xl">
                🤖
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-white">AdminZero</span>
                  <span className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">APP</span>
                  <span className="text-[10px] text-gray-500">4:16 PM</span>
                </div>
                <div className="text-gray-300 font-bold">
                  ✅ Query Results:
                </div>
                
                {/* Monospace markdown table */}
                <div className="bg-[#121416] p-4 rounded-xl border border-white/5 font-mono text-xs text-emerald-400 max-w-full overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
                  {`count\n-----\n22`}
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </div>

      {/* 3. Detailed Security & Feature Cards */}
      <div className="space-y-12">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white">Two-Layer Security Architecture</h2>
          <p className="text-sm text-gray-400 mt-2">
            Built with security first, ensuring business team queries can never mutate or compromise your structural database integrity.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          <Card className="bg-white/[0.02] border-white/5 p-8 text-left space-y-4">
            <div className="p-3 bg-brand-blue/10 border border-brand-blue/20 text-brand-blue rounded-2xl w-12 h-12 flex items-center justify-center">
              <Shield size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Read-Only Guardrails</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Enforced by strict model rules that reject requests attempting modifications. It refuses `INSERT`, `UPDATE`, `DELETE`, or `DROP` commands at the core AI level.
            </p>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 p-8 text-left space-y-4">
            <div className="p-3 bg-brand-orange/10 border border-brand-orange/20 text-brand-orange rounded-2xl w-12 h-12 flex items-center justify-center">
              <Terminal size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">Secondary SQL Scanner</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Every query goes through a secondary, local regex script scanner before executing. Any query not starting with `SELECT` or containing mutating keywords is immediately blocked.
            </p>
          </Card>

          <Card className="bg-white/[0.02] border-white/5 p-8 text-left space-y-4">
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl w-12 h-12 flex items-center justify-center">
              <Database size={24} />
            </div>
            <h3 className="text-xl font-bold text-white">AES-256 Credentials</h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Connection credentials are encrypted on the server utilizing cipher keys before inserting into the SQLite database. Passwords are never returned in plaintext.
            </p>
          </Card>

        </div>
      </div>

      {/* 4. Pricing Plans */}
      <div className="space-y-12 border-t border-white/5 pt-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold text-white">Simple, Straightforward Pricing</h2>
          <p className="text-sm text-gray-400 mt-2">
            Choose the plan that fits your engineering team's scale. Cancel or upgrade at any time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          
          {/* Starter Plan */}
          <Card className="bg-white/[0.02] border-white/5 p-8 text-left flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Starter Plan</h3>
                <p className="text-xs text-gray-500 mt-1">Perfect for testing and small teams</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">₹0</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">/ month</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-400 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>1 Mapped Slack Channel</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>1 Database Connection</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>100 AI Queries / month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Community Support</span>
                </li>
              </ul>
            </div>
            <div className="pt-8 w-full">
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/adminzero'}
                className="w-full flex justify-center py-3"
              >
                Get Started Free
              </Button>
            </div>
          </Card>

          {/* Pro Plan */}
          <Card className="bg-white/[0.02] border-white/5 p-8 text-left flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Pro Plan</h3>
                <p className="text-xs text-brand-orange mt-1">For production scale and team control</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">₹999</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">/ month</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-400 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-orange" />
                  <span>10 Mapped Slack Channels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-orange" />
                  <span>10 Database Connections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-orange" />
                  <span>1,000 AI Queries / month</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-orange" />
                  <span>Priority Email Support</span>
                </li>
              </ul>
            </div>
            <div className="pt-8 w-full">
              <Button
                variant="secondary"
                onClick={() => window.location.href = '/adminzero'}
                className="w-full flex justify-center py-3"
              >
                Go Pro Now
              </Button>
            </div>
          </Card>

          {/* Business Plan */}
          <Card className="bg-white/[0.03] border-brand-blue/30 p-8 text-left flex flex-col justify-between relative overflow-hidden group shadow-lg shadow-brand-blue/5">
            <div className="absolute top-0 right-0 bg-brand-blue text-white font-extrabold text-[9px] uppercase tracking-widest py-1 px-4 rounded-bl-xl">
              RECOMMENDED
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-white">Business Plan</h3>
                <p className="text-xs text-brand-blue mt-1">For full enterprise autonomy & SLA</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white tracking-tight font-mono">₹3,999</span>
                <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">/ month</span>
              </div>
              <ul className="space-y-3.5 text-sm text-gray-300 border-t border-white/5 pt-6">
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Unlimited Slack Channels</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Unlimited DB Connections</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Unlimited Queries (Max 1M/mo)</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Custom Schema Column Hints</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <Check size={16} className="text-brand-blue" />
                  <span>Dedicated Slack Setup Support</span>
                </li>
              </ul>
            </div>
            <div className="pt-8 w-full">
              <Button
                variant="primary"
                onClick={() => window.location.href = '/adminzero'}
                className="w-full flex justify-center py-3"
              >
                Go Business Now
              </Button>
            </div>
          </Card>

        </div>
      </div>

      {/* 5. Step-by-Step Setup Guide */}
      <div className="space-y-12 border-t border-white/5 pt-20 max-w-4xl mx-auto">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Setup in 3 Steps</h2>
          <p className="text-sm text-gray-400 mt-2">
            No heavy installation required. Connect AdminZero in under 5 minutes.
          </p>
        </div>

        <div className="relative border-l border-white/10 ml-4 md:ml-8 space-y-12 text-left">
          
          {/* Step 1 */}
          <div className="relative pl-8 md:pl-10">
            <span className="absolute -left-4 top-1.5 w-8 h-8 rounded-full bg-dark-surface border border-white/15 text-white flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Create & Configure Your Slack App</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
              Go to the Slack App console and build a custom app. Add OAuth scopes for <code className="text-white bg-white/5 px-1 py-0.5 rounded font-mono text-xs">app_mentions:read</code> and <code className="text-white bg-white/5 px-1 py-0.5 rounded font-mono text-xs">chat:write</code>, then install it to your workspace and copy your OAuth Bot token to your environment settings.
            </p>
          </div>

          {/* Step 2 */}
          <div className="relative pl-8 md:pl-10">
            <span className="absolute -left-4 top-1.5 w-8 h-8 rounded-full bg-dark-surface border border-white/15 text-white flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Map Connections in the Dashboard</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
              Log into the <a href="/adminzero" className="text-brand-blue hover:underline">AdminZero Portal</a> using your password. Enter the target Slack Channel ID, a database connection URL, and describe your table columns as schema hints to guide the AI translator.
            </p>
          </div>

          {/* Step 3 */}
          <div className="relative pl-8 md:pl-10">
            <span className="absolute -left-4 top-1.5 w-8 h-8 rounded-full bg-dark-surface border border-white/15 text-white flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h3 className="text-lg font-bold text-white mb-2">Invite the Bot & Run Queries</h3>
            <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
              Invite the bot into your mapped Slack channel typing <code className="text-white bg-white/5 px-1 py-0.5 rounded font-mono text-xs">/invite @AdminZero</code>. Now, simply ask `@AdminZero how many client requests do we have?` and watch it respond!
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}

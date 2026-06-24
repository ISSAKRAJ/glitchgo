"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Bot, Shield, Terminal, ArrowRight, Check, HelpCircle, 
  Play, Cpu, Database, MessageSquare, AlertCircle, FileText, Download 
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('glitchgo'); // 'glitchgo' | 'adminzero'

  return (
    <div className="flex flex-col min-h-screen bg-dark-bg text-white">
      <Navbar />

      <main className="flex-1 w-full pt-32 pb-24 relative overflow-hidden">
        {/* Ambient background lights */}
        <div className="absolute top-1/4 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto px-6 relative z-10">
          
          {/* Header */}
          <div className="text-center mb-16 space-y-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider"
            >
              <BookOpen size={14} />
              <span>HELP CENTER & DOCUMENTATION</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight font-outfit"
            >
              How to Use GlitchGo & AdminZero
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed"
            >
              Your complete setup guide and documentation. Get step-by-step instructions for all features.
            </motion.p>

            {/* Toggle Switch */}
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex bg-dark-surface/50 border border-white/10 p-1.5 rounded-2xl relative shadow-inner mt-8"
            >
              <div className="relative flex gap-2 z-10">
                <button
                  onClick={() => setActiveTab('glitchgo')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-250 cursor-pointer ${
                    activeTab === 'glitchgo' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  💼 Enterprise AI
                </button>
                <button
                  onClick={() => setActiveTab('adminzero')}
                  className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-colors duration-250 cursor-pointer flex items-center gap-1.5 ${
                    activeTab === 'adminzero' ? 'text-white' : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  🤖 AdminZero (SaaS Product)
                </button>
              </div>
              
              {/* Sliding background pill indicator */}
              <div
                className="absolute top-1.5 bottom-1.5 left-1.5 bg-brand-blue rounded-xl shadow-lg shadow-brand-blue/20 transition-all duration-300"
                style={{
                  width: activeTab === 'glitchgo' ? '154px' : '204px',
                  transform: activeTab === 'glitchgo' ? 'translateX(0)' : 'translateX(162px)'
                }}
              />
            </motion.div>
          </div>

          {/* Tab 1: GlitchGo Guide */}
          {activeTab === 'glitchgo' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16 text-left"
            >
              {/* Section 1: Ordering */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center text-sm font-bold font-mono">1</span>
                  Select a Custom Solution & Submit Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      GlitchGo provides high-ticket Custom Enterprise AI Implementations. On the homepage, choose between:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>Enterprise System Refactoring & Scale</strong>: Complete codebase audits, security upgrades, database optimizations, and legacy system refactoring.</li>
                      <li><strong>Custom AI Agent & Pipeline Development</strong>: Bespoke multi-agent orchestration, private enterprise LLM pipelines, and Slack ChatOps integration.</li>
                    </ul>
                    <p>
                      Click <strong>Request Custom Proposal</strong> on any service card to pre-fill the Enterprise Demo form. Fill out your Name, Work Email, and Company Size, and our solutions team will analyze your requirements.
                    </p>
                  </div>
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-brand-orange">
                      <AlertCircle size={14} /> Demo Form Guardrails
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Our secure intake form validates contact info, verifying work domain emails and ensuring company size selections are captured. Spam-bot filters are run dynamically.
                    </p>
                    <div className="border border-white/10 rounded-lg p-3 bg-dark-bg font-mono text-[10px] text-brand-orange-light">
                      * Name: John Doe<br />
                      * Work Email: john@company.com<br />
                      * Company Size: 11 - 50 Employees<br />
                      * Notes: Custom database integration specs
                    </div>
                  </Card>
                </div>
              </div>

              {/* Section 2: Payments */}
              <div className="space-y-6 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center text-sm font-bold font-mono">2</span>
                  Milestone Invoice Verification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                        UPI
                      </div>
                      <h4 className="font-bold text-white text-sm">Scan QR or Manual UTR</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Payments and invoices are processed securely. Once our solutions engineering team approves the proposal and defines milestones, invoice checkouts are unlocked in your portal. Scan dynamic QR codes to pay via instant UPI.
                    </p>
                  </Card>
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      After completing a milestone transaction, submit proof to unlock portal credentials and source code:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>AI Receipt Scan</strong>: Upload a screenshot of your milestone receipt. Gemini scans the transaction details in real time to verify UPI reference IDs.</li>
                      <li><strong>Manual UTR</strong>: Manually enter the 12-digit transaction ID from your bank confirmation page to verify payment instantly.</li>
                    </ul>
                    <p className="text-xs text-gray-500 italic">
                      Note: To prevent duplication fraud, the database rejects already-used UTR references.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 3: Delivery */}
              <div className="space-y-6 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center text-sm font-bold font-mono">3</span>
                  Track Milestones & Sign Off Builds
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      Keep track of your custom implementations live in the Portal dashboard. Milestones transition from Proposal to Active development, QA, and Delivery.
                    </p>
                    <p>
                      Once a milestone is complete, a secure download button appears. You can download configuration files, codebase patches, or secure deployment builds.
                    </p>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-xs text-red-400">
                      <strong>⚠️ AUTOMATED DATA PURGE NOTICE:</strong><br />
                      To ensure client privacy and strict enterprise database compliance, we purge custom repository builds from our systems exactly 7 days after milestone sign-off. Download backups immediately.
                    </div>
                  </div>
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-between">
                    <div>
                      <h4 className="font-bold text-white mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-brand-blue">
                        <Shield size={14} /> Confidentiality & NDAs
                      </h4>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        All codebase refactoring and custom implementations are conducted under strict privacy. Our execution environments are isolated, ensuring client configurations and schema mappings are never leaked.
                      </p>
                    </div>
                    <div className="border border-white/10 rounded-lg p-3 bg-dark-bg flex items-center justify-between text-xs font-mono">
                      <span className="text-emerald-400">✓ Security Sandbox</span>
                      <span className="text-emerald-400">✓ MSME Reg: UDYAM-AP-17-0080333</span>
                    </div>
                  </Card>
                </div>
              </div>

            </motion.div>
          )}

          {/* Tab 2: AdminZero Guide */}
          {activeTab === 'adminzero' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-16 text-left"
            >
              {/* Section 1: Slack App Setup */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center text-sm font-bold font-mono">1</span>
                  Setup custom Slack Application
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      To interact with your database using natural English, you need to create a Slack app for your workspace:
                    </p>
                    <ol className="list-decimal pl-5 space-y-2">
                      <li>Go to the <a href="https://api.slack.com/apps" target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline">Slack App Console</a> and click <strong>Create New App</strong>.</li>
                      <li>Select <strong>From scratch</strong>, name your application (e.g. <em>AdminZero</em>), and choose your target Slack workspace.</li>
                      <li>Under <strong>OAuth & Permissions</strong>, scroll down to <strong>Scopes</strong> and add these Bot Token scopes:
                        <ul className="list-disc pl-5 mt-1 font-mono text-xs text-white space-y-0.5">
                          <li>app_mentions:read</li>
                          <li>chat:write</li>
                        </ul>
                      </li>
                      <li>Install the app to your workspace and copy the generated <strong>Bot User OAuth Token</strong> (starts with <code className="text-white bg-white/5 px-1 py-0.5 rounded">xoxb-</code>).</li>
                    </ol>
                  </div>
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center">
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-brand-blue">
                      <Terminal size={14} /> Slack Credentials Hint
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Add your Slack app Bot token and client credentials to your server environment file:
                    </p>
                    <div className="border border-white/10 rounded-lg p-3 bg-dark-bg font-mono text-[10px] text-brand-blue-light">
                      SLACK_BOT_TOKEN=xoxb-your-token-here<br />
                      SLACK_SIGNING_SECRET=your-secret-here<br />
                      NEXT_PUBLIC_SLACK_CLIENT_ID=your-client-id-here
                    </div>
                  </Card>
                </div>
              </div>

              {/* Section 2: Config Mappings */}
              <div className="space-y-6 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center text-sm font-bold font-mono">2</span>
                  Map Workspace & Database Credentials
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="text-brand-blue" size={24} />
                      <h4 className="font-bold text-white text-sm">Secure AES-256 Credentials</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Your connection credentials are encrypted on the server utilizing cipher keys before inserting into the SQLite database. Database credentials are never stored in plaintext and cannot be read by anyone else.
                    </p>
                  </Card>
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      Log into the **AdminZero Portal** (`/adminzero`) to map database connection configurations:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Create a **Workspace** representation. Tiers are defined as *Starter* (₹0/mo, 1 DB limit), *Pro* (₹999/mo, 10 DB limit), or *Business* (₹3,999/mo, unlimited DBs).</li>
                      <li>Under **Database Mappings**, click "Add Connection". Specify a unique Name, select the mapped Slack Channel ID, and enter your PostgreSQL Connection URI.</li>
                      <li>Use the **Test Connection** button. The server will run a safe authentication check, returning success if the connection is established.</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Section 3: Schema hints & querying */}
              <div className="space-y-6 border-t border-white/5 pt-12">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-blue flex items-center justify-center text-sm font-bold font-mono">3</span>
                  Supply Schema Hints & Run Queries in Slack
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      To help the AI translate natural language queries accurately, you can provide schema hints:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Describe important tables, columns, and relations. E.g., <code>"client_requests table holds intake leads, status column shows payment status (Paid, Completed)"</code>.</li>
                      <li>Invite the bot into your channel: Type <code className="text-white bg-white/5 px-1 py-0.5 rounded">/invite @AdminZero</code> inside the target Slack channel.</li>
                      <li>Query the bot directly in English: Mention the bot and type your query, e.g. <code className="text-white bg-white/5 px-1 py-0.5 rounded">@AdminZero show me all paid client requests</code>.</li>
                    </ul>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-xs">
                      <p className="font-semibold text-white mb-2 flex items-center gap-2">
                        <Shield size={14} className="text-brand-orange" /> Read-Only Security Guardrails
                      </p>
                      <p className="text-gray-400 leading-normal">
                        AdminZero enforces read-only query integrity. Mutating statements (`INSERT`, `UPDATE`, `DELETE`, `DROP`, etc.) are blocked at both the LLM generator core and a secondary local regex scanner. All query outputs automatically append `LIMIT 100` to optimize execution runtime.
                      </p>
                    </div>
                  </div>
                  <Card className="bg-[#1F2326] border border-white/10 p-6 rounded-2xl text-left font-sans text-xs">
                    <div className="border-b border-white/5 pb-2 mb-3 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-500/80 inline-block" />
                      <span className="text-[10px] text-gray-500 font-mono ml-2">Slack Live Conversation</span>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <span className="font-bold text-white">Issak Raj</span> <span className="text-[9px] text-gray-500">10:42 PM</span>
                        <p className="text-gray-300 mt-0.5">@AdminZero how many bug fixes are completed?</p>
                      </div>
                      <div className="border-l-2 border-brand-blue/30 pl-3 py-0.5">
                        <span className="font-bold text-white">AdminZero</span> <span className="text-[9px] bg-brand-blue/20 text-brand-blue px-1 rounded font-bold ml-1">APP</span>
                        <p className="text-gray-400 italic mt-0.5">🔍 Translating query for database...</p>
                        <p className="text-gray-400 italic mt-1">⚙️ Executing SQL: <code className="text-brand-blue-light font-mono text-[10px]">SELECT COUNT(*) FROM client_requests WHERE status = 'Completed' LIMIT 100;</code></p>
                      </div>
                      <div className="border-l-2 border-emerald-500/30 pl-3 py-0.5">
                        <span className="font-bold text-white">AdminZero</span> <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-1 rounded font-bold ml-1">APP</span>
                        <p className="text-emerald-400 font-mono text-[10px] mt-1.5 bg-[#121416] p-2 rounded">count<br />-----<br />18</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </motion.div>
          )}

          {/* Help Contact */}
          <div className="mt-20 border-t border-white/5 pt-12 text-center space-y-4">
            <HelpCircle className="mx-auto text-brand-orange" size={32} />
            <h3 className="text-xl font-bold text-white">Still Need Help?</h3>
            <p className="text-gray-400 text-sm max-w-md mx-auto">
              If you have any issues setting up AdminZero or ordering a project rescue, reach out directly to our engineering support team.
            </p>
            <p className="text-brand-blue font-bold text-sm">
              <a href="mailto:teamglitchgo@gmail.com" className="hover:underline">teamglitchgo@gmail.com</a>
            </p>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}

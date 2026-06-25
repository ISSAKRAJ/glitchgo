"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  BookOpen, Bot, Shield, Terminal, HelpCircle, 
  Database, MessageSquare, AlertCircle, FileText, Download,
  Upload, Sparkles, RefreshCw, Lock, Eye, AlertTriangle
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import Card from '../../components/ui/Card';

// Presets for the UPI Receipt Scanner Simulator
const RECEIPT_PRESETS = [
  {
    id: 'valid',
    label: '✅ Valid Pro Plan Receipt (₹999)',
    recipient: '7013017818@naviaxis',
    amount: '₹999.00',
    utr: '349812760541',
    status: 'Success',
    filename: 'upi_receipt_pro_999.png',
    resultType: 'success',
    notes: 'Valid recipient, correct Pro amount, unique UTR.'
  },
  {
    id: 'wrong_recipient',
    label: '❌ Receipt with Incorrect Recipient',
    recipient: '7013017818@otherupi',
    amount: '₹999.00',
    utr: '827104958273',
    status: 'Success',
    filename: 'payment_screenshot_other.png',
    resultType: 'wrong_recipient',
    notes: 'Paid to wrong UPI merchant. Gemini Vision detects incorrect ID and flags it.'
  },
  {
    id: 'duplicate_utr',
    label: '❌ Receipt with Already Used UTR (Duplicate)',
    recipient: '7013017818@naviaxis',
    amount: '₹999.00',
    utr: '123456789012',
    status: 'Success',
    filename: 'old_receipt_copy.png',
    resultType: 'duplicate',
    notes: 'Valid receipt details, but UTR is already in database (prevents duplicate credit fraud).'
  }
];

// Presets for the Slack ChatOps SQL Query Simulator
const QUERY_PRESETS = [
  {
    id: 'safe',
    label: '🔍 Safe Query',
    prompt: '@AdminZero show me total paid requests from today',
    deepseekSql: "SELECT * FROM client_requests WHERE status = 'Paid' AND created_at >= CURRENT_DATE;",
    astCheck: 'PASS',
    astDetails: 'Type: SELECT. Target Tables: [client_requests]. Blacklisted Columns Check: OK.',
    dbResult: 'Success: 3 rows returned',
    finalResponse: `📊 *AdminZero Lead Analyst Report*
Found *3* paid requests today:
• *John Doe* (₹999) - _10:30 AM_
• *Jane Smith* (₹999) - _11:15 AM_
• *AP Tech* (₹3,999) - _02:45 PM_

Total revenue generated: *₹5,997*
[Processed and summarized by *gemini-2.5-flash* Lead Analyst]`,
    healed: false
  },
  {
    id: 'unsafe_mutation',
    label: '⚠️ Mutation Attempt',
    prompt: '@AdminZero DELETE FROM client_requests WHERE id = 12',
    deepseekSql: "DELETE FROM client_requests WHERE id = 12;",
    astCheck: 'BLOCKED',
    astDetails: 'Type: DELETE. Security Exception: DML write operations (DELETE, INSERT, UPDATE, DROP) are strictly prohibited on read-only connections.',
    dbResult: 'Not Executed (Blocked at AST level)',
    finalResponse: `❌ *AdminZero Security Alert*
Access Denied. Mutating statement type \`DELETE\` was intercepted and blocked by the AST Shield.
*Action:* Statement blocked.
*Incident Code:* AZ-SEC-9912
This query was not sent to your database.`,
    healed: false
  },
  {
    id: 'forbidden_column',
    label: '🔒 Column Leak Attempt',
    prompt: '@AdminZero show me user passwords and connection details',
    deepseekSql: "SELECT username, password, connection_uri FROM users;",
    astCheck: 'BLOCKED',
    astDetails: 'Type: SELECT. Security Exception: Column [password] and [connection_uri] are blacklisted in system schema policies.',
    dbResult: 'Not Executed (Blocked at AST level)',
    finalResponse: `❌ *AdminZero Security Alert*
Access Denied. The query attempts to select blacklisted columns (\`password\`, \`connection_uri\`) which are restricted.
*Action:* Statement blocked.
*Incident Code:* AZ-SEC-4033
This query was not sent to your database.`,
    healed: false
  },
  {
    id: 'misspelled_healing',
    label: '✨ Misspelled Table (Self-Healing)',
    prompt: '@AdminZero select count(*) from client_requsts',
    deepseekSql: "SELECT COUNT(*) FROM client_requsts;",
    astCheck: 'PASS',
    astDetails: 'Type: SELECT. Target Tables: [client_requsts]. Blacklisted Columns Check: OK.',
    dbResult: 'Error: table "client_requsts" does not exist',
    healed: true,
    escalationLog: 'DeepSeek syntax query failed. Escalating to gemini-2.5-pro for query repair...',
    repairedSql: "SELECT COUNT(*) FROM client_requests;",
    repairedDbResult: 'Success: 1 row returned',
    finalResponse: `📊 *AdminZero Lead Analyst Report*
There are currently *12* total client requests registered in your database.
_Note: Database connection healed query syntax mismatch automatically. (Table "client_requsts" -> "client_requests")_
[Processed and summarized by *gemini-2.5-flash* Lead Analyst]`,
  }
];

export default function GuidePage() {
  const [activeTab, setActiveTab] = useState('glitchgo'); // 'glitchgo' | 'adminzero'

  // Timeout references to prevent memory leaks
  const timeoutsRef = useRef([]);

  const cleanAllTimeouts = () => {
    timeoutsRef.current.forEach(clearTimeout);
    timeoutsRef.current = [];
  };

  useEffect(() => {
    return () => cleanAllTimeouts();
  }, []);

  // --- UPI Scanner Simulator State ---
  const [selectedReceipt, setSelectedReceipt] = useState(RECEIPT_PRESETS[0]);
  const [isReceiptScanning, setIsReceiptScanning] = useState(false);
  const [receiptScanLogs, setReceiptScanLogs] = useState([]);
  const [receiptScanStatus, setReceiptScanStatus] = useState('idle'); // 'idle' | 'scanning' | 'done'

  const handleSimulateReceiptScan = () => {
    cleanAllTimeouts();
    setIsReceiptScanning(true);
    setReceiptScanStatus('scanning');
    setReceiptScanLogs([]);

    const logSteps = [
      { text: `🔄 [Gemini Vision] Loading receipt image '${selectedReceipt.filename}'...`, delay: 400 },
      { text: `📝 [Gemini Vision] Running OCR character extraction...`, delay: 900 },
      { text: `🔍 [Gemini Vision] Target Recipient: '${selectedReceipt.recipient}'`, delay: 1400 },
      { text: `💰 [Gemini Vision] Target Amount: ${selectedReceipt.amount}`, delay: 1900 },
      { text: `💳 [Gemini Vision] Extracted UTR Ref: ${selectedReceipt.utr}`, delay: 2400 },
    ];

    logSteps.forEach((step) => {
      const id = setTimeout(() => {
        setReceiptScanLogs(prev => [...prev, step.text]);
      }, step.delay);
      timeoutsRef.current.push(id);
    });

    const finalId = setTimeout(() => {
      setIsReceiptScanning(false);
      setReceiptScanStatus('done');

      let finalLog = "";
      if (selectedReceipt.resultType === 'success') {
        finalLog = `✅ [SYSTEM] Verification SUCCESS. Match found. UPI Recipient corresponds to '7013017818@naviaxis'. UTR is unique and registered. Milestone unlocked!`;
      } else if (selectedReceipt.resultType === 'wrong_recipient') {
        finalLog = `❌ [SYSTEM] Verification FAILED. Recipient matches '${selectedReceipt.recipient}', but must strictly be '7013017818@naviaxis'. Transaction rejected.`;
      } else if (selectedReceipt.resultType === 'duplicate') {
        finalLog = `❌ [SYSTEM] Verification FAILED. UTR '${selectedReceipt.utr}' already exists in database. Duplicate transaction claim prevented.`;
      }
      setReceiptScanLogs(prev => [...prev, finalLog]);
    }, 2900);
    timeoutsRef.current.push(finalId);
  };

  // --- Slack Query Simulator State ---
  const [selectedQuery, setSelectedQuery] = useState(QUERY_PRESETS[0]);
  const [queryInput, setQueryInput] = useState(QUERY_PRESETS[0].prompt);
  const [isCustomQuery, setIsCustomQuery] = useState(false);
  const [querySimStep, setQuerySimStep] = useState('idle'); // 'idle' | 'translating' | 'checking_ast' | 'executing' | 'synthesizing' | 'done'
  const [simLogs, setSimLogs] = useState([]);

  const handleSelectQueryPreset = (preset) => {
    setSelectedQuery(preset);
    setQueryInput(preset.prompt);
    setIsCustomQuery(false);
    setQuerySimStep('idle');
    setSimLogs([]);
  };

  const handleCustomQueryChange = (e) => {
    setQueryInput(e.target.value);
    setIsCustomQuery(true);
    setQuerySimStep('idle');
    setSimLogs([]);
  };

  const handleSimulateQuery = () => {
    cleanAllTimeouts();
    setSimLogs([]);
    setQuerySimStep('translating');

    // Setup simulated steps based on preset or custom logic
    let targetPreset = selectedQuery;
    
    if (isCustomQuery) {
      // Basic dynamic logic for custom typing
      const isMutation = /\b(delete|update|drop|insert|alter|create|truncate)\b/i.test(queryInput);
      const isForbidden = /\b(password|secret|ssn|connection_uri|token)\b/i.test(queryInput);
      const isMisspelled = /\b(client_requsts|requsts)\b/i.test(queryInput);

      if (isMutation) {
        targetPreset = QUERY_PRESETS.find(p => p.id === 'unsafe_mutation');
      } else if (isForbidden) {
        targetPreset = QUERY_PRESETS.find(p => p.id === 'forbidden_column');
      } else if (isMisspelled) {
        targetPreset = QUERY_PRESETS.find(p => p.id === 'misspelled_healing');
      } else {
        targetPreset = {
          ...QUERY_PRESETS[0],
          prompt: queryInput,
          deepseekSql: `SELECT * FROM client_requests WHERE name ILIKE '%${queryInput.replace(/@AdminZero\s+/g, '')}%' LIMIT 10;`,
          finalResponse: `📊 *AdminZero Lead Analyst Report*\nProcessed custom query. Executed raw SELECT safely.\nNo matches found for that criteria.\n[Processed and summarized by *gemini-2.5-flash* Lead Analyst]`
        };
      }
    }

    // Step 1: Translate
    const tId1 = setTimeout(() => {
      setQuerySimStep('checking_ast');
      setSimLogs(prev => [...prev, `⚡ [DeepSeek V3] Translated text to SQL:\n   ${targetPreset.deepseekSql}`]);
    }, 800);
    timeoutsRef.current.push(tId1);

    // Step 2: AST Check
    const tId2 = setTimeout(() => {
      if (targetPreset.astCheck === 'BLOCKED') {
        setQuerySimStep('done');
        setSimLogs(prev => [
          ...prev, 
          `🛡️ [AST Shield] BLOCKED!`,
          `💥 [AST Exception] ${targetPreset.astDetails}`
        ]);
        return;
      }
      setQuerySimStep('executing');
      setSimLogs(prev => [...prev, `🛡️ [AST Shield] PASS: Query verified as read-only. Details: ${targetPreset.astDetails}`]);
    }, 1600);
    timeoutsRef.current.push(tId2);

    // Step 3: Database execution / Self-healing Escalation
    const tId3 = setTimeout(() => {
      if (targetPreset.astCheck === 'BLOCKED') return; // skipped

      if (targetPreset.healed) {
        setSimLogs(prev => [
          ...prev, 
          `🔌 [DB Client] Connecting...`,
          `❌ [DB Client] Error: table "client_requsts" does not exist`,
          `✨ [Self-Healing] ${targetPreset.escalationLog}`,
          `🔧 [gemini-2.5-pro] Repaired SQL: ${targetPreset.repairedSql}`,
          `🔌 [DB Client] Retrying repaired SQL...`,
          `✅ [DB Client] ${targetPreset.repairedDbResult}`
        ]);
        setQuerySimStep('synthesizing');
      } else {
        setSimLogs(prev => [
          ...prev, 
          `🔌 [DB Client] Connecting...`,
          `✅ [DB Client] ${targetPreset.dbResult}`
        ]);
        setQuerySimStep('synthesizing');
      }
    }, 2600);
    timeoutsRef.current.push(tId3);

    // Step 4: Flash synthesis
    const tId4 = setTimeout(() => {
      if (targetPreset.astCheck === 'BLOCKED') return; // skipped

      setQuerySimStep('done');
      setSimLogs(prev => [
        ...prev, 
        `🧠 [gemini-2.5-flash] Synthesizing query results and formatting for Slack...`
      ]);
    }, 3600);
    timeoutsRef.current.push(tId4);
  };

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
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-blue/10 border border-brand-blue/20 text-brand-blue text-xs font-bold uppercase tracking-wider">
              <BookOpen size={14} />
              <span>HELP CENTER & DOCUMENTATION</span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white leading-tight font-outfit">
              How to Use GlitchGo & AdminZero
            </h1>

            <p className="text-gray-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
              Explore interactive playgrounds to learn about our automated UPI billing checkers and database query security pipelines.
            </p>

            {/* Toggle Switch */}
            <div className="inline-flex bg-dark-surface/50 border border-white/10 p-1.5 rounded-2xl relative shadow-inner mt-8">
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
            </div>
          </div>

          {/* Tab 1: GlitchGo Guide */}
          {activeTab === 'glitchgo' && (
            <div className="space-y-16 text-left">
              {/* Section 1: Ordering */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3 font-outfit">
                  <span className="w-8 h-8 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange flex items-center justify-center text-sm font-bold font-mono">1</span>
                  Select a Custom Solution & Request Demo
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
                      Click <strong>Request Demo</strong> on the navigation bar or scroll to the bottom of the landing page to fill out the Enterprise Demo form. Fill out your Name, Work Email, and Company Size, and our solutions team will analyze your requirements.
                    </p>
                  </div>
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center" hover={false}>
                    <h3 className="font-bold text-white mb-2 flex items-center gap-2 text-xs uppercase tracking-wider text-brand-orange">
                      <AlertCircle size={14} /> Demo Form Guardrails
                    </h3>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Our secure intake form validates contact info, verifying work domain emails and ensuring company size selections are captured. Spam-bot filters are run dynamically.
                    </p>
                    <div className="border border-white/10 rounded-lg p-3 bg-dark-bg font-mono text-[10px] text-brand-orange">
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
                  AI-Powered UPI Invoice Verification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      Payments and invoices are processed securely. Once our solutions engineering team approves the proposal and defines milestones, invoice checkouts are unlocked in your portal. Scan the dynamic QR code to make your UPI payment.
                    </p>
                    <p>
                      After completing a milestone transaction, submit proof to unlock portal credentials and source code:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li><strong>AI Receipt Scan (Gemini Vision)</strong>: Upload a screenshot of your milestone receipt. Gemini scans the transaction details in real-time, validating recipient UPI ID, amount, payment status, and extracting the 12-digit UTR instantly.</li>
                      <li><strong>Manual UTR (Fallback)</strong>: If the receipt scan fails or you prefer manual entry, submit the 12-digit transaction ID (UTR) from your bank confirmation for quick manual admin review.</li>
                    </ul>
                    <div className="bg-brand-orange/10 border border-brand-orange/20 rounded-xl p-4 text-xs text-brand-orange space-y-1">
                      <div className="font-bold flex items-center gap-1.5">
                        <Lock size={12} /> FRAUD PREVENTION SCHEMES
                      </div>
                      <p className="text-[11px] text-gray-400">
                        • <strong>Merchant Check:</strong> Gemini Vision strictly verifies the recipient is <strong>7013017818@naviaxis</strong>.<br />
                        • <strong>Deduplication:</strong> The database rejects already-used UTR references, preventing duplicate credit fraud.
                      </p>
                    </div>
                  </div>

                  {/* INTERACTIVE UPI RECEIPT SCANNER SIMULATOR */}
                  <Card className="bg-[#121316] border border-white/10 p-6 flex flex-col justify-between" hover={false}>
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Sparkles size={14} className="text-brand-orange animate-pulse" /> Receipt Scanner Playground
                        </h4>
                        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded font-mono">Gemini Vision v2.5</span>
                      </div>

                      <p className="text-[11px] text-slate-400 mb-4">
                        Select a mock receipt screenshot below to test how our AI Vision processing handles validation rules in real-time.
                      </p>

                      {/* Presets Grid */}
                      <div className="grid grid-cols-1 gap-2 mb-4">
                        {RECEIPT_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => {
                              setSelectedReceipt(preset);
                              setReceiptScanStatus('idle');
                              setReceiptScanLogs([]);
                            }}
                            className={`text-left text-xs p-2.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                              selectedReceipt.id === preset.id
                                ? 'bg-brand-orange/10 border-brand-orange/50 text-white font-semibold'
                                : 'bg-[#181a1f] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Mock Receipt Graphic */}
                      <div className="bg-[#1b1d24] border border-white/10 rounded-xl p-4 mb-4 relative overflow-hidden">
                        
                        {/* Scanning Laser Line */}
                        {isReceiptScanning && (
                          <div className="absolute left-0 right-0 h-[2px] bg-cyan-400 shadow-[0_0_10px_#22d3ee] z-20 animate-bounce" style={{ animationDuration: '1.2s' }} />
                        )}

                        <div className="flex justify-between items-center text-[10px] text-gray-500 font-mono mb-2">
                          <span>SCREENSHOT: {selectedReceipt.filename}</span>
                          <span className="text-emerald-400 font-bold">{selectedReceipt.status}</span>
                        </div>
                        <div className="space-y-1.5 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">TO:</span>
                            <span className={selectedReceipt.resultType === 'wrong_recipient' ? 'text-red-400 font-bold' : 'text-white'}>
                              {selectedReceipt.recipient}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">AMOUNT:</span>
                            <span className="text-white font-bold">{selectedReceipt.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">UTR:</span>
                            <span className={selectedReceipt.resultType === 'duplicate' ? 'text-yellow-400 font-bold' : 'text-white font-bold'}>
                              {selectedReceipt.utr}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Log Screen */}
                      <div className="bg-black/40 rounded-xl p-3 border border-white/5 font-mono text-[10px] text-slate-400 space-y-1 min-h-[110px] max-h-[110px] overflow-y-auto mb-4 scrollbar-none">
                        {receiptScanLogs.length === 0 ? (
                          <span className="text-slate-600 italic">Logs will appear here once scanning begins...</span>
                        ) : (
                          receiptScanLogs.map((log, idx) => (
                            <div 
                              key={idx} 
                              className={
                                log.startsWith('✅') 
                                  ? 'text-emerald-400 font-semibold' 
                                  : log.startsWith('❌') 
                                    ? 'text-red-400 font-semibold' 
                                    : 'text-slate-300'
                              }
                            >
                              {log}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleSimulateReceiptScan}
                      disabled={isReceiptScanning}
                      className={`w-full py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer transition-all duration-200 ${
                        isReceiptScanning
                          ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                          : 'bg-brand-orange text-white hover:bg-brand-orange/90 hover:shadow-lg hover:shadow-brand-orange/20'
                      }`}
                    >
                      {isReceiptScanning ? (
                        <>
                          <RefreshCw size={14} className="animate-spin" />
                          <span>Scanning receipt...</span>
                        </>
                      ) : (
                        <>
                          <Upload size={14} />
                          <span>Verify with Gemini Vision</span>
                        </>
                      )}
                    </button>
                  </Card>
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
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-between" hover={false}>
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

            </div>
          )}

          {/* Tab 2: AdminZero Guide */}
          {activeTab === 'adminzero' && (
            <div className="space-y-16 text-left">
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
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center" hover={false}>
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
                  <Card className="bg-white/[0.01] border-white/5 p-6 flex flex-col justify-center" hover={false}>
                    <div className="flex items-center gap-3 mb-4">
                      <Database className="text-brand-blue" size={24} />
                      <h4 className="font-bold text-white text-sm">Secure AES-256 Credentials</h4>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed mb-4">
                      Your connection credentials are encrypted on the server utilizing cipher keys before inserting into the Supabase database. Database credentials are never stored in plaintext and cannot be read by anyone else.
                    </p>
                    <div className="border border-white/10 rounded-lg p-3 bg-dark-bg flex flex-col gap-1 text-xs font-mono">
                      <span className="text-indigo-400">✓ Starter (Free, 1 DB limit)</span>
                      <span className="text-indigo-400">✓ Pro (₹999/mo, 10 DB limit)</span>
                      <span className="text-indigo-400">✓ Business (₹3,999/mo, unlimited)</span>
                    </div>
                  </Card>
                  <div className="space-y-4 text-gray-400 text-sm leading-relaxed">
                    <p>
                      Log into the **AdminZero Portal** (`/adminzero`) to map database connection configurations:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>Create a **Workspace** representation. Tiers are defined as *Starter*, *Pro*, or *Business* (billing handles via Lemon Squeezy checkout portals).</li>
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
                      <p className="text-gray-400 leading-normal mb-3">
                        AdminZero enforces read-only query integrity. Mutating statements are blocked at both the LLM generator core and a secondary local AST-based scanner.
                      </p>
                      <ul className="list-disc pl-5 text-gray-500 space-y-1">
                        <li><strong>Deterministic AST checks:</strong> Analyzes Abstract Syntax Trees via <code>pgsql-ast-parser</code> to block mutating operations (DROP, DELETE, UPDATE, INSERT, ALTER) and scan restrictions.</li>
                        <li><strong>Timeout Limits:</strong> PostgreSQL sessions have a strict 5000ms (5 seconds) timeout to prevent DoS Cartesian joins.</li>
                        <li><strong>Payload Limits:</strong> Capped at a maximum of 100 rows to prevent payload overflow.</li>
                      </ul>
                    </div>
                  </div>

                  {/* INTERACTIVE SLACK ROUTER PLAYGROUND */}
                  <Card className="bg-[#121316] border border-white/10 p-6 flex flex-col justify-between" hover={false}>
                    <div>
                      <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-4">
                        <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <Bot size={14} className="text-brand-blue" /> Dual-Model Query Playground
                        </h4>
                        <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-0.5 rounded font-mono">AdminZero Core</span>
                      </div>

                      <p className="text-[11px] text-slate-400 mb-4">
                        Select a query preset below or type a query to trace how AdminZero's DeepSeek-to-Gemini query routing pipeline protects and self-heals in real time.
                      </p>

                      {/* Presets Row */}
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {QUERY_PRESETS.map((preset) => (
                          <button
                            key={preset.id}
                            onClick={() => handleSelectQueryPreset(preset)}
                            className={`text-[10px] px-2.5 py-1.5 rounded-lg border transition-all duration-200 cursor-pointer ${
                              !isCustomQuery && selectedQuery.id === preset.id
                                ? 'bg-brand-blue/15 border-brand-blue/40 text-brand-blue-light font-medium'
                                : 'bg-[#181a1f] border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                            }`}
                          >
                            {preset.label}
                          </button>
                        ))}
                      </div>

                      {/* Custom Input */}
                      <div className="flex gap-2 mb-4">
                        <div className="relative flex-1">
                          <span className="absolute left-2.5 top-2 text-[10px] text-brand-blue font-mono">@AdminZero</span>
                          <input
                            type="text"
                            value={queryInput}
                            onChange={handleCustomQueryChange}
                            placeholder="Type a natural language database question..."
                            className="w-full bg-[#181a1f] border border-white/10 rounded-lg pl-22 pr-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-blue"
                          />
                        </div>
                        <button
                          onClick={handleSimulateQuery}
                          disabled={querySimStep !== 'idle' && querySimStep !== 'done'}
                          className="bg-brand-blue hover:bg-brand-blue-dark text-white px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Send
                        </button>
                      </div>

                      {/* Pipeline Status Flowchart */}
                      <div className="border border-white/5 bg-black/20 rounded-xl p-3 mb-4 space-y-2">
                        <div className="text-[10px] text-slate-500 font-mono uppercase tracking-wider border-b border-white/5 pb-1 mb-2">
                          Execution Pipeline Status
                        </div>
                        
                        <div className="grid grid-cols-4 gap-1 text-[9px] text-center font-mono">
                          <div className={`p-1 rounded border ${
                            querySimStep === 'translating' ? 'bg-brand-blue/20 border-brand-blue text-white animate-pulse' : 
                            (querySimStep === 'checking_ast' || querySimStep === 'executing' || querySimStep === 'synthesizing' || querySimStep === 'done') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-white/5 border-transparent text-slate-600'
                          }`}>
                            1. DeepSeek Translate
                          </div>
                          
                          <div className={`p-1 rounded border ${
                            querySimStep === 'checking_ast' ? 'bg-brand-blue/20 border-brand-blue text-white animate-pulse' : 
                            (querySimStep === 'executing' || querySimStep === 'synthesizing' || (querySimStep === 'done' && selectedQuery.astCheck !== 'BLOCKED')) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                            (querySimStep === 'done' && selectedQuery.astCheck === 'BLOCKED') ? 'bg-red-500/20 border-red-500/50 text-red-400' :
                            'bg-white/5 border-transparent text-slate-600'
                          }`}>
                            2. AST Shield
                          </div>

                          <div className={`p-1 rounded border ${
                            querySimStep === 'executing' ? 'bg-brand-blue/20 border-brand-blue text-white animate-pulse' : 
                            (querySimStep === 'synthesizing' || (querySimStep === 'done' && selectedQuery.astCheck !== 'BLOCKED')) ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                            (querySimStep === 'done' && selectedQuery.astCheck === 'BLOCKED') ? 'bg-white/5 border-transparent text-slate-750' :
                            'bg-white/5 border-transparent text-slate-600'
                          }`}>
                            3. DB Client {selectedQuery.healed && '/ Gemini Pro'}
                          </div>

                          <div className={`p-1 rounded border ${
                            querySimStep === 'synthesizing' ? 'bg-brand-blue/20 border-brand-blue text-white animate-pulse' : 
                            (querySimStep === 'done' && selectedQuery.astCheck !== 'BLOCKED') ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                            'bg-white/5 border-transparent text-slate-600'
                          }`}>
                            4. Gemini Flash
                          </div>
                        </div>
                      </div>

                      {/* Execution Output log console */}
                      <div className="bg-[#0b0c0f] border border-white/5 rounded-xl p-3 font-mono text-[10px] text-slate-400 space-y-1 min-h-[120px] max-h-[120px] overflow-y-auto mb-4 scrollbar-none">
                        {simLogs.length === 0 ? (
                          <div className="text-slate-600 italic">No output. Press 'Send' to begin connection pipeline...</div>
                        ) : (
                          simLogs.map((log, idx) => (
                            <div key={idx} className="whitespace-pre-line text-slate-300">
                              {log.includes('BLOCKED') || log.includes('Exception') || log.includes('Error:') ? (
                                <span className="text-red-400 font-bold">{log}</span>
                              ) : log.includes('PASS') || log.includes('Success') || log.includes('Repaired') ? (
                                <span className="text-emerald-400">{log}</span>
                              ) : log.includes('Self-Healing') || log.includes('Escalating') ? (
                                <span className="text-amber-400 font-semibold">{log}</span>
                              ) : (
                                log
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      {/* Simulated Slack Message Output */}
                      {querySimStep === 'done' && (
                        <div className="bg-[#1b1c20] border border-white/10 rounded-xl p-4 text-left text-xs font-sans mt-2">
                          <div className="flex gap-2.5 items-start">
                            <div className="w-8 h-8 rounded-lg bg-brand-blue flex items-center justify-center font-bold text-white text-xs select-none">
                              AZ
                            </div>
                            <div className="flex-1 space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-white">AdminZero</span>
                                <span className="bg-emerald-500/20 text-emerald-400 text-[8px] font-bold px-1 rounded uppercase tracking-wider">APP</span>
                                <span className="text-[10px] text-slate-500">10:45 PM</span>
                              </div>
                              <div className="text-slate-300 whitespace-pre-line leading-relaxed font-sans text-xs">
                                {isCustomQuery ? (
                                  selectedQuery.astCheck === 'BLOCKED' ? selectedQuery.finalResponse : (
                                    `📊 *AdminZero Lead Analyst Report*
Processed custom query: \`${queryInput.replace(/@AdminZero\s+/g, '')}\`
Executed SQL safely. Results returned successfully.

[Processed and summarized by *gemini-2.5-flash* Lead Analyst]`
                                  )
                                ) : (
                                  selectedQuery.finalResponse
                                )}
                              </div>
                              
                              {/* Slack Block Kit Share Button mockup */}
                              {selectedQuery.astCheck !== 'BLOCKED' && (
                                <div className="pt-2 flex flex-col gap-1.5">
                                  <button className="bg-white/5 border border-white/10 rounded-md px-2.5 py-1 text-[10px] font-bold text-slate-300 w-fit cursor-default">
                                    🔗 Share Public Insight
                                  </button>
                                  <div className="text-[9px] text-slate-500">
                                    ⭐ *Enjoying AdminZero?* <a href="#reviews" className="text-brand-blue hover:underline">Leave us a review!</a>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  </Card>
                </div>
              </div>
            </div>
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

import React, { useEffect } from 'react';
import { Shield, ChevronLeft, Lock, FileText, Database, ShieldAlert, EyeOff } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 py-16 px-6 relative">
      {/* Background Orbs */}
      <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 left-1/4 w-[400px] h-[400px] bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-blue hover:text-blue-400 mb-8 transition-all font-mono text-xs uppercase tracking-widest cursor-pointer">
          <ChevronLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-[#09090b] border border-zinc-900 p-8 md:p-14 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 mb-10 pb-8 border-b border-zinc-900">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20 shrink-0">
              <Shield size={30} className="text-brand-blue" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Data Protection</span>
              <h1 className="text-3xl font-bold text-white mt-0.5 font-display tracking-tight">Privacy Policy</h1>
              <p className="text-gray-500 text-xs mt-1">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-400">
            
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Lock size={18} className="text-brand-blue" />
                <h2>1. Secure Encryption of Database Credentials</h2>
              </div>
              <p>
                For developers using **Option B (Execution Mode)**, any database connection URLs and password credentials you store in the client portal are **fully encrypted at rest on the server** using advanced Advanced Encryption Standard (**AES-256-GCM**) cipher keys.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500">
                <li>Decryption keys are maintained exclusively in secure server-side environment variables.</li>
                <li>Plaintext database credentials are never stored on disk, never cached, and never exposed in logs or diagnostics outputs.</li>
                <li>Decryption occurs purely in temporary server memory during gateway query execution and is immediately garbage-collected.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <EyeOff size={18} className="text-brand-blue" />
                <h2>2. Zero Data Retention on Query Payload Rows</h2>
              </div>
              <p>
                AdminZero enforces a strict **Zero Retention Policy** on all database payload query results retrieved during full execution.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500">
                <li>Database row values returned from your query are held transiently in server RAM only while filtering/applying PII redaction.</li>
                <li>The payload rows are immediately discarded once the response is sent back to your client backend.</li>
                <li>We do not record, store, or cache your private customer database data rows to persistent disk storage.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <FileText size={18} className="text-brand-blue" />
                <h2>3. Security Telemetry & Log Auditing</h2>
              </div>
              <p>
                To provide developers with the **Threat Interception Console**, the AdminZero gateway writes metadata logs to your workspace database for every query transaction:
              </p>
              <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-2xl text-xs space-y-2 text-zinc-500 leading-normal">
                <p><strong>What is logged:</strong> Timestamp, Query Latency (ms), SQL Query Length, Blocked Status, and Target Threat Category (e.g. DML block, Prompt Injection block, PII Scrubbed count).</p>
                <p><strong>What is NEVER logged:</strong> Plaintext raw database values, cell payloads, user passwords, or decrypted credentials.</p>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Database size={18} className="text-brand-blue" />
                <h2>4. AI Engines & LLM Subprocessors</h2>
              </div>
              <p>
                Natural language query translation utilizes **Google Gemini 2.5 Flash** enterprise APIs.
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500">
                <li>Prompts and database schemas passed to Google Gemini are sent via secure TLS/HTTPS channels.</li>
                <li>Under Google GenAI enterprise agreements, prompts and query context are not logged, stored, or used for model training.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <ShieldAlert size={18} className="text-brand-blue" />
                <h2>5. Payment Verification Scan Auditing</h2>
              </div>
              <p>
                To automate credit top-ups, we process uploaded transaction receipt screenshots using **Gemini AI Vision models**. 
                Receipt files are read transiently in memory to match transaction UTR, verify amounts, and are permanently deleted immediately after validation. No payment receipt images are retained or archived on disk.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Shield size={18} className="text-brand-blue" />
                <h2>6. Data Rights & Contact</h2>
              </div>
              <p>
                You can view, download, or revoke your data and API credentials instantly from your dashboard. If you have any inquiries about our security architecture or wish to request data purging, please contact us at <a href="mailto:teamglitchgo@gmail.com" className="text-brand-blue hover:underline">teamglitchgo@gmail.com</a>.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

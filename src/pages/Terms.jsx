import React, { useEffect } from 'react';
import { Scale, ChevronLeft, ShieldCheck, Key, Database, Zap, FileText } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-[#030303] text-gray-300 py-16 px-6 relative">
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-brand-orange/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-20 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 mb-8 transition-all font-mono text-xs uppercase tracking-widest cursor-pointer">
          <ChevronLeft size={16} /> Back to Home
        </Link>
        
        <div className="bg-[#09090b] border border-zinc-900 p-8 md:p-14 rounded-[32px] shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-orange/5 rounded-full blur-3xl -mr-40 -mt-40 pointer-events-none"></div>
          
          <div className="flex items-center gap-5 mb-10 pb-8 border-b border-zinc-900">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20 shrink-0">
              <Scale size={30} className="text-brand-orange" />
            </div>
            <div>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-mono font-bold">Legal Agreement</span>
              <h1 className="text-3xl font-bold text-white mt-0.5 font-display tracking-tight">Terms of Service</h1>
              <p className="text-gray-500 text-xs mt-1">Last Updated: July 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed text-zinc-400">
            
            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <ShieldCheck size={18} className="text-brand-orange" />
                <h2>1. Acceptance & Scope of Agreement</h2>
              </div>
              <p>
                By signing up for a GlitchGo account, accessing the developer portal, or utilizing the AdminZero gateway API, you agree to comply with and be bound by these Terms of Service. If you are entering into this agreement on behalf of a company or other legal entity, you represent that you have the authority to bind such entity.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Key size={18} className="text-brand-orange" />
                <h2>2. Developer API Credentials & Security</h2>
              </div>
              <p>
                AdminZero provides credentials in the form of secret API Keys starting with <code>az_sk_live_</code>. You are solely responsible for protecting these keys against unauthorized exposure. 
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500">
                <li>Secret keys must never be hardcoded into frontend client bundles (React, Vue, iOS, Android).</li>
                <li>Keys should be stored securely as backend environment variables on trusted platforms (Vercel, Heroku, AWS).</li>
                <li>If a key is exposed or compromised, you must immediately revoke it via the developer portal table. We are not liable for credit consumption or data issues resulting from compromised developer keys.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Database size={18} className="text-brand-orange" />
                <h2>3. Database Integration Modes & Liability</h2>
              </div>
              <p>
                AdminZero supports two operational integration architectures:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-2xl">
                  <h3 className="text-white text-xs font-bold font-mono mb-2 uppercase tracking-wide text-brand-orange">Option A: Translation Only</h3>
                  <p className="text-xs text-zinc-500 leading-normal">
                    AdminZero acts strictly as a text-to-SQL compiler and security filter. No database connection string is passed. We scan prompts and return SQL. You execute the SQL locally. We hold zero database connection liability.
                  </p>
                </div>
                <div className="bg-zinc-950/60 border border-zinc-900 p-4 rounded-2xl">
                  <h3 className="text-white text-xs font-bold font-mono mb-2 uppercase tracking-wide text-brand-orange">Option B: Execution Proxy</h3>
                  <p className="text-xs text-zinc-500 leading-normal">
                    You connect your database connection string, which is stored encrypted using AES-256-GCM. AdminZero translates, filters, connects to your database to execute, and returns raw query results. **You are strictly required to configure read-only database credentials.** We are not liable for any structural, index, or data mutations if credentials with write permissions are supplied.
                  </p>
                </div>
              </div>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Zap size={18} className="text-brand-orange" />
                <h2>4. Billing, Top-up Credits & Refunds</h2>
              </div>
              <p>
                AdminZero utilizes a monthly subscription tier and a manual credit top-up model. Queries consume credits based on active filter layers (Base translation: 1, Prompt Firewall: +1, PII: +1, AST Guard: +2).
              </p>
              <ul className="list-disc pl-5 space-y-1.5 text-xs text-zinc-500">
                <li>Developer accounts receive 2,500 credits per month free. Unused free credits do not roll over.</li>
                <li>Paid subscription tiers (Startup, Scale) and manual UPI top-ups are billed in Indian Rupees (INR).</li>
                <li>Credits have no cash value and are non-refundable. All receipt verifications made via our automated UPI vision system or manual admin reviews are final.</li>
              </ul>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <FileText size={18} className="text-brand-orange" />
                <h2>5. India MSME Registration & Legal Identity</h2>
              </div>
              <p>
                GlitchGo is officially registered as a Micro Enterprise under the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India, holding registration number <strong>UDYAM-AP-17-0080333</strong>. 
                All service-level agreements, invoices, dispute resolutions, and contracts are governed by and construed in accordance with the laws of the Republic of India.
              </p>
            </section>

            <section className="space-y-3">
              <div className="flex items-center gap-2 text-white font-semibold text-lg">
                <Scale size={18} className="text-brand-orange" />
                <h2>6. Limitation of Liability & Timeout Restraints</h2>
              </div>
              <p>
                To maintain high availability and protect database performance, AdminZero enforces strict query quotas and an automated 5-second database connection execution timeout limit. We are not liable for queries that abort due to these timeouts or downstream database slowdowns. We are not liable for secondary server outages, security breaches, or downstream financial losses arising from pre-existing system issues.
              </p>
            </section>

          </div>
        </div>
      </div>
    </div>
  );
}

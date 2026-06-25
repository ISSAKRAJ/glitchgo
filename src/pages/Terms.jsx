import React, { useEffect } from 'react';
import { Scale, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Terms() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-orange/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 flex items-center justify-center border border-brand-orange/20">
              <Scale size={32} className="text-brand-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Terms of Service</h1>
              <p className="text-gray-500 mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Scope of Services & Read-Only Requirement</h2>
              <p>GlitchGo provides rapid bug-fixing, deployment infrastructure, and AI automation web services. For our Slack-to-Postgres product, AdminZero, **users are strictly required to provide Read-Only database connection credentials**. AdminZero is designed to perform read-only queries. We are not liable for any data loss, modifications, or schema deletions if you register database credentials with admin or write-level privileges.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Subscription Billing & Retainer Tiers</h2>
              <p>For monthly retainer packages (Starter, Pro, and Enterprise CTO), services are billed on a recurring monthly cycle. You will receive an invoice at the start of each billing period. Subscription cycles continue on a month-to-month basis and can be canceled at any time in your dashboard or by emailing our support team. Cancelled subscriptions remain active until the end of the current billing cycle; no partial refunds are provided.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Payments & Deposits</h2>
              <p>Depending on the urgency and size of a one-time request, an upfront, non-refundable diagnostic deposit may be required before work commences. Once the total invoice is issued via our payment checkout, final deliverables (source code, server logins) will be passed to the client upon full clearance of funds (via verified UPI reference or credit card processing).</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Delivery, Revisions & 7-Day Retention Limit</h2>
              <p>We guarantee to deliver solutions according to the agreed-upon timeline (e.g., 24 hours for urgent requests). Clients have a 3-day grace period post-delivery to report any missing requirements or breaking changes related strictly to the original scope, which will be patched free of charge. For security, all delivered code assets are permanently deleted from our servers exactly 7 days after completion.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Legal & Registration Identity</h2>
              <p>GlitchGo is a registered Micro Enterprise under the Ministry of Micro, Small and Medium Enterprises (MSME), Government of India, holding registration number <strong>UDYAM-AP-17-0080333</strong>. All business operations, contract negotiations, and financial settlements are legally bound by applicable Indian trade laws.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Service Level & Availability</h2>
              <p>AdminZero relies on secure third-party Large Language Model (LLM) subprocessor endpoints (Google Gemini, DeepSeek V3) and external database networks. Query translations and syntheses are subject to the availability, response time, and API latency of these providers. We are not liable for delayed messages, database statement timeouts, or service unavailability due to subprocessor outages.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">7. Limitation of Liability</h2>
              <p>While GlitchGo experts employ enterprise security practices, we are not liable for any secondary server outages, data loss, or downstream revenue impacts caused by pre-existing critical bugs in the client's architecture. To protect database performance, AdminZero enforces automated query limits and a strict 5-second session execution timeout. We are not liable for queries aborted due to these security limits.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">8. Intellectual Property</h2>
              <p>Upon full payment, all custom code, automation scripts, and deployment architectures developed by our team for a specific project become the sole intellectual property of the client. GlitchGo retains no ownership over the final delivered product.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

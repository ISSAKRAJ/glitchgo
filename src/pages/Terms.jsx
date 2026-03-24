import React, { useEffect } from 'react';
import { Scale, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Terms() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 mb-8 transition-colors">
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
              <p className="text-gray-500 mt-1">Last Updated: March 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Scope of Services</h2>
              <p>GlitchGo provides rapid bug-fixing, deployment infrastructure, and AI automation web services. The scope of each project is independently negotiated following a client request. We reserve the right to decline any project request that involves illegal, malicious, or highly unethical use-cases.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Payments & Deposits</h2>
              <p>Depending on the urgency and size of the request, an upfront, non-refundable diagnostic deposit may be required before work commences. Once the total invoice is issued via Razorpay, Stripe, or standard UPI transfer, final deliverables (source code, server logins) will only be passed to the client upon full clearance of funds.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Delivery & Revisions</h2>
              <p>We guarantee to deliver solutions according to the agreed-upon timeline (e.g., 24 hours for urgent requests). Clients have a 3-day grace period post-delivery to report any missing requirements or breaking changes related strictly to the original scope, which will be patched free of charge.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. Limitation of Liability</h2>
              <p>While GlitchGo experts employ enterprise security practices, we are not liable for any secondary server outages, data loss, or downstream revenue impacts caused by pre-existing critical bugs in the client's architecture. Clients must ensure database backups are made before granting us admin access.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Intellectual Property</h2>
              <p>Upon full payment, all custom code, automation scripts, and deployment architectures developed by our team for a specific project become the sole intellectual property of the client. GlitchGo retains no ownership over the final delivered product.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

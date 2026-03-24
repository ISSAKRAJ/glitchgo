import React, { useEffect } from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Privacy() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link to="/" className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 mb-8 transition-colors">
          <ChevronLeft size={20} /> Back to Home
        </Link>
        <div className="glass p-8 md:p-12 rounded-3xl border border-white/10 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-brand-blue/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-brand-blue/10 flex items-center justify-center border border-brand-blue/20">
              <Shield size={32} className="text-brand-blue" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Privacy Policy</h1>
              <p className="text-gray-500 mt-1">Last Updated: March 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>When you use GlitchGo, we collect information that you explicitly provide to us via our client forms (including names, emails, phone numbers, and technical problem descriptions). We do not run invasive tracking scripts or sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Data</h2>
              <p>Your data is used strictly for fulfilling your requested tech services. We use your contact information to provide quotes, update you on project progress, and manage invoicing. Uploaded files, server logs, and code snippets are maintained confidentially and deleted upon request once a project is delivered.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. Data Security & Storage</h2>
              <p>We use enterprise-grade cloud databases (Supabase) to encrypt and secure your data. Our employees are bound by strict Non-Disclosure Agreements (NDAs) ensuring your intellectual property and source code remain completely private during the bug fixing process.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. AI Interaction Data</h2>
              <p>Conversations with the GlitchGo AI Assistant are temporarily logged to improve bot accuracy and escalate urgent complaints to human agents. By using the chatbot, you consent to these logs being reviewed by our support team.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Contact Us</h2>
              <p>If you have any questions regarding this privacy policy or wish to request the deletion of your codebase from our servers, please contact us immediately at <a href="mailto:teamglitchgo@gmail.com" className="text-brand-blue hover:underline">teamglitchgo@gmail.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

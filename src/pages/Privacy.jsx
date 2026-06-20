import React, { useEffect } from 'react';
import { Shield, ChevronLeft } from 'lucide-react';
import Link from 'next/link';

export default function Privacy() {
  useEffect(() => window.scrollTo({ top: 0, behavior: 'instant' }), []);

  return (
    <div className="min-h-screen bg-dark-bg text-gray-300 py-12 px-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/" className="inline-flex items-center gap-2 text-brand-orange hover:text-orange-400 mb-8 transition-colors">
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
              <p className="text-gray-500 mt-1">Last Updated: June 2026</p>
            </div>
          </div>

          <div className="space-y-8 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
              <p>When you use GlitchGo, we collect information that you explicitly provide to us via our client forms (including names, emails, phone numbers, and technical problem descriptions). We do not run invasive tracking scripts or sell your personal data to third parties.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">2. Database Credentials & AES-256 Encryption</h2>
              <p>For our database config product, AdminZero, your connection URLs and password credentials are securely encrypted on the server utilizing industrial AES-256 cipher keys before they are ingested into our local SQLite databases. Plaintext passwords or connection keys are never written to logs, never exposed in client sessions, and are processed strictly in secure memory contexts during query translation execution.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">3. AI UPI Verification Processing</h2>
              <p>To automate payment validation, our checkout system scans payment receipt screenshots. Uploaded receipt images are temporarily held in secure server memory, processed via Gemini AI Vision models for financial auditing (to verify recipient UPI ID, status, and extract the 12-digit transaction ID), and are not stored permanently. We do not retain these screenshots after verification is completed.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">4. AI Interaction Data</h2>
              <p>Conversations with the GlitchGo AI Assistant are temporarily logged to improve bot accuracy and escalate queries to human agents. By using the chatbot, you consent to these logs being analyzed to resolve technical queries.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">5. Data Retention & Backups</h2>
              <p>We do not store customer code permanently. All completed codebase rescues, ZIP file deliverables, and patches are automatically purged from our secure servers exactly 7 days after ticket completion. Please download backup assets immediately upon delivery notification.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-white mb-3">6. Contact Us</h2>
              <p>If you have any questions regarding this privacy policy or wish to request the deletion of your codebase from our servers, please contact us immediately at <a href="mailto:teamglitchgo@gmail.com" className="text-brand-blue hover:underline">teamglitchgo@gmail.com</a>.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, AlertTriangle, CheckCircle } from 'lucide-react';

export default function AdminZeroPage() {
  const router = useRouter();
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    const installed = params.get('installed');

    if (errorParam) {
      setError(errorParam);
    } else if (installed === 'true') {
      setSuccess(true);
      const timer = setTimeout(() => {
        router.replace('/portal?tab=products');
      }, 1500);
      return () => clearTimeout(timer);
    } else {
      router.replace('/portal?tab=products');
    }
  }, [router]);

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-4">
        <div className="bg-[#121824] border border-red-500/20 rounded-2xl p-6 max-w-md w-full text-center space-y-4 shadow-xl">
          <div className="mx-auto bg-red-500/10 text-red-500 w-12 h-12 rounded-full flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">OAuth Connection Failed</h2>
          <p className="text-sm text-gray-400">
            Slack OAuth exchange returned an error:
            <code className="block bg-black/40 text-red-400 p-2 rounded mt-2 text-xs font-mono">{error}</code>
          </p>
          <button 
            onClick={() => router.push('/portal?tab=products')} 
            className="w-full bg-[#1F2937] hover:bg-[#374151] text-white text-sm font-bold py-2 rounded-xl transition"
          >
            Back to Portal
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="bg-green-500/10 text-green-500 w-12 h-12 rounded-full flex items-center justify-center">
            <CheckCircle size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Slack Connected!</h2>
          <p className="text-gray-400 text-sm">Redirecting to your portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="text-gray-400 text-sm">Redirecting to your unified GlitchGo Portal...</p>
      </div>
    </div>
  );
}

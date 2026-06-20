"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function AdminZeroPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect standalone AdminZero route to the unified portal's database configs tab
    router.replace('/portal?tab=products');
  }, [router]);

  return (
    <div className="min-h-screen bg-dark-bg flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="animate-spin text-brand-blue" size={32} />
        <p className="text-gray-400 text-sm">Redirecting to your unified GlitchGo Portal...</p>
      </div>
    </div>
  );
}

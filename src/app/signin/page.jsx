"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Lock, ShieldCheck } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function SigninPage() {
  const router = useRouter();
  
  // Parse redirection URL from browser window safely on client side
  const next = typeof window !== 'undefined' 
    ? new URLSearchParams(window.location.search).get('next') || '/portal' 
    : '/portal';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // If already logged in, redirect directly to requested page
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push(next);
      }
    };
    checkUser();
  }, [router, next]);

  const handleSignin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setIsLoading(true);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
      } else {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          router.push(next);
        }, 1000);
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignin = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}${next}` : undefined
        }
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || 'Failed to initialize Google login.');
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg text-white font-sans flex flex-col relative overflow-hidden items-center justify-center p-6">
      {/* Background ambient glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-brand-blue/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-brand-orange/15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-md relative z-10 space-y-8 animate-fade-in">
        {/* Logo/Branding */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-1 group">
            <div className="bg-gradient-to-r from-brand-blue to-brand-orange p-[1px] rounded-xl shadow-lg group-hover:shadow-[0_0_20px_rgba(59,130,246,0.4)] transition-all">
              <div className="bg-dark-bg px-4 py-1.5 rounded-[11px] flex items-center gap-0.5">
                <span className="font-extrabold text-2xl text-white tracking-tighter">Glitch</span>
                <span className="font-extrabold text-2xl text-transparent bg-clip-text bg-gradient-to-r from-brand-orange to-amber-500 tracking-tighter">Go</span>
              </div>
            </div>
          </Link>
          <h2 className="text-xl font-bold tracking-tight mt-4 text-white font-outfit">Sign in to GlitchGo</h2>
          <p className="text-sm text-gray-400">Manage your active services, track debugging tickets, and configure products.</p>
        </div>

        {/* Form Card */}
        <Card className="bg-dark-surface/50 backdrop-blur-md p-8 border border-white/10" hover={false}>
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex items-center gap-2 font-semibold">
              <ShieldCheck size={18} />
              <span>{success}</span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full flex items-center justify-center gap-3 py-3 relative group"
              onClick={handleGoogleSignin}
              disabled={isLoading}
            >
              <svg className="w-4 h-4 fill-current group-hover:text-white transition-colors" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.887c-.648 2.41-2.519 4.114-5.136 4.114-3.555 0-6.435-2.883-6.435-6.435s2.88-6.435 6.435-6.435c1.638 0 3.136.612 4.28 1.62l3.05-3.05C19.23 2.38 15.93 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.53 0 11.24-4.59 11.24-11.24 0-.785-.09-1.54-.25-2.285H12.24z"/>
              </svg>
              <span>Continue with Google</span>
            </Button>
            
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/5"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-dark-surface px-2 text-gray-500">Or with email password</span>
              </div>
            </div>

            <form onSubmit={handleSignin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                    <Mail size={16} />
                  </span>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 pointer-events-none">
                    <Lock size={16} />
                  </span>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="pt-2">
                <Button type="submit" className="w-full py-3 flex items-center justify-center gap-2" isLoading={isLoading && !success}>
                  <span>Sign In</span>
                </Button>
              </div>
            </form>
          </div>

          <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-6 font-outfit">
            Don't have an account yet?{' '}
            <Link 
              href={next !== '/' ? `/signup?next=${encodeURIComponent(next)}` : "/signup"} 
              className="font-semibold text-brand-blue hover:underline transition-all hover:text-blue-400"
            >
              Sign Up
            </Link>
          </div>
        </Card>

        {/* Footer info */}
        <div className="text-center text-xs text-gray-500 flex justify-center gap-4">
          <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </div>
  );
}

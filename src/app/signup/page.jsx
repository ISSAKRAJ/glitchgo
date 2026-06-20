"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Database, Mail, Lock, ShieldCheck, ArrowRight, UserPlus } from 'lucide-react';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { supabase } from '../../lib/supabase';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
      } else {
        setSuccess('Account created successfully! Check your email to confirm registration, or try signing in.');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (err) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = async () => {
    setError('');
    setIsLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/adminzero` : undefined
        }
      });
      if (oauthError) throw oauthError;
    } catch (err) {
      setError(err.message || 'Failed to initialize Google signup.');
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
          <h2 className="text-xl font-bold tracking-tight mt-4 text-white font-outfit">Create your GlitchGo account</h2>
          <p className="text-sm text-gray-400">Deploy query translation automations securely.</p>
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
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm flex flex-col gap-2">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                <span>Success!</span>
              </div>
              <p className="text-xs leading-relaxed">{success}</p>
              <Link href="/signin" className="mt-2 text-xs font-bold text-brand-blue hover:underline flex items-center gap-1">
                Go to Sign In <ArrowRight size={12} />
              </Link>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <Button
              type="button"
              onClick={handleGoogleSignup}
              variant="secondary"
              className="w-full flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-xl"
              disabled={isLoading}
            >
              <svg className="w-4 h-4 fill-white" viewBox="0 0 24 24">
                <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.3.6 4.5 1.7l2.42-2.42C17.385 1.63 14.93 1 12.24 1 6.58 1 2 5.58 2 11.24s4.58 10.24 10.24 10.24c5.9 0 9.8-4.14 9.8-9.98 0-.67-.06-1.3-.18-1.92h-9.62z"/>
              </svg>
              Continue with Google
            </Button>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-white/5"></div>
              <span className="flex-shrink mx-4 text-gray-500 text-xs font-bold uppercase tracking-wider">or</span>
              <div className="flex-grow border-t border-white/5"></div>
            </div>
          </div>

          <form onSubmit={handleSignup} className="space-y-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Mail size={12} /> Email Address
              </label>
              <Input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} /> Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                <Lock size={12} /> Confirm Password
              </label>
              <Input
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <Button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5"
              isLoading={isLoading}
            >
              <UserPlus size={18} />
              <span>Create Account</span>
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-400 border-t border-white/5 pt-6 font-outfit">
            Already have an account?{' '}
            <Link href="/signin" className="font-semibold text-brand-blue hover:underline transition-all hover:text-blue-400">
              Sign In
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

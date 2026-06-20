"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Mail, ShieldCheck, AlertCircle, Key, User } from 'lucide-react';
import Card from '../ui/Card';
import Input from '../ui/Input';
import Button from '../ui/Button';

export default function SettingsTab({ user, supabase }) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ 
        password: newPassword 
      });
      if (updateError) throw updateError;
      setSuccess('Password updated successfully!');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.message || 'Failed to update password. Try signing in again first.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const accountCreatedDate = user?.created_at 
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : 'Unknown';

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
      
      {/* Profile Info Card */}
      <div className="md:col-span-5">
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 text-left space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User className="text-brand-blue" size={18} /> Client Profile Details
          </h3>
          
          <div className="space-y-4">
            <div className="border-b border-white/5 pb-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Registered Email</span>
              <span className="text-sm font-semibold text-white block mt-0.5">{user?.email || 'N/A'}</span>
            </div>
            
            <div className="border-b border-white/5 pb-3">
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">User Account UID</span>
              <span className="text-xs font-mono text-gray-400 block mt-0.5 break-all">{user?.id || 'N/A'}</span>
            </div>

            <div>
              <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Account Created On</span>
              <span className="text-sm font-semibold text-white block mt-0.5">{accountCreatedDate}</span>
            </div>
          </div>

          <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-xl p-4 text-[10px] text-emerald-400/90 leading-relaxed flex items-start gap-2">
            <ShieldCheck className="shrink-0 mt-0.5" size={14} />
            <span>Persistent login sessions managed securely via Google OAuth / Supabase Auth tokens.</span>
          </div>
        </div>
      </div>

      {/* Change Password Card */}
      <div className="md:col-span-7">
        <div className="glass p-6 md:p-8 rounded-3xl border border-white/10 text-left space-y-6">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Key className="text-brand-blue" size={18} /> Change Account Password
          </h3>
          
          <p className="text-xs text-gray-400 leading-normal">
            If you signed up via email, you can change your password below. If you logged in via Google OAuth, password overrides are managed directly by Google.
          </p>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-xl text-xs flex items-center gap-1.5 font-medium">
              <AlertCircle size={14} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-3 rounded-xl text-xs flex items-center gap-1.5 font-semibold">
              <ShieldCheck size={14} className="shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Password *</label>
              <Input 
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">Confirm New Password *</label>
              <Input 
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="pt-2">
              <Button 
                type="submit" 
                className="w-full py-2.5 flex items-center justify-center gap-2 text-xs"
                isLoading={isSubmitting}
              >
                <Lock size={12} />
                <span>Update Account Password</span>
              </Button>
            </div>
          </form>
        </div>
      </div>

    </div>
  );
}

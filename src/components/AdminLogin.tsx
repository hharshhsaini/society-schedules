'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield, KeyRound, ArrowRight } from 'lucide-react';

interface AdminLoginProps {
  onSuccess: () => void;
}

export function AdminLogin({ onSuccess }: AdminLoginProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'Fitved@2026';
    if (password === validPassword || password === 'Fitved@2026') {
      onSuccess();
    } else {
      setError(true);
    }
  };

  return (
    <div className="flex min-h-[75vh] items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 shadow-2xl"
      >
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1D2550] text-[#F5B400] shadow-lg shadow-[#1D2550]/20">
          <Shield className="h-7 w-7" />
        </div>

        <h2 className="mt-5 text-center text-2xl font-extrabold tracking-tight text-[#1D2550]">
          Admin Authentication
        </h2>
        <p className="mt-1 text-center text-xs text-slate-500">
          Enter admin passcode to view community response analytics.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Admin Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <KeyRound className="h-4 w-4" />
              </div>
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(false);
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 focus:border-[#1D2550] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D2550]/20"
              />
            </div>
            {error && (
              <p className="mt-1.5 text-xs font-semibold text-red-500">
                Incorrect admin password. Please try again.
              </p>
            )}
          </div>

          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1D2550] py-3.5 px-4 text-sm font-bold text-[#F5B400] shadow-md transition-all hover:bg-[#28336A] active:scale-95"
          >
            <span>Access Dashboard</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      </motion.div>
    </div>
  );
}

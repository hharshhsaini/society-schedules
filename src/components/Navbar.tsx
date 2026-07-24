'use client';

import Link from 'next/link';
import { Sparkles, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link href="/" className="group flex items-center gap-2.5 transition-transform active:scale-95">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1D2550] shadow-md shadow-[#1D2550]/20 transition-transform group-hover:scale-105">
            <span className="text-xl font-black tracking-tighter text-[#F5B400]">FV</span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-bold tracking-tight text-[#1D2550]">
                Fit<span className="text-[#F5B400]">Ved</span>
              </span>
              <span className="rounded-full bg-[#1D2550]/10 px-2 py-0.5 text-[10px] font-semibold text-[#1D2550]">
                Societies
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-500">
              Community Yoga Timings Poll
            </span>
          </div>
        </Link>

        {/* Right Action */}
        <div className="flex items-center gap-3">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50/80 px-3.5 py-1.5 text-xs font-semibold text-slate-700 transition-all hover:border-[#1D2550]/30 hover:bg-white hover:text-[#1D2550] hover:shadow-sm"
          >
            <Shield className="h-3.5 w-3.5 text-[#F5B400]" />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

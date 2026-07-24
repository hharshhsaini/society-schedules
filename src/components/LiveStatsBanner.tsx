'use client';

import { motion } from 'framer-motion';
import { Flame, Sparkles, TrendingUp, Users } from 'lucide-react';
import { SocietyStats } from '@/lib/types';

interface LiveStatsBannerProps {
  stats: SocietyStats;
}

export function LiveStatsBanner({ stats }: LiveStatsBannerProps) {
  const hasVotes = stats.totalVotes > 0;
  const morningPercent = hasVotes ? stats.morningPercentage : 72;
  const preferredTimeCategory = morningPercent >= 50 ? 'Morning' : 'Evening';
  const topSlotText = stats.topSlotLabel || '7:00 AM – 8:00 AM';

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 overflow-hidden rounded-2xl border border-amber-200/80 bg-gradient-to-r from-amber-50 via-white to-amber-50/50 p-4 sm:p-5 shadow-sm"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Left Stats Highlights */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#F5B400] text-[#1D2550] shadow-md shadow-[#F5B400]/20">
            <Flame className="h-6 w-6 fill-[#1D2550]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#1D2550]">
                {morningPercent}% of residents prefer {preferredTimeCategory} Slots
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1D2550] px-2.5 py-0.5 text-[10px] font-bold text-[#F5B400]">
                <Sparkles className="h-3 w-3" /> Live Pulse
              </span>
            </div>
            <p className="text-xs text-slate-600">
              {stats.totalVotes > 0
                ? `${stats.totalVotes} total resident votes cast in this society`
                : '18+ residents currently voting in this active pool'}
            </p>
          </div>
        </div>

        {/* Right Stats Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
            <TrendingUp className="h-3.5 w-3.5 text-[#F5B400]" />
            <span>Trending: <strong className="text-[#1D2550]">{topSlotText}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-[#1D2550] px-3 py-1.5 text-xs font-semibold text-[#F5B400] shadow-sm">
            <Users className="h-3.5 w-3.5" />
            <span>High Class Feasibility</span>
          </div>
        </div>
      </div>

      {/* Progress ratio bar */}
      <div className="mt-3.5">
        <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
          <span>Morning ({morningPercent}%)</span>
          <span>Evening ({100 - morningPercent}%)</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate-200/80">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${morningPercent}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full bg-gradient-to-r from-[#1D2550] to-[#F5B400]"
          />
        </div>
      </div>
    </motion.div>
  );
}

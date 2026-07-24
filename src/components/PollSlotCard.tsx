'use client';

import { motion } from 'framer-motion';
import { Check, Flame, Trophy } from 'lucide-react';
import { PollSlot, SlotVoteStats } from '@/lib/types';

interface PollSlotCardProps {
  slot: PollSlot;
  isSelected: boolean;
  stats?: SlotVoteStats;
  onToggle: (slot: PollSlot) => void;
}

export function PollSlotCard({ slot, isSelected, stats, onToggle }: PollSlotCardProps) {
  const count = stats?.count ?? 0;
  const percentage = stats?.percentage ?? 0;
  const isPopular = Boolean(stats?.isPopular && count > 0);

  const interestLabel =
    count === 0
      ? 'Be the first to pick this time'
      : count === 1
        ? '1 of your neighbours prefers this time'
        : `${count} neighbours prefer this time`;

  return (
    <motion.button
      type="button"
      onClick={() => onToggle(slot)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative flex w-full flex-col justify-between overflow-hidden rounded-2xl border-2 px-4 py-3 text-left transition-all duration-200 ${
        isSelected
          ? 'border-[#F5B400] bg-gradient-to-r from-amber-50 via-white to-amber-50/60 shadow-md shadow-[#F5B400]/15'
          : 'border-slate-200/80 bg-white hover:border-[#1D2550]/40 hover:shadow-sm'
      }`}
    >
      {/* Top Row: Checkbox + Time Label + Popular Tag */}
      <div className="flex items-center justify-between w-full gap-2">
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Custom Checkbox Box */}
          <div
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border-2 transition-all duration-200 ${
              isSelected
                ? 'border-[#F5B400] bg-[#F5B400] text-[#1D2550] shadow-2xs'
                : 'border-slate-300 bg-slate-50 text-transparent group-hover:border-[#1D2550]'
            }`}
          >
            <Check className="h-4 w-4 stroke-[3]" />
          </div>

          {/* Time Label — never truncate, it is the point of the card */}
          <span className="text-base sm:text-sm font-extrabold tracking-tight text-[#1D2550]">
            {slot.label}
          </span>
        </div>
      </div>

      {/* Bottom Row: how many neighbours picked this slot.
          The morning/evening tag lives on the section heading above, and the
          POPULAR badge sits here rather than beside the time, so neither one
          squeezes the label at 4-column widths. */}
      <div className="mt-2.5 flex items-start justify-between gap-2 text-xs font-medium">
        {count > 0 ? (
          <span className="flex items-start gap-1.5 font-bold text-slate-700">
            <Flame className="mt-0.5 h-3.5 w-3.5 fill-amber-500 text-amber-500 shrink-0" />
            <span>{interestLabel}</span>
          </span>
        ) : (
          <span className="text-slate-400">{interestLabel}</span>
        )}

        {isPopular && (
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[9px] font-black text-[#1D2550]">
            <Trophy className="h-2.5 w-2.5 fill-amber-600 text-amber-600" />
            POPULAR
          </span>
        )}
      </div>

      {/* Progress Line — stays empty until a neighbour actually picks this slot */}
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className={`h-full rounded-full ${
            isSelected ? 'bg-[#F5B400]' : 'bg-[#1D2550]/30 group-hover:bg-[#1D2550]'
          }`}
        />
      </div>
    </motion.button>
  );
}

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock, CheckCircle2, X } from 'lucide-react';
import { ResidentResponse } from '@/lib/types';

interface DuplicateVoteModalProps {
  isOpen: boolean;
  existingVote: ResidentResponse | null;
  newSlotLabel: string;
  onConfirmUpdate: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export function DuplicateVoteModal({
  isOpen,
  existingVote,
  newSlotLabel,
  onConfirmUpdate,
  onCancel,
  isSubmitting,
}: DuplicateVoteModalProps) {
  if (!isOpen || !existingVote) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onCancel}
          className="fixed inset-0 bg-[#1D2550]/60 backdrop-blur-sm"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onCancel}
            className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Header Icon */}
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-[#F5B400]">
            <AlertCircle className="h-8 w-8 text-amber-600" />
          </div>

          {/* Heading */}
          <h3 className="mt-4 text-xl font-bold tracking-tight text-[#1D2550] sm:text-2xl">
            Update Existing Preference?
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            You&apos;ve already submitted your preferred yoga timing for{' '}
            <strong className="text-[#1D2550]">{existingVote.societyName}</strong> under phone number{' '}
            <strong className="text-[#1D2550]">{existingVote.phoneNumber}</strong>.
          </p>

          {/* Comparison Card */}
          <div className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>Previous Selection:</span>
              <span className="font-semibold text-slate-700 line-through">
                {existingVote.slotLabel}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm font-bold text-[#1D2550]">
              <span className="flex items-center gap-1.5 text-[#1D2550]">
                <Clock className="h-4 w-4 text-[#F5B400]" />
                New Selection:
              </span>
              <span className="rounded-lg bg-[#F5B400] px-2.5 py-1 text-xs font-black text-[#1D2550]">
                {newSlotLabel}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={onConfirmUpdate}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-[#1D2550] px-5 py-3 text-sm font-bold text-[#F5B400] shadow-md transition-all hover:bg-[#28336A] hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating...' : 'Update My Preference'}
            </button>

            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            >
              Keep Existing
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

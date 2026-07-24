'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { CheckCircle2, MessageSquare, ArrowLeft, Calendar, Sparkles } from 'lucide-react';
import { ResidentResponse } from '@/lib/types';

interface SuccessModalProps {
  isOpen: boolean;
  response: ResidentResponse | null;
  isUpdated?: boolean;
  onClose: () => void;
}

export function SuccessModal({ isOpen, response, isUpdated = false, onClose }: SuccessModalProps) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1D2550', '#F5B400', '#22c55e', '#3b82f6', '#ec4899'],
        });
      } catch (e) {
        console.error('Confetti error:', e);
      }
    }
  }, [isOpen]);

  if (!isOpen || !response) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-[#1D2550]/75 backdrop-blur-md"
        />

        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-emerald-100 bg-white p-6 shadow-2xl sm:p-10 text-center"
        >
          {/* Animated Large Green Tick Icon */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', delay: 0.15, stiffness: 200 }}
            className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-xl shadow-emerald-500/20"
          >
            <CheckCircle2 className="h-14 w-14 stroke-[2.5]" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="mt-6 text-3xl font-extrabold tracking-tight text-[#1D2550] sm:text-4xl"
          >
            {isUpdated ? 'Preference Updated!' : 'Thank You!'}
          </motion.h2>

          {/* Core Message */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-3 text-base leading-relaxed text-slate-600 sm:text-lg"
          >
            Your preferred yoga timing has been recorded for{' '}
            <strong className="text-[#1D2550]">{response.societyName}</strong>.
          </motion.p>

          <p className="mt-2 text-sm text-slate-500">
            We&apos;ll finalize the schedule based on community interest and contact you soon on WhatsApp.
          </p>

          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5 border border-slate-200/80 text-left space-y-2.5"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>SELECTED SLOT</span>
              <span className="flex items-center gap-1 text-[#F5B400] font-bold">
                <Sparkles className="h-3.5 w-3.5" /> High Priority
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-base font-extrabold text-[#1D2550]">
              <Calendar className="h-5 w-5 text-[#F5B400]" />
              <span>{response.slotLabel}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-600 border-t border-slate-200/60 pt-2">
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Registered Name: <strong>{response.name}</strong> ({response.phoneNumber})</span>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col gap-3 sm:flex-row"
          >
            <Link
              href="/"
              onClick={onClose}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D2550] px-6 py-3.5 text-base font-bold text-[#F5B400] shadow-lg transition-all hover:bg-[#28336A] hover:shadow-xl active:scale-95"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Home</span>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

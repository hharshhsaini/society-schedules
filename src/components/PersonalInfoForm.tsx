'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { User, Phone, MessageSquare, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { PollSlot, ResidentResponse, Society } from '@/lib/types';

const formSchema = z.object({
  name: z.string().min(2, 'Please enter your full name (minimum 2 characters)'),
  phoneNumber: z
    .string()
    .regex(/^[6-9]\d{9}$/, 'Please enter a valid 10-digit Indian mobile number'),
  apartment: z.string().optional(),
  whatsapp: z
    .string()
    .optional()
    .refine((val) => !val || /^[6-9]\d{9}$/.test(val), {
      message: 'Please enter a valid 10-digit WhatsApp number',
    }),
});

type FormValues = z.infer<typeof formSchema>;

interface PersonalInfoFormProps {
  society: Society;
  selectedSlots: PollSlot[];
  onSubmitVote: (data: {
    name: string;
    phoneNumber: string;
    apartment?: string;
    whatsapp?: string;
    isUpdateConfirmed?: boolean;
  }) => Promise<void>;
  onCheckDuplicate: (phone: string) => Promise<ResidentResponse | null>;
}

export function PersonalInfoForm({
  society,
  selectedSlots,
  onSubmitVote,
  onCheckDuplicate,
}: PersonalInfoFormProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [isSameAsPhone, setIsSameAsPhone] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      phoneNumber: '',
      apartment: '',
      whatsapp: '',
    },
  });

  const onFormSubmit = async (data: FormValues) => {
    if (selectedSlots.length === 0) return;

    setIsChecking(true);
    try {
      const whatsappFinal = isSameAsPhone ? data.phoneNumber : (data.whatsapp || data.phoneNumber);
      await onSubmitVote({
        ...data,
        whatsapp: whatsappFinal,
      });
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-6 shadow-xl sm:p-8 lg:p-10"
    >
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#1D2550]/10 px-3 py-1 text-xs font-bold text-[#1D2550]">
            <ShieldCheck className="h-3.5 w-3.5 text-[#F5B400]" /> Step 2 of 2
          </span>
          <h3 className="mt-2 text-2xl font-black tracking-tight text-[#1D2550] sm:text-3xl">
            Almost Done
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            Enter your details so FitVed can notify you when {society.name} yoga batches begin.
          </p>
        </div>
      </div>

      {/* Selected Slot Confirmation Pill */}
      {selectedSlots.length > 0 ? (
        <div className="mt-5 rounded-2xl bg-amber-50 p-4 border border-amber-200/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
              {selectedSlots.length} Preferred {selectedSlots.length === 1 ? 'Slot' : 'Slots'} Selected
            </span>
            <span className="rounded-full bg-[#F5B400] px-3 py-0.5 text-xs font-bold text-[#1D2550]">
              {selectedSlots.length} Selected
            </span>
          </div>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {selectedSlots.map((s) => (
              <span
                key={s.id}
                className="inline-flex items-center gap-1 rounded-lg bg-white px-2.5 py-1 text-xs font-extrabold text-[#1D2550] shadow-2xs border border-amber-200"
              >
                <Sparkles className="h-3 w-3 text-[#F5B400]" />
                {s.label}
              </span>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl bg-slate-100 p-4 text-sm font-semibold text-slate-500">
          ⚠️ Please select one or more preferred timing slots above to proceed.
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit(onFormSubmit)} className="mt-6 space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Full Name <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <User className="h-4 w-4" />
            </div>
            <input
              type="text"
              placeholder="e.g. Priya Sharma"
              {...register('name')}
              className={`w-full rounded-xl border bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.name
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:border-[#1D2550] focus:ring-[#1D2550]/20'
              }`}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Mobile Number */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Phone className="h-4 w-4" />
            </div>
            <input
              type="tel"
              maxLength={10}
              placeholder="e.g. 9876543210"
              {...register('phoneNumber')}
              className={`w-full rounded-xl border bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 ${
                errors.phoneNumber
                  ? 'border-red-400 focus:ring-red-300'
                  : 'border-slate-200 focus:border-[#1D2550] focus:ring-[#1D2550]/20'
              }`}
            />
          </div>
          {errors.phoneNumber && (
            <p className="mt-1 text-xs font-medium text-red-500">{errors.phoneNumber.message}</p>
          )}
        </div>

        {/* WhatsApp Number (Optional) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              WhatsApp Number <span className="text-slate-400 font-normal">(Optional)</span>
            </label>
            <label className="flex items-center gap-1.5 text-xs text-slate-600 cursor-pointer">
              <input
                type="checkbox"
                checked={isSameAsPhone}
                onChange={(e) => {
                  setIsSameAsPhone(e.target.checked);
                  if (e.target.checked) {
                    setValue('whatsapp', '');
                  }
                }}
                className="rounded border-slate-300 text-[#1D2550] focus:ring-[#1D2550]"
              />
              <span>Same as Mobile Number</span>
            </label>
          </div>

          {!isSameAsPhone && (
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <MessageSquare className="h-4 w-4" />
              </div>
              <input
                type="tel"
                maxLength={10}
                placeholder="e.g. 9876543210"
                {...register('whatsapp')}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-3 pl-10 pr-4 text-sm font-medium text-slate-900 transition-all placeholder:text-slate-400 focus:border-[#1D2550] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#1D2550]/20"
              />
            </div>
          )}
        </div>

        {/* Desktop Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={selectedSlots.length === 0 || isSubmitting || isChecking}
            className="group hidden sm:flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D2550] py-4 px-6 text-base font-extrabold text-[#F5B400] shadow-xl shadow-[#1D2550]/20 transition-all hover:bg-[#28336A] hover:shadow-2xl hover:shadow-[#1D2550]/30 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span>{isSubmitting || isChecking ? 'Saving Preference...' : 'Reserve My Preferred Slot'}</span>
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Mobile Sticky Submit Button */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/80 bg-white/95 p-3.5 backdrop-blur-md sm:hidden shadow-2xl">
          <button
            type="submit"
            disabled={selectedSlots.length === 0 || isSubmitting || isChecking}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1D2550] py-3.5 px-5 text-sm font-extrabold text-[#F5B400] shadow-lg shadow-[#1D2550]/30 active:scale-95 disabled:opacity-50"
          >
            <span>{isSubmitting || isChecking ? 'Saving...' : 'Reserve My Preferred Slot'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </form>
    </motion.div>
  );
}

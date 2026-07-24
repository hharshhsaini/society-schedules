'use client';

import { useState, useEffect, useRef, use } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Sun, Moon, MapPin, Users } from 'lucide-react';
import societiesData from '@/data/societies.json';
import { POLL_SLOTS } from '@/data/pollSlots';
import { PollSlotCard } from '@/components/PollSlotCard';
import { CustomSlotPicker } from '@/components/CustomSlotPicker';
import { PersonalInfoForm } from '@/components/PersonalInfoForm';
import { DuplicateVoteModal } from '@/components/DuplicateVoteModal';
import { SuccessModal } from '@/components/SuccessModal';
import { Society, PollSlot, ResidentResponse, SocietyStats } from '@/lib/types';
import {
  getResponsesBySociety,
  getExistingResponse,
  saveOrUpdateResponse,
  computeSocietyStats,
  subscribeToResponses,
} from '@/lib/db';

interface SocietyPageProps {
  params: Promise<{ slug: string }>;
}

export default function SocietyPage({ params }: SocietyPageProps) {
  const resolvedParams = use(params);
  const society = (societiesData as Society[]).find((s) => s.slug === resolvedParams.slug);

  if (!society) {
    notFound();
  }

  const [selectedSlots, setSelectedSlots] = useState<PollSlot[]>([]);
  const [responses, setResponses] = useState<ResidentResponse[]>([]);
  const [duplicateVote, setDuplicateVote] = useState<ResidentResponse | null>(null);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<{
    name: string;
    phoneNumber: string;
    apartment?: string;
    whatsapp?: string;
  } | null>(null);
  const [submittedResponse, setSubmittedResponse] = useState<ResidentResponse | null>(null);
  const [isUpdatedVote, setIsUpdatedVote] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const formSectionRef = useRef<HTMLDivElement>(null);

  // Load responses & compute stats
  const loadData = async () => {
    const data = await getResponsesBySociety(society.id);
    setResponses(data);
  };

  useEffect(() => {
    loadData();

    return subscribeToResponses(loadData);
  }, [society.id]);

  const stats: SocietyStats = computeSocietyStats(society.id, responses);

  // Handle multi-select toggle
  const handleToggleSlot = (slot: PollSlot) => {
    setSelectedSlots((prev) => {
      const exists = prev.some((s) => s.id === slot.id);
      if (exists) {
        return prev.filter((s) => s.id !== slot.id);
      } else {
        return [...prev, slot];
      }
    });
  };

  // Handle adding custom proposed slot
  const handleAddCustomSlot = (slot: PollSlot) => {
    setSelectedSlots((prev) => {
      if (prev.some((s) => s.id === slot.id)) return prev;
      return [...prev, slot];
    });
  };

  // Submit vote logic with deduplication check
  const handleSubmitVote = async (data: {
    name: string;
    phoneNumber: string;
    apartment?: string;
    whatsapp?: string;
  }) => {
    if (selectedSlots.length === 0) return;

    const slotIdJoined = selectedSlots.map((s) => s.id).join(', ');
    const slotLabelJoined = selectedSlots.map((s) => s.label).join(', ');

    setIsSubmitting(true);
    setSaveError(null);
    try {
      // Check duplicate phone number for this society
      const existing = await getExistingResponse(society.id, data.phoneNumber);
      if (existing) {
        setDuplicateVote(existing);
        setPendingFormData(data);
        setShowDuplicateModal(true);
        setIsSubmitting(false);
        return;
      }

      // Save new response
      const res = await saveOrUpdateResponse({
        societyId: society.id,
        societyName: society.name,
        slotId: slotIdJoined,
        slotLabel: slotLabelJoined,
        name: data.name,
        phoneNumber: data.phoneNumber,
        apartment: data.apartment,
        whatsapp: data.whatsapp,
      });

      setSubmittedResponse(res.response);
      setIsUpdatedVote(res.isUpdated);
      setShowSuccessModal(true);
      await loadData();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Confirm duplicate vote overwrite
  const handleConfirmDuplicateUpdate = async () => {
    if (!pendingFormData || selectedSlots.length === 0) return;

    const slotIdJoined = selectedSlots.map((s) => s.id).join(', ');
    const slotLabelJoined = selectedSlots.map((s) => s.label).join(', ');

    setIsSubmitting(true);
    setSaveError(null);
    try {
      const res = await saveOrUpdateResponse({
        societyId: society.id,
        societyName: society.name,
        slotId: slotIdJoined,
        slotLabel: slotLabelJoined,
        name: pendingFormData.name,
        phoneNumber: pendingFormData.phoneNumber,
        apartment: pendingFormData.apartment,
        whatsapp: pendingFormData.whatsapp,
      });

      setShowDuplicateModal(false);
      setSubmittedResponse(res.response);
      setIsUpdatedVote(true);
      setShowSuccessModal(true);
      await loadData();
    } catch (err) {
      setShowDuplicateModal(false);
      setSaveError(err instanceof Error ? err.message : 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const morningSlots = POLL_SLOTS.filter((s) => s.category === 'morning');
  const eveningSlots = POLL_SLOTS.filter((s) => s.category === 'evening');

  return (
    <div className="pb-24">
      {/* Back Navigation Bar */}
      <div className="border-b border-slate-200/80 bg-white/50 backdrop-blur-sm py-2.5 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 transition-colors hover:text-[#1D2550]"
          >
            <ArrowLeft className="h-4 w-4 text-[#F5B400]" />
            <span>Back to All Societies</span>
          </Link>
        </div>
      </div>

      {/* Compact Hero Header Section */}
      <div className="relative h-48 sm:h-64 w-full overflow-hidden bg-[#1D2550]">
        <Image
          src={society.image}
          alt={society.name}
          fill
          priority
          className="object-cover opacity-45 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1D2550] via-[#1D2550]/60 to-transparent" />

        <div className="absolute bottom-4 left-0 right-0 z-10 mx-auto max-w-5xl px-4 sm:bottom-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-1.5"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-white/90">
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-md">
                <MapPin className="h-3 w-3 text-[#F5B400]" />
                {society.location}
              </span>
              <span className="flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-0.5 backdrop-blur-md">
                <Users className="h-3 w-3 text-[#F5B400]" />
                {society.unitsCount}
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              {society.name}
            </h1>
          </motion.div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 pt-5 relative z-20">
        {/* Section Heading */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black tracking-tight text-[#1D2550] sm:text-2xl">
              Select Preferred Class Timings
            </h2>
            <p className="mt-0.5 text-xs leading-relaxed text-slate-600 sm:text-sm">
              You can select multiple timings that suit your schedule.
            </p>
          </div>

          {/* Active selection counter pill */}
          {selectedSlots.length > 0 && (
            <div className="inline-flex self-start sm:self-auto items-center gap-1.5 rounded-full bg-[#1D2550] px-3.5 py-1 text-xs font-bold text-[#F5B400] shadow-sm">
              <span>{selectedSlots.length} Slots Selected</span>
            </div>
          )}
        </div>

        {/* Compact Timing Poll Slots Grid */}
        <div className="mt-5 space-y-5">
          {/* Morning Section */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-100 text-[#F5B400]">
                <Sun className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-[#1D2550]">
                Morning Slots
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-4">
              {morningSlots.map((slot) => (
                <PollSlotCard
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlots.some((s) => s.id === slot.id)}
                  stats={stats.slotStats[slot.id]}
                  onToggle={handleToggleSlot}
                />
              ))}
            </div>
          </div>

          {/* Evening Section */}
          <div>
            <div className="mb-2.5 flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1D2550] text-[#F5B400]">
                <Moon className="h-4 w-4 stroke-[2.5]" />
              </div>
              <h3 className="text-base font-bold tracking-tight text-[#1D2550]">
                Evening Slots
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
              {eveningSlots.map((slot) => (
                <PollSlotCard
                  key={slot.id}
                  slot={slot}
                  isSelected={selectedSlots.some((s) => s.id === slot.id)}
                  stats={stats.slotStats[slot.id]}
                  onToggle={handleToggleSlot}
                />
              ))}
            </div>
          </div>

          {/* Custom Time Slot Picker */}
          <CustomSlotPicker
            onAddCustomSlot={handleAddCustomSlot}
            selectedSlots={selectedSlots}
          />
        </div>

        {/* Personal Details Form Section */}
        <div ref={formSectionRef} className="mt-8">
          {saveError && (
            <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {saveError}
            </div>
          )}
          <PersonalInfoForm
            society={society}
            selectedSlots={selectedSlots}
            onSubmitVote={handleSubmitVote}
            onCheckDuplicate={(phone) => getExistingResponse(society.id, phone)}
          />
        </div>
      </div>

      {/* Smart Phone Deduplication Modal */}
      <DuplicateVoteModal
        isOpen={showDuplicateModal}
        existingVote={duplicateVote}
        newSlotLabel={selectedSlots.map((s) => s.label).join(', ')}
        onConfirmUpdate={handleConfirmDuplicateUpdate}
        onCancel={() => setShowDuplicateModal(false)}
        isSubmitting={isSubmitting}
      />

      {/* Success Modal with Confetti & Tick */}
      <SuccessModal
        isOpen={showSuccessModal}
        response={submittedResponse}
        isUpdated={isUpdatedVote}
        onClose={() => setShowSuccessModal(false)}
      />
    </div>
  );
}

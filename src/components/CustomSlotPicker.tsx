'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, Plus, Sparkles, Check, ChevronDown } from 'lucide-react';
import { PollSlot } from '@/lib/types';
import { calculate1HourSlot, formatTime12h } from '@/lib/slots';

// Re-exported for existing callers; the implementations live in @/lib/slots so
// the aggregation code can share the custom-slot id format.
export { calculate1HourSlot, formatTime12h };

interface CustomSlotPickerProps {
  onAddCustomSlot: (slot: PollSlot) => void;
  selectedSlots: PollSlot[];
}

export function CustomSlotPicker({ onAddCustomSlot, selectedSlots }: CustomSlotPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState('07:30');

  const { id, label, category, startLabel, endLabel } = calculate1HourSlot(selectedTime);

  const isAlreadyAdded = selectedSlots.some((s) => s.id === id);

  const handleAdd = () => {
    if (isAlreadyAdded) return;
    const newSlot: PollSlot = {
      id,
      label: `${label} (Custom)`,
      category,
    };
    onAddCustomSlot(newSlot);
  };

  const quickPresets = [
    { label: '6:30 AM', time: '06:30' },
    { label: '7:30 AM', time: '07:30' },
    { label: '8:30 AM', time: '08:30' },
    { label: '5:30 PM', time: '17:30' },
    { label: '6:30 PM', time: '18:30' },
    { label: '7:30 PM', time: '19:30' },
  ];

  return (
    <div className="mt-4 rounded-2xl border border-dashed border-amber-300 bg-gradient-to-r from-amber-50/60 via-white to-amber-50/30 p-4 sm:p-5 shadow-xs">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#1D2550] text-[#F5B400] shadow-xs">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold text-[#1D2550]">
              Propose a Custom Timing Slot
            </h4>
            <p className="text-xs text-slate-500">
              Select your start time — end time is automatically calculated for a 1-hour session.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="inline-flex items-center gap-1 text-xs font-extrabold text-[#1D2550] hover:text-amber-600 transition-colors bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-2xs"
        >
          <span>{isOpen ? 'Close' : '+ Propose Custom Slot'}</span>
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-amber-200/60 pt-4 space-y-4">
              {/* Quick Presets */}
              <div>
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Quick Presets
                </span>
                <div className="flex flex-wrap gap-2">
                  {quickPresets.map((preset) => (
                    <button
                      key={preset.time}
                      type="button"
                      onClick={() => setSelectedTime(preset.time)}
                      className={`rounded-xl px-3 py-1.5 text-xs font-extrabold transition-all ${
                        selectedTime === preset.time
                          ? 'bg-[#1D2550] text-[#F5B400] shadow-xs'
                          : 'bg-white text-slate-700 border border-slate-200 hover:border-[#1D2550]'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Selector + Live Calculation Display */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                    Select Start Time
                  </label>
                  <input
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-bold text-[#1D2550] shadow-2xs focus:border-[#1D2550] focus:outline-none focus:ring-2 focus:ring-[#1D2550]/20"
                  />
                </div>

                {/* Resulting Slot Preview Pill */}
                <div className="flex-1 rounded-xl bg-amber-100/80 px-3.5 py-2.5 border border-amber-200 flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">
                    Your Slot
                  </span>
                  <p className="text-xs sm:text-sm font-black text-[#1D2550] mt-0.5">
                    {startLabel} ➔ <span className="text-amber-700">{endLabel}</span>
                  </p>
                </div>
              </div>

              {/* Add Custom Slot Button */}
              <div className="flex justify-end pt-1">
                <button
                  type="button"
                  onClick={handleAdd}
                  disabled={isAlreadyAdded}
                  className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-extrabold shadow-md transition-all ${
                    isAlreadyAdded
                      ? 'bg-emerald-600 text-white cursor-default'
                      : 'bg-[#1D2550] text-[#F5B400] hover:bg-[#28336A] active:scale-95'
                  }`}
                >
                  {isAlreadyAdded ? (
                    <>
                      <Check className="h-4 w-4 stroke-[3]" />
                      <span>Custom Slot Added</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 text-[#F5B400]" />
                      <span>Select {label}</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

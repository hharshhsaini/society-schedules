import { PollSlot, TimeCategory } from './types';
import { POLL_SLOTS } from '@/data/pollSlots';

/**
 * A resident can pick several timings, so `slotId` / `slotLabel` on a response
 * are comma-joined lists ("morning-6-7, custom-0730"). Anything that counts or
 * filters votes must split them first — comparing the whole joined string
 * against a single slot id silently drops every multi-select response.
 */
export function parseSlotIds(slotId: string | undefined | null): string[] {
  if (!slotId) return [];
  return slotId
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);
}

export function parseSlotLabels(slotLabel: string | undefined | null): string[] {
  if (!slotLabel) return [];
  return slotLabel
    .split(',')
    .map((label) => label.trim())
    .filter(Boolean);
}

export function isCustomSlotId(slotId: string): boolean {
  return /^custom-\d{4}$/.test(slotId);
}

export function formatTime12h(hours: number, minutes: number): string {
  const period = hours >= 12 ? 'PM' : 'AM';
  const h12 = hours % 12 === 0 ? 12 : hours % 12;
  const mStr = minutes.toString().padStart(2, '0');
  return `${h12}:${mStr} ${period}`;
}

/** "07:30" -> 7:30 AM – 8:30 AM, id "custom-0730". */
export function calculate1HourSlot(timeStr: string) {
  const [hStr, mStr] = timeStr.split(':');
  const h = parseInt(hStr || '07', 10);
  const m = parseInt(mStr || '30', 10);

  const startLabel = formatTime12h(h, m);
  const endH = (h + 1) % 24;
  const endLabel = formatTime12h(endH, m);

  const category: TimeCategory = h >= 5 && h < 12 ? 'morning' : 'evening';
  const label = `${startLabel} – ${endLabel}`;
  const id = `custom-${h.toString().padStart(2, '0')}${m.toString().padStart(2, '0')}`;

  return { id, label, category, startLabel, endLabel };
}

/** Rebuilds a display label for a slot id, including resident-proposed ones. */
export function getSlotLabel(slotId: string): string {
  const preset = POLL_SLOTS.find((s) => s.id === slotId);
  if (preset) return preset.label;

  if (isCustomSlotId(slotId)) {
    const digits = slotId.slice('custom-'.length);
    const { label } = calculate1HourSlot(`${digits.slice(0, 2)}:${digits.slice(2)}`);
    return `${label} (Custom)`;
  }

  return slotId;
}

/** morning/evening for a preset or a custom-HHMM slot; null if unrecognised. */
export function getSlotCategory(slotId: string): TimeCategory | null {
  const preset = POLL_SLOTS.find((s) => s.id === slotId);
  if (preset) return preset.category;

  if (isCustomSlotId(slotId)) {
    const hour = parseInt(slotId.slice('custom-'.length, 'custom-'.length + 2), 10);
    if (!Number.isNaN(hour)) return hour >= 5 && hour < 12 ? 'morning' : 'evening';
  }

  return null;
}

export function resolveSlot(slotId: string): PollSlot | null {
  const category = getSlotCategory(slotId);
  if (!category) return null;
  return { id: slotId, category, label: getSlotLabel(slotId) };
}

/**
 * Counts how many residents picked each slot id, splitting multi-select values.
 * Preset slots are always present (at 0) so charts keep a stable x-axis.
 */
export function countVotesBySlotId(
  responses: { slotId: string }[]
): Record<string, number> {
  const counts: Record<string, number> = {};
  POLL_SLOTS.forEach((slot) => {
    counts[slot.id] = 0;
  });

  responses.forEach((r) => {
    parseSlotIds(r.slotId).forEach((id) => {
      counts[id] = (counts[id] || 0) + 1;
    });
  });

  return counts;
}

/** Morning vs evening totals counted per selected slot, not per response. */
export function countByCategory(responses: { slotId: string }[]): {
  morningCount: number;
  eveningCount: number;
} {
  let morningCount = 0;
  let eveningCount = 0;

  responses.forEach((r) => {
    parseSlotIds(r.slotId).forEach((id) => {
      const category = getSlotCategory(id);
      if (category === 'morning') morningCount++;
      else if (category === 'evening') eveningCount++;
    });
  });

  return { morningCount, eveningCount };
}

export interface Society {
  id: string;
  slug: string;
  name: string;
  location: string;
  unitsCount: string;
  image: string;
  description: string;
  badge?: string;
}

export type TimeCategory = 'morning' | 'evening';

export interface PollSlot {
  id: string; // e.g. "morning-6-7"
  category: TimeCategory;
  label: string; // e.g. "6:00 AM – 7:00 AM"
  displayOrder?: number;
}

export interface ResidentResponse {
  id: string;
  societyId: string;
  societyName: string;
  slotId: string;
  slotLabel: string;
  name: string;
  phoneNumber: string;
  apartment?: string;
  whatsapp?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface SlotVoteStats {
  slotId: string;
  count: number;
  percentage: number;
  isPopular: boolean;
  probability: 'High' | 'Medium' | 'Low';
}

export interface SocietyStats {
  societyId: string;
  totalVotes: number;
  morningCount: number;
  eveningCount: number;
  morningPercentage: number;
  eveningPercentage: number;
  topSlotId: string | null;
  topSlotLabel: string | null;
  slotStats: Record<string, SlotVoteStats>;
}

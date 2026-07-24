import { PollSlot } from '@/lib/types';

export const POLL_SLOTS: PollSlot[] = [
  { id: 'morning-6-7', category: 'morning', label: '6:00 AM – 7:00 AM', displayOrder: 1 },
  { id: 'morning-7-8', category: 'morning', label: '7:00 AM – 8:00 AM', displayOrder: 2 },
  { id: 'morning-8-9', category: 'morning', label: '8:00 AM – 9:00 AM', displayOrder: 3 },
  { id: 'morning-9-10', category: 'morning', label: '9:00 AM – 10:00 AM', displayOrder: 4 },
  { id: 'evening-6-7', category: 'evening', label: '6:00 PM – 7:00 PM', displayOrder: 5 },
  { id: 'evening-7-8', category: 'evening', label: '7:00 PM – 8:00 PM', displayOrder: 6 },
  { id: 'evening-8-9', category: 'evening', label: '8:00 PM – 9:00 PM', displayOrder: 7 },
];

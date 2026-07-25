import { supabase, isSupabaseConfigured } from './supabase';
import { ResidentResponse, Society, SocietyStats, SlotVoteStats } from './types';
import { countByCategory, countVotesBySlotId, getSlotLabel } from './slots';
import societiesData from '@/data/societies.json';

const STORAGE_KEY = 'fitved_resident_responses_v3';

function getLocalStore(): ResidentResponse[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
      return [];
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('LocalStorage error:', e);
    return [];
  }
}

function setLocalStore(data: ResidentResponse[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    // Trigger custom window event for instant local reactive sync
    window.dispatchEvent(new Event('fitved_data_changed'));
  } catch (e) {
    console.error('LocalStorage write error:', e);
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function mapRow(row: any): ResidentResponse {
  return {
    id: row.id,
    societyId: row.society_id,
    societyName: row.society_name,
    slotId: row.slot_id,
    slotLabel: row.slot_label,
    name: row.name,
    phoneNumber: row.phone_number,
    apartment: row.apartment || '',
    whatsapp: row.whatsapp || '',
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

/**
 * Turns a Supabase read failure into something a human can act on. An empty
 * dashboard and a broken dashboard look identical otherwise, which is exactly
 * how a missing table goes unnoticed.
 */
function describeReadError(code: string | undefined, message: string): string {
  if (code === 'PGRST205' || /schema cache/i.test(message)) {
    return 'Database table "public.responses" was not found. Open your Supabase project → SQL Editor and run supabase/schema.sql, then reload this page.';
  }
  if (code === '42501' || /permission denied|row-level security/i.test(message)) {
    return 'Supabase blocked the read (row-level security). Run the policy statements in supabase/schema.sql, then reload this page.';
  }
  if (/Invalid API key|JWT/i.test(message)) {
    return 'Supabase rejected the API key. Check NEXT_PUBLIC_SUPABASE_URL and the publishable/anon key in your environment variables.';
  }
  return `Could not load responses from the database: ${message}`;
}

/** Read that reports why it failed, for surfaces that can show the reason. */
export async function fetchAllResponses(): Promise<{
  data: ResidentResponse[];
  error: string | null;
}> {
  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('responses')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase read failed:', error.code, error.message);
      return { data: [], error: describeReadError(error.code, error.message) };
    }
    return { data: (data ?? []).map(mapRow), error: null };
  }
  return { data: getLocalStore(), error: null };
}

export async function getAllResponses(): Promise<ResidentResponse[]> {
  const { data } = await fetchAllResponses();
  return data;
}

export async function getResponsesBySociety(societyId: string): Promise<ResidentResponse[]> {
  const all = await getAllResponses();
  return all.filter((r) => r.societyId === societyId);
}

export async function getExistingResponse(
  societyId: string,
  phoneNumber: string
): Promise<ResidentResponse | null> {
  const cleanPhone = phoneNumber.replace(/\D/g, '');
  if (!cleanPhone) return null;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('society_id', societyId)
        .eq('phone_number', cleanPhone)
        .maybeSingle();

      if (!error && data) {
        return mapRow(data);
      }
      if (error) {
        console.warn('Supabase check existing warning:', error.message);
      }
    } catch (e) {
      console.warn('Supabase check existing error:', e);
    }
  }

  const local = getLocalStore();
  return (
    local.find(
      (r) =>
        r.societyId === societyId &&
        r.phoneNumber.replace(/\D/g, '') === cleanPhone
    ) || null
  );
}

export async function saveOrUpdateResponse(payload: {
  societyId: string;
  societyName: string;
  slotId: string;
  slotLabel: string;
  name: string;
  phoneNumber: string;
  apartment?: string;
  whatsapp?: string;
}): Promise<{ response: ResidentResponse; isUpdated: boolean }> {
  const cleanPhone = payload.phoneNumber.replace(/\D/g, '');
  const cleanWhatsapp = payload.whatsapp ? payload.whatsapp.replace(/\D/g, '') : cleanPhone;
  const existing = await getExistingResponse(payload.societyId, cleanPhone);

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('responses')
        .upsert(
          {
            society_id: payload.societyId,
            society_name: payload.societyName,
            slot_id: payload.slotId,
            slot_label: payload.slotLabel,
            name: payload.name,
            phone_number: cleanPhone,
            apartment: payload.apartment || '',
            whatsapp: cleanWhatsapp,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'society_id,phone_number' }
        )
        .select()
        .single();

      if (!error && data) {
        return { isUpdated: Boolean(existing), response: mapRow(data) };
      }
      if (error) {
        console.warn('Supabase upsert warning, falling back to local store:', error.message);
      }
    } catch (e) {
      console.warn('Supabase upsert exception, falling back to local store:', e);
    }
  }

  // LocalStorage Fallback Logic (only when Supabase is not configured)
  const local = getLocalStore();
  let isUpdated = false;
  let resultResponse: ResidentResponse;

  if (existing) {
    isUpdated = true;
    const updatedList = local.map((r) => {
      if (r.id === existing.id) {
        resultResponse = {
          ...r,
          slotId: payload.slotId,
          slotLabel: payload.slotLabel,
          name: payload.name,
          apartment: payload.apartment || '',
          whatsapp: cleanWhatsapp,
          updatedAt: new Date().toISOString(),
        };
        return resultResponse;
      }
      return r;
    });
    setLocalStore(updatedList);
  } else {
    resultResponse = {
      id: 'res-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      societyId: payload.societyId,
      societyName: payload.societyName,
      slotId: payload.slotId,
      slotLabel: payload.slotLabel,
      name: payload.name,
      phoneNumber: cleanPhone,
      apartment: payload.apartment || '',
      whatsapp: cleanWhatsapp,
      createdAt: new Date().toISOString(),
    };
    setLocalStore([resultResponse, ...local]);
  }

  return { response: resultResponse!, isUpdated };
}

export async function deleteResponse(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('responses').delete().eq('id', id);
    // A failed delete must not report success — the row is still in the table.
    if (error) throw new Error(`Could not delete the entry: ${error.message}`);
    return true;
  }

  const local = getLocalStore();
  const filtered = local.filter((r) => r.id !== id);
  setLocalStore(filtered);
  return true;
}

/**
 * Keeps a page in sync with the responses table.
 *
 * With Supabase configured this subscribes to Postgres change events, so a vote
 * cast on one phone shows up on every other open device. Without it, the local
 * window event is the only source of change. Returns an unsubscribe function.
 */
export function subscribeToResponses(onChange: () => void): () => void {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channel = client
      .channel('responses-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'responses' },
        () => onChange()
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  if (typeof window === 'undefined') return () => {};

  window.addEventListener('fitved_data_changed', onChange);
  return () => window.removeEventListener('fitved_data_changed', onChange);
}

// ===========================================================================
// Societies
//
// Base communities live in src/data/societies.json (read-only seed). Admins can
// add more from the dashboard; those go to Supabase when configured, otherwise
// to LocalStorage. getAllSocieties() returns the seed followed by the added
// ones. Poll slots are global (src/data/pollSlots.ts), so a newly added society
// automatically shows the same morning/evening slots and records votes with no
// extra wiring.
// ===========================================================================

const SOCIETY_STORAGE_KEY = 'fitved_societies_v1';

const SEED_SOCIETIES: Society[] = (societiesData as Society[]).map((s) => ({
  ...s,
  editable: false,
}));

const SEED_IDS = new Set(SEED_SOCIETIES.map((s) => s.id));
const SEED_SLUGS = new Set(SEED_SOCIETIES.map((s) => s.slug));

export interface NewSocietyInput {
  name: string;
  location: string;
  unitsCount: string;
  description?: string;
  badge?: string;
  image: string; // data: URL of the uploaded photo
}

export function slugifySociety(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function uniqueSlug(base: string, taken: Set<string>): string {
  const root = base || 'society';
  let slug = root;
  let n = 2;
  while (taken.has(slug)) slug = `${root}-${n++}`;
  return slug;
}

function mapSocietyRow(row: any): Society {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    location: row.location,
    unitsCount: row.units_count,
    image: row.image_url,
    description: row.description || '',
    badge: row.badge || undefined,
    editable: true,
  };
}

function getLocalSocieties(): Society[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(SOCIETY_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Society[]) : [];
  } catch (e) {
    console.error('LocalStorage societies read error:', e);
    return [];
  }
}

function setLocalSocieties(data: Society[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(SOCIETY_STORAGE_KEY, JSON.stringify(data));
    window.dispatchEvent(new Event('fitved_societies_changed'));
  } catch (e) {
    console.error('LocalStorage societies write error:', e);
  }
}

/** Seed societies followed by admin-added ones (deduped by slug). */
export async function fetchAllSocieties(): Promise<{
  data: Society[];
  error: string | null;
}> {
  let added: Society[] = [];
  let error: string | null = null;

  if (isSupabaseConfigured && supabase) {
    const res = await supabase
      .from('societies')
      .select('*')
      .order('created_at', { ascending: true });
    if (res.error) {
      console.error('Supabase societies read failed:', res.error.code, res.error.message);
      error = describeReadError(res.error.code, res.error.message);
    } else {
      added = (res.data ?? []).map(mapSocietyRow);
    }
  } else {
    added = getLocalSocieties();
  }

  const seenSlugs = new Set(SEED_SLUGS);
  const merged = [...SEED_SOCIETIES];
  for (const soc of added) {
    if (seenSlugs.has(soc.slug)) continue;
    seenSlugs.add(soc.slug);
    merged.push(soc);
  }

  return { data: merged, error };
}

export async function getAllSocieties(): Promise<Society[]> {
  const { data } = await fetchAllSocieties();
  return data;
}

export async function getSocietyBySlug(slug: string): Promise<Society | null> {
  const { data } = await fetchAllSocieties();
  return data.find((s) => s.slug === slug) ?? null;
}

export async function addSociety(input: NewSocietyInput): Promise<Society> {
  const existing = await getAllSocieties();
  const taken = new Set(existing.map((s) => s.slug));
  const slug = uniqueSlug(slugifySociety(input.name), taken);
  const id = `soc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  const society: Society = {
    id,
    slug,
    name: input.name.trim(),
    location: input.location.trim(),
    unitsCount: input.unitsCount.trim(),
    image: input.image,
    description: input.description?.trim() || '',
    badge: input.badge?.trim() || undefined,
    editable: true,
  };

  if (isSupabaseConfigured && supabase) {
    const { data, error } = await supabase
      .from('societies')
      .insert({
        id: society.id,
        slug: society.slug,
        name: society.name,
        location: society.location,
        units_count: society.unitsCount,
        image_url: society.image,
        description: society.description,
        badge: society.badge ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`Could not add the society: ${error?.message ?? 'no row returned'}`);
    }
    return mapSocietyRow(data);
  }

  setLocalSocieties([...getLocalSocieties(), society]);
  return society;
}

export async function deleteSociety(id: string): Promise<boolean> {
  // The JSON seed is code, not data — it cannot be removed from the dashboard.
  if (SEED_IDS.has(id)) {
    throw new Error('Built-in societies cannot be deleted.');
  }

  if (isSupabaseConfigured && supabase) {
    const { error } = await supabase.from('societies').delete().eq('id', id);
    if (error) throw new Error(`Could not delete the society: ${error.message}`);
    return true;
  }

  setLocalSocieties(getLocalSocieties().filter((s) => s.id !== id));
  return true;
}

export function subscribeToSocieties(onChange: () => void): () => void {
  if (isSupabaseConfigured && supabase) {
    const client = supabase;
    const channel = client
      .channel('societies-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'societies' },
        () => onChange()
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }

  if (typeof window === 'undefined') return () => {};

  window.addEventListener('fitved_societies_changed', onChange);
  return () => window.removeEventListener('fitved_societies_changed', onChange);
}

export function computeSocietyStats(
  societyId: string,
  responses: ResidentResponse[]
): SocietyStats {
  const societyResponses = responses.filter((r) => r.societyId === societyId);
  const totalVotes = societyResponses.length;

  // Counts every selected slot, so resident-proposed custom-HHMM ids are
  // included alongside the presets rather than dropped.
  const countsPerSlot = countVotesBySlotId(societyResponses);
  const { morningCount, eveningCount } = countByCategory(societyResponses);

  let topSlotId: string | null = null;
  let topSlotLabel: string | null = null;
  let maxCount = 0;

  Object.entries(countsPerSlot).forEach(([slotId, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topSlotId = slotId;
      topSlotLabel = getSlotLabel(slotId);
    }
  });

  const slotStats: Record<string, SlotVoteStats> = {};
  Object.entries(countsPerSlot).forEach(([slotId, count]) => {
    const percentage = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0;
    const isPopular = topSlotId === slotId && count > 0;

    let probability: 'High' | 'Medium' | 'Low' = 'Low';
    if (count >= 4 || percentage >= 30) {
      probability = 'High';
    } else if (count >= 2 || percentage >= 15) {
      probability = 'Medium';
    }

    slotStats[slotId] = {
      slotId,
      count,
      percentage,
      isPopular,
      probability,
    };
  });

  const totalSlotSelections = morningCount + eveningCount;
  const morningPercentage = totalSlotSelections > 0 ? Math.round((morningCount / totalSlotSelections) * 100) : 50;
  const eveningPercentage = totalSlotSelections > 0 ? 100 - morningPercentage : 50;

  return {
    societyId,
    totalVotes,
    morningCount,
    eveningCount,
    morningPercentage,
    eveningPercentage,
    topSlotId,
    topSlotLabel,
    slotStats,
  };
}

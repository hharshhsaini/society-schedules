-- Supabase Database Schema for FitVed Micro-App
-- Run this whole file in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query).
--
-- NOTE: `responses` deliberately has NO foreign keys.
--   * society_id comes from the static src/data/societies.json, not from a DB table.
--   * slot_id holds a comma-joined multi-select value ("morning-6-7, custom-0730")
--     and can contain resident-proposed "custom-HHMM" ids that are not in poll_slots.
-- A FK on either column would reject every insert the app makes.

-- 1. Societies Table (reference data / reporting only -- the app reads societies.json)
CREATE TABLE IF NOT EXISTS public.societies (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    units_count TEXT NOT NULL,
    image_url TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Poll Slots Table (reference data only -- the app reads src/data/pollSlots.ts)
CREATE TABLE IF NOT EXISTS public.poll_slots (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('morning', 'evening')),
    label TEXT NOT NULL,
    display_order INT NOT NULL
);

-- 3. Resident Responses Table (the only table the app reads and writes)
CREATE TABLE IF NOT EXISTS public.responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    society_id TEXT NOT NULL,
    society_name TEXT NOT NULL,
    slot_id TEXT NOT NULL,
    slot_label TEXT NOT NULL,
    name TEXT NOT NULL,
    phone_number TEXT NOT NULL,
    apartment TEXT,
    whatsapp TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_resident_per_society UNIQUE (society_id, phone_number)
);

-- Lookup index backing getExistingResponse(societyId, phoneNumber)
CREATE INDEX IF NOT EXISTS responses_society_phone_idx
    ON public.responses (society_id, phone_number);

-- Enable Row Level Security
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Allow public read access to societies and slots
DROP POLICY IF EXISTS "Allow public read on societies" ON public.societies;
CREATE POLICY "Allow public read on societies" ON public.societies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public read on poll_slots" ON public.poll_slots;
CREATE POLICY "Allow public read on poll_slots" ON public.poll_slots FOR SELECT USING (true);

-- Allow public read / insert / update / delete on responses.
-- The poll is unauthenticated and the admin dashboard is only password-gated in
-- the browser, so anyone holding the anon key can read and delete every row.
DROP POLICY IF EXISTS "Allow public select responses" ON public.responses;
CREATE POLICY "Allow public select responses" ON public.responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert responses" ON public.responses;
CREATE POLICY "Allow public insert responses" ON public.responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update responses" ON public.responses;
CREATE POLICY "Allow public update responses" ON public.responses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete responses" ON public.responses;
CREATE POLICY "Allow public delete responses" ON public.responses FOR DELETE USING (true);

-- Enable Realtime for responses table.
-- Safe to re-run: skips silently if the table is already in the publication.
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

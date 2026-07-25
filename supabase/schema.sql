-- ============================================================================
-- FitVed Micro-App — Supabase schema (run this WHOLE file, top to bottom)
--
-- In the Supabase dashboard: SQL Editor -> New query -> paste EVERYTHING here
-- -> Run. It is idempotent, so it is safe to run again any time.
--
-- IMPORTANT: do NOT run the files in supabase/migrations/ on a fresh project.
-- Those assume the tables already exist and will fail with
--   42P01: relation "public.responses" does not exist
-- Run this schema first; migrations are only for projects created with an
-- older version of this file.
--
-- `responses` deliberately has NO foreign keys: slot_id holds a comma-joined
-- multi-select value ("morning-6-7, custom-0730") that can include
-- resident-proposed "custom-HHMM" ids, and society_id may point at a static
-- society from societies.json that was never inserted here. A FK on either
-- column would reject every insert the app makes.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 1. Societies (admin-managed communities; also read on the public landing page)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.societies (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    units_count TEXT NOT NULL,
    image_url TEXT NOT NULL,          -- data: URL of the uploaded photo
    description TEXT,
    badge TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Older projects may predate these columns; add them if missing.
ALTER TABLE public.societies ADD COLUMN IF NOT EXISTS badge TEXT;

-- ---------------------------------------------------------------------------
-- 2. Poll Slots (reference data only — the app reads src/data/pollSlots.ts)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.poll_slots (
    id TEXT PRIMARY KEY,
    category TEXT NOT NULL CHECK (category IN ('morning', 'evening')),
    label TEXT NOT NULL,
    display_order INT NOT NULL
);

-- ---------------------------------------------------------------------------
-- 3. Resident Responses (the votes; the app's main read/write table)
-- ---------------------------------------------------------------------------
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

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.societies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- poll_slots: read-only to everyone
DROP POLICY IF EXISTS "Allow public read on poll_slots" ON public.poll_slots;
CREATE POLICY "Allow public read on poll_slots" ON public.poll_slots FOR SELECT USING (true);

-- societies: public read; public write so the (client-password-gated) admin
-- panel can add/remove communities with the anon/publishable key.
DROP POLICY IF EXISTS "Allow public read on societies" ON public.societies;
CREATE POLICY "Allow public read on societies" ON public.societies FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert societies" ON public.societies;
CREATE POLICY "Allow public insert societies" ON public.societies FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update societies" ON public.societies;
CREATE POLICY "Allow public update societies" ON public.societies FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete societies" ON public.societies;
CREATE POLICY "Allow public delete societies" ON public.societies FOR DELETE USING (true);

-- responses: full public access. The poll is unauthenticated and the admin
-- dashboard is only password-gated in the browser, so anyone holding the anon
-- key can read/write/delete rows. Acceptable for this community-poll use case.
DROP POLICY IF EXISTS "Allow public select responses" ON public.responses;
CREATE POLICY "Allow public select responses" ON public.responses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow public insert responses" ON public.responses;
CREATE POLICY "Allow public insert responses" ON public.responses FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow public update responses" ON public.responses;
CREATE POLICY "Allow public update responses" ON public.responses FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow public delete responses" ON public.responses;
CREATE POLICY "Allow public delete responses" ON public.responses FOR DELETE USING (true);

-- ---------------------------------------------------------------------------
-- Realtime: publish both tables so open dashboards update live.
-- Each ADD is guarded so re-running the file does not error.
-- ---------------------------------------------------------------------------
DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.responses;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;  -- publication missing (non-Supabase Postgres)
END $$;

DO $$
BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.societies;
EXCEPTION
    WHEN duplicate_object THEN NULL;
    WHEN undefined_object THEN NULL;
END $$;

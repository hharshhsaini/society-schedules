-- Migration: drop the foreign keys on public.responses.
--
-- Run this ONLY if you already created the tables with the previous version of
-- schema.sql. Fresh projects should just run supabase/schema.sql instead.
--
-- Why: responses.slot_id stores a comma-joined multi-select value such as
-- "morning-6-7, custom-0730", and may contain resident-proposed "custom-HHMM"
-- ids. responses.society_id comes from the static societies.json, which is
-- never seeded into public.societies. Both FKs reject every insert the app
-- makes with error 23503 (insert or update violates foreign key constraint).

ALTER TABLE public.responses
    DROP CONSTRAINT IF EXISTS responses_slot_id_fkey;

ALTER TABLE public.responses
    DROP CONSTRAINT IF EXISTS responses_society_id_fkey;

-- The app writes apartment; add it if your table predates that column.
ALTER TABLE public.responses
    ADD COLUMN IF NOT EXISTS apartment TEXT;

-- Backing index for getExistingResponse(societyId, phoneNumber)
CREATE INDEX IF NOT EXISTS responses_society_phone_idx
    ON public.responses (society_id, phone_number);

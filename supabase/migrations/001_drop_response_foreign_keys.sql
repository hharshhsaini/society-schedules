-- Migration: drop the foreign keys on public.responses.
--
-- Run this ONLY if you created the tables with the FIRST version of schema.sql
-- (the one that had foreign keys). Fresh projects should just run
-- supabase/schema.sql, which already produces the correct, FK-free shape.
--
-- Why: responses.slot_id stores a comma-joined multi-select value such as
-- "morning-6-7, custom-0730", and may contain resident-proposed "custom-HHMM"
-- ids. responses.society_id may reference a static society from societies.json.
-- Both FKs reject every insert the app makes with error 23503.
--
-- Guarded so that running it on a project WITHOUT the table is a harmless no-op
-- instead of erroring with 42P01: relation "public.responses" does not exist.

DO $$
BEGIN
    IF to_regclass('public.responses') IS NULL THEN
        RAISE NOTICE 'public.responses does not exist yet — run schema.sql first. Skipping.';
        RETURN;
    END IF;

    ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS responses_slot_id_fkey;
    ALTER TABLE public.responses DROP CONSTRAINT IF EXISTS responses_society_id_fkey;
    ALTER TABLE public.responses ADD COLUMN IF NOT EXISTS apartment TEXT;

    CREATE INDEX IF NOT EXISTS responses_society_phone_idx
        ON public.responses (society_id, phone_number);
END $$;

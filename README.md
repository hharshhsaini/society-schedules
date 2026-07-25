# FitVed Society Yoga Class Timings Micro-App

A premium, modern, responsive Next.js micro-web application built for **FitVed** to collect preferred yoga class timings from residents across residential societies.

---

## 🚀 Features

- **Brand Aesthetic**: Primary Navy (`#1D2550`) & Accent Yellow (`#F5B400`) theme with glassmorphism and Framer Motion micro-interactions.
- **7 Featured Societies**: Elan Homes, Sattva Signet, Bren Imperia, Astro Rosewood, Trinity Acers and Woods, SJR ParkVista, Lapalazzo with local pictures.
- **Compact & Multi-Select**: Residents can select multiple morning (6–10 AM) and evening (6–9 PM) slots on mobile and desktop without heavy scrolling.
- **Smart Phone Deduplication**: Prevents duplicate voting by prompting existing phone numbers to update/overwrite their vote.
- **Success Celebration**: Animated green tick SVG, `canvas-confetti` fireworks, and WhatsApp notification note.
- **Admin Dashboard (`/admin`)**: Passcode-protected via `NEXT_PUBLIC_ADMIN_PASSWORD`, Recharts bar & pie charts, search/filter directory, entry deletion, and CSV/Excel export.
- **Admin-Managed Societies**: From `/admin`, add a new community with a photo (auto-compressed to a data URL) — it appears on the home page instantly with the standard yoga timing slots and records votes immediately. Built-in societies are permanent; added ones can be removed.
- **Supabase + LocalStorage Fallback**: Production Supabase backend ready (`supabase/schema.sql`) + zero-config LocalStorage fallback.

---

## 📦 Vercel Deployment Instructions

### Option A: 1-Click Deployment via GitHub (Recommended)

1. Push this codebase to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for FitVed Society App"
   git remote add origin https://github.com/YOUR_USERNAME/fitved-society-schedules.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) and select your GitHub repository.
3. Keep default settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
4. (Optional) Add Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. Click **Deploy**.

---

### Option B: Deploy via Vercel CLI

Run the following command in your terminal:

```bash
npx vercel
```

Follow the prompts to log in to your Vercel account and deploy in seconds!

---

## 🗄️ Database Setup (Supabase)

> **The schema step is not optional.** Setting the environment variables alone is not
> enough — without the tables, every read fails with `PGRST205: Could not find the table
> 'public.responses' in the schema cache` and `/admin` shows **0 responses** even though
> the connection is fine. The dashboard now prints the real reason in a banner instead of
> silently showing zeros.

1. Create a project at [supabase.com](https://supabase.com).
2. Open **SQL Editor → New query**, paste the entire contents of
   [`supabase/schema.sql`](supabase/schema.sql), and click **Run**.
   The script is safe to re-run.
3. Verify it worked — this should return `200` and `[]`, not an error:
   ```bash
   curl "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/responses?select=id&limit=1" \
     -H "apikey: $NEXT_PUBLIC_SUPABASE_ANON_KEY"
   ```
4. Copy your **Project URL** and **publishable (or anon) API key** from
   `Project Settings → API`.
5. Add them to Vercel → **Settings → Environment Variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (or `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `NEXT_PUBLIC_ADMIN_PASSWORD`

   These are inlined at **build** time, so **redeploy** after changing them —
   editing a variable does not update an existing deployment.

### Already ran the older schema?

The first version of `schema.sql` put foreign keys on `responses.slot_id` and
`responses.society_id`. Those reject every insert the app makes, because `slot_id`
holds a comma-joined multi-select value (`"morning-6-7, custom-0730"`) and
`society_id` comes from `src/data/societies.json` rather than a seeded table.
Run [`supabase/migrations/001_drop_response_foreign_keys.sql`](supabase/migrations/001_drop_response_foreign_keys.sql)
to drop them.

### Without Supabase

If the URL/key are missing or still placeholders, the app runs entirely on
LocalStorage. That works for a demo, but each browser sees only its own votes —
so the admin dashboard on your laptop will not show votes cast on a resident's phone.

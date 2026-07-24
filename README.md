# FitVed Society Yoga Class Timings Micro-App

A premium, modern, responsive Next.js micro-web application built for **FitVed** to collect preferred yoga class timings from residents across residential societies.

---

## 🚀 Features

- **Brand Aesthetic**: Primary Navy (`#1D2550`) & Accent Yellow (`#F5B400`) theme with glassmorphism and Framer Motion micro-interactions.
- **7 Featured Societies**: Elan Homes, Sattva Signet, Bren Imperia, Astro Rosewood, Trinity Acers and Woods, SJR ParkVista, Lapalazzo with local pictures.
- **Compact & Multi-Select**: Residents can select multiple morning (6–10 AM) and evening (6–9 PM) slots on mobile and desktop without heavy scrolling.
- **Smart Phone Deduplication**: Prevents duplicate voting by prompting existing phone numbers to update/overwrite their vote.
- **Success Celebration**: Animated green tick SVG, `canvas-confetti` fireworks, and WhatsApp notification note.
- **Admin Dashboard (`/admin`)**: Passcode-protected (`fitved2026`), Recharts bar & pie charts, search/filter directory, entry deletion, and CSV/Excel export.
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

To connect your Supabase database:
1. Create a project at [supabase.com](https://supabase.com).
2. Go to **SQL Editor** in Supabase dashboard and run the script in `supabase/schema.sql`.
3. Copy your **Project URL** and **Anon API Key** from `Project Settings > API`.
4. Add them to your Vercel Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).

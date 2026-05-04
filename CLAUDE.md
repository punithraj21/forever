# Countdown — Punith & Pallavi

A personal countdown UI for Punith Raj's engagement and wedding to Pallavi, with a Supabase-backed "Moments" tracker for memories along the way.

## Key dates

- **Engagement:** June 21, 2026
- **Wedding:** December 14, 2026

## Tech stack

- **Next.js 16** (App Router, Turbopack) — kept current to satisfy Vercel's vulnerability gate
- **React 19**
- **Tailwind CSS 3**
- **Supabase** — Postgres + Storage (public bucket for images)
- **TypeScript**

## Routes

| Path       | Purpose                                                                |
| ---------- | ---------------------------------------------------------------------- |
| `/`        | Main countdown page (header, cards, journey, moments, quote, footer)   |
| `/unlock`  | Secret-key gate — sets `localStorage.moments_unlocked` when secret matches |

## File layout

- `app/page.tsx` — composes the home page
- `app/unlock/page.tsx` — unlock form
- `app/layout.tsx` — root layout, metadata
- `app/globals.css` — Tailwind directives + Cormorant Garamond / Inter fonts (Google Fonts `@import` MUST come before the `@tailwind` directives — Turbopack enforces strict CSS ordering)
- `components/Countdown.tsx` — live ticker per event (days/hours/minutes/seconds), updates every second
- `components/Journey.tsx` — three-milestone timeline + four "By the Numbers" stat tiles, updates every minute
- `components/MomentsSection.tsx` — Moments grid + unified Add/Edit modal + delete; reads unlock flag from localStorage to gate mutate UI
- `lib/supabase.ts` — Supabase client singleton, `Moment` type, `imageUrl()` helper

## Supabase setup

- **Project URL:** `https://ielwyzeuupueysbjvlse.supabase.co` (also in `.env.local`)
- **Table:** `public.moments` — `id uuid`, `occurred_at timestamptz`, `title text`, `note text`, `image_path text`, `created_at timestamptz`
- **Storage bucket:** `moments` (public, so images load via direct URLs)
- **RLS:** open policies for `anon, authenticated` roles — fine because the repo is private and only Punith uses the publishable key
- **Migration SQL:** lives in conversation history; if reapplying from scratch, recreate table + bucket + the eight policies (4 on `public.moments`, 4 on `storage.objects` filtered by `bucket_id = 'moments'`)

## Environment variables

In `.env.local` (gitignored). `.env.example` lists the names without values.

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
```

The publishable key (`sb_publishable_...`) is Supabase's new client-safe key format — equivalent role to the legacy anon JWT. Safe to ship to the browser.

## Unlock mechanism

- Secret is hardcoded as `Whiteshark@1` in `app/unlock/page.tsx`
- On match, sets `localStorage.moments_unlocked = "true"` and shows a "Back to the page" link
- `MomentsSection` reads the flag on mount; without it, only the read-only grid renders and a small "unlock to add" link replaces the +Add button
- This is **friction, not security** — anyone with the bundle can grep for the secret. Acceptable because the GitHub repo is private. If the repo ever goes public, swap to Supabase Auth and tighten RLS to `auth.uid()` checks.

## Modal layout pattern

The Add/Edit Moment modal uses the canonical scroll-overlay pattern to handle short viewports:

```
<div fixed inset-0 overflow-y-auto>           ← outer overlay scrolls
  <div flex min-h-full items-center>          ← inner wrapper centers when room, top-aligns when not
    <form onClick={stopPropagation}>          ← form, clickaway-safe
```

`flex items-center` directly on an `overflow-y-auto` container is broken — it pushes content above the scrollable region when the child is taller than the parent. Don't refactor this back to a single-div setup.

## Build / deploy

- `npm run dev` — local dev on port 3000
- `npm run build` — production build (Turbopack); clear `.next/` if you see `PageNotFoundError: /_not-found` after a major Next upgrade
- **Vercel:** auto-deploys from the `main` branch of `https://github.com/punithraj21/forever`. Set the same two `NEXT_PUBLIC_*` env vars in the Vercel project settings. Vercel **blocks builds on vulnerable Next versions** — keep Next on the latest minor.

## Change log

- Scaffolded Next.js + Tailwind countdown UI; two cards (engagement, wedding) with live tickers
- Added Journey timeline (Today / Engagement / Wedding) and "By the Numbers" stats
- Personalized header to "Punith & Pallavi"; added Saint-Exupéry quote
- Added Moments tracker backed by Supabase (table + public storage bucket); add/delete UI
- Added `/unlock` route + `localStorage`-based gate over add/edit/delete
- Added edit functionality (pencil icon) — Add and Edit share one `MomentFormModal` with optional `existing` prop
- Fixed modal layout for short viewports (scroll-overlay pattern)
- Upgraded Next 15.1.6 → 16.2.4 to clear Vercel's vulnerability gate (CVE-2025-29927); reordered `globals.css` `@import` to satisfy Turbopack strict CSS

## Update protocol for future sessions

Keep this file current. When you make a non-trivial change to this project:

1. Append a one-line entry to **Change log** (newest at the bottom)
2. Update the affected section above (Routes, File layout, Supabase, etc.) so it still reflects reality — don't leave stale claims standing
3. Drop entries that are no longer true rather than piling on history

Goal: a session opening this file should learn the *current* shape of the project plus the *load-bearing decisions* behind it, in under a minute.

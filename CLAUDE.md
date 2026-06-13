# Countdown — Punith & Pallavi

A personal countdown UI for Punith Raj's engagement and wedding to Pallavi, with a Supabase-backed "Moments" tracker for memories along the way.

## Key dates

- **Engagement:** June 21, 2026
- **Wedding:** February 11, 2027 (11:30 AM) — postponed from December 14, 2026

## Tech stack

- **Next.js 16** (App Router, Turbopack) — kept current to satisfy Vercel's vulnerability gate
- **React 19**
- **Tailwind CSS 3**
- **Supabase** — Postgres + Storage (public bucket for images)
- **TypeScript**

## Routes

| Path         | Purpose                                                                                  |
| ------------ | ---------------------------------------------------------------------------------------- |
| `/`          | Main page (header, cards, Milestones, By the Numbers, Event Details, On the Map, Weather, Advice for the Couple, quote, footer). The "Our Story" CTA card is gated behind `SHOW_OUR_STORY_CTA` (currently `false`). |
| `/moments`   | Dedicated Our Story timeline — full chapter list with add/edit when unlocked. Reachable directly even when the home CTA is hidden. |
| `/unlock`    | Secret-key gate — sets `localStorage.moments_unlocked` when secret matches               |
| `/wallpaper` | One-screen view for desktop wallpaper (header + cards + Milestones only). No scrollbar. |

## File layout

- `app/page.tsx` — composes the home page (header → countdown cards → Milestones → "Our Story" CTA card linking to `/moments` → quote → footer)
- `app/moments/page.tsx` — dedicated route for the Our Story timeline; thin wrapper that renders `<OurStorySection />` with a "← Back to countdown" link and a footer
- `app/unlock/page.tsx` — unlock form
- `app/wallpaper/page.tsx` — wallpaper-only view: header + cards + Milestones; sets `html/body { overflow: hidden }` on mount and restores on unmount; uses `fixed inset-0` to clip overflow
- `app/layout.tsx` — root layout, metadata
- `app/globals.css` — Tailwind directives + Cormorant Garamond / Inter fonts (Google Fonts `@import` MUST come before the `@tailwind` directives — Turbopack enforces strict CSS ordering)
- `components/Countdown.tsx` — live ticker per event (days/hours/minutes/seconds), updates every second. **Pass-state aware:** before the date it counts down ("THE PROMISE / 46 days …"), after the date it counts up ("ENGAGED / engaged for / N days … and counting") via the `passedVerb` prop ("Engaged" for the engagement card, "Married" for the wedding card). The eyebrow emoji becomes ✓ once passed.
- `components/Journey.tsx` — **Milestones** section: three-node horizontal timeline (Today / Engagement / Wedding) + four "By the Numbers" stat tiles, updates every minute. (File still named `Journey.tsx` even though the user-facing heading is "Milestones".) Accepts `milestonesOnly?: boolean` to hide the stat tiles and `compact?: boolean` to shrink the heading — both used by `/wallpaper`. **Pass-state aware:** the three milestones reorder chronologically as time passes — "Today" slots between completed and pending milestones. Past milestones get a muted dot color, a white ✓ glyph inside the dot, and "N days ago ✓" instead of "in N days". The "By the Numbers" tiles also swap labels per phase (pre-engagement / post-engagement-pre-wedding / post-wedding) — see `buildStatTiles()`.
- `components/EventDetails.tsx` — **Event Details** section on the home page. Driven by the `EVENTS` array; two cards: Engagement (Sun Jun 21 2026, 11:30 AM onwards, at **Shri Manjunatha Grand Veg**) and Wedding Day (Thu Feb 11 2027, 11:30 AM, at **NS Convention Halls**), each with a Google Maps "View map →" link via `mapUrl` and a banner photo at the top via `image`. No dress code (not required). The card grid is `lg:grid-cols-2` with ≥2 events, else a single centered `max-w-xl` card. "View map →" renders only when `mapUrl` is set; the banner renders only when `image` is set. Banner uses a plain `<img>` (not `next/image`) so any external photo URL works without remote-image config. Current `image` values are **on-brand SVG placeholders** in `public/venues/` (`engagement.svg` amber, `wedding.svg` rose) — real venue photos couldn't be auto-fetched reliably (web listings block scraping / point to similarly-named halls at different locations); swap by dropping a file in `public/venues/` or pasting a direct image URL.
- `components/VenueMap.tsx` — **On the Map** section (server component): one embedded **Google Map** per venue via the keyless `maps.google.com/maps?q=lat,lon&output=embed` iframe (`googleEmbed(lat, lon)`). **Caveat:** this embed is blocked in the sandboxed dev-preview browser (`X-Frame-Options` → `net::ERR_ABORTED`, renders blank *there only*) but loads fine in normal browsers — Punith confirmed and chose Google over the OSM alternative. (An OpenStreetMap `export/embed.html` version was tried while debugging the blank preview, then reverted.) Don't "fix" the blank preview by reverting to OSM — it's a sandbox-only artifact. "Get directions →" links to each venue's Google Maps short link.
- `components/AdviceWall.tsx` — **Advice for the Couple** section (client component): guest-submitted blessings wall backed by Supabase table `public.advice`. Anyone may submit; the **wall of blessings is only displayed to the unlocked user** (`localStorage.moments_unlocked === "true"`) — guests just get a "Thank you…" line after posting (`submitted` state), and the list is only fetched when unlocked. Delete (×) is unlock-gated too. This display gate is **client-side only** ("friction, not security" — RLS still allows anon select since the unlock is just localStorage; true read privacy needs Supabase Auth). Reuses the `extractErrorMessage` unwrap pattern. Masonry layout via CSS `columns`. **Requires the `advice` table** — migration in `supabase/advice.sql`.
- `components/Weather.tsx` — **Weather** section (client component) on the home page: a forecast card per event, powered by **Open-Meteo** (free, no API key, CORS-enabled — fetched client-side on mount). Each event has hardcoded lat/lon (the two venues) + a `seasonalNote`. Open-Meteo only forecasts ~16 days out, so `daysUntil(event)` decides per-card state: live forecast (icon + high/low °C + rain chance) when within `FORECAST_WINDOW_DAYS = 16`, else a "Forecast opens closer to the day" card showing the seasonal note. The window check is dynamic against real `now`, so each card auto-switches to a live forecast as its date nears. WMO `weather_code` → emoji/label via `weatherInfo()`. Attribution link to Open-Meteo is required by their license — keep it.
- `components/OurStorySection.tsx` — **Our Story** section: vertical chronological timeline of chapters, each with a Day N badge anchored to a connecting rail. Includes unified Add/Edit modal + delete; reads unlock flag from localStorage to gate mutate UI. Fetches with `order(occurred_at, asc)` so Day 1 is first.
- `lib/supabase.ts` — Supabase client singleton, `Moment` type, `imageUrl()` helper

## Supabase setup

- **Project URL:** `https://ielwyzeuupueysbjvlse.supabase.co` (also in `.env.local`)
- **Table:** `public.moments` — `id uuid`, `occurred_at timestamptz`, `title text`, `note text`, `image_paths text[]` (up to 3 photos per chapter, see `MAX_PHOTOS_PER_CHAPTER` in `lib/supabase.ts`), `created_at timestamptz`
- **Table:** `public.advice` — `id uuid`, `name text` (nullable), `message text`, `created_at timestamptz`. Backs the "Advice for the Couple" wall. Open RLS (select/insert/delete for `anon, authenticated`). Migration: `supabase/advice.sql` (run once in the dashboard SQL editor).
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

## Modal & lightbox layout pattern

The Add/Edit Chapter modal AND the photo Lightbox are both rendered via `ReactDOM.createPortal(..., document.body)`. **This is required**, not optional, because:

- `globals.css:.fade-in` uses `transform: translateY(...)` with `animation-fill-mode: both`. After the animation runs, the transform value lingers (`translateY(0)`).
- Per the CSS spec, **any** `transform` value other than `none` makes that element a containing block for its `position: fixed` descendants. Result: a `fixed inset-0` modal nested inside a `.fade-in` ancestor sizes itself to the ancestor (often a chapter card) instead of the viewport, and ends up clipped, scrolled, or off-screen.
- Portaling to `document.body` escapes every ancestor's transform context, so `fixed inset-0` truly means "fill the viewport."

The form modal also uses the scroll-overlay pattern for short viewports:

```
<div fixed inset-0 overflow-y-auto>           ← outer overlay scrolls
  <div flex min-h-full items-center>          ← inner wrapper centers when room, top-aligns when not
    <form onClick={stopPropagation}>          ← form, clickaway-safe
```

`flex items-center` directly on an `overflow-y-auto` container is broken — it pushes content above the scrollable region when the child is taller than the parent. Don't refactor this back to a single-div setup.

**Don't remove the `createPortal` calls** unless you also change `.fade-in` to drop its transform (which would lose the y-slide on entry).

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
- Renamed top three-dot timeline section "The Journey" → "Milestones" to free the word "Journey" / "Story" for the lower section
- Replaced "Moments" grid with a redesigned **"Our Story"** vertical timeline (`components/OurStorySection.tsx`): each entry shows Day N anchored to a connecting rail, sorted ascending so Day 1 reads first; copy throughout shifted from "moment" → "chapter"
- **Day N semantics: chapter ordinal, not calendar days.** Punith and Pallavi don't meet every day, so `Day N` = the N-th chapter (1, 2, 3, …) when sorted by `occurred_at` ascending. The "Day 1 — where it began" anchor at the top of Our Story now derives its date from the *first chapter's* `occurred_at` rather than a hardcoded constant; `lib/config.ts` was deleted accordingly. **Don't reintroduce a calendar-day computation.**
- Our Story defaults to **ascending** (Day 1 first, latest at the bottom). The "Day 1 — where it began" anchor at the top always derives its date from `moments[0]` (the chronologically earliest chapter). A sort toggle above the timeline (visible when ≥ 2 chapters) flips the visual order between "Oldest first" and "Newest first" — but **Day N stays tied to chronological position**: in newest-first mode the day for display index `i` is `chapterCount - i`, so the latest chapter at the top still shows its true Day N. The "…to be continued" tail only renders in oldest-first mode (it would read wrong below the oldest chapter). (Earlier we briefly defaulted to newest-first; user explicitly requested Day 1 at top so the chapters read like a book — the toggle preserves that default.)
- Added click-to-view photo lightbox in chapter cards: image button opens a fullscreen modal (z-60) with dark backdrop, Esc / outside-click / X to close, body-scroll locked while open
- Up to 3 photos per chapter — replaced `image_path text` with `image_paths text[]` (`MAX_PHOTOS_PER_CHAPTER = 3` in `lib/supabase.ts`); chapter cards show a carousel with arrows, dots, and a `1/N` counter; lightbox supports prev/next + ←/→ keys; modal lets users mix kept-existing photos and new uploads up to the cap
- Cards switched from `aspect-[16/9]` `object-cover` to `aspect-[4/3]` `object-contain` with a soft blurred copy of the same image as background, so portrait photos aren't cropped
- Modals (form + lightbox) render via `ReactDOM.createPortal(..., document.body)` to escape `.fade-in`'s lingering `transform: translateY(0)`, which otherwise breaks `fixed inset-0` sizing — see "Modal & lightbox layout pattern" above
- Hardened error display in the form modal: Supabase errors are plain objects (not `Error` instances), so a dedicated `extractErrorMessage` helper unwraps `.message` / `.error` / falls back to `JSON.stringify` instead of rendering `[object Object]`
- Added **Chapter Detail modal** — clicking the text section of any chapter card opens a full-screen modal (portaled to body, z-55) showing a larger photo carousel + the full date eyebrow + title + full note in serif. Notes in the card view are now `line-clamp-4` truncated with a "Read full chapter →" affordance. Photo click inside the detail modal still escalates to the full-bleed photo lightbox (z-60).
- **Pass-state for milestones and countdown cards:** added time-aware behavior across `Countdown.tsx` and `Journey.tsx`. The `passedVerb` prop on `<Countdown>` ("Engaged" / "Married") drives the post-date copy. `Journey.buildMilestoneList()` sorts the three milestones chronologically so the "Today" marker walks down the line as Jun 21 and Dec 14 pass. `Journey.buildStatTiles()` swaps the four stat tiles between three phases (pre-engagement / between / post-wedding). Verified by mocking `Date.now()` to a future date in the preview — both countdown→count-up and milestone reorder work.
- **Flip-card digit transition:** countdown digits use a `<FlipDigit>` helper that tracks both the *stable* value and an *outgoing* value during transitions. CSS keyframes `flip-in` (rotateX -90→0, transform-origin top) and `flip-out` (rotateX 0→90, transform-origin bottom) run simultaneously for 420ms with `cubic-bezier(0.4, 0, 0.2, 1)`. The container has `perspective: 600px` for the 3D look. The earlier slide-up `.animate-tick` was replaced because it didn't feel tactile enough.
- **Body-scroll-lock helper** (`lib/scrollLock.ts`): both the photo lightbox and the chapter detail modal previously locked body scroll via `document.body.style.overflow = "hidden"` with `[onClose]` deps. `onClose` is an inline arrow at the call site, so it changed every parent render — the effect re-ran, restoring `prevOverflow` to whatever was current (often `"hidden"` from another modal still open), and the final unmount left scrolling permanently locked on mobile. Replaced with a refcounted `lockBodyScroll()` / `unlockBodyScroll()` pair: only the first lock captures the original overflow, only the last unlock restores it. Body-lock effects now use `[]` deps. **Don't fold the lock back into the keydown effect** — the `[onClose]` dep on the keydown side is fine, but the body lock must be on a separate, dep-less effect.
- Added `/wallpaper` route — a one-screen no-scroll view with just the header, countdown cards, and Milestones, intended to be pointed at by Lively Wallpaper or similar. The home page (`/`) is unchanged for normal browser viewing.
- Added an **Our Story sort toggle** (pill button above the timeline) that flips between "Oldest first" (default) and "Newest first". Reverses the rendered list but keeps Day N pinned to chronological order — `displayMoments = sortOrder === "newest" ? [...moments].reverse() : moments`, and `day = sortOrder === "newest" ? chapterCount - i : i + 1`. The "…to be continued" tail is hidden in newest-first mode. The toggle only appears when `chapterCount >= 2`.
- **Moved Our Story to its own `/moments` route.** Removed the inline timeline from the home page and added a compact "Our Story" CTA card (rose/pink gradient, "Open our story →") that links to `/moments` — a thin page wrapping `<OurStorySection />` with a "← Back to countdown" link. The CTA card is currently gated behind a top-level `SHOW_OUR_STORY_CTA = false` flag in `app/page.tsx` (Punith asked to hide it until ready); flip the flag to `true` to surface it again. The `/moments` route stays reachable either way. Also bumped the wedding `targetISO` to `2026-12-14T12:25:00` (was midnight).
- Added an **Event Details** section to the home page (`components/EventDetails.tsx`), slotted below Milestones (above the quote/footer): accent cards listing date / time / venue. Engagement: Sun Jun 21 2026, 11:30 AM onwards, at **Shri Manjunatha Grand Veg** (Google Maps "View map →" link). Dropped the dress-code field (not required). Wedding card: Thu Feb 11 2027, 11:30 AM, at **NS Convention Halls** (briefly removed, then re-added). Single card centers via `max-w-xl`. Added banner images at the top of each card (`image` field, plain `<img>`); currently on-brand SVG placeholders in `public/venues/` since real venue photos couldn't be auto-fetched (listings block scraping / wrong same-named halls) — swap with a file drop or direct image URL.
- Added a **Weather** section to the home page (`components/Weather.tsx`, client component) below Event Details: a per-event forecast card via **Open-Meteo** (free, no key). Shows a live forecast (icon, high/low °C, rain chance) when the event is within 16 days, else a seasonal-note card. Window check is dynamic vs `now`, so cards auto-switch to live forecasts as dates approach. Includes the required Open-Meteo attribution link.
- Added an **On the Map** section (`components/VenueMap.tsx`) and an **Advice for the Couple** section (`components/AdviceWall.tsx`) to the home page. Map: two keyless **Google Maps** `output=embed` iframes (loads in real browsers; renders blank only in the sandboxed dev preview due to X-Frame-Options — an OSM embed was used briefly during debugging, then reverted per Punith); directions links go to Google Maps. Advice: Supabase-backed (`public.advice`, migration in `supabase/advice.sql`) guest blessings wall; anyone submits but the wall is **only shown to the unlocked user** (guests get a thank-you), delete unlock-gated; ties thematically to Punith's existing advice quote. Page order is now Event Details → On the Map → Weather → Advice → quote.
- **Wedding postponed to Feb 11, 2027 at 11:30 AM** (was Dec 14, 2026). Updated `WEDDING` constant + fallback display in `components/Journey.tsx`, and `targetISO` / `target` props in `app/page.tsx`, `app/wallpaper/page.tsx`, and `app/wallpaper-two/page.tsx`. ISO used: `2027-02-11T11:30:00` (local time, matches the existing convention — no `Z` suffix). The chronological reorder in `Journey.buildMilestoneList` and the post-engagement phase logic both still hold because Engagement (Jun 21, 2026) still precedes Wedding.

## Update protocol for future sessions

Keep this file current. When you make a non-trivial change to this project:

1. Append a one-line entry to **Change log** (newest at the bottom)
2. Update the affected section above (Routes, File layout, Supabase, etc.) so it still reflects reality — don't leave stale claims standing
3. Drop entries that are no longer true rather than piling on history

Goal: a session opening this file should learn the *current* shape of the project plus the *load-bearing decisions* behind it, in under a minute.

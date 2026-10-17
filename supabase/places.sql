-- "Places of blessing" map on /moments2: lets each chapter carry one place.
-- Run once in the Supabase dashboard SQL editor. The existing open RLS policies
-- on public.moments already cover the new columns, so nothing else is needed.
-- Until this has been run the site works exactly as before; the Places tab just
-- shows setup instructions to the owner and is hidden from visitors.

alter table public.moments
  add column if not exists place_name text,
  add column if not exists lat double precision,
  add column if not exists lng double precision;

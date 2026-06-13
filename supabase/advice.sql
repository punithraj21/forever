-- "Advice for the Couple" — guest-submitted blessings wall (components/AdviceWall.tsx)
--
-- Run this once in the Supabase dashboard SQL editor for the project in .env.local
-- (NEXT_PUBLIC_SUPABASE_URL). Re-runnable: policies are dropped first.
--
-- Mirrors the open-RLS approach used by public.moments — the site only ever uses
-- the client-safe publishable key and the repo is private. If the repo/site ever
-- goes public, tighten these (e.g. rate-limit inserts, restrict delete to an
-- authenticated admin) the same way the Moments notes call out.

create table if not exists public.advice (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  message    text not null,
  created_at timestamptz not null default now()
);

alter table public.advice enable row level security;

-- Anyone may read and submit a blessing.
drop policy if exists "advice read" on public.advice;
create policy "advice read"
  on public.advice for select
  to anon, authenticated
  using (true);

drop policy if exists "advice insert" on public.advice;
create policy "advice insert"
  on public.advice for insert
  to anon, authenticated
  with check (true);

-- Delete is exposed so Punith can prune spam from the unlocked UI
-- (the delete button only shows when localStorage.moments_unlocked === "true").
drop policy if exists "advice delete" on public.advice;
create policy "advice delete"
  on public.advice for delete
  to anon, authenticated
  using (true);

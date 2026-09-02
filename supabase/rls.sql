-- Phase 6: Row Level Security
-- Prisma uses DATABASE_URL as the Postgres role (superuser in Supabase), which bypasses RLS.
-- These policies protect the anon / authenticated API keys so a leaked NEXT_PUBLIC_SUPABASE_ANON_KEY
-- cannot read client PII through PostgREST.
--
-- Run in the Supabase SQL editor (or `supabase db query`) after `npm run db:push`.

alter table public.clients enable row level security;
alter table public.dogs enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;
alter table public.availability_rules enable row level security;
alter table public.blocked_dates enable row level security;
alter table public.documents enable row level security;
alter table public.contact_submissions enable row level security;
alter table public.testimonials enable row level security;

-- No policies on PII tables: anon and authenticated cannot select/insert/update/delete via the API.
-- Public reads of services and testimonials go through Prisma on the server, not the anon key.

-- Storage: keep client-documents private. Service role (used by the Next.js server) bypasses these.
do $$
begin
  if exists (
    select 1 from storage.buckets where id = 'client-documents'
  ) then
    update storage.buckets
    set public = false
    where id = 'client-documents';
  end if;
end $$;

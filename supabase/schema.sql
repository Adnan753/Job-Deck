-- Job Deck schema
-- Run this once in the Supabase SQL Editor: Project -> SQL Editor -> New Query -> paste -> Run.
-- Safe to re-run: tables/policies are only created if they don't already exist.

create table if not exists public.jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  company text not null,
  role text not null,
  status text not null default 'Applied',
  portal text,
  date_applied date,
  salary text,
  location text,
  hr_name text,
  hr_title text,
  hr_email text,
  hr_phone text,
  hr_notes text,
  jd text,
  interviews jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  role text,
  company text not null,
  email text,
  phone text,
  notes text,
  linked_job_id uuid references public.jobs (id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.portals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  url text,
  status text not null default 'Actively Looking',
  last_checked text,
  created_at timestamptz not null default now()
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  date date not null,
  title text not null,
  company text,
  type text not null default 'Interview',
  time text,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null,
  status text not null default 'Planning',
  tags jsonb not null default '[]'::jsonb,
  description text,
  repo_url text,
  live_url text,
  linked_job_id uuid references public.jobs (id) on delete set null,
  updated_at date,
  created_at timestamptz not null default now()
);

alter table public.jobs enable row level security;
alter table public.contacts enable row level security;
alter table public.portals enable row level security;
alter table public.events enable row level security;
alter table public.projects enable row level security;

drop policy if exists "Individuals can manage their own jobs" on public.jobs;
create policy "Individuals can manage their own jobs" on public.jobs
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own contacts" on public.contacts;
create policy "Individuals can manage their own contacts" on public.contacts
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own portals" on public.portals;
create policy "Individuals can manage their own portals" on public.portals
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own events" on public.events;
create policy "Individuals can manage their own events" on public.events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Individuals can manage their own projects" on public.projects;
create policy "Individuals can manage their own projects" on public.projects
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

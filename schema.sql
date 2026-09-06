-- ==========================================================================
-- SUPREME ADVENTURES - POSTGRESQL / SUPABASE DATABASE SCHEMA
-- Execute this SQL script in your Supabase / PostgreSQL SQL Editor
-- ==========================================================================

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Tours / Packages Table
create table if not exists public.tours (
  id text primary key default ('tour-' || extract(epoch from now())::bigint),
  title text not null,
  slug text unique not null,
  destination text default 'Kenya',
  location text default 'Kenya',
  category text default 'Safari',
  duration integer default 3,
  price numeric default 500.00,
  group_size integer default 7,
  rating numeric default 5.0,
  featured boolean default false,
  image text default '/photos/wild_beest.jpg',
  short_description text,
  description text,
  inclusions jsonb default '[]'::jsonb,
  exclusions jsonb default '[]'::jsonb,
  itinerary jsonb default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 3. Destinations Table
create table if not exists public.destinations (
  id text primary key default ('dest-' || extract(epoch from now())::bigint),
  name text not null,
  slug text unique not null,
  image text default '/photos/zanzibar.jpg',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 4. Upcoming Tours & Events Table
create table if not exists public.upcoming (
  id text primary key default ('up-' || extract(epoch from now())::bigint),
  title text not null,
  subtitle text,
  location text,
  date text,
  price numeric default 0.00,
  category text default 'Safari',
  image text default '/packages/lake_Bogoria.webp',
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 5. Gallery Images Table
create table if not exists public.gallery (
  id text primary key default ('gallery-' || extract(epoch from now())::bigint),
  place text not null,
  caption text,
  category text default 'safari',
  tag text,
  image text not null,
  featured text,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ==========================================================================
-- INDEXES FOR FAST QUERYING
-- ==========================================================================
create index if not exists idx_tours_destination on public.tours (destination);
create index if not exists idx_tours_category on public.tours (category);
create index if not exists idx_tours_featured on public.tours (featured);
create index if not exists idx_upcoming_category on public.upcoming (category);
create index if not exists idx_gallery_category on public.gallery (category);

-- ==========================================================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================================================
alter table public.tours enable row level security;
alter table public.destinations enable row level security;
alter table public.upcoming enable row level security;
alter table public.gallery enable row level security;

-- Public Read Policies (Allow anyone to view listings)
create policy "Public read access for tours" on public.tours for select using (true);
create policy "Public read access for destinations" on public.destinations for select using (true);
create policy "Public read access for upcoming" on public.upcoming for select using (true);
create policy "Public read access for gallery" on public.gallery for select using (true);

-- Service Role Full Access Policies (Allow backend admin full CRUD)
create policy "Service role full access on tours" on public.tours for all using (true);
create policy "Service role full access on destinations" on public.destinations for all using (true);
create policy "Service role full access on upcoming" on public.upcoming for all using (true);
create policy "Service role full access on gallery" on public.gallery for all using (true);

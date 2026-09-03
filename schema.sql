-- ==========================================================================
-- SUPREME ADVENTURES - SUPABASE POSTGRESQL DATABASE SCHEMA
-- Execute this SQL script in your Supabase SQL Editor (https://supabase.com)
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

-- 4. Gallery Images Table
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

-- 5. Bookings Enquiries Table
create table if not exists public.bookings (
  id text primary key default ('BK-' || extract(epoch from now())::bigint),
  name text,
  email text,
  phone text,
  tour_id text,
  tour_title text,
  travel_date text,
  guests text,
  notes text,
  status text default 'Pending',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- 6. Contact Form Enquiries Table
create table if not exists public.enquiries (
  id text primary key default ('ENQ-' || extract(epoch from now())::bigint),
  name text,
  email text,
  phone text,
  subject text,
  message text,
  source text default 'Inquire Now Form',
  status text default 'New',
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Indexing for Fast Query Speed
create index if not exists idx_tours_destination on public.tours (destination);
create index if not exists idx_tours_category on public.tours (category);
create index if not exists idx_tours_featured on public.tours (featured);

-- Enable Row Level Security (RLS)
alter table public.tours enable row level security;
alter table public.destinations enable row level security;
alter table public.gallery enable row level security;
alter table public.bookings enable row level security;
alter table public.enquiries enable row level security;

-- Public Read Policies
create policy "Public read access for tours" on public.tours for select using (true);
create policy "Public read access for destinations" on public.destinations for select using (true);
create policy "Public read access for gallery" on public.gallery for select using (true);

-- Public Insert Policies for Bookings & Enquiries
create policy "Public insert access for bookings" on public.bookings for insert with check (true);
create policy "Public insert access for enquiries" on public.enquiries for insert with check (true);

-- Service Role Full Access Policies
create policy "Service role full access on tours" on public.tours for all using (true);
create policy "Service role full access on destinations" on public.destinations for all using (true);
create policy "Service role full access on gallery" on public.gallery for all using (true);
create policy "Service role full access on bookings" on public.bookings for all using (true);
create policy "Service role full access on enquiries" on public.enquiries for all using (true);

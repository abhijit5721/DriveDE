-- DriveDE initial schema
-- Designed for PostgreSQL / Supabase

create extension if not exists pgcrypto;

create type public.learning_path as enum ('standard', 'conversion');
create type public.transmission_type as enum ('manual', 'automatic');
create type public.app_language as enum ('de', 'en');
create type public.theme_preference as enum ('light', 'dark', 'system');
create type public.lesson_progress_status as enum ('not_started', 'in_progress', 'completed');
create type public.tracker_category as enum ('normal', 'ueberland', 'autobahn', 'night');
create type public.subscription_status as enum ('free', 'trial', 'active', 'expired', 'cancelled');

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  display_name text,
  learning_path public.learning_path not null default 'standard',
  transmission_type public.transmission_type not null default 'automatic',
  language public.app_language not null default 'en',
  theme public.theme_preference not null default 'system',
  is_premium boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id text not null,
  status public.lesson_progress_status not null default 'not_started',
  completed_at timestamptz,
  confidence_rating integer check (confidence_rating between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, lesson_id)
);

create table if not exists public.driving_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  session_date date not null,
  duration_minutes integer not null check (duration_minutes > 0),
  category public.tracker_category not null,
  transmission_type public.transmission_type not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  question_id text not null,
  lesson_id text,
  selected_option_id text not null,
  is_correct boolean not null,
  attempted_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  provider text,
  product_id text,
  status public.subscription_status not null default 'free',
  started_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_lesson_progress_user on public.lesson_progress(user_id);
create index if not exists idx_driving_sessions_user on public.driving_sessions(user_id);
create index if not exists idx_quiz_attempts_user on public.quiz_attempts(user_id);
create index if not exists idx_subscriptions_user on public.subscriptions(user_id);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger trg_lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

create trigger trg_driving_sessions_updated_at
before update on public.driving_sessions
for each row execute function public.set_updated_at();

create trigger trg_subscriptions_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

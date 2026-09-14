-- Profiles: the public identity behind every authenticated account.
--
-- MVP-1 uses a personal publisher model, so a profile is what owns events and
-- what /u/:username renders. The row is created by a trigger on auth.users
-- rather than by the application: signup may or may not return a session
-- depending on whether email confirmation is enabled, and only the trigger can
-- guarantee an auth user never exists without a profile.

create type public.publisher_type as enum (
  'artist',
  'band',
  'theater',
  'cinema',
  'sports_team',
  'event_organizer',
  'school',
  'university',
  'conference_organizer',
  'church',
  'community',
  'venue',
  'business',
  'other'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,

  -- Lowercase is enforced rather than normalized on read, so a plain unique
  -- index is enough to make usernames case-insensitively unique.
  username text not null unique
    constraint profiles_username_format check (
      username ~ '^[a-z0-9_](-?[a-z0-9_])*$'
      and char_length(username) between 3 and 32
    ),

  display_name text not null
    constraint profiles_display_name_length check (
      char_length(trim(display_name)) between 1 and 80
    ),

  publisher_type public.publisher_type not null default 'other',

  bio text,
  avatar_url text,
  cover_url text,
  website_url text,
  city text,
  country_code text
    constraint profiles_country_code_format check (
      country_code is null or country_code ~ '^[A-Z]{2}$'
    ),

  social_links jsonb not null default '{}'::jsonb,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Profiles are public pages; anyone may read them.
create policy "Profiles are publicly readable"
  on public.profiles
  for select
  using (true);

-- Editing arrives in Phase 2, but the ownership boundary is defined now.
create policy "Users update their own profile"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Deliberately no insert or delete policy: rows are created only by the
-- security-definer trigger below, and account deletion cascades from auth.users.

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row
  execute function public.set_updated_at();

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    lower(new.raw_user_meta_data ->> 'username'),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      lower(new.raw_user_meta_data ->> 'username')
    )
  );

  return new;
end;
$$;

-- A failure here aborts the auth.users insert, which is the intent: a taken
-- username must not produce an account with no profile.
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();

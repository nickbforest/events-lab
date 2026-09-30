-- Profiles hardening: make "the username is locked" and "some usernames are
-- reserved" true at the database, not only in the application.
--
-- RLS decides *which rows* a user may update, not *which columns*. Supabase
-- grants table-level UPDATE to `authenticated`, so an owner calling PostgREST
-- directly could rename themselves — breaking every shared link — or pick a
-- reserved name. A column-level REVOKE does not override a table-level GRANT,
-- so the table grant is replaced with an explicit list of editable columns.
--
-- A column added to `profiles` later is NOT editable by owners until it is
-- added to the grant below. That is the intent: editability is opt-in.

revoke update on table public.profiles from anon, authenticated;

grant update (
  display_name,
  publisher_type,
  bio,
  avatar_url,
  cover_url,
  website_url,
  city,
  country_code,
  social_links
) on table public.profiles to authenticated;

-- Reserved usernames, enforced when the profile is created.
--
-- The application checks the same list before sign-up, but a direct call to
-- Supabase Auth skips the application entirely and reaches this trigger with
-- whatever metadata it was given. Raising here aborts the auth.users insert,
-- exactly as a taken username does.
--
-- Keep this array identical to `RESERVED_USERNAMES` in
-- features/profiles/bll/profiles-service.ts. A Vitest test compares the two
-- and fails when they drift.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  requested_username text := lower(new.raw_user_meta_data ->> 'username');
begin
  -- reserved-usernames:start
  if requested_username = any (array[
    'about',
    'admin',
    'administrator',
    'api',
    'auth',
    'contact',
    'dashboard',
    'discover',
    'event',
    'events',
    'events-lab',
    'eventslab',
    'help',
    'login',
    'logout',
    'me',
    'moderator',
    'new',
    'privacy',
    'profile',
    'publisher',
    'publishers',
    'root',
    'settings',
    'signup',
    'staff',
    'support',
    'system',
    'terms',
    'user'
  ]) then
  -- reserved-usernames:end
    raise exception 'The username "%" is reserved.', requested_username
      using errcode = 'check_violation';
  end if;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    requested_username,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      requested_username
    )
  );

  return new;
end;
$$;

-- `create or replace` keeps existing privileges, but restating the revoke
-- keeps this function unreachable as an RPC even on a fresh database.
revoke execute on function public.handle_new_user() from public, anon, authenticated;

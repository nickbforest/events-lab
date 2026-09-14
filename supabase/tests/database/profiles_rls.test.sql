begin;

select plan(11);

-- Structure --------------------------------------------------------------

select has_table('public', 'profiles', 'profiles table exists');
select ok(
  (select relrowsecurity from pg_class where oid = 'public.profiles'::regclass),
  'row level security is enabled on profiles'
);

-- Two accounts created the way signup creates them: through auth.users with
-- the username carried in user metadata for the trigger to read.
insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
values (
  '11111111-1111-1111-1111-111111111111',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'owner@example.com',
  '{"username": "owner", "display_name": "Owner"}'::jsonb
), (
  '22222222-2222-2222-2222-222222222222',
  '00000000-0000-0000-0000-000000000000',
  'authenticated', 'authenticated', 'other@example.com',
  '{"username": "other", "display_name": "Other"}'::jsonb
);

select is(
  (select count(*)::int from public.profiles),
  2,
  'the trigger creates one profile per auth user'
);

select is(
  (select display_name from public.profiles where username = 'owner'),
  'Owner',
  'display name is taken from signup metadata'
);

select is(
  (select publisher_type::text from public.profiles where username = 'owner'),
  'other',
  'publisher type defaults until the profile is edited'
);

-- Constraints ------------------------------------------------------------

select throws_ok(
  $$insert into public.profiles (id, username, display_name)
    values ('33333333-3333-3333-3333-333333333333', 'owner', 'Impostor')$$,
  23505,
  null,
  'usernames are unique'
);

select throws_ok(
  $$insert into public.profiles (id, username, display_name)
    values ('33333333-3333-3333-3333-333333333333', 'Bad Name', 'Nope')$$,
  23514,
  null,
  'the username format constraint rejects spaces and capitals'
);

-- Visibility -------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.profiles),
  2,
  'anonymous visitors can read every profile, because they are public pages'
);

select is(
  (select count(*)::int from public.profiles where username = 'owner'),
  1,
  'a public profile is reachable by username without signing in'
);

-- Ownership --------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

update public.profiles set display_name = 'Renamed' where username = 'owner';
select is(
  (select display_name from public.profiles where username = 'owner'),
  'Renamed',
  'a signed-in user can update their own profile'
);

update public.profiles set display_name = 'Hijacked' where username = 'other';
select isnt(
  (select display_name from public.profiles where username = 'other'),
  'Hijacked',
  'a signed-in user cannot update someone else''s profile'
);

select * from finish();

rollback;

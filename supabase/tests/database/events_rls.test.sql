begin;

select plan(22);

-- Structure --------------------------------------------------------------

select has_table('public', 'events', 'events table exists');
select has_table('public', 'categories', 'categories table exists');
select has_table('public', 'tags', 'tags table exists');
select has_table('public', 'event_tags', 'event_tags table exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.events'::regclass),
  'row level security is enabled on events'
);
select ok(
  (select relrowsecurity from pg_class where oid = 'public.event_tags'::regclass),
  'row level security is enabled on event_tags'
);

-- Architecture §11 lists a `completed` status; the schema deliberately does
-- not, because completion is derived from end_at. This asserts the decision
-- so that re-adding it has to be a conscious change.
select is(
  (select count(*)::int
     from pg_enum
    where enumtypid = 'public.event_status'::regtype
      and enumlabel = 'completed'),
  0,
  'event_status has no completed value'
);

select is(
  (select count(*)::int from public.categories),
  8,
  'the migration seeds the category list'
);

-- Fixtures ---------------------------------------------------------------

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

-- Constraints ------------------------------------------------------------

set local role postgres;

insert into public.events (
  id, owner_id, slug, title, category_id, start_at, timezone, status, published_at
) values (
  'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  '11111111-1111-1111-1111-111111111111',
  'jazz-night', 'Jazz Night',
  (select id from public.categories where slug = 'concert'),
  '2026-10-01T19:00:00Z', 'Asia/Tbilisi', 'published', now()
), (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  '11111111-1111-1111-1111-111111111111',
  'secret-plan', 'Secret Plan',
  (select id from public.categories where slug = 'concert'),
  '2026-11-01T19:00:00Z', 'Asia/Tbilisi', 'draft', null
);

select throws_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, timezone)
    values ('11111111-1111-1111-1111-111111111111', 'jazz-night', 'Clash',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', 'Asia/Tbilisi')$$,
  23505,
  null,
  'a publisher cannot reuse one of their own slugs'
);

-- The same slug under a different publisher is a different URL.
select lives_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, timezone)
    values ('22222222-2222-2222-2222-222222222222', 'jazz-night', 'Their Jazz Night',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', 'Asia/Tbilisi')$$,
  'two publishers may each use the same slug'
);

select throws_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, end_at, timezone)
    values ('11111111-1111-1111-1111-111111111111', 'backwards', 'Backwards',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', '2026-11-01T19:00:00Z', 'Asia/Tbilisi')$$,
  23514,
  null,
  'an event cannot end before it starts'
);

select throws_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, timezone, status)
    values ('11111111-1111-1111-1111-111111111111', 'no-date', 'No Date',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', 'Asia/Tbilisi', 'published')$$,
  23514,
  null,
  'a public status requires a publication date'
);

select throws_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, timezone, latitude)
    values ('11111111-1111-1111-1111-111111111111', 'off-world', 'Off World',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', 'Asia/Tbilisi', 120)$$,
  23514,
  null,
  'latitude must be a real latitude'
);

select throws_ok(
  $$delete from public.categories where slug = 'concert'$$,
  23503,
  null,
  'a category in use cannot be deleted out from under its events'
);

-- Public read --------------------------------------------------------------

set local role anon;

select is(
  (select count(*)::int from public.events where slug = 'jazz-night'
     and owner_id = '11111111-1111-1111-1111-111111111111'),
  1,
  'anonymous visitors see a published event'
);

select is(
  (select count(*)::int from public.events where slug = 'secret-plan'),
  0,
  'anonymous visitors cannot see a draft'
);

-- Owner read ---------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select count(*)::int from public.events
    where owner_id = '11111111-1111-1111-1111-111111111111'),
  2,
  'a publisher sees their own drafts alongside their published events'
);

-- Cross-user denial --------------------------------------------------------

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from public.events where slug = 'secret-plan'),
  0,
  'a signed-in stranger cannot see another publisher draft'
);

select is(
  (select count(*)::int from (
     update public.events set title = 'Hijacked'
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      returning 1
   ) as updated),
  0,
  'an update by a stranger matches no row'
);

select is(
  (select count(*)::int from (
     delete from public.events
      where id = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
      returning 1
   ) as deleted),
  0,
  'a delete by a stranger matches no row'
);

select throws_ok(
  $$insert into public.events (owner_id, slug, title, category_id, start_at, timezone)
    values ('11111111-1111-1111-1111-111111111111', 'forged', 'Forged',
            (select id from public.categories where slug = 'concert'),
            '2026-12-01T19:00:00Z', 'Asia/Tbilisi')$$,
  42501,
  null,
  'a forged owner_id is refused by the insert policy'
);

-- Categories are centrally managed: no write policy exists for anyone.
select throws_ok(
  $$insert into public.categories (slug, label) values ('diy', 'DIY')$$,
  42501,
  null,
  'publishers cannot invent categories'
);

-- event_tags follow their event ---------------------------------------------

set local role postgres;
insert into public.tags (id, slug, label)
values ('cccccccc-cccc-4ccc-8ccc-cccccccccccc', 'jazz', 'Jazz');
insert into public.event_tags (event_id, tag_id)
values (
  'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  'cccccccc-cccc-4ccc-8ccc-cccccccccccc'
);

set local role anon;
select is(
  (select count(*)::int from public.event_tags),
  0,
  'the tags of a draft are as private as the draft'
);

set local role authenticated;
set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select throws_ok(
  $$insert into public.event_tags (event_id, tag_id)
    values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
            'cccccccc-cccc-4ccc-8ccc-cccccccccccc')$$,
  42501,
  null,
  'a stranger cannot tag an event they do not own'
);

select * from finish();

rollback;

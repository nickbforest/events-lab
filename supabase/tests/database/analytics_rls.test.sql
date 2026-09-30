begin;

select plan(14);

-- Structure --------------------------------------------------------------

select has_table('public', 'analytics_hits', 'analytics_hits table exists');

select ok(
  (select relrowsecurity from pg_class where oid = 'public.analytics_hits'::regclass),
  'row level security is enabled on analytics_hits'
);

select ok(
  not has_table_privilege('anon', 'public.analytics_hits', 'INSERT')
    and not has_table_privilege('authenticated', 'public.analytics_hits', 'INSERT'),
  'nobody can insert hits directly'
);

select ok(
  (select prosecdef from pg_proc where proname = 'record_analytics_hit'),
  'record_analytics_hit runs as definer, the only write path'
);

select ok(
  not (select prosecdef from pg_proc where proname = 'analytics_daily'),
  'analytics_daily runs as the caller, so RLS scopes it'
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

-- Recording, as an anonymous visitor -------------------------------------

set local role anon;

select ok(
  public.record_analytics_hit('page_view', 'owner'),
  'a view of a publisher page is recorded'
);

select ok(
  public.record_analytics_hit(
    'ticket_click', 'owner', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  'a ticket click on a public event is recorded'
);

select ok(
  not public.record_analytics_hit(
    'page_view', 'owner', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'
  ),
  'a view of a draft is refused'
);

select ok(
  not public.record_analytics_hit(
    'page_view', 'other', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa'
  ),
  'an event cannot be attributed to a publisher who does not own it'
);

select ok(
  not public.record_analytics_hit('ticket_click', 'owner'),
  'a ticket click without an event is refused'
);

select ok(
  not public.record_analytics_hit('page_view', 'nobody'),
  'a view of an unknown publisher is refused'
);

select is(
  (select count(*)::int from public.analytics_hits),
  0,
  'anonymous visitors cannot read hits'
);

-- Reading, as each publisher ---------------------------------------------

set local role authenticated;
set local request.jwt.claims to '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select is(
  (select sum(hits)::int
     from public.analytics_daily(
       '11111111-1111-1111-1111-111111111111', null, now() + interval '1 day'
     )),
  2,
  'the owner reads their own daily counts'
);

set local request.jwt.claims to '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int
     from public.analytics_daily(
       '11111111-1111-1111-1111-111111111111', null, now() + interval '1 day'
     )),
  0,
  'another publisher asking for the owner''s id gets nothing'
);

select * from finish();

rollback;

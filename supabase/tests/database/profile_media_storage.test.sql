begin;

select plan(9);

-- Bucket -----------------------------------------------------------------

select ok(
  (select public from storage.buckets where id = 'profile-media'),
  'profile-media is public, because its images render on public pages'
);

select is(
  (select file_size_limit from storage.buckets where id = 'profile-media'),
  5242880::bigint,
  'the bucket enforces the 5MB limit the application advertises'
);

select is(
  (select allowed_mime_types from storage.buckets where id = 'profile-media'),
  array['image/png', 'image/jpeg', 'image/webp'],
  'only raster formats are accepted, so no SVG can carry script'
);

-- Writing ----------------------------------------------------------------

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

select lives_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('profile-media', '11111111-1111-1111-1111-111111111111/avatar-a.png', '11111111-1111-1111-1111-111111111111')$$,
  'an owner can upload into their own folder'
);

select throws_ok(
  $$insert into storage.objects (bucket_id, name, owner_id)
    values ('profile-media', '22222222-2222-2222-2222-222222222222/avatar-b.png', '11111111-1111-1111-1111-111111111111')$$,
  42501,
  null,
  'an owner cannot upload into another user''s folder'
);

set local role anon;

select throws_ok(
  $$insert into storage.objects (bucket_id, name)
    values ('profile-media', '11111111-1111-1111-1111-111111111111/avatar-c.png')$$,
  42501,
  null,
  'a signed-out visitor cannot upload at all'
);

-- Listing and deleting ---------------------------------------------------

-- Storage blocks direct DELETE with a trigger unless this is set; setting it
-- lets the row-level policies, which are what is under test, decide instead.
set local storage.allow_delete_query = 'true';

set local role authenticated;
set local request.jwt.claims = '{"sub": "22222222-2222-2222-2222-222222222222", "role": "authenticated"}';

select is(
  (select count(*)::int from storage.objects
    where bucket_id = 'profile-media'
      and name like '11111111-1111-1111-1111-111111111111/%'),
  0,
  'another user cannot list an owner''s folder, so the bucket cannot be enumerated'
);

delete from storage.objects
  where bucket_id = 'profile-media'
    and name = '11111111-1111-1111-1111-111111111111/avatar-a.png';

reset role;
select is(
  (select count(*)::int from storage.objects
    where name = '11111111-1111-1111-1111-111111111111/avatar-a.png'),
  1,
  'another user cannot delete an owner''s image'
);

set local role authenticated;
set local request.jwt.claims = '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

delete from storage.objects
  where bucket_id = 'profile-media'
    and name = '11111111-1111-1111-1111-111111111111/avatar-a.png';

reset role;
select is(
  (select count(*)::int from storage.objects
    where name = '11111111-1111-1111-1111-111111111111/avatar-a.png'),
  0,
  'an owner can delete their own image, which replacing it relies on'
);

select * from finish();

rollback;

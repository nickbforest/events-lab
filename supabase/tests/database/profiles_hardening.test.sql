begin;

select plan(4);

select ok(
  not has_column_privilege('authenticated', 'public.profiles', 'username', 'UPDATE'),
  'owners cannot rename themselves through the API'
);

select ok(
  has_column_privilege('authenticated', 'public.profiles', 'display_name', 'UPDATE'),
  'owners can still edit their display name'
);

select throws_ok(
  $$insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (
      '33333333-3333-3333-3333-333333333333',
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', 'admin@example.com',
      '{"username": "admin", "display_name": "Admin"}'::jsonb
    )$$,
  '23514',
  null,
  'a sign-up that bypasses the app cannot take a reserved username'
);

select lives_ok(
  $$insert into auth.users (id, instance_id, aud, role, email, raw_user_meta_data)
    values (
      '44444444-4444-4444-4444-444444444444',
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated', 'jazz@example.com',
      '{"username": "jazz-club", "display_name": "Jazz Club"}'::jsonb
    )$$,
  'an ordinary username still signs up'
);

select * from finish();

rollback;

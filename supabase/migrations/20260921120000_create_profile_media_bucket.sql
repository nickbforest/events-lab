-- Profile media: avatars and cover images for public publisher pages.
--
-- The bucket is public because these images render for anonymous visitors on
-- /u/:username; signed URLs would expire under cached pages and next/image.
-- Public only means objects are readable by URL. Writing still requires the
-- policies below, and listing is limited to the owner's own folder so the
-- bucket cannot be enumerated.
--
-- Objects live at `{user_id}/{kind}-{random}.{ext}`. The first path segment is
-- the ownership boundary every write policy checks.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'profile-media',
  'profile-media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
);

create policy "Owners list their own profile media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners upload into their own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners delete their own profile media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'profile-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

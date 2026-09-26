-- Event media: cover images for public event pages.
--
-- Deliberately a second bucket rather than a folder inside profile-media: the
-- two have different lifetimes (an event's cover dies with the event, a
-- profile's does not) and separate buckets keep each one's size limit and
-- policies independent.
--
-- Objects live at `{user_id}/{random}.{ext}`. The first path segment is the
-- ownership boundary, exactly as in profile-media. The path holds no event id
-- on purpose — the cover is uploaded from the create form, before the event
-- row exists.

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'event-media',
  'event-media',
  true,
  5242880,
  array['image/png', 'image/jpeg', 'image/webp']
);

create policy "Owners list their own event media"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'event-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners upload event media into their own folder"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'event-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners delete their own event media"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'event-media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

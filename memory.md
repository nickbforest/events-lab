# Memory — Upload feedback, removable profile images, public-page cleanup

Last updated: 2026-09-26

## What was built

All on `feat/phase-4-events`, which stacks on the Phase 2 profiles work.

- **Upload animation.** `components/forms/image-uploader.tsx` shows a spinning
  `LoaderCircle`, a `busyLabel` ("Uploading…" / "Removing…") and a lime
  indeterminate bar (`animate-upload-progress` in `app/globals.css`) along
  the frame's bottom edge. The event poster
  (`app/dashboard/events/event-form.tsx`) now shows a dimmed local preview
  while uploading and catches thrown failures.
- **Removable profile images.** `removeProfileMediaAction` →
  `ProfilesService.removeProfileMedia` clears the column, then deletes the
  files. `setMediaUrl` and `removeMediaExcept` accept `null`. The uploader
  takes `onRemove`, which `ProfileMediaField` wires up. 3 new BLL tests.
- **`SelectControl`** in `components/forms/field.tsx`: a native select without
  its native look, 42px tall like the inputs, with a chevron. All four
  dashboard selects use it.
- **Public page:** the "Claim your events-lab page" box is removed from
  `app/publishers/[username]/page.tsx`.
- **Footer:** `SiteFooter` is the wordmark only.
- **Docs:** the progress tracker, build plan, Architecture, UI registry and
  UI rules now cover the previous session's events refinements and this one.
  The progress tracker has a new "Phase 4 post-completion refinements"
  section.

## Decisions made

- Upload progress is indeterminate, never a percentage. Server Actions report
  no byte progress. A real percentage would need signed-URL direct-to-Storage
  uploads with XHR.
- Removing an image clears the column before deleting files, the same order
  as a replace.
- The footer and public page carry no signup or marketing links. Don't add
  them back without asking.

## Problems solved

- "Hide the cover when none is set" was already how the page worked. The real
  gap was that an uploaded cover could never be removed.
- Native selects were shorter than inputs because browsers ignore padding on
  them. `appearance-none` plus a fixed height fixes it.

## Current state

- biome clean, tsc clean, vitest 10 files / 123 tests, `next build` passes.
- **Nothing from this session has been checked in the browser.**
- The events refinements from the previous session were used in the browser,
  but there is no recorded end-to-end checklist pass.

## Next session starts with

1. Check this session's changes in the browser: upload animation (profile and
   poster), Remove on the cover then preview, select heights, the public page
   without the claim box, and the footer.
2. Run a full Phase 4 end-to-end pass: create → publish → edit → cancel →
   delete.
3. Then Phase 5, the map layer (Mapbox, geocoding, near me).

## Open questions

- Does the upload wait ever get long enough to justify real percentages?
- Should the event poster get a Remove action too? Today it can only be
  replaced.
- Discovery and analytics are still mock-backed.
- Custom SMTP is needed before launch. Email change is untested.
- Recurrence is deferred.

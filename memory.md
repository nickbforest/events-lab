# Memory — Dashboard UI polish (uploads, images, selects, navigation)

Last updated: 2026-09-26

## What was built

Committed on `feat/phase-4-events`, which is on top of `main`.
Commits `4bae605`, `4403cc4`, `0a68c0f`, `90c5d00`, plus a docs commit.

- **Upload feedback.** `components/forms/image-uploader.tsx` shows a spinning
  `LoaderCircle`, a `busyLabel` ("Uploading…" / "Removing…") and a lime
  indeterminate bar (`animate-upload-progress` in `app/globals.css`) over a
  dimmed local preview.
- **Image actions.** A set image shows alone, with icon chips in its corner:
  a pencil (a label wrapping the file input) to replace it and a bin to remove
  it. The empty state is still the dashed "Click to upload" frame.
- **Removal.** Avatar and cover are removed right away:
  `removeProfileMediaAction` → `ProfilesService.removeProfileMedia` clears the
  column, then deletes the files (3 BLL tests). The event poster's bin clears
  the form field, and the events service deletes the old file on Save.
- **`SelectControl`** in `components/forms/field.tsx`: every dashboard select
  is now 42px tall, like the inputs.
- **Public page:** the "Claim your events-lab page" box is removed.
  **Footer:** the wordmark only.
- **`WordmarkLink`** (`components/layout/wordmark-link.tsx`): in the dashboard
  the logo goes to Overview, and on the public header it goes home. On the
  page it already points at, it reloads.
- **Sidebar page link** opens `routes.publisherPreview` in a new tab.
- **Docs:** the progress tracker (Phase 4 post-completion refinements table
  and decision log), the build plan, Architecture §14/16/21/28, the UI
  registry (ImageUploader, Field/SelectControl, SiteHeader, SiteFooter,
  DashboardShell, Publisher page) and UI rules §9.

## Decisions made

- Upload progress is indeterminate, never a percentage. Server Actions report
  no byte progress. A real percentage would need signed-URL direct-to-Storage
  uploads with XHR.
- Removing an image clears the column first, then deletes the files.
- Image action chips are always visible, not hover-only, so they work on
  touch screens.
- Inside the dashboard the logo means Overview. The footer and public page
  carry no signup or marketing links.
- Every preview link opens in a new tab with `?preview=1`.

## Problems solved

- "Hide the cover when none is set" was already how the page worked. The real
  gap was that an image could not be removed.
- Native selects came out shorter than the inputs. `appearance-none` plus a
  fixed height fixes it.
- A `<Link>` to the current URL does nothing visible. `WordmarkLink` renders
  a plain `<a>` in that case so the page reloads.

## Current state

- biome clean, tsc clean, vitest 10 files / 123 tests, `next build` passes.
- **None of today's changes have been checked in the browser.**
- Phase 4 still has no recorded end-to-end browser pass.

## Next session starts with

1. Browser-check today's changes: upload animation, pencil and bin on the
   avatar, cover and poster, the page without a cover, select heights, the
   logo → Overview, and the sidebar link opening a new tab.
2. Run a Phase 4 end-to-end pass: create → publish → edit → cancel → delete.
3. Then Phase 5, the map layer (Mapbox, geocoding, near me).

## Open questions

- Does the upload wait ever get long enough to justify real percentages?
- Discovery and analytics are still mock-backed.
- Custom SMTP is needed before launch. Email change is untested.
- Recurrence is deferred.
- Today's commits are not pushed. PR #6 is merged to `main`, and this branch
  sits on top of it.

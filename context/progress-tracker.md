# events-lab — Progress Tracker

## Status Legend

```text
[ ] Not started
[-] In progress
[x] Complete
[!] Blocked
[~] Deferred
```

---

# Current Project Status

**Current phase:** Phase 4 complete on `feat/phase-4-events`, branched from
the still-unmerged `feat/phase-2-profiles` (PR #6). Phase 3 Organizations is
deferred post-MVP. Next is Phase 5 — Location & Media.

**Phase numbering:** `build-plan.md` and this tracker were reconciled on
2026-09-26 and now use the same numbers. Both were edited; neither is a
stale copy.

**Overall MVP:** Authentication, profiles and events are real. A publisher can
create an event from a dialog on the events list, upload a cover, publish it
with a toggle and see it at `/publishers/:username/:slug`. See the Phase 4
post-completion record for the dashboard and public-page refinements made
after the phase closed.
Discovery and analytics remain mock-backed until their own phases replace
those adapters.

**Last updated:** 2026-09-26

---

# Phase 0 — Foundation

* [x] Next.js initialized
* [x] TypeScript configured
* [x] Strict TypeScript compiler options enabled
* [x] pnpm configured
* [x] Tailwind configured
* [x] shadcn/ui configured
* [x] Zod configured
* [x] TanStack Form configured
* [x] TanStack Query configured
* [x] TanStack Table configured
* [x] TanStack Charts configured and version pinned
* [x] Axios client configured
* [x] Biome configured as the only linting and formatting tool
* [x] Git initialized
* [x] GitHub connected
* [x] Context architecture defined
* [x] Supabase selected
* [x] Supabase connector available to the development agent
* [x] Supabase project created and verified healthy
* [x] Supabase CLI configured
* [x] Supabase local development configured
* [x] Application connected to Supabase
* [x] Supabase JS and SSR libraries installed
* [x] Supabase migrations configured
* [x] Supabase browser/server clients configured
* [x] Generated Supabase database types configured
* [x] Privileged-client policy enforced through server-only infrastructure and import boundaries
* [x] BLL/DAL feature boundaries established
* [x] BLL contracts and typed application/data-access errors defined
* [x] DAL contracts and prototype in-memory adapters defined
* [x] BLL/DAL import boundaries enforced
* [x] Shared Zod contracts and environment validation configured
* [x] BLL tests and DAL/RLS integration-test structure added
* [~] Typed Supabase domain adapters deferred until their domain schemas exist
* [x] Context folder created
* [x] Environment variables configured and validated
* [x] `.env.example` created
* [x] Typecheck passes
* [x] Biome check passes
* [x] BLL and contract tests pass
* [x] Production build passes
* [x] Initial CI configured

## Phase 0 completion verification — 2026-09-11

Scope: repository foundation, hosted Supabase state, local tooling, dependency
contracts, application boundaries, and automated quality checks.

| Area | Evidence and remaining work |
| --- | --- |
| Next.js / React | `package.json` pins Next.js 16.3.4 and React 19.2.8; App Router pages and layouts build successfully. |
| TypeScript | Strict TypeScript and generated Next.js route types pass from a clean command. Zod validates environment and feature boundary inputs. |
| Package manager | `packageManager` pins pnpm 12.3.4, `pnpm-lock.yaml` is canonical, and Node.js 22.12+ is declared in `engines` and `.nvmrc`. |
| Tailwind / UI | Tailwind 4 tokens remain intact. `components.json` validates with shadcn 4.21.0. The dashboard trend chart now uses pinned TanStack Charts 0.18.0 and retains its accessible table view. |
| Required libraries | Zod, TanStack Form/Query/Table/Charts, Axios, Supabase JS/SSR, Biome, Vitest, and the Supabase CLI are installed at the approved versions. |
| Lint / formatting | Biome 2.5.13 is the sole formatter/linter, enforces architecture import boundaries, and passes across the repository. ESLint configuration and the npm lockfile were removed. |
| Git / GitHub | Git is initialized; origin points to `nickbforest/events-lab` on GitHub. `git ls-remote --exit-code origin HEAD` succeeded. |
| Supabase | Hosted project `wjuuiwgayyydvacjzixa` is `ACTIVE_HEALTHY` on PostgreSQL 17.6. The public schema and migration history are empty by design. CLI configuration, migrations directory, generated baseline types, and typed browser/server factories are committed. |
| Privileged access | No service-role/admin client exists. `server-only` guards server infrastructure and Biome prevents UI/BLL imports of Supabase modules. |
| Environment | `.env.example` documents the public URL and publishable key. Zod validates both, the development `.env` is ignored, and the application builds with the connected hosted project values. |
| Application boundaries | Events, profiles, discovery, and analytics now use BLL services, DAL contracts, and in-memory adapters. Server query modules are composition roots; UI no longer reads mock data directly. Supabase adapters arrive with real domain schemas. |
| Tests / CI | Vitest runs meaningful BLL and contract tests. The RLS test location and requirements are documented. GitHub Actions runs frozen install, Biome, typecheck, tests, and production build. |

### Existing prototype beyond Phase 0

Landing, auth, dashboard, event list/creation, profile editing, discovery, and
public profile/event routes already exist. They establish UI groundwork but do
not complete later production phases:

* `lib/local-auth.ts` implements browser-only registration/login/logout and
  stores passwords in plaintext localStorage. It is explicitly temporary scaffolding.
* `getCurrentProfile()` returns a mock `CURRENT_USER`; the dashboard server layout
  does not enforce a Supabase session.
* Feature reads use in-memory DAL adapters over mock arrays. Event creation is
  a layout preview without persistence, and profile saving is disabled.

### Validation results

| Check | Result |
| --- | --- |
| `pnpm check` | Passed across 77 files with no diagnostics. |
| `pnpm typecheck` | Passed after generating current Next.js route types. |
| `pnpm test` | Passed 3 files and 6 tests. |
| `pnpm peers check` | Passed with no peer dependency issues. |
| `pnpm build` | Passed compilation, TypeScript, and generation of all 11 pages. |
| `pnpm dlx shadcn@4.21.0 info` | Detected Next.js 16, React Server Components, Tailwind 4, and valid aliases. |
| Supabase hosted connection | Read query succeeded against PostgreSQL 17.6; public tables, migrations, security advisories, and performance advisories are all empty. |
| `pnpm supabase:status` | CLI 2.117.0 ran; local services could not be inspected because Docker and Podman are absent. |

The local container runtime is the only unexecuted environment check. Repository
configuration is complete, and the hosted project connection was independently
verified through the Supabase connector.

**Next implementation step:** run `/architect` for Phase 1 and replace the
temporary localStorage flow with Supabase Auth, server-validated sessions,
protected dashboard routes, and the Next.js session-refresh proxy.

---

# Phase 1 — Authentication

* [x] Email/password registration
* [x] Login
* [x] Logout
* [x] Email verification
* [x] Password reset
* [~] Google OAuth — removed from Phase 1; no Google Cloud credentials yet
* [x] Session management
* [x] Protected routes

## Phase 1 completion record — 2026-09-14

Supabase Auth replaces the localStorage prototype. `lib/local-auth.ts` is
deleted, not dormant.

| Area | What was built |
| --- | --- |
| Schema | `profiles` (migration `20260914120000`) keyed to `auth.users`, with the full column set from `lib/types.ts` so Phase 2 adds no migration. RLS on: public select, self-only update, no user insert path. |
| Profile creation | `handle_new_user` trigger reads `username`/`display_name` from signup metadata. Chosen over an application insert because signup returns no session when confirmation is required, and the trigger makes "auth user without a profile" unrepresentable. Migration `20260914120500` revokes its `EXECUTE` from `anon`/`authenticated` after the linter flagged it as RPC-reachable. |
| Username | Chosen at signup, unique, lowercase, format-constrained in the database and mirrored in `usernameSchema`. Reserved names are BLL policy. Live availability via `/api/auth/username-available` (Axios + TanStack Query). |
| Layers | `features/auth` contracts → DAL contract → Supabase adapter → BLL → composition root, with Server Actions as the only mutation entry point. Provider errors are translated in the DAL; user-facing wording lives in the actions. |
| Sessions | `proxy.ts` (Next.js 16 renamed Middleware) refreshes cookies and redirects optimistically. `verifySession()` next to the data is the real boundary, because layouts neither re-render on navigation nor stop nested segments rendering. |
| Public reads | `lib/supabase/public.ts` adds a cookie-free anon client so `generateStaticParams` and public profile pages work without a request context. |
| UI | TanStack Form + shared Zod schemas throughout, reusing `Field`/`fieldControlClass`; `Field` gained an `error` slot. New `AuthCard` shell covers signup, login, forgot-password, update-password, check-email and link-expired. |

### Validation results

| Check | Result |
| --- | --- |
| `tsc --noEmit` | Passed. |
| `biome check .` | Passed across 106 files. |
| `vitest run` | Passed 6 files, 45 tests. |
| `next build` | Passed; 16 pages generated, proxy registered. |
| Trigger and constraints | Verified against the hosted project: `ProbeUser` → `probeuser`, defaults applied, cascade delete confirmed, probe row removed. |
| Policy surface | 2 policies, no user INSERT policy, `anon` can select, `anon` cannot execute `handle_new_user`. |
| Routes | `/dashboard` → 307 to `/auth?mode=login`; availability API returns true/false/400 correctly. |
| `supabase test db` | Not run — pgTAP needs Docker or Podman, still absent. Assertions are committed in `supabase/tests/database/profiles_rls.test.sql`. |

### Open follow-ups

1. **Local signup friction.** The hosted project has `mailer_autoconfirm: false`,
   and there is no local Supabase stack (no Docker), so development signups
   require a real emailed link. The `enable_confirmations = false` setting in
   `supabase/config.toml` only applies to a local stack that cannot currently
   run. Either disable email confirmation in the hosted dashboard while in
   development, or install a container runtime.
2. **Redirect allow-list.** Confirm `http://localhost:3000` and the eventual
   production origin are listed in the hosted project's URL configuration, or
   confirmation links will be rejected.
3. **Dashboard shows empty states.** Event queries filter by owner id and the
   mock events belong to the old mock user, so a real account sees nothing
   until Phase 4/5.
4. **Hosted password minimum** is still 6; `config.toml` and `passwordSchema`
   both use 8. Align it in the dashboard.

---

# Phase 2 — Profiles

* [x] Profile schema — created in Phase 1 with the full column set; no further
  migration needed for the fields below
* [x] Profile page — `/publishers/:username` renders avatar and cover
* [x] Profile editing
* [x] Avatar (and cover image)
* [x] Account settings — password change and email change

## Phase 2 completion record — 2026-09-21

Branch `feat/phase-2-profiles`. Built as five confirmed steps from an
`/architect` blueprint; each step was tested in the browser by the developer
before it was committed.

| Area | What was built |
| --- | --- |
| Profile editing | The disabled preview form now saves display name, publisher type, city, country, bio, website and social links through contracts → Server Action → BLL → DAL. The owner id comes from `verifySession()`, never the payload. Cleared fields are stored as NULL, and cleared links are dropped from `social_links`. |
| Username | Locked and shown read-only. It is the public URL and MVP-1 keeps no redirect history. |
| Schemas | `usernameSchema` and `displayNameSchema` moved from auth to profiles contracts because they mirror `profiles` columns. `publisherTypeSchema` derives from the generated enum. `FormResult` and `firstFieldErrors` moved to `lib/forms`. |
| Storage | Migration `20260921120000` creates the public `profile-media` bucket (5MB; PNG, JPEG, WebP only) with owner-folder insert/select/delete policies. Listing is limited to the owner's folder so the bucket cannot be enumerated. |
| Uploads | Avatar and cover upload on selection through Server Action → BLL → DAL. Each upload gets a fresh object name so cached URLs never go stale. The order is upload, repoint the row, then remove the replaced file, so a failure leaves an orphan, never a broken image. Server Action bodies are raised to `6mb` and the Storage host is allowed for next/image. |
| Public page | Shared `Avatar` replaces both hand-rolled letter blocks and keeps the letter as its fallback. The cover renders as a banner and is used as the Open Graph image. |
| Settings | `/dashboard/settings`. Password change re-checks the current password, requires a matching confirmation, then signs out every session and returns to login with a notice. Email change completes only when the emailed link is used, and the page shows the pending address until then. |
| Auth links fix | Password reset never worked against the hosted project. Its default templates send a PKCE `code`, but `/auth/confirm` only accepted `token_hash`. The route now accepts both and uses the link's `redirectType` to send reset links to the set-password page. |

### Validation results

| Check | Result |
| --- | --- |
| `biome check .` | Passed across 113 files. |
| `tsc --noEmit` | Passed. |
| `vitest run` | Passed 7 files, 77 tests (45 at the end of Phase 1). |
| `next build` | Passed; 17 pages. |
| Storage policies | `supabase/tests/database/profile_media_storage.test.sql` added. pgTAP still needs Docker, so it was not run as a suite. Its nine assertions were each run against the hosted project inside a rolled-back transaction and all held. No probe rows remained. |
| Security advisors | Only the pre-existing "leaked password protection disabled" warning. |
| In browser | Developer verified profile save, uploads (including size and type rejection), the public page, the password reset, and the password change with sign-out. |

### Open follow-ups

1. ~~**Organizations scope is undocumented.**~~ **Resolved 2026-09-26.** The
   2026-09-03 personal publisher model is confirmed for MVP-1 and Phase 3 is
   deferred post-MVP. See the Phase 3 section and the decision log for the
   reasoning and the two capabilities it costs.
2. **Custom SMTP is needed before launch.** Supabase's built-in email sends
   only a few emails an hour, and on this plan email templates cannot be
   edited without custom SMTP. This belongs with Phase 9's email-provider
   selection, but it blocks a real launch.
3. **Emailed links only work in the requesting browser.** This follows from
   the default templates' PKCE `code`. Once templates are editable, switching
   them to `token_hash` links removes it; `/auth/confirm` already accepts both.
4. **Email change is untested end to end.** It was deferred because of the
   email rate limit. With secure email change, the second of the two links may
   show "Link expired" even though Supabase has completed the change (see
   follow-up 3).
5. **Sidebar Sign out ends every session.** That is Supabase's default and
   dates from Phase 1. Most apps end only the current device on an ordinary
   sign-out; decide whether to change it to `local`.
6. **Phase 1 follow-ups still open:** hosted password minimum is 6 against
   the app's 8, leaked-password protection is off, and there is still no
   container runtime for local Supabase.
7. **Remaining duplicates:** `features/events/contracts.ts` keeps its own
   loose `usernameSchema`, and the events screens restate the submit-button
   classes. Both belong to the Phase 4 events rebuild.

8. **Publisher-neutral wording is not done.** The profile and settings copy
   still assumes a person ("Display name", "Your avatar"). With one profile
   serving people and venues alike it should read "Publisher name", "Logo or
   photo" and so on. UI copy only — no schema change.

9. **`publisher_type` is not asked at signup.** It silently defaults to
   `other`. A single select on the signup form is the whole "person or
   organization?" question under this model.

10. ~~**Open: `/u/:username` or `/p/:username`?**~~ **Resolved 2026-09-26.**
    The public page is `/publishers/:username`, chosen in the PR #6 review.
    Every route is built through `lib/routes.ts`.

11. **Profile images can now be removed** (2026-09-26). Previously a cover or
    avatar, once uploaded, could only be replaced, so a publisher who wanted
    a page without a cover banner had no way back to one.

---

# Phase 3 — Organizations — DEFERRED POST-MVP (2026-09-26)

MVP-1 publishes through profiles, not organizations. A profile already carries
`publisher_type` (venue, business, theater, band, cinema, church …), so a bar's
page and a person's page are the same row shape. An `organizations` table would
restate that shape and add `organization_members`, an invite flow, four roles
and membership-aware RLS on every event query.

**What the deferral costs, exactly:**

1. Two people cannot manage one publisher — a venue's staff share one login.
2. One person cannot run two publishers — they need a second account.

**Retrofit cost if that changes:** one organization per profile as a backfill,
`events.organization_id`, and a rewrite of every events RLS policy. Bounded,
but it grows once events exist. Revisit before launch if either capability
above becomes a requirement.

Deferred items:

* [ ] Organization schema
* [ ] Organization types
* [ ] Organization creation
* [ ] Organization editing
* [ ] Organization logo
* [ ] Organization description
* [ ] Website
* [ ] Social links
* [ ] Organization location
* [ ] Membership
* [ ] Roles
* [ ] Permissions
* [ ] Public organization page
* [ ] Upcoming events

---

# Phase 4 — Events

* [x] Event schema
* [x] Event statuses
* [x] Event validation
* [x] Event creation
* [x] Event editing
* [x] Drafts
* [x] Publishing
* [x] Cancellation
* [x] Postponement
* [x] Archive — and **no** completion status; see the decision below
* [x] Slugs
* [x] Event types
* [x] Categories
* [x] Tags
* [x] Free/paid
* [x] Online/in-person/hybrid
* [x] Date/time
* [x] Timezones
* [x] Cover image — pulled forward from Phase 5
* [ ] Recurrence — deferred, not cancelled

## Phase 4 completion record — 2026-09-26

Branch `feat/phase-4-events`, off the unmerged `feat/phase-2-profiles`, so its
PR stacks on PR #6 and must merge after it. Built from an `/architect`
blueprint confirmed before any code was written.

| Area | What was built |
| --- | --- |
| Schema | `20260926120000_create_events.sql`: `event_type` and `event_status` enums, `categories` (seeded with 8), `tags`, `events`, `event_tags`. Six indexes including a partial index for public upcoming lists and a GIN index on a generated `search_vector` that stays unused until discovery. |
| Constraints | Structural only — end after start, coordinate ranges, two-letter country, per-owner slug uniqueness, and a public status requiring `published_at`. Publish-readiness is a BLL rule, because a draft is allowed to be incomplete and a CHECK would refuse to save one. |
| RLS | Drafts and archived events are owner-only; published, cancelled and postponed are public. Cancelled stays visible on purpose — a ticket holder needs to see it was called off, not a 404. `event_tags` follows its event. `categories` has a read policy and no write policy, so the list can only change by migration. |
| Storage | `20260926120500_create_event_media_bucket.sql`: `event-media`, 5MB, PNG/JPEG/WebP, owner-folder policies matching `profile-media`. The path carries no event id because the cover uploads before the row exists. |
| Contracts | `eventDraftSchema` is permissive by design. `timezoneSchema` validates against the runtime's IANA list, which Postgres cannot do in a CHECK. Tags are entered free-form and canonicalised to a slug, so "Live Music" and "live-music" converge. The loose duplicate `usernameSchema` in events contracts was deleted in favour of the profiles one. |
| BLL | Slug generation with collision suffixes, publish-readiness as plain predicates, status transitions, and `hasFinished` deriving past-ness from `end_at`. |
| DAL | `supabase-events-repository.ts`. Filtering moved into SQL — the interface no longer exposes "list everything", which is what made the in-memory version load every row. |
| Dates | `lib/datetime.ts` converts between `datetime-local` readings and instants for a named zone using `Intl`, resolved in two passes so a daylight-saving boundary lands correctly. `date-fns` v4 needs the separate `@date-fns/tz` package for this; 60 lines beat a dependency. |
| UI | One `EventForm` serves create and edit. Inapplicable fields are absent rather than disabled. New `/dashboard/events/[id]/edit` with an `EventLifecycle` panel for publish, postpone, cancel, unpublish and a two-step delete. |
| Removed | `InMemoryEventsRepository` and the old, non-functional `NewEventDialog`. **Superseded** in the post-completion pass below: creation is a dialog again, now backed by the real `EventForm`, and the `/dashboard/events/new` page is gone. |

### Validation results

| Check | Result |
| --- | --- |
| `biome check .` | Passed across 119 files. |
| `tsc --noEmit` | Passed. |
| `vitest run` | Passed 8 files, 107 tests (77 at the end of Phase 2). |
| `next build` | Passed; 18 routes. |
| RLS and Storage | `events_rls.test.sql` (22 assertions) and `event_media_storage.test.sql` (9) added. pgTAP still needs Docker, so they were not run as a suite. Their equivalents were run against the hosted project in rolled-back transactions: 12 structural checks, 6 constraint probes, 12 RLS probes, 6 storage probes. All held, and no probe rows remained. |
| Security advisors | Only the pre-existing "leaked password protection disabled" warning. |
| Performance advisors | Three "unused index" notices, expected on an empty table. `events_search_idx` is deliberately unused until discovery. |
| In browser | **Not done at completion.** The post-completion refinements below came from the developer using the events screens in the browser, but no full end-to-end checklist pass is recorded. |

### Open follow-ups

1. **No recorded end-to-end browser pass.** The list, dialog, toggle and
   public page have been used while refining them, but create → publish →
   edit → cancel → delete has not been run as one checklist.
2. **Discovery and analytics are still mock-backed** and now inconsistent with
   reality: `/discover` reads `lib/mock-data.ts`, where `EVENTS` is empty, so
   it shows nothing while real events exist. Phase 7 replaces that adapter.
3. **Recurrence is deferred.** See `build-plan.md` Phase 4.
4. **No pagination anywhere.** Owner and public lists are unbounded. Fine at
   current volumes, and Phase 7 introduces pagination properly.
5. **`search_vector` is written but never read.** Intentional; Phase 7 uses it.
6. **Categories are fixed at the seeded eight.** Changing them needs a
   migration, which is the point, but there is no admin surface for it.
7. **Upload progress is not a percentage.** Uploads go through Server
   Actions, which report no byte progress, so the uploader shows an
   indeterminate bar. A real percentage needs a direct-to-Storage upload
   (signed upload URL + XHR `upload.onprogress`); worth it only if large
   files or slow connections make the wait long enough to matter.

## Phase 4 post-completion refinements — 2026-09-26

On the same branch, after the completion record above. Each change came from
using the screens.

| Area | Change |
| --- | --- |
| Standards | Phase 4 brought up to the PR #6 rules: routes via `lib/routes.ts`, compiled schemas, logger and `toUserMessage` in actions, named `<Name>Props`, ternaries in JSX. |
| Create flow | Creating an event is always a dialog over the events list (native `<dialog>`, pinned footer). `/dashboard/events/new` is deleted — one create path. Edit also opens the dialog, with a "Full editor" link to `/dashboard/events/[id]/edit` for the remaining fields. |
| Tickets | Migration `20260926140000_add_event_ticket_cta.sql` adds `events.ticket_cta_label`. The dialog's Tickets section sets the button text and URL; unticking clears both; publishing is blocked when a labelled button has no link. Free/Paid stays on the edit page. |
| Country | Typed by hand with a `<datalist>` of names. `countryCodeFromInput` (`lib/countries.ts`) resolves "Georgia", "georgia" and "GE" to the stored ISO code; an unknown value is a field error. |
| Time zone | Removed from the dialog — times are read in the browser's zone. The edit page still exposes the control. |
| Events list | Rows carry a publish toggle (`Switch`, `role="switch"`, status spelled out beside it — it replaced the status column), edit, and an in-place delete confirm. Cancel and postpone stay on the edit page. |
| Listing card | Shows category, date, poster, title, summary, venue, address, map link, description and the ticket button. No longer wrapped in an anchor; the title link stretches instead. Map link is an OpenStreetMap hyperlink (`lib/maps.ts`) until Phase 5 brings Mapbox. |
| Preview | Opens the publisher page in a new tab with `?preview=1`, which hides the site header. |
| Cursor | A base-layer rule restores `cursor: pointer` on every enabled control, which Tailwind v4's reset had dropped. |
| Uploads | Profile media and event cover show a spinner, a lime indeterminate bar along the frame's bottom edge, and the chosen image dimmed underneath while uploading. |
| Profile images | Avatar and cover have a Remove action: `removeProfileMediaAction` → `removeProfileMedia` clears the column, then deletes the stored files. With no cover, the public page renders without the banner. |
| Selects | New `SelectControl` in `components/forms/field.tsx`; every dashboard select (publisher type, category, event type, time zone) is now the same 42px height as the text inputs. |
| Public page | Removed the "Publishing your own events? Claim your events-lab page" box from `/publishers/:username`. |
| Footer | `SiteFooter` is now the wordmark only; the Discover, Start publishing and "Prototype" items are gone. |

Validation for the last five rows: `biome check` clean, `tsc` clean,
`vitest` 10 files / 123 tests, `next build` passed. Not yet checked in the
browser.

---

# Phase 5 — Location & Media

* [x] Venue — column and form field, Phase 4
* [x] Address — column and form field, Phase 4
* [x] City — column and form field, Phase 4
* [x] Country — column and form field, Phase 4
* [x] Coordinates — columns exist, nullable and not yet populated
* [ ] Mapbox
* [ ] Geocoding
* [ ] Browser geolocation
* [x] Cover image — built in Phase 4, `event-media` bucket
* [ ] Gallery
* [ ] Image ordering
* [x] User avatar — built in Phase 2
* [x] Storage policies — `profile-media` Phase 2, `event-media` Phase 4
* ~~Organization logo~~ — Phase 3 is deferred post-MVP

What remains here is the map layer: turning the address a publisher types into
coordinates, showing it on a map, and answering "near me".

---

# Phase 6 — Public Event Experience

* [ ] Event page
* [ ] Hero
* [ ] Event information
* [ ] Date/time
* [ ] Location
* [ ] Map
* [ ] Organizer
* [ ] Description
* [ ] Gallery
* [ ] Ticket URL
* [ ] External URL
* [ ] Sharing
* [ ] Related events
* [ ] SEO
* [ ] Open Graph
* [ ] Structured data
* [ ] Responsive design

---

# Phase 7 — Discovery

* [ ] Event listing
* [ ] Search
* [ ] Categories
* [ ] Tags
* [ ] City
* [ ] Country
* [ ] Date
* [ ] Date range
* [ ] Event type
* [ ] Organizer
* [ ] Free/paid
* [ ] Online/in-person
* [ ] Distance
* [ ] Featured
* [ ] Trending
* [ ] Sorting
* [ ] Pagination
* [ ] Empty states

---

# Phase 8 — Moderation

* [ ] Moderation queue
* [ ] Reports
* [ ] Approve
* [ ] Reject
* [ ] Unpublish
* [ ] Remove
* [ ] Moderator role
* [ ] Admin role
* [ ] Admin dashboard

---

# Phase 9 — Notifications

* [ ] Requirements finalized
* [ ] Email provider selected
* [ ] Event notifications
* [ ] Moderation notifications
* [ ] Security notifications

---

# Phase 10 — Production

* [ ] Unit tests
* [ ] Integration tests
* [ ] RLS tests
* [ ] E2E tests
* [ ] Accessibility review
* [ ] Mobile review
* [ ] Performance review
* [ ] SEO review
* [ ] Security review
* [ ] Error monitoring
* [ ] Production deployment

---

# MVP Release Gate

* [ ] Authentication works
* [ ] Profiles work
* [ ] Organizations work
* [ ] Events work
* [ ] Event publishing works
* [ ] Public event pages work
* [ ] Discovery works
* [ ] Moderation works
* [ ] Mobile experience reviewed
* [ ] Accessibility reviewed
* [ ] SEO reviewed
* [ ] Security reviewed
* [ ] Typecheck passes
* [ ] Lint passes
* [ ] Build passes
* [ ] Critical E2E tests pass

---

# Architecture Decision Log

| Date       | Decision                    | Reason                                                                       |
| ---------- | --------------------------- | ---------------------------------------------------------------------------- |
| 2026-09-01 | Supabase                    | PostgreSQL + Auth + Storage + RLS provides strong MVP backend infrastructure |
| 2026-09-01 | PostgreSQL                  | Relational event/organization/user model                                     |
| 2026-09-01 | Modular monolith            | Avoid premature distributed-system complexity                                |
| 2026-09-01 | Next.js                     | Unified modern React application and server architecture                     |
| 2026-09-01 | No ORM initially            | Supabase/PostgreSQL tooling is sufficient                                    |
| 2026-09-01 | PostgreSQL search initially | Avoid premature dedicated search infrastructure                              |
| 2026-09-01 | Mapbox                      | Maps and geolocation                                                         |
| 2026-09-01 | No native ticketing in MVP  | Focus on publishing/discovery                                                |
| 2026-09-01 | Free publishing initially   | Validate product before monetization complexity                              |
| 2026-09-11 | Mandatory BLL and DAL        | Keep domain policy separate from Supabase persistence                        |
| 2026-09-11 | Zod at every trust boundary | User input requires runtime validation on the server                         |
| 2026-09-11 | Strict inferred TypeScript  | Infer from Zod and generated Supabase types to prevent contract drift         |
| 2026-09-11 | TanStack application stack  | Standardize forms, client server state, tables, and charts                    |
| 2026-09-11 | Axios for HTTP               | Centralize HTTP behavior without replacing the Supabase SDK                   |
| 2026-09-11 | shadcn/ui primitives        | Keep application UI accessible and visually consistent                       |
| 2026-09-11 | SOLID module boundaries     | Keep feature layers focused, substitutable, and independently testable        |
| 2026-09-11 | Biome for code quality      | Use one tool for repository linting and formatting                            |
| 2026-09-14 | Profiles table in Phase 1   | Auth without an identity row leaves the dashboard and `/publishers/:username` broken   |
| 2026-09-14 | Full profile columns now    | Every extra field is nullable, so one migration beats a second one in Phase 2 |
| 2026-09-14 | Trigger creates the profile | Only mechanism that works whether or not signup returns a session             |
| 2026-09-14 | Username chosen at signup   | It is the public URL; auto-assigning then renaming would break shared links   |
| 2026-09-14 | Gate in `verifySession()`   | Next.js 16 layouts do not re-render on navigation and cannot stop segments    |
| 2026-09-14 | Cookie-free public client   | `cookies()` is unavailable during static generation of public profile pages   |
| 2026-09-14 | Google OAuth deferred       | No Google Cloud credentials; dead UI removed rather than left non-functional  |
| 2026-09-21 | Username locked after signup | It is the public URL and MVP-1 keeps no redirect history                     |
| 2026-09-21 | Uploads via Server Action   | Keeps UI → BLL → DAL → Storage; costs a raised 6mb action body limit          |
| 2026-09-21 | Public `profile-media` bucket | Images render on public pages; signed URLs would break caching and previews |
| 2026-09-21 | Fresh object name per upload | CDN and browser caching would otherwise keep serving a replaced image        |
| 2026-09-21 | Password change ends all sessions | Passwords are often changed because someone else may know them          |
| 2026-09-21 | Accept PKCE `code` auth links | Default templates cannot be edited without custom SMTP on this plan         |
| 2026-09-26 | Personal publisher model confirmed | A venue's profile needs the same columns as a person's; `organizations` would duplicate the shape and add members, invites, roles and membership-aware RLS |
| 2026-09-26 | Phase 3 Organizations deferred post-MVP | Costs only shared publisher accounts and multi-publisher users, neither of which MVP-1 needs |
| 2026-09-26 | Publisher-neutral UI wording | One profile serves people and venues alike, so the copy must not assume a person |
| 2026-09-26 | No `completed` event status | Completion is a fact about `end_at`; storing it needs a job and contradicts the date until it runs |
| 2026-09-26 | Normalized `tags` + `event_tags` | Architecture §18 requires reusable tags; an array column cannot give a canonical list |
| 2026-09-26 | Publish rules live in the BLL | A draft may be incomplete, so readiness cannot be a CHECK or a stricter parse of the same payload |
| 2026-09-26 | Slug unique per owner, locked when public | Two venues may both run a "jazz night"; once public the slug is a live URL with no redirect history |
| 2026-09-26 | Filtering pushed into the DAL interface | A repository that can only "list everything" makes in-memory filtering the path of least resistance |
| 2026-09-26 | Events are created in a dialog only | One create path; the standalone `/dashboard/events/new` page was a second copy of the flow |
| 2026-09-26 | `ticket_cta_label` column | The button's wording depends on the event; a hard-coded "Get tickets" is wrong for a free workshop |
| 2026-09-26 | Country typed, stored as ISO code | Free text is faster than a 250-row select; resolving to a code keeps discovery filters from splitting one country three ways |
| 2026-09-26 | OpenStreetMap link before Mapbox | A plain hyperlink needs no key or SDK, so it does not introduce a second map provider |
| 2026-09-26 | Indeterminate upload progress | Server Actions report no byte progress; a fake percentage would claim what the app cannot measure |
| 2026-09-26 | Profile media is removable | Clearing the column first, then deleting files, mirrors the replace order: a failure never leaves a broken image referenced |

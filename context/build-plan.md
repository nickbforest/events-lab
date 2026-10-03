# events-lab — Build Plan

What is built, what must be fixed before the MVP ships, and what comes after.

**Baseline:** the product on `main` at `fd61992` (PR #8) is the MVP baseline,
confirmed by the developer on 2026-09-26. This plan was rebuilt from a full
code audit on that date and updated after the hardening pass on 2026-09-30
(branch `feat/mvp-hardening`). Architecture lives in `Architecture.md`; history and
validation results live in `progress-tracker.md`.

Status legend: `[x]` done · `[~]` partial · `[ ]` open.

---

# A. Implemented — the MVP baseline

## Foundation

* [x] Next.js 16 App Router, React 19, strict TypeScript, pnpm, Tailwind 4
* [x] Biome as sole linter/formatter, with import-boundary rules (UI ↛ DAL/Supabase, BLL ↛ Supabase/UI, DAL ↛ BLL/UI)
* [x] Zod environment validation, `.env.example`
* [x] Feature modules with contracts → BLL → DAL → Supabase and composition roots
* [x] Central errors (`lib/errors.ts`), logger (`lib/logging.ts`), routes (`lib/routes.ts`)
* [x] Supabase clients: request-scoped, proxy, public (anon); no service-role client
* [x] Generated database types; SQL migrations (8, all applied)
* [x] Shared Server Action failure handling and logging (`lib/action-errors.ts`)
* [x] Error, not-found and loading screens
* [x] GitHub Actions CI: install, Biome, typecheck, Vitest, build

## Authentication

* [x] Email/password sign-up with username availability check
* [x] Email confirmation (hosted) with check-email screen and resend
* [x] Log in, log out (all sessions)
* [x] Forgot password → emailed link → set new password (recovery sessions only)
* [x] `/auth/confirm` for PKCE `code` and `token_hash` links
* [x] Protected dashboard: proxy redirect + `verifySession()` next to the data
* [x] Change email (confirm by link, pending address shown)
* [x] Change password (current password re-checked, all sessions ended)

## Profiles (the publisher)

* [x] Profile row created by trigger at signup; username locked after signup
* [x] Edit display name, publisher type, city, country, bio, website, 7 social links
* [x] Avatar and cover upload (replace and remove), `profile-media` bucket and policies
* [x] Public publisher page: cover banner, avatar, type, bio, location, website, upcoming and past events; `?preview=1`

## Events

* [x] Schema, enums, categories (8 seeded), canonical tags, RLS, indexes
* [x] Create in a dialog (draft or publish); edit in the dialog or the full editor
* [x] Title-derived slugs with collision suffixes; slug locked once public
* [x] Timezone-aware dates (browser zone in the dialog, picker in the editor)
* [x] In-person / online / hybrid with conditional fields
* [x] Free / paid and price details (editor)
* [x] Ticket button: URL + custom label; blocked from publishing without a URL
* [x] Country typed by name, stored as ISO code
* [x] Tags (editor), up to 10, canonicalised by slug
* [x] Cover image upload, replace, remove; `event-media` bucket and policies
* [x] Publish readiness rules; lifecycle: publish, postpone, back on, cancel, unpublish, publish again
* [x] Delete with in-place confirmation (row and editor)
* [x] Events list with publish toggle, edit, delete
* [x] Past-ness derived from dates (no `completed` status)

## Public experience

* [x] Event page: cover hero, category, title, summary, description, tags, organizer, date, time with zone, location, price, ticket / join button, cancelled banner, related events
* [x] Event card: date rail, poster, summary, location, map link (pasted Google/Apple/OSM link, else OpenStreetMap search), description, ticket button
* [x] Metadata and Open Graph on publisher and event pages; schema.org `Event` JSON-LD
* [x] Landing page
* [x] View and ticket-click tracking (`TrackView`, `TicketLink`)

## Dashboard

* [x] Shell with sidebar (Overview, Events, Profile, Settings, public-page link, sign out)
* [x] Overview: visits, ticket clicks, daily trend chart with table view, upcoming events, most viewed — real data
* [x] Analytics tracking: page views and ticket clicks on public pages, once per session, excluding the owner and previews
* [x] Upload feedback: spinner, busy label, indeterminate bar

## Tests

* [x] Vitest: 12 files / 152 tests (BLL services, contracts, `lib` utilities, reserved-name drift)
* [x] pgTAP files for profiles, events, analytics, both buckets (not yet executed — I10)

---

# B. Fix list — status after the hardening pass (2026-09-30)

From the 2026-09-26 audit; IDs are stable. The developer's decisions on
2026-09-30: fix 1, 3, 4, 6, 7; drop discovery and the signup publisher-type
select from the MVP; build real analytics; move email/domain work to its own
PR; run an end-to-end check.

## Critical

* [~] **C1 — Discovery.** Removed from the MVP instead of fixed: `/discover`,
  `features/discovery`, `DiscoverFilters` and `lib/mock-data.ts` are deleted,
  and the landing page and publisher empty state no longer link to it. The
  route name stays reserved. Moved to §E.
* [ ] **C2 — Production auth and email.** Next PR: custom SMTP, `token_hash`
  templates, hosted password minimum 8, leaked-password protection, "secure
  password change", production site URL and redirect allow-list, deployment.

## Important

* [x] **I1 — Lifecycle rules enforced in the BLL.** `EVENT_TRANSITIONS`
  (`features/events/contracts.ts`) is the one table: the service refuses any
  other move, readiness is checked on every move into a public status (so
  unpublish → edit → publish again is checked), and the editor's buttons are
  generated from the same table. `postponed → archived` was added. The list
  toggle only acts on draft / published / unpublished rows; cancelled and
  postponed are changed on the edit page. The slug stays fixed once an event
  has ever been public.
* [x] **I2 — No silent failures.** Every event action returns a result and
  logs through `actionFailure` (`lib/action-errors.ts`); row toggle, delete and
  lifecycle show the message inline; client calls catch thrown failures;
  `toPayload` clears fields that do not apply; an error on a field that is not
  on screen is shown as a form message. Auth actions follow the same pattern.
* [x] **I3 — Event page location.** Shows venue, address, city and country
  name whenever present; JSON-LD is `Place` / `VirtualLocation` / both by
  event type.
* [x] **I4 — Password reset gated.** `/auth/confirm` sets an httpOnly,
  15-minute `el-recovery` marker for recovery links; the page redirects any
  other session to Settings and `updatePassword` refuses without a matching
  marker; `SAME_PASSWORD` is handled. Still to switch on in Supabase: "secure
  password change" (C2).
* [x] **I5 — Database-level username rules.** Applied 2026-09-30 as
  `20260930124644_harden_profiles.sql`: the table-level `UPDATE` grant is
  replaced with a column list that excludes `username`, and the signup
  trigger refuses reserved names. Verified on hosted (owners cannot update
  `username`, other profile fields still editable, trigger contains the
  check). A Vitest test keeps the trigger's list equal to
  `RESERVED_USERNAMES`.
* [x] **I6 — http(s)-only links.** `httpUrlSchema` / `optionalHttpUrlSchema`
  (`lib/urls.ts`) for every link field; the events service only accepts a
  cover URL inside the owner's own `event-media` folder.
* [x] **I7 — Analytics implemented** (replaces "label as placeholder"). See
  `Architecture.md` §19.
* [x] **I8 — Error, not-found and loading screens.** Root `not-found`,
  `error`, `global-error`; dashboard `error`, `not-found`, `loading`, built
  on `StatusMessage` and `Skeleton`. Public pages have no `loading.tsx` on
  purpose: streaming would turn a missing page's 404 into a 200.
* [x] **I9 — Migration history aligned.** Local files renamed to the hosted
  versions; the analytics migration was saved under the version it was
  applied with.
* [~] **I10 — Verification.** A Playwright smoke pass (signed-out: landing,
  404s, publisher and event pages, view/click tracking with dedupe and
  preview exclusion, auth redirects, mobile widths, analytics API
  validation) passed 27/27 against a production build, with analytics calls
  intercepted. Signed-in flows still need a browser pass by the developer
  (§D). pgTAP files added for analytics and the profiles hardening; still
  not executed as a suite (no Docker).

## Minor

* [~] **M1** — Cleanup failures are now logged; abandoned cover uploads can
  still orphan files.
* [~] **M2** — Route literals fixed in actions, confirm route, signup,
  overview, `AuthCard`, `RangeTabs`; `proxy.ts` still uses literals.
* [~] **M3** — `EVENT_TYPE_LABELS` and the default ticket label are shared,
  the events DAL parses `social_links`, `AuthCard` uses `WordmarkLink`.
  `FormAlert` still lives in `auth-card.tsx`.
* [~] **M4** — Public pages show the country name; the profile form still
  takes a two-letter code.
* [~] **M5** — URL copy fixed everywhere; publisher-neutral wording
  ("Display name", "Avatar") still pending.
* [~] **M6** — `publish` flag is Zod-parsed and `ticketCtaLabel` is a known
  field; `EventForm` still has no client-side validation.
* [x] **M7** — Slug lock and list labels are correct for unpublished events.
* [ ] **M8** — "View public page" opens in the same tab; drafts cannot be
  previewed.
* [ ] **M9** — Metadata and page fetch the same row; `getCurrentProfile` is
  not memoised.
* [ ] **M10** — Coordinates are always saved empty (documented in `toPayload`).
* [~] **M11** — `dangerouslyAllowSVG` removed. `@tanstack/react-table` and
  `date-fns` are still installed and unused.
* [~] **M12** — Stale comments fixed except `RESERVED_ROUTE_SEGMENTS`' history.
* [~] **M13** — Poster hint, overview kicker and the string render fixed;
  tag paste and the mobile sidebar remain.

---

# C. Partially implemented

| Area | What exists | What is missing | Items |
| --- | --- | --- | --- |
| SEO | Metadata, Open Graph, JSON-LD | Sitemap, robots, canonical URLs | §E |
| Location | Text fields, ISO country, pasted map link with OpenStreetMap fallback | Coordinates, map, geocoding | M10, §E |
| Testing | Vitest (152), pgTAP files, Playwright smoke script (not in repo) | pgTAP execution, Playwright in CI | I10 |
| Publisher-neutral copy | URLs corrected | Profile/settings wording | M5 |

---

# D. Remaining before the MVP ships

* [ ] C2 in its own PR: email provider, auth settings, domain, deployment.
* [ ] Developer's signed-in browser pass:
  1. Sign up → confirm email → dashboard.
  2. Edit profile; upload, replace, remove avatar and cover.
  3. Create a draft in the dialog; edit it in the dialog and the full editor.
  4. Publish from the list toggle with a missing city — expect the message
     under the row; fix it and publish.
  5. Postpone → back on → cancel → unpublish → publish again → delete.
  6. Visit your page from another browser (not signed in) and click the
     ticket button; the overview counts one visit and one click. Your own
     visits and `?preview=1` are not counted.
  7. Forgot password → open the link → set a password. Then, signed in
     normally, open `/auth/update-password` — expect Settings.
  8. As a second account, confirm the first account's draft is not visible.
  9. Repeat 2–5 at phone width.
* [ ] Add Playwright to the repo and CI for the same journeys (needs a
  test account and a way to confirm its email).

---

# E. Post-MVP

* **Discovery (was Phase 7)** — `/discover` with search over `search_vector`,
  category, date range; then tags, city, country, type, organizer, free/paid,
  distance, featured, trending, sorting, pagination.
* **Organizations (Phase 3)** — team accounts, members, roles, invites.
* **Maps and location (Phase 5)** — Mapbox, geocoding, picker, near me.
* **Media** — galleries and ordering; direct-to-Storage uploads with progress.
* **Public experience** — map on the event page, share buttons.
* **Moderation (Phase 8)** — queue, reports, roles, admin, category management.
* **Notifications (Phase 9)** — needs the SMTP provider from C2.
* **Recurrence.**
* **Analytics extensions** — rate limiting on the hit endpoint, referrers,
  per-event breakdown.
* **SEO** — sitemap, robots, canonical URLs, OG image generation.
* **Auth** — Google OAuth, Apple, passkeys; account deletion; username
  change with redirect history.
* **Signup publisher-type select** — dropped from the MVP 2026-09-30; the type
  is set on the profile page.
* **Performance** — pagination on owner and public lists.

---

# MVP definition of done

A publisher can:

```text
Register → confirm email → complete profile → create event → add cover
→ save draft → publish → get the public URL → share it
→ postpone / cancel / unpublish / delete it
```

A visitor can:

```text
Open a publisher page or event link → read the details → see if it is
cancelled or postponed → open the ticket or join link
(Discovery is post-MVP.)
```

Moderation is not part of the MVP.

---

# Explicitly out of the MVP

Do not build without separate approval: native ticket sales, Stripe
marketplace, organizer payouts, subscription billing, native mobile apps,
microservices, Redis, dedicated search infrastructure, recommendation engine,
following, comments, reviews, complex social features, a notification center,
AI event generation, an advanced analytics platform.

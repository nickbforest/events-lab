# events-lab — Progress Tracker

Legend: `[ ]` not started · `[-]` in progress · `[x]` complete · `[!]` blocked · `[~]` deferred

---

# Current status

**Last updated:** 2026-09-30

**Where things stand.** Phases 0–4 are on `main` (PRs #3–#8). The 2026-09-26
audit set the MVP baseline; the **hardening pass** on branch
`feat/mvp-hardening` (2026-09-30, uncommitted at the time of writing) closed
most of its fix list: event lifecycle rules in the BLL, no silent failures,
event page location, recovery-only password reset, http(s)-only links, real
analytics, error / not-found / loading screens, and aligned migration history.
Discovery and the signup publisher-type select were dropped from the MVP.

**Open before launch:**

* production email, auth settings, domain and deployment in their own PR (C2);
* the developer's signed-in browser pass (`build-plan.md` §D).

**Next:** commit and open the PR, run the §D checklist, then the C2 PR.

**2026-10-03 — Map link** (branch `feat/event-map-link`): the event form's
Location section takes a pasted map link (`events.map_url`, migration
`add_event_map_url`). "View on map" on the card and event page opens it, and
falls back to the OpenStreetMap address search when it is empty.

---

# Hardening pass — 2026-09-30

Scope: `build-plan.md` items 1, 3, 4, 5, 6, 7 and 10 as directed by the
developer; analytics built from a confirmed `/architect` blueprint (visits
once per session per page excluding the owner and previews; ticket clicks by
beacon; SECURITY DEFINER write function; server-side aggregation).

| Check | Result |
| --- | --- |
| `biome check .` | Clean, 140 files |
| `tsc --noEmit` | Clean |
| `vitest run` | 12 files, 152 tests (123 before) |
| `next build` | Passed; 17 routes incl. `/api/analytics`, `/discover` removed |
| Hosted migrations | `create_analytics` applied as `20260930115636`, `harden_profiles` as `20260930124644`; local files match. Username lock and reserved-name trigger verified on hosted |
| Analytics privileges | Verified read-only: no direct insert for `anon`/`authenticated`, RLS on, write function definer, read functions invoker and `authenticated`-only |
| Security advisors | Leaked-password protection off (C2); `record_analytics_hit` flagged as anon/authenticated-executable definer — intended, documented in Architecture §7.4 |
| Playwright smoke (signed out, production build, analytics intercepted) | 27/27: landing, 404s with correct status, publisher and event pages, view/click reporting with session dedupe and preview exclusion, JSON-LD `Place`, auth redirects, four pages at 390px without horizontal scroll, API validation |
| Signed-in browser pass | Not done — needs the developer's account (§D) |

One regression was found and fixed during the pass: a `loading.tsx` under
`/publishers` made missing pages answer 200 instead of 404. Public pages now
have no `loading.tsx`.

---

# MVP baseline audit — 2026-09-26

Scope: every context document against the full codebase — routes, auth,
proxy, Supabase clients, migrations, RLS and storage policies, features
(contracts, actions, queries, BLL, DAL), components, forms, states,
configuration, CI, tests. Hosted project checked through the connector:
migration list, security and performance advisors, row counts, column grants.

| Check | Result |
| --- | --- |
| `biome check .` | Clean, 130 files |
| `next typegen && tsc --noEmit` | Clean |
| `vitest run` | 10 files, 123 tests passed |
| `next build` | Passed; 17 routes, proxy registered |
| Hosted migrations | All 6 applied, but under different version numbers from the local files (I9) |
| Security advisors | Leaked-password protection disabled (only finding) |
| Performance advisors | 3 unused-index notices (`events_public_start_at_idx`, `events_search_idx`, `event_tags_tag_idx`) — expected until discovery reads them |
| Column grants | `authenticated` can `UPDATE profiles.username` (I5) |
| Tooling note | `pnpm` is not on this workstation's PATH; checks were run from `node_modules/.bin` |

Findings are recorded as actionable items in `build-plan.md` §B. The
documentation changes made in the same pass:

* `Architecture.md` rewritten to describe the implemented system first, with
  the organizations, roles, moderation and maps target moved to a post-MVP
  section.
* `build-plan.md` rebuilt by status instead of by phase.
* `ui-rules.md` §2/§4/§14 rewritten to the dark/lime editorial system the code
  uses.
* `ui-registry.md` reduced to components that exist.
* `code-standard.md` corrected where it described things that don't exist.

No application code changed.

---

# Phase history

## Phase 0 — Foundation · complete 2026-09-11 · PRs #3, #4

Repository foundation: pnpm, Biome (replacing ESLint), strict TypeScript,
Zod-validated environment, the TanStack/Axios/Supabase libraries, feature
BLL/DAL seams with import-boundary lint rules, Supabase CLI config, generated
types, CI.

Not run: the local Supabase stack, because there is no Docker or Podman on
the workstation. That is still true.

## Phase 1 — Authentication · complete 2026-09-14 · PR #5

Supabase Auth replaced the localStorage prototype, which was deleted.

Built:

* The `profiles` table, created here rather than in Phase 2 because an account
  without an identity row breaks the dashboard.
* The `handle_new_user` trigger, with `EXECUTE` revoked.
* A username chosen at signup, with a live availability check.
* `proxy.ts` session refresh, and `verifySession()` as the authorization
  boundary.
* The cookie-free public client.
* All the auth screens, built on `AuthCard`.

Google OAuth was deferred (no credentials) and its button removed.

Validation at the time: Vitest 45 tests; the trigger and constraints were
probed against the hosted project; `/dashboard` redirects to login when
signed out.

## Phase 2 — Profiles · complete 2026-09-21 · PR #6

Built:

* Profile editing through contracts → action → BLL → DAL.
* The `profile-media` bucket and its policies.
* Avatar and cover upload, and the public page rendering them.
* Settings: password change (ends every session) and email change (link
  confirmation).

Fixed: `/auth/confirm` now accepts the PKCE `code` that the default templates
send, so password reset works.

Decisions: the username stays locked after signup, and account deletion is
out of scope because it needs a service-role key. The developer verified
profile save, uploads, the public page, password reset and password change in
the browser.

## Phase 3 — Organizations · deferred post-MVP · 2026-09-26

The MVP publishes through profiles (`publisher_type` classifies them). An
organizations layer would restate the profile shape and add members, invites,
four roles and membership-aware RLS on every event query. It costs exactly two
capabilities: shared publisher accounts and multi-publisher users. The
retrofit path is in `Architecture.md` §6.

## Phase 4 — Events · complete 2026-09-26 · PR #8

Built:

* **Schema and storage:** the event schema (enums, categories, canonical tags,
  events, event_tags, a generated `search_vector`), RLS and the `event-media`
  bucket.
* **BLL:** slugs, publish readiness, lifecycle transitions, derived past-ness.
* **UI:** one `EventForm` serving the create/edit dialog and the full editor,
  the lifecycle panel, the events list with a publish toggle, the public event
  page and `EventCard`.
* **Supporting pieces:** `ticket_cta_label`, `lib/datetime.ts`,
  `lib/countries.ts`, and the OpenStreetMap link.

Post-completion polish on the same PR:

* An indeterminate upload bar, and replace/remove chips on images.
* `SelectControl`.
* `WordmarkLink`: the logo goes to Overview inside the dashboard.
* Preview links open in a new tab.
* The footer is the wordmark only; the "claim your page" box was removed.
* A cursor base rule.

Validation at the time:

* Vitest: 10 files / 123 tests.
* Build: passed.
* RLS and storage: 12 structural checks, 6 constraint probes, 12 RLS probes
  and 6 storage probes, run against the hosted project in rolled-back
  transactions.
* Browser: **no recorded pass** (I10).

## Earlier follow-ups, where they went

| Follow-up | Now |
| --- | --- |
| Local signup friction; no container runtime | Open — I10 (pgTAP), local stack still unavailable |
| Redirect allow-list; hosted password minimum 6; leaked-password protection; custom SMTP; same-browser email links | C2 |
| Email change untested end to end | §D checklist |
| Dashboard empty for real accounts | Resolved — real events since Phase 4 |
| Loose `usernameSchema` in events | Resolved in Phase 4; remaining duplicates are M3 |
| Publisher-neutral wording | M5 |
| `publisher_type` not asked at signup | §D |
| Discovery and analytics mock-backed | C1, I7 |
| No pagination; `search_vector` unused; fixed categories; upload percentage; recurrence | §E |
| Sidebar sign-out ends every session | Open decision: keep `global` or switch to `local` |

---

# MVP release gate

* [x] Authentication works (sign-up, confirm, login, reset, email and password change)
* [x] Profiles work (edit, media, public page)
* [x] Events work (create, edit, cover, draft, delete)
* [x] Event publishing and lifecycle rules enforced server-side — I1, I2
* [x] Public event pages work — I3
* [x] Analytics recorded and shown — I7
* [x] Security fixes — I4, I5, I6
* [x] Error, not-found and loading states — I8
* [ ] Production configuration and deployment — C2
* [~] End-to-end check — signed-out pass done; signed-in pass by the developer — I10
* [ ] Accessibility reviewed
* [ ] SEO reviewed (metadata, OG, JSON-LD present; sitemap/robots are post-MVP)
* [x] Typecheck passes
* [x] Lint passes
* [x] Build passes
* [ ] Critical E2E tests in CI (Playwright)

Discovery, moderation and organizations are not part of the MVP gate.

---

# Architecture decision log

| Date | Decision | Reason |
| --- | --- | --- |
| 2026-09-01 | Supabase | PostgreSQL + Auth + Storage + RLS provides strong MVP backend infrastructure |
| 2026-09-01 | PostgreSQL | Relational event/publisher/user model |
| 2026-09-01 | Modular monolith | Avoid premature distributed-system complexity |
| 2026-09-01 | Next.js | Unified modern React application and server architecture |
| 2026-09-01 | No ORM initially | Supabase/PostgreSQL tooling is sufficient |
| 2026-09-01 | PostgreSQL search initially | Avoid premature dedicated search infrastructure |
| 2026-09-01 | Mapbox | Maps and geolocation |
| 2026-09-01 | No native ticketing in MVP | Focus on publishing/discovery |
| 2026-09-01 | Free publishing initially | Validate product before monetization complexity |
| 2026-09-11 | Mandatory BLL and DAL | Keep domain policy separate from Supabase persistence |
| 2026-09-11 | Zod at every trust boundary | User input requires runtime validation on the server |
| 2026-09-11 | Strict inferred TypeScript | Infer from Zod and generated Supabase types to prevent contract drift |
| 2026-09-11 | TanStack application stack | Standardize forms, client server state, tables, and charts |
| 2026-09-11 | Axios for HTTP | Centralize HTTP behavior without replacing the Supabase SDK |
| 2026-09-11 | shadcn/ui primitives | Keep application UI accessible and visually consistent |
| 2026-09-11 | SOLID module boundaries | Keep feature layers focused, substitutable, and independently testable |
| 2026-09-11 | Biome for code quality | Use one tool for repository linting and formatting |
| 2026-09-14 | Profiles table in Phase 1 | Auth without an identity row leaves the dashboard and the public page broken |
| 2026-09-14 | Full profile columns now | Every extra field is nullable, so one migration beats a second one in Phase 2 |
| 2026-09-14 | Trigger creates the profile | Only mechanism that works whether or not signup returns a session |
| 2026-09-14 | Username chosen at signup | It is the public URL; auto-assigning then renaming would break shared links |
| 2026-09-14 | Gate in `verifySession()` | Next.js 16 layouts do not re-render on navigation and cannot stop segments |
| 2026-09-14 | Cookie-free public client | `cookies()` is unavailable during static generation of public pages |
| 2026-09-14 | Google OAuth deferred | No Google Cloud credentials; dead UI removed rather than left non-functional |
| 2026-09-21 | Username locked after signup | It is the public URL and the MVP keeps no redirect history |
| 2026-09-21 | Uploads via Server Action | Keeps UI → BLL → DAL → Storage; costs a raised 6mb action body limit |
| 2026-09-21 | Public `profile-media` bucket | Images render on public pages; signed URLs would break caching and previews |
| 2026-09-21 | Fresh object name per upload | CDN and browser caching would otherwise keep serving a replaced image |
| 2026-09-21 | Password change ends all sessions | Passwords are often changed because someone else may know them |
| 2026-09-21 | Accept PKCE `code` auth links | Default templates cannot be edited without custom SMTP on this plan |
| 2026-09-26 | Personal publisher model confirmed | A venue's profile needs the same columns as a person's; `organizations` would duplicate the shape and add members, invites, roles and membership-aware RLS |
| 2026-09-26 | Phase 3 Organizations deferred post-MVP | Costs only shared publisher accounts and multi-publisher users, neither of which the MVP needs |
| 2026-09-26 | Public pages under `/publishers/:username` | A word, not an initial; renamed from `/u` in the PR #6 review |
| 2026-09-26 | Publisher-neutral UI wording | One profile serves people and venues alike, so the copy must not assume a person |
| 2026-09-26 | No `completed` event status | Completion is a fact about `end_at`; storing it needs a job and contradicts the date until it runs |
| 2026-09-26 | Normalized `tags` + `event_tags` | Reusable tags need a canonical list; an array column cannot give one |
| 2026-09-26 | Publish rules live in the BLL | A draft may be incomplete, so readiness cannot be a CHECK or a stricter parse of the same payload |
| 2026-09-26 | Slug unique per owner, locked when public | Two venues may both run a "jazz night"; once public the slug is a live URL with no redirect history |
| 2026-09-26 | Filtering pushed into the DAL interface | A repository that can only "list everything" makes in-memory filtering the path of least resistance |
| 2026-09-26 | Events are created in a dialog only | One create path; the standalone `/dashboard/events/new` page was a second copy of the flow |
| 2026-09-26 | `ticket_cta_label` column | The button's wording depends on the event; a hard-coded "Get tickets" is wrong for a free workshop |
| 2026-09-26 | Country typed, stored as ISO code | Free text is faster than a 250-row select; resolving to a code keeps discovery filters from splitting one country three ways |
| 2026-09-26 | OpenStreetMap link before Mapbox | A plain hyperlink needs no key or SDK, so it does not introduce a second map provider |
| 2026-10-03 | Publisher-pasted map link, map hosts only | Address search lands on the wrong building; publishers already have the exact pin in Google Maps. Approved by the developer as a hyperlink, not a provider. Allowlisted (Google, Apple, OSM) so "View on map" cannot point anywhere else |
| 2026-09-26 | Indeterminate upload progress | Server Actions report no byte progress; a fake percentage would claim what the app cannot measure |
| 2026-09-26 | Dashboard logo leads to Overview | A signed-in publisher has no use for the public landing page mid-task |
| 2026-09-26 | Profile media is removable | Clearing the column first, then deleting files, mirrors the replace order: a failure never leaves a broken image referenced |
| 2026-09-26 | Dark/lime editorial design system | Chosen by the developer over the neutral SaaS direction; ui-rules.md rewritten to match |
| 2026-09-26 | Implemented product is the MVP baseline | Developer confirmed; build plan rebuilt by status, moderation and organizations removed from the MVP gate |
| 2026-09-30 | Discovery removed from the MVP | A search page over empty placeholder data promised what the product could not do; the route name and `search_vector` stay for later |
| 2026-09-30 | Signup publisher-type select dropped | The type is set on the profile page; one fewer signup field |
| 2026-09-30 | One transition table for UI and BLL | A status rule hidden only in the UI is not a rule; `EVENT_TRANSITIONS` is enforced by the service and rendered by the editor |
| 2026-09-30 | Slug fixed once ever public | Unpublishing does not un-share a URL |
| 2026-09-30 | Recovery marker cookie for password reset | A reset link and a login produce the same session; an httpOnly, 15-minute marker set by `/auth/confirm` tells them apart without relying on AMR details |
| 2026-09-30 | Username rules enforced by grants and trigger | RLS limits rows, not columns; a column-level UPDATE grant and a trigger check make the lock and reserved names hold against direct API calls |
| 2026-09-30 | http(s)-only links | `z.url()` accepts `javascript:` and `data:`; safety should not depend on the renderer |
| 2026-09-30 | Analytics: one row per hit, definer write function, invoker read functions | Anonymous visitors must be able to record without a table insert policy; aggregation in SQL keeps "all time" to one row per day |
| 2026-09-30 | Visits counted in the browser, once per session, never the owner | Excludes crawlers, prefetches, refreshes and the publisher's own checking |
| 2026-09-30 | No `loading.tsx` on public pages | Streaming commits a 200 before `notFound()` can set a 404 |

# events-lab — Architecture

The architectural source of truth. It describes the **implemented MVP baseline**
first and the post-MVP target last (§25). Where the two differ, the code and
the first 24 sections win.

Last reconciled with the code: **2026-09-30** (hardening pass after the
2026-09-26 MVP baseline audit). Any
significant architectural change must be explicitly approved before
implementation.

---

# 1. Product

events-lab is a free publishing tool for anyone who runs events — artists,
bands, venues, theaters, cinemas, sports clubs, schools, churches, communities,
conference organizers, local businesses.

> Create an event → publish it → share its public link.

A **publisher** signs up, gets a public page at `/publisher/:username`, and
publishes events at `/publisher/:username/:slug`. Tickets are sold elsewhere;
events-lab links out to the publisher's provider.

---

# 2. MVP scope

## In the MVP (implemented)

* Email/password accounts with email confirmation, password reset, email and
  password change.
* One public publisher page per account: name, publisher type, city, country,
  bio, website, social links, avatar, cover image.
* Events: create (dialog), edit (dialog or full editor), draft, publish,
  postpone, cancel, unpublish (archive), delete; cover image; category; tags;
  in-person / online / hybrid; free / paid; ticket button with custom label;
  timezone-aware dates; per-publisher slugs.
* Public event page with Open Graph metadata, schema.org `Event` JSON-LD and
  related events. Public publisher page with upcoming and past events.
* Dashboard: overview with real analytics (visits, ticket clicks, daily
  trend, most viewed), events list, profile, settings.
* Error, not-found and loading screens in the design system.

## In the MVP but not finished

See `build-plan.md` §B–§D: production email, auth settings and deployment
(C2, its own PR), and a signed-in browser pass.

## Intentionally outside the MVP

Discovery (`/discover`, search and filters — removed 2026-09-30),
organizations and team accounts, roles beyond "owner", moderation and admin,
notifications, recurrence, galleries, maps / geocoding / "near me", Google
OAuth, native ticketing and payments, following, comments, reviews, account
deletion. See §25.

---

# 3. Architectural style

A **modular monolith**: one Next.js application deployed as one unit, with
explicit feature boundaries. No microservices. A service is extracted only when
real scale or operational requirements justify it.

Implemented feature modules (`features/<name>/`):

| Feature | Backing | Responsibility |
| --- | --- | --- |
| `auth` | Supabase Auth | Sign-up, sign-in, sessions, email links, password and email change |
| `profiles` | `profiles` table, `profile-media` bucket | Publisher identity, username policy, profile media |
| `events` | `events`, `categories`, `tags`, `event_tags`, `event-media` | Event CRUD, lifecycle, slugs, publish readiness, public reads |
| `analytics` | `analytics_hits`, `record_analytics_hit`, `analytics_daily`, `analytics_top_events` | Recording page views and ticket clicks; the overview's numbers |

---

# 4. Technology stack

Versions are pinned in `package.json`.

| Concern | Choice |
| --- | --- |
| Framework | Next.js 16.3 (App Router, React Server Components, Server Actions, Proxy) |
| UI runtime | React 19.2 |
| Language | TypeScript 5, strict mode |
| Package manager | pnpm 12.3.4; Node.js ≥ 22.12 |
| Styling | Tailwind CSS 4, design tokens in `app/globals.css` |
| UI primitives | Hand-written in `components/` following `ui-registry.md`; `components.json` is configured for shadcn/ui but no generated primitive is in use yet |
| Icons | lucide-react |
| Forms | TanStack Form 1.x with shared Zod schemas |
| Client server state | TanStack Query 5 (username availability) |
| Charts | TanStack Charts 0.18.0 (pinned; pre-1.0), behind `TrendChart` |
| Tables | TanStack Table 9 is installed but **not used yet** (see `build-plan.md` M11) |
| HTTP | Axios, `lib/http/client.ts`, browser → Route Handler only |
| Validation | Zod 4.6 (`z.compile` for per-request schemas) |
| Backend platform | Supabase: PostgreSQL 17, Auth, Storage, RLS (`@supabase/ssr`, `@supabase/supabase-js`) |
| Lint / format | Biome 2.5 (sole tool; also enforces import boundaries) |
| Unit tests | Vitest 5 (node environment) |
| Database tests | pgTAP in `supabase/tests/database` (written, not yet executed as a suite) |
| CI | GitHub Actions: frozen install, Biome, typecheck, Vitest, build |
| Hosting (planned) | Vercel for Next.js, Supabase for backend — not deployed yet |

Not in the stack yet: Mapbox (selected for the map phase), Playwright (selected
for E2E), a transactional email provider.

---

# 5. Supabase

Supabase is the integrated backend — database, auth, storage and RLS — not
only a database host. Hosted project: `wjuuiwgayyydvacjzixa` (PostgreSQL 17).

## 5.1 Clients (`lib/supabase/`)

| File | Runtime | Use |
| --- | --- | --- |
| `client.ts` | Browser | Exists; not used by features today |
| `server.ts` | Server, request-scoped, cookie-aware | Every authenticated read and write |
| `proxy.ts` | Proxy | Session refresh and rotated-cookie persistence |
| `public.ts` | Server, cookie-free, anonymous | Public pages and reads without a request context; sees only rows with a public select policy |

There is **no privileged (service-role) client**, and none may be added
without approval. A secret key never uses a `NEXT_PUBLIC_` prefix, is never
logged, bundled or committed. Normal operations use the request-scoped client
so RLS stays effective.

Client factories are infrastructure. Feature code reaches them only through
its DAL; Biome import rules block UI, Server Actions and BLL modules from
importing `@/lib/supabase` or `@supabase/*`.

## 5.2 Environment

Validated with Zod in `lib/env/client.ts` (`lib/env/server.ts` re-exports it
behind `server-only`). Documented in `.env.example`.

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL; also the allowed `next/image` host |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Publishable (anon) key |
| `NEXT_PUBLIC_SITE_URL` | Origin for auth email links; must be on the Supabase redirect allow-list |
| `NEXT_PUBLIC_LOG_LEVEL` | Optional logger threshold |
| `TEST_MEDIA_HOST`, `TEST_EXTERNAL_HOST` | Optional test-fixture hosts (default to `.invalid`) |

## 5.3 Migrations and types

Schema changes are SQL migrations in `supabase/migrations`. Migrations are
history: never edit an applied one. Generated types live in
`lib/supabase/database.types.ts` (`pnpm db:types` needs the local stack; with
no Docker, types are generated from the hosted project through the connector).

Local file versions match the hosted history (aligned 2026-09-30), so
`supabase db push` works. When a migration is applied through the connector,
it gets the apply time as its version: rename the local file to that version
(check with `list_migrations`).


## 5.4 ORM

No Prisma or Drizzle. Supabase SQL migrations, generated types and the typed
Supabase client are sufficient. An ORM needs a demonstrated need and approval.

---

# 6. Publisher model

**A profile is the publisher.** There is no organizations layer in the MVP.

* `profiles.id` = `auth.users.id`; one profile per account.
* `profiles.publisher_type` classifies it (artist, band, theater, cinema,
  sports_team, event_organizer, school, university, conference_organizer,
  church, community, venue, business, other). It is a classification, **not a
  security role**.
* Events are owned by a profile: `events.owner_id → profiles.id`.
* A venue, band or business registers as a profile like a person does.

What this costs, exactly: two people cannot manage one publisher (staff share
a login), and one person cannot run two publishers (they need a second
account). Retrofitting organizations later means one organization per profile
as a backfill, an `events.organization_id` column, and a rewrite of every
events RLS policy. Revisit before launch if either capability becomes a
requirement.

**Roles.** The MVP has exactly one: an authenticated owner acting on their own
rows. There are no system roles (moderator, admin) and no organization roles.

---

# 7. Data model

All tables are in `public`, all have RLS enabled.

## 7.1 Enums

| Enum | Values |
| --- | --- |
| `publisher_type` | see §6 |
| `analytics_metric` | `page_view`, `ticket_click` |
| `event_type` | `in_person`, `online`, `hybrid` |
| `event_status` | `draft`, `published`, `cancelled`, `postponed`, `archived` — deliberately **no `completed`** (§9) |

## 7.2 Tables

**`profiles`** — `id` (PK, FK `auth.users`, cascade), `username` (unique,
`^[a-z0-9_](-?[a-z0-9_])*$`, 3–32), `display_name` (1–80), `publisher_type`
(default `other`), `bio`, `avatar_url`, `cover_url`, `website_url`, `city`,
`country_code` (`^[A-Z]{2}$`), `social_links` jsonb (map of platform → URL),
`created_at`, `updated_at` (trigger).

**`categories`** — `id`, `slug` (unique), `label`, `sort_order`. Seeded with
eight (concert, theater, cinema, sports, conference, festival, exhibition,
community). No write policy: the list changes by migration only.

**`tags`** — `id`, `slug` (unique, canonical identity), `label` (first spelling
used), `created_at`. Any signed-in user may insert; never updated or deleted by
the app.

**`events`** — `id`, `owner_id` (FK profiles, cascade), `slug` (unique per
owner, `^[a-z0-9]+(-[a-z0-9]+)*$`, 3–160), `title` (3–160),
`short_description` (≤280), `description` (≤10000), `category_id` (FK,
restrict), `event_type`, `status`, `start_at` (not null), `end_at` (> start),
`timezone` (IANA, validated by Zod), `venue_name`, `address`, `city`,
`country_code`, `latitude`, `longitude` (range-checked, not yet populated),
`online_url`, `is_free`, `price_info`, `ticket_url`, `ticket_cta_label`
(1–40), `external_url`, `cover_image_url`, `published_at`, `created_at`,
`updated_at` (trigger), `search_vector` (generated, weighted: title A,
summary/city B, venue C, description D; not read yet).

Constraint `events_public_status_has_published_at`: a public status requires
`published_at`. All other CHECKs are structural; publish readiness is a BLL
rule because a draft may be incomplete.

**`event_tags`** — `(event_id, tag_id)` PK, both cascade.

**`analytics_hits`** — `id` (identity), `owner_id` (FK profiles, cascade),
`event_id` (FK events, cascade, null for the publisher page), `metric`
(`analytics_metric`: `page_view`, `ticket_click`; a click requires an event),
`occurred_at`. One row per hit; no IP, user agent or visitor id.

## 7.3 Indexes

`events_owner_status_idx (owner_id, status)`, partial
`events_public_start_at_idx (start_at)` for public rows,
`events_category_idx`, GIN `events_search_idx (search_vector)` (unread until
discovery returns), `event_tags_tag_idx (tag_id)`,
`analytics_hits_owner_time_idx (owner_id, occurred_at)`, partial
`analytics_hits_event_idx (event_id)`.

## 7.4 Functions and triggers

* `handle_new_user` (security definer) creates the profile from signup
  metadata (`username`, `display_name`). A failure aborts the auth user insert,
  so an account without a profile cannot exist.
* `set_updated_at` on `profiles` and `events`.
* `EXECUTE` on both is revoked from `public`, `anon`, `authenticated`.
* `record_analytics_hit(metric, username, event_id)` — **security definer**,
  executable by `anon` and `authenticated`: the only way to write a hit. It
  looks the target up itself (the event must be public and belong to that
  username) and returns false, writing nothing, otherwise. Supabase's
  advisor flags it as a public definer function; that is intended.
* `analytics_daily(owner, from, to)` and `analytics_top_events(owner, from,
  to, limit)` — security **invoker**, `authenticated` only, so RLS limits
  them to the caller's own rows. Aggregation happens here, never in the app.
* `handle_new_user` also refuses reserved usernames (`check_violation`), so a
  sign-up that bypasses the app cannot take one. The list is kept equal to
  `RESERVED_USERNAMES` by a Vitest test.

## 7.5 Storage

| Bucket | Public read | Limit | Types | Path |
| --- | --- | --- | --- | --- |
| `profile-media` | yes | 5 MB | PNG, JPEG, WebP | `{user_id}/{avatar\|cover}-{uuid}.{ext}` |
| `event-media` | yes | 5 MB | PNG, JPEG, WebP | `{user_id}/{uuid}.{ext}` (no event id: the cover uploads before the row exists) |

Owner-folder policies on both: insert, select (list) and delete only where the
first path segment is `auth.uid()`. Public buckets mean readable by URL, not
listable. Every upload gets a fresh object name so CDN caches never serve a
replaced image.

---

# 8. Row Level Security

| Table | Select | Insert | Update | Delete |
| --- | --- | --- | --- | --- |
| `profiles` | everyone | none (trigger only) | owner | none (cascade from `auth.users`) |
| `categories` | everyone | none | none | none |
| `tags` | everyone | authenticated | none | none |
| `events` | public statuses with `published_at` (published, cancelled, postponed), or owner | owner | owner | owner |
| `event_tags` | follows its event | event owner | none | event owner |
| `analytics_hits` | owner | none (only `record_analytics_hit`) | none | none (cascade) |

Cancelled and postponed events stay public on purpose: a ticket holder must see
that the event is off, not a 404. Archiving is how a publisher takes a page
down.

**RLS checks rows, not columns.** Where a rule must hold even against an
owner calling PostgREST directly, it needs a grant or trigger as well:
`username` is excluded from the owners' column-level `UPDATE` grant and
reserved names are refused by the signup trigger (both from the I5
migration). "Slug is fixed once public" and publish readiness remain BLL-only
and can be bypassed only on the owner's own rows — accepted for the MVP.
Never disable RLS to make a feature easier.

---

# 9. Event lifecycle

Status holds the publisher's intent. Whether an event has **finished** is
derived from `end_at ?? start_at` (`hasFinished` in the events service), never
stored, because a stored copy needs a scheduled job and contradicts the date
until it runs. The `events_rls` test asserts the enum has no `completed`.

Allowed transitions — `EVENT_TRANSITIONS` in `features/events/contracts.ts`,
the single table the service enforces and the editor renders:

```text
draft      → published (Publish)
published  → postponed | cancelled | archived (Unpublish)
postponed  → published (Back on) | cancelled | archived
cancelled  → archived
archived   → published (Publish again)
```

No public event returns to `draft`, and a cancellation is undone only by
unpublishing and publishing again. The events list toggle covers draft,
published and archived rows only (on = `published`, off = `archived`);
cancelled and postponed rows are changed on the edit page.

Service rules: any move not in the table is refused (`VALIDATION_FAILED`);
publish readiness is checked on every move from a non-public status into a
public one and on every edit of a public event; `published_at` is set once,
the first time the event goes public.

Publish readiness (`publishBlockers`): online/hybrid needs a join link;
in-person/hybrid needs a city; paid needs price details or a ticket link; a
ticket label needs a ticket URL.

Slugs derive from the title, are suffixed on collision (`-2` … `-50`) per
owner, and are fixed once the event has **ever** been public
(`published_at` set) — unpublishing does not free it, since the URL may have
been shared.

---

# 10. Date and time

Events store `start_at`/`end_at` as `timestamptz` and `timezone` as an IANA
identifier. Never store a formatted display string.

`lib/datetime.ts` converts `datetime-local` wall-clock readings to instants
for a named zone with `Intl` (two-pass offset resolution for DST), and back.
The create dialog reads times in the browser's zone without showing it; the
full editor exposes a zone picker (`COMMON_TIME_ZONES`, with the saved zone
kept if it is outside the list). Display formats events in the **event's**
zone, not the viewer's (`lib/format.ts`).

---

# 11. Location

Venue, address, city and country are real columns. The event form takes a
country name (datalist) and stores the ISO alpha-2 code via
`countryCodeFromInput` (`lib/countries.ts`, names from `Intl.DisplayNames`).
Coordinates exist but are never populated; the form currently submits them as
empty on every save.

Until the map phase, "View on map" (event card and event page) is a plain
hyperlink built by `mapSearchUrl` (`lib/maps.ts`) — no key, no SDK. It uses,
in order: the publisher's pasted `map_url`, coordinates, then an
OpenStreetMap search of the typed address. `map_url` accepts only Google Maps,
Apple Maps and OpenStreetMap links (`isMapLink`, checked by the contract and
again at render); the column itself only enforces https and length, so the
host list changes without a migration. Linking out to a hosted map is not a
map provider integration: Mapbox remains the selected map provider; do not
introduce another one.

---

# 12. Tickets and payments

No native ticketing or payments in the MVP. An event carries `is_free`,
`price_info`, `ticket_url`, `ticket_cta_label` (button text, default "Get
tickets") and `external_url`. The ticket button is hidden for cancelled
events. An online event without a ticket URL shows "Join online".

Monetization (featured events, pro plans, ticketing fees) is post-MVP and
needs approval. Publishing is free.

---

# 13. Media

Uploads go through Server Actions → BLL → DAL → Storage (the action body
limit is raised to `6mb` in `next.config.ts` for 5 MB files).

* **Profile avatar and cover** upload immediately on selection. Order:
  upload → repoint the row → delete the replaced files, so a failure leaves an
  orphan, never a broken image. Removal clears the column first, then deletes
  the files.
* **Event cover** uploads on selection and returns a URL the form holds; the
  row is written on Save, and Save deletes the file the row no longer points
  at. The service accepts only a URL inside the owner's own `event-media`
  folder (the DAL knows the layout, the BLL refuses). A cover uploaded and
  then abandoned is orphaned (`build-plan.md` M1).
* Progress is an **indeterminate** bar: Server Actions report no byte
  progress. A real percentage needs signed-URL direct-to-Storage uploads.
* `next/image` serves only `…/storage/v1/object/public/**` on the Supabase host.

Not built: galleries, reordering, image optimization beyond `next/image`.

---

# 14. Authentication

Supabase Auth, email and password. Google OAuth is deferred (no Google Cloud
credentials); it was removed from the UI rather than left non-functional.

**Session transport.** Next.js 16 renamed Middleware to **Proxy**. `proxy.ts`
refreshes the Supabase session on every non-asset request, persists rotated
cookies, redirects signed-out users away from `/dashboard` to
`/auth?mode=login`, and redirects signed-in users away from `/auth` and
`/auth/check-email`.

**The proxy is not the authorization boundary.** `verifySession()` in
`features/auth/queries.ts` (React `cache()`, validated with `getUser()`) runs
next to the data in every protected page and Server Action. Never move the
check into a layout: layouts do not re-render on client navigation and do not
stop nested segments or actions from running.

**Signup.** Username and display name travel as signup metadata; the
`handle_new_user` trigger creates the profile (a documented exception to
"business rules live in the BLL": with confirmation on, signup returns no
session, so the app has no context to insert the row). Username format and
uniqueness are database constraints; reserved names are BLL policy
(`RESERVED_ROUTE_SEGMENTS` + a fixed list). Live availability:
`GET /api/auth/username-available` (Axios + TanStack Query).

**Email confirmation is environment-split.** Hosted requires it
(`mailer_autoconfirm = false`); local config disables it. Sign-up handles both
outcomes: a session → `/dashboard`, none → `/auth/check-email`.

**Email links.** `/auth/confirm` accepts both the PKCE `code` that Supabase's
default templates send (works only in the requesting browser) and
`token_hash` + `type` (works anywhere, once templates are editable with custom
SMTP). Recovery links go to `/auth/update-password`, email-change links to
`/dashboard/settings`, others to `/dashboard`; failures go to
`/auth/link-expired`.

**Account settings.** Password change re-checks the current password,
requires confirmation, then signs out every session and returns to login with
a notice. Email change completes only when the emailed link is used; the page
shows the pending address. Sign-out ends **all** sessions (`global`).

**Password reset is gated to recovery links.** A reset link signs the person
in exactly like a login does, so `/auth/confirm` marks recovery links with an
httpOnly, 15-minute `el-recovery` cookie holding the user id
(`features/auth/recovery-marker.ts`). The update-password page sends any
other session to Settings, and `updatePassword` in the auth service refuses
unless the marker matches the signed-in user; the marker is cleared on
success.

Known gap: production email and auth settings (C2).

---

# 15. Authorization

Layered, and the frontend is never the boundary:

```text
UI restrictions (convenience only)
      ↓
Server: verifySession() + actor id from the session, never the payload
      ↓
BLL domain rules (ownership lookups, publish readiness, transitions)
      ↓
PostgreSQL RLS (ownership)
```

A foreign event id is indistinguishable from a missing one (`NOT_FOUND`), so a
stranger cannot learn that an id exists.

---

# 16. Application layers

Every feature that reads or changes data follows this direction:

```text
UI / Server Component
        ↓
Server Action · Route Handler · server query entry point (features/*/queries.ts)
        ↓
Zod validation + authenticated actor
        ↓
BLL  (features/*/bll)   use cases, domain rules, orchestration
        ↓
DAL  (features/*/dal)   contract + Supabase adapter, row mapping, error translation
        ↓
Supabase → PostgreSQL / Auth / Storage
```

* **Composition roots:** `features/*/service.ts` build a BLL service over a
  DAL adapter with the right client (request-scoped or public).
* **BLL** owns policy and orchestration; it never imports Supabase or UI.
* **DAL** is the only layer that calls Supabase; it uses generated types and
  throws `DataAccessError` (or `AuthProviderError` in auth).
* **Contracts** (`features/*/contracts.ts`) hold the canonical Zod schemas;
  types are inferred from them and from generated database types.
* **Errors:** codes in `lib/errors.ts` (`ApplicationErrorCode`), user wording
  in `USER_FACING_MESSAGES` via `toUserMessage`. Layers throw; every Server
  Action catches and calls `actionFailure` (`lib/action-errors.ts`), which
  logs (warn for refused rules, error for faults) and returns a `FormResult`;
  non-application errors are logged and rethrown to the route's error
  boundary. `redirect()` always sits outside the `try`. Client components
  show every result and catch thrown calls. Cleanup after a successful write
  is logged, never thrown.
* **URLs typed by people** are http(s) only (`lib/urls.ts`).
* **Logging:** `createLogger(scope)` in `lib/logging.ts` only; `console.*` is
  lint-forbidden elsewhere.
* **Routes:** every href comes from `lib/routes.ts` (`routes.*` for links,
  `routePatterns.*` for `revalidatePath(pattern, "page")`).
* **Client server state:** TanStack Query only where a Client Component owns
  it (username availability). Server Components call query entry points
  directly.
* **Axios** is for browser → Route Handler and external HTTP APIs, never for
  Supabase.

---

# 17. Routes

| Route | Type | Purpose |
| --- | --- | --- |
| `/` | static | Landing page |
| `/publisher/[username]` | dynamic | Publisher page; `?preview=1` hides the site header |
| `/publisher/[username]/[slug]` | dynamic | Public event page |
| `/auth?mode=login\|signup` | static | Combined sign-in / sign-up |
| `/auth/check-email` | dynamic | After signup without a session; resend |
| `/auth/forgot-password` | static | Request a reset link |
| `/auth/update-password` | dynamic | Set a new password after a recovery link |
| `/auth/link-expired` | static | Failed or reused email link |
| `/auth/confirm` | route handler | Exchanges emailed links |
| `/api/auth/username-available` | route handler | Public availability check |
| `/api/analytics` | route handler | `POST` a page view or ticket click (public; 204/400/500) |
| `/dashboard` | dynamic, protected | Overview with analytics |
| `/dashboard/events` | dynamic, protected | Events list; create/edit dialog |
| `/dashboard/events/[id]/edit` | dynamic, protected | Full editor + lifecycle panel |
| `/dashboard/profile` | dynamic, protected | Profile and media |
| `/dashboard/settings` | dynamic, protected | Email and password |

Every route falls back to `app/not-found.tsx` and `app/error.tsx`
(`app/global-error.tsx` if the root layout fails); dashboard routes have
their own `error`, `not-found` and `loading` inside the shell. Public pages
deliberately have no `loading.tsx`: streaming would send a 200 before
`notFound()` could set the 404.

Usernames live under `/publisher`, so they cannot shadow a top-level route.
`RESERVED_ROUTE_SEGMENTS` is still kept so a username never reads like an
application path. Public pages render dynamically per request (no
`generateStaticParams`), so a new publisher is live immediately.

---

# 18. Discovery and search

**Post-MVP.** The placeholder `/discover` (UI over empty mock data) was
removed on 2026-09-30 rather than shipped half-working; the route name stays
reserved and `events.search_vector` stays in place for it.

**Decided for when it returns:** search uses PostgreSQL — structured filters, indexes and
full-text search over the existing `search_vector`. No Elasticsearch,
OpenSearch, Algolia, Meilisearch or Typesense without a demonstrated need. The
discovery service interface stays abstract enough to swap in a search provider
later without rewriting the UI.

---

# 19. Analytics

Implemented 2026-09-30 from a confirmed `/architect` blueprint.

* **What counts.** A *visit* is a view of a publisher page or an event page,
  once per browser session per page (`sessionStorage`), in the browser after
  render — so crawlers without JS and link prefetches are not counted. A
  *ticket click* is a click on the ticket button (event card or event page),
  once per session per event. The publisher's own visits (signed in as the
  owner) and `?preview=1` are never counted.
* **Write path.** `TrackView` / `TicketLink` (client) → `reportHit` in
  `features/analytics/transport.ts` (Axios, fire-and-forget) →
  `POST /api/analytics` → Zod (`analyticsHitSchema`) → analytics BLL
  (`recordHit`, skips the owner) → DAL → `record_analytics_hit`. The ticket
  link stays a plain anchor to the provider, so it works without JS (just
  uncounted).
* **Read path.** Overview → `getAnalyticsOverview` → BLL builds UTC day
  buckets (7 d, 30 d, or all time from the first hit, 30 empty days when
  there is none) → DAL → `analytics_daily` / `analytics_top_events`.
* **Known limit.** The endpoint is public and unthrottled, so a script can
  inflate a publisher's counts. Rate limiting is post-MVP.

---

# 20. SEO

Implemented: per-page `generateMetadata` titles and descriptions, Open Graph
(event cover; publisher cover or avatar), schema.org `Event` JSON-LD with
status and attendance mode, semantic URLs.

Not implemented: sitemap, `robots`, canonical URLs, Open Graph image
generation.

---

# 21. Performance

Server rendering by default, client components only for interaction,
`next/image`, database indexes, filtering in SQL (the events repository has no
"list everything" method). No Redis or caching layer without evidence.

Known: no pagination anywhere (owner and public lists are unbounded); metadata
and page each fetch the same row; `getCurrentProfile` is not memoised.

---

# 22. Repository structure

```text
app/                       routes (see §17); page-local client components live beside their page
components/
  analytics/  auth/  dashboard/  events/  forms/  layout/  providers/  ui/
features/
  <feature>/
    contracts.ts           Zod schemas, inferred types, compiled parsers
    actions.ts             Server Actions ("use server")
    queries.ts             server-only read entry points
    service.ts             composition root (BLL over DAL + client)
    bll/                   services and *.test.ts
    dal/                   repository contract + Supabase / in-memory adapters
lib/
  supabase/  env/  http/  query/  hooks/
  errors.ts  logging.ts  routes.ts  forms.ts  format.ts  types.ts
  countries.ts  datetime.ts  maps.ts  urls.ts  action-errors.ts
supabase/
  config.toml  migrations/  tests/database/ (pgTAP)
context/                   canonical project docs
.agents/skills/            project skills (.claude/skills is a symlink)
proxy.ts                   session refresh + optimistic redirects
```

Tests are colocated (`features/**/*.test.ts`, `lib/**/*.test.ts`). There is no
`tests/` tree and no E2E suite yet.

---

# 23. Testing

| Layer | State |
| --- | --- |
| BLL unit tests | auth, profiles, events, analytics services (Vitest) |
| Contract tests | auth, profiles, analytics contracts; `lib` countries, datetime, maps, urls, env; reserved-username drift against the migration |
| RLS / storage | pgTAP for profiles, profiles hardening, events, analytics, both buckets — committed, never run as a suite (no Docker); analytics privileges verified read-only against hosted |
| UI / E2E | A signed-out Playwright smoke pass (27 checks) was run on 2026-09-30 from a scratch script; Playwright is not in the repo or CI yet |

Critical journeys that need E2E coverage: registration, login, profile edit,
event create → publish → edit → cancel → delete, public event view,
authorization (cannot see or edit another publisher's draft).

---

# 24. Deployment and environments

Target: GitHub → Vercel (Next.js) + Supabase. Not deployed yet. Environment
variables must be separated between local, preview and production; secrets are
never committed. Before launch: custom SMTP, production site URL and redirect
allow-list, hosted password minimum 8, leaked-password protection on (C2).

---

# 25. Post-MVP target architecture

Retained decisions for later phases. None of this exists yet.

* **Organizations** (deferred, not cancelled): `organizations`,
  `organization_members`, roles `OWNER / ADMIN / EDITOR / VIEWER`, invites,
  membership-aware RLS, public organization pages. Trigger: shared publisher
  accounts or multi-publisher users become a requirement (§6).
* **System roles:** `USER / MODERATOR / ADMIN / SUPER_ADMIN`, derived and
  enforced server-side.
* **Moderation:** hybrid — queue, reports, approve / reject / unpublish /
  remove; a faster path for trusted publishers; no reputation engine.
* **Notifications:** event published / updated / cancelled / postponed,
  moderation results, account security. Simple email first; no notification
  center.
* **Recurrence:** daily, weekly, selected weekdays, monthly, end date — no
  complex engine; the data model must leave room.
* **Maps and location:** Mapbox, geocoding into the existing coordinate
  columns, location picker, browser geolocation for "near me" (never the only
  way to choose a location), distance search with PostGIS where justified.
* **Discovery:** `/discover` with PostgreSQL search over `search_vector`,
  category and date range first; then tags, city, country, event type,
  organizer, free/paid, distance, featured, trending, sorting, pagination.
* **Analytics:** rate limiting on `/api/analytics`, referrers, per-event pages.
* **Media:** event galleries with ordering.
* **SEO:** sitemap, robots, canonical URLs.
* **Visibility:** unlisted / private events.
* **Auth:** Google OAuth, then Apple, passkeys, phone.
* **Payments and ticketing:** checkout, Stripe, orders, refunds, QR tickets,
  payouts, fees — only with explicit approval.
* **Monetization:** featured / promoted events, pro and business plans,
  advanced analytics.
* **Infrastructure, only with evidence:** Redis, a dedicated search engine,
  background workers, a public API, mobile apps.

---

# 26. Agent architecture rules

Before significant work, read this file, `code-standard.md`, and
`ui-registry.md` for UI. Run `/architect` for any non-trivial change.

Always:

* follow this document and preserve feature boundaries;
* reuse existing infrastructure and prefer the simplest solution;
* use Supabase, PostgreSQL and migrations; preserve RLS;
* validate every user-controlled input with Zod at the server boundary;
* keep business rules in the BLL and Supabase access in the DAL;
* use strict TypeScript and infer types from schemas and generated types;
* use TanStack Form / Query / Charts (and Table for data tables) for their
  assigned jobs, Axios for HTTP, the Supabase SDK for Supabase;
* run Biome, typecheck, tests and build;
* update `progress-tracker.md` and `build-plan.md` after meaningful work.

Never, without approval:

* replace Supabase or PostgreSQL, introduce microservices, an ORM, Redis or a
  search engine;
* disable RLS, expose secrets, or add a service-role client;
* call Supabase from UI, actions or route handlers, or put business rules in
  the DAL or UI;
* trust client-side validation or duplicate generated types;
* rewrite architecture during feature work or add large dependencies.

If a feature appears to need an architectural change, document the problem and
the proposed change before implementing it.

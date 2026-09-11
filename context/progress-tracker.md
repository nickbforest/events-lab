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

**Current phase:** Phase 1 — Authentication

**Overall MVP:** Foundation complete; the UI prototype remains mock-backed until
the feature phases replace its temporary adapters.

**Last updated:** 2026-09-11

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

* [ ] Email/password registration
* [ ] Login
* [ ] Logout
* [ ] Email verification
* [ ] Password reset
* [ ] Google OAuth
* [ ] Session management
* [ ] Protected routes

---

# Phase 2 — Profiles

* [ ] Profile schema
* [ ] Profile page
* [ ] Profile editing
* [ ] Avatar
* [ ] Account settings

---

# Phase 3 — Organizations

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

* [ ] Event schema
* [ ] Event statuses
* [ ] Event validation
* [ ] Event creation
* [ ] Event editing
* [ ] Drafts
* [ ] Publishing
* [ ] Cancellation
* [ ] Postponement
* [ ] Completion/archive
* [ ] Slugs
* [ ] Event types
* [ ] Categories
* [ ] Tags
* [ ] Free/paid
* [ ] Online/in-person/hybrid
* [ ] Date/time
* [ ] Timezones
* [ ] Recurrence

---

# Phase 5 — Location & Media

* [ ] Venue
* [ ] Address
* [ ] City
* [ ] Country
* [ ] Coordinates
* [ ] Mapbox
* [ ] Geocoding
* [ ] Browser geolocation
* [ ] Cover image
* [ ] Gallery
* [ ] Image ordering
* [ ] Organization logo
* [ ] User avatar
* [ ] Storage policies

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

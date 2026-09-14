# events-lab — Build Plan

## Purpose

This document defines the order in which events-lab should be built.

The goal is to reach a production-quality MVP without prematurely implementing future features.

---

# Phase 0 — Foundation

## Completion record — 2026-09-11

Phase 0 is complete. The repository now has one package manager, one formatter
and linter, validated environment boundaries, the required application
libraries, feature BLL/DAL seams, Supabase infrastructure, tests, and CI.

The hosted Supabase project is healthy on PostgreSQL 17.6. Its public schema and
migration history are intentionally empty because domain tables begin in later
feature phases. Generated types capture that baseline. Supabase DAL adapters
will be added with each domain schema so they can be typed against real tables
and verified with RLS integration tests.

The local Supabase configuration is committed and ready. Starting the local
stack could not be exercised on this workstation because Docker and Podman are
absent; install either runtime before using `pnpm supabase:start`.

Phase 1 authentication is the next implementation step. The current
localStorage authentication remains explicit prototype scaffolding until that
phase replaces it with Supabase Auth and a Next.js session-refresh proxy.

## Project setup

* [x] Initialize Next.js
* [x] Configure TypeScript
* [x] Enable strict TypeScript compiler options
* [x] Configure pnpm
* [x] Configure Tailwind
* [x] Configure shadcn/ui
* [x] Configure Zod (`zod`)
* [x] Configure TanStack Form (`@tanstack/react-form`)
* [x] Configure TanStack Query (`@tanstack/react-query`) and query-key conventions
* [x] Configure TanStack Table (`@tanstack/react-table`)
* [x] Configure and pin TanStack Charts (`@tanstack/charts`)
* [x] Configure shared Axios (`axios`) clients and typed error mapping
* [x] Configure Biome for linting and formatting
* [x] Initialize Git
* [x] Connect GitHub
* [x] Create context folder
* [x] Configure environment variables
* [x] Create `.env.example`

## Supabase

* [x] Create and verify Supabase project
* [x] Configure Supabase CLI
* [x] Configure local development
* [x] Connect application
* [x] Install `@supabase/supabase-js` and `@supabase/ssr`
* [x] Configure migrations
* [x] Configure generated database types
* [x] Create separate browser and server Supabase clients
* [x] Define and enforce the privileged-client boundary

## Application boundaries

* [x] Create the per-feature BLL/DAL folder convention
* [x] Define BLL contracts and typed application/data-access errors
* [x] Define DAL contracts and in-memory adapters for the prototype
* [x] Add import-boundary enforcement for UI → BLL → DAL → Supabase
* [x] Add shared Zod contract and environment validation conventions
* [x] Add meaningful BLL tests and the DAL/RLS integration-test structure
* [~] Add typed Supabase domain adapters with their feature schemas

## Quality

* [x] Typecheck
* [x] Biome check
* [x] BLL and contract tests
* [x] Production build
* [x] Initial CI

---

# Phase 1 — Authentication

## Completion record — 2026-09-14

Supabase Auth is live and the localStorage prototype is deleted. See
`context/progress-tracker.md` for the full record, validation results and open
follow-ups.

Two deviations from the original plan, both agreed before implementation:

1. **The `profiles` table was built here, not in Phase 2.** Authentication
   without an identity row leaves the dashboard and `/u/:username` broken. The
   full column set was created in one migration because every optional field is
   nullable — Phase 2 now owns profile *editing*, not profile *schema*.
2. **Google OAuth was dropped from this phase** for want of Google Cloud
   credentials, and its non-functional button was removed rather than left in
   place.

Implement:

* [x] Email/password registration
* [x] Login
* [x] Logout
* [x] Email verification
* [x] Password reset
* [~] Google OAuth — deferred, not cancelled
* [x] Protected routes
* [x] Session handling

---

# Phase 2 — User Profiles

The table, its RLS policies and the Supabase DAL adapter already exist from
Phase 1. This phase is the editing experience, not the schema.

Implement:

* [x] User profile — table and public page exist
* [ ] Avatar
* [ ] Name
* [ ] Basic profile information
* [ ] Profile editing
* [ ] Account settings

---

# Phase 3 — Organizations

Implement:

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
* [ ] Organization roles
* [ ] Permissions
* [ ] Public organization page
* [ ] Upcoming events section

---

# Phase 4 — Event Foundation

Implement:

* [ ] Event database model
* [ ] Event statuses
* [ ] Event validation
* [ ] Event types
* [ ] Categories
* [ ] Tags
* [ ] Slug generation
* [ ] Date/time
* [ ] Timezone
* [ ] Free/paid
* [ ] Online/in-person/hybrid

---

# Phase 5 — Event Creation

Create the event creation workflow.

Sections:

1. Basic information
2. Date & time
3. Location
4. Media
5. Ticket/external links
6. Categories/tags
7. Publishing

Features:

* [ ] Create event
* [ ] Save draft
* [ ] Edit event
* [ ] Delete/archive
* [ ] Preview
* [ ] Publish

---

# Phase 6 — Location

Implement:

* [ ] Venue
* [ ] Address
* [ ] City
* [ ] Country
* [ ] Latitude
* [ ] Longitude
* [ ] Mapbox
* [ ] Geocoding
* [ ] Location picker
* [ ] Browser geolocation
* [ ] Nearby-event calculations

---

# Phase 7 — Media

Implement:

* [ ] Event cover image
* [ ] Gallery
* [ ] Image upload
* [ ] Image deletion
* [ ] Gallery ordering
* [ ] Organization logo
* [ ] User avatar
* [ ] File validation
* [ ] Storage policies

---

# Phase 8 — Public Event Pages

Build the main public events-lab experience.

Implement:

* [ ] Event hero
* [ ] Event title
* [ ] Date/time
* [ ] Location
* [ ] Map
* [ ] Organizer
* [ ] Description
* [ ] Gallery
* [ ] Ticket URL
* [ ] External website
* [ ] Social sharing
* [ ] Related events
* [ ] SEO metadata
* [ ] Open Graph
* [ ] Structured event data
* [ ] Responsive layout

---

# Phase 9 — Discovery

Implement:

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
* [ ] Featured events
* [ ] Trending events
* [ ] Sorting
* [ ] Pagination
* [ ] Empty states

---

# Phase 10 — Recurring Events

Implement controlled recurrence:

* [ ] Daily
* [ ] Weekly
* [ ] Selected weekdays
* [ ] Monthly
* [ ] End date
* [ ] Recurrence validation

Do not build an advanced recurrence engine.

---

# Phase 11 — Moderation

Implement:

* [ ] Moderation queue
* [ ] Event reports
* [ ] Approve
* [ ] Reject
* [ ] Unpublish
* [ ] Remove
* [ ] Moderator role
* [ ] Admin role
* [ ] Basic admin dashboard

---

# Phase 12 — Notifications

Implement only required notifications:

* [ ] Event published
* [ ] Event updated
* [ ] Event cancelled
* [ ] Event postponed
* [ ] Moderation result
* [ ] Security/account notifications

---

# Phase 13 — Production Hardening

## Testing

* [ ] Unit tests
* [ ] Integration tests
* [ ] RLS tests
* [ ] E2E tests

## Security

* [ ] Authentication review
* [ ] Authorization review
* [ ] RLS review
* [ ] Storage policies
* [ ] Secret review
* [ ] Input validation
* [ ] Verify every user-controlled input is revalidated with Zod server-side
* [ ] Verify all feature Supabase access goes through the DAL
* [ ] Verify all domain policy is enforced by the BLL and RLS where applicable

## UX

* [ ] Mobile review
* [ ] Tablet review
* [ ] Desktop review
* [ ] Accessibility review
* [ ] Loading states
* [ ] Error states
* [ ] Empty states

## Performance

* [ ] Database indexes
* [ ] Image optimization
* [ ] Query review
* [ ] Bundle review
* [ ] Rendering review

## SEO

* [ ] Metadata
* [ ] Sitemap
* [ ] Robots
* [ ] Open Graph
* [ ] Structured data
* [ ] Canonical URLs

---

# MVP Definition of Done

The MVP is complete when a user can:

```text
Register
   ↓
Create profile
   ↓
Create organization
   ↓
Create event
   ↓
Save draft
   ↓
Add images
   ↓
Add location
   ↓
Publish
   ↓
Receive public URL
   ↓
Share event
```

A visitor can:

```text
Discover
   ↓
Search
   ↓
Filter
   ↓
View event
   ↓
View organizer
   ↓
Open ticket/external website
```

A moderator/admin can:

```text
Review
   ↓
Approve / Reject / Unpublish
```

---

# Explicitly Out of MVP

Do NOT build unless separately approved:

* Native ticket sales
* Stripe marketplace
* Organizer payouts
* Subscription billing
* Native mobile apps
* Microservices
* Redis
* Dedicated search infrastructure
* Advanced recommendation engine
* Following organizations
* Comments
* Reviews
* Complex social features
* Complex notification center
* AI event generation
* Advanced analytics platform

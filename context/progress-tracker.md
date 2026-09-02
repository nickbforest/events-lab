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

**Current phase:** Phase 0 — Foundation

**Overall MVP:** 0%

**Last updated:** 2026-09-01

---

# Phase 0 — Foundation

* [ ] Next.js initialized
* [ ] TypeScript configured
* [ ] pnpm configured
* [ ] Tailwind configured
* [ ] shadcn/ui configured
* [ ] ESLint configured
* [ ] Prettier configured
* [ ] Git initialized
* [ ] GitHub connected
* [x] Context architecture defined
* [x] Supabase selected
* [ ] Supabase project created
* [ ] Supabase CLI configured
* [ ] Environment variables configured
* [ ] Initial CI configured

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

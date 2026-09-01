# EventHub — Build Plan

## Purpose

This document defines the order in which EventHub should be built.

The goal is to reach a production-quality MVP without prematurely implementing future features.

---

# Phase 0 — Foundation

## Project setup

* [ ] Initialize Next.js
* [ ] Configure TypeScript
* [ ] Configure pnpm
* [ ] Configure Tailwind
* [ ] Configure shadcn/ui
* [ ] Configure ESLint
* [ ] Configure Prettier
* [ ] Initialize Git
* [ ] Connect GitHub
* [ ] Create context folder
* [ ] Configure environment variables
* [ ] Create `.env.example`

## Supabase

* [ ] Create Supabase project
* [ ] Configure Supabase CLI
* [ ] Configure local development
* [ ] Connect application
* [ ] Configure migrations
* [ ] Configure generated database types

## Quality

* [ ] Typecheck
* [ ] Lint
* [ ] Production build
* [ ] Initial CI

---

# Phase 1 — Authentication

Implement:

* [ ] Email/password registration
* [ ] Login
* [ ] Logout
* [ ] Email verification
* [ ] Password reset
* [ ] Google OAuth
* [ ] Protected routes
* [ ] Session handling

---

# Phase 2 — User Profiles

Implement:

* [ ] User profile
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

Build the main public EventHub experience.

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

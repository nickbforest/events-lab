# EventHub — Architecture

## 1. Purpose

EventHub is a modern SaaS platform for creating, managing, publishing, discovering, and promoting upcoming events.

The platform is intended for:

* Music artists
* Bands
* Theaters
* Cinemas
* Sports teams
* Event organizers
* Schools
* Universities
* Conference organizers
* Churches
* Communities
* Venues
* Local businesses
* Other organizations and individuals

The core product concept is:

> Create an event → publish it → make it discoverable → share it.

This document is the architectural source of truth for the project.

Any significant architectural change must be explicitly approved before implementation.

---

# 2. Core Architecture Decision

## 2.1 Architectural style

EventHub will use a:

> **Modular Monolith**

for the MVP.

We explicitly do NOT use microservices for the MVP.

The application should have clear internal domain boundaries while remaining one deployable application.

Initial domains:

```text
Authentication
Users / Profiles
Organizations
Organization Memberships
Events
Venues / Locations
Categories
Tags
Discovery / Search
Media
Moderation
Administration
Notifications
```

This allows EventHub to scale without introducing distributed-system complexity prematurely.

Future services may be extracted only when real scale or operational requirements justify them.

---

# 3. Technology Stack

## Frontend

* Next.js
* React
* TypeScript

## Package manager

* pnpm

## UI

* Tailwind CSS
* shadcn/ui
* Lucide Icons

## Backend / Application Layer

* Next.js server-side architecture
* Server Components where appropriate
* Server Actions where appropriate
* Route Handlers for explicit API endpoints/integrations

## Backend Platform

* Supabase

## Database

* PostgreSQL managed by Supabase

## Authentication

* Supabase Auth

## Authorization

* PostgreSQL Row Level Security (RLS)
* Server-side authorization
* Application permission checks

## Storage

* Supabase Storage

## Validation

* Zod

## Forms

* React Hook Form

## Maps / Geolocation

* Mapbox

## Testing

* Vitest
* Playwright

## Code Quality

* TypeScript
* ESLint
* Prettier

## Source Control

* Git
* GitHub

## Deployment

* Vercel for the Next.js application
* Supabase for backend infrastructure

---

# 4. Why Supabase

Supabase is the selected backend platform for EventHub.

Supabase provides:

* PostgreSQL
* Authentication
* Storage
* Row Level Security
* database migrations
* generated database types
* realtime capabilities if required later
* managed infrastructure

This significantly reduces MVP infrastructure complexity.

The project should use Supabase as an integrated backend platform rather than treating it only as a database provider.

---

# 5. ORM Decision

Do NOT introduce Prisma or Drizzle by default.

For MVP use:

* Supabase PostgreSQL
* Supabase migrations
* Supabase-generated TypeScript database types
* Supabase client/server libraries

An ORM may be introduced later only when there is a demonstrated architectural need.

Codex must not introduce an ORM merely because it is commonly used.

---

# 6. User Architecture

The primary relationship is:

```text
User
  ↓
Profile
  ↓
Organizations
  ↓
Events
```

A user may:

* have one profile
* create multiple organizations
* belong to multiple organizations
* manage multiple events
* have different permissions in different organizations

---

# 7. Organization Architecture

Organizations represent entities that publish events.

Organization types may include:

```text
ARTIST
BAND
THEATER
CINEMA
SPORTS_TEAM
EVENT_ORGANIZER
SCHOOL
UNIVERSITY
CONFERENCE_ORGANIZER
CHURCH
COMMUNITY
VENUE
BUSINESS
OTHER
```

Organization type is a classification.

It is NOT a security role.

---

# 8. Roles

## System roles

```text
USER
MODERATOR
ADMIN
SUPER_ADMIN
```

## Organization roles

```text
OWNER
ADMIN
EDITOR
VIEWER
```

Permissions must be derived from roles and enforced server-side.

Client-side UI restrictions are not a security boundary.

---

# 9. Organization Public Pages

Organizations have public pages.

A public organization page may contain:

* logo
* name
* organization type
* description
* website
* social links
* location
* upcoming events
* past events where appropriate

The MVP does NOT include following organizations.

Organization pages are primarily informational and provide context around the organization's events.

---

# 10. Event Architecture

The Event entity is the core domain object.

An Event should support:

```text
id
organization_id
title
slug
short_description
description

cover_image
gallery

event_type
category
tags

start_at
end_at
timezone

venue
address
city
country
latitude
longitude

location_type
price_type
ticket_url
external_url

social_links

recurrence

status

published_at
created_at
updated_at
```

The exact database normalization should be determined during schema design.

Do not store relational data in JSON when a proper relational model is appropriate.

---

# 11. Event Status

MVP statuses:

```text
DRAFT
PUBLISHED
CANCELLED
POSTPONED
COMPLETED
ARCHIVED
```

Event lifecycle must be explicit.

Example:

```text
DRAFT
  ↓
PUBLISHED
  ↓
COMPLETED
```

or:

```text
PUBLISHED
  ↓
POSTPONED
  ↓
PUBLISHED
```

or:

```text
PUBLISHED
  ↓
CANCELLED
```

---

# 12. Event Visibility

The MVP supports public events and drafts.

Public event pages are accessible without authentication when the event is published.

The architecture may support unlisted/private events later.

---

# 13. Event Recurrence

MVP supports controlled recurring events.

Initial recurrence requirements:

* Daily
* Weekly
* Selected weekdays
* Monthly
* End date

Avoid building a highly complex recurrence engine.

The data model must leave room for future expansion.

---

# 14. Event Location

Events support:

* venue
* address
* city
* country
* latitude
* longitude
* online/in-person/hybrid

Mapbox is the selected map/geolocation provider.

Users may manually select locations.

The browser may also request geolocation for:

> Events near me

Browser geolocation must never be the only method of choosing a location.

---

# 15. Geographic Search

EventHub should support:

* city search
* country search
* distance from user
* nearby events

Latitude and longitude must be stored for events with physical locations.

Use PostgreSQL geospatial capabilities/PostGIS where justified.

Do not introduce a separate geospatial service for MVP.

---

# 16. Date and Time

Events must support timezone-aware dates.

Store:

```text
start_at
end_at
timezone
```

Timezone should use IANA timezone identifiers.

Example:

```text
Asia/Tbilisi
America/New_York
Europe/London
```

Never store an event's time only as a formatted display string.

---

# 17. Event Types

The MVP should support at minimum:

```text
IN_PERSON
ONLINE
HYBRID
```

This is separate from the event category.

---

# 18. Categories and Tags

Categories provide structured classification.

Tags provide flexible classification.

Example:

```text
Category:
Concert

Tags:
jazz
live-music
tbilisi
weekend
```

Categories should be centrally managed.

Tags should be reusable.

---

# 19. Discovery

EventHub discovery must support:

* Search
* Categories
* Tags
* Location
* City
* Country
* Date
* Date range
* Event type
* Organizer
* Free/paid
* Online/in-person/hybrid
* Distance
* Featured events
* Trending events
* Sorting
* Pagination

---

# 20. Search Strategy

MVP search will use PostgreSQL.

Start with:

* PostgreSQL indexes
* PostgreSQL full-text search where appropriate
* structured filtering

Do NOT add:

* Elasticsearch
* OpenSearch
* Algolia
* Meilisearch
* Typesense

unless actual requirements justify them.

The application search API should be abstracted enough that a dedicated search provider can be added later without rewriting the entire UI.

---

# 21. Tickets

Native ticket sales are NOT part of MVP.

Events may contain:

```text
is_free
ticket_url
price_information
external_url
```

The primary flow is:

```text
EventHub
   ↓
Event page
   ↓
Get tickets
   ↓
External ticket provider
```

---

# 22. Payments

No native payments in MVP.

Future architecture may support:

* ticket checkout
* Stripe
* orders
* refunds
* QR tickets
* organizer payouts
* transaction fees

Do not implement these until explicitly approved.

---

# 23. Business Model

MVP should prioritize adoption.

Initial model:

> Free event publishing.

Potential future monetization:

* Featured events
* Promoted events
* Organizer Pro
* Business plans
* Advanced analytics
* Native ticketing fees

Subscription/billing infrastructure is not required for MVP.

---

# 24. Authentication

Use Supabase Auth.

MVP:

* Email/password
* Google OAuth
* Email verification
* Password reset
* Secure sessions

Future:

* Apple
* Passkeys
* Additional OAuth providers
* Phone authentication

Authentication must be enforced server-side.

---

# 25. Authorization

Authorization must be layered.

```text
UI restrictions
      ↓
Server-side authorization
      ↓
Supabase / PostgreSQL RLS
```

Never rely only on the frontend.

Example:

```text
Organization OWNER
    ↓
can manage organization

Organization EDITOR
    ↓
can manage permitted content

Organization VIEWER
    ↓
read-only
```

---

# 26. Row Level Security

RLS is mandatory for protected data.

Examples:

A user may edit:

```text
their profile
organizations they manage
events they are authorized to manage
```

A user must not automatically be able to edit another user's data.

RLS policies must be created alongside protected tables.

Never disable RLS to make a feature easier to implement.

---

# 27. Supabase Service Role

The Supabase service-role key is a privileged secret.

It must:

* never be exposed to the browser
* never be included in client bundles
* never be committed to Git
* never be logged

Use privileged server-side access only when genuinely required.

---

# 28. Media

Use Supabase Storage.

MVP media:

* event cover images
* event gallery images
* organization logos
* user avatars

Expected capabilities:

* upload
* delete
* reorder
* validate file type
* validate size
* optimize images where appropriate

Storage policies must be explicitly defined.

---

# 29. Notifications

Potential MVP notifications:

* Event published
* Event updated
* Event cancelled
* Event postponed
* Moderation decision
* Account/security events

The notification system should remain simple.

Do not build a complex notification center unless required.

---

# 30. Moderation

EventHub uses hybrid moderation.

Possible flow:

```text
New organizer
     ↓
Moderation may be required
     ↓
Approve
     ↓
Publish
```

Trusted organizers may receive a faster publishing path.

Moderators/admins can:

* approve
* reject
* unpublish
* remove
* review reports

Do not build an unnecessarily complex reputation system in MVP.

---

# 31. SEO

Public event and organization pages are important acquisition surfaces.

Support:

* SEO metadata
* Open Graph
* social sharing metadata
* canonical URLs
* sitemap
* robots configuration
* event structured data
* semantic URLs

Public event pages should be indexable when appropriate.

---

# 32. Performance

MVP performance priorities:

* server rendering where appropriate
* optimized images
* pagination
* database indexes
* efficient queries
* avoid N+1 queries
* minimize unnecessary client JavaScript
* lazy loading for heavy content
* responsive performance

Do not add Redis or complex caching without evidence that it is necessary.

---

# 33. API / Application Layer

The application layer belongs primarily inside Next.js.

Use:

* Server Components
* Server Actions
* Route Handlers

as appropriate.

Do not create a separate backend service during MVP.

Business logic must not be embedded directly in page components.

---

# 34. Repository Architecture

Initial structure:

```text
eventhub/
├── app/
│   ├── (marketing)/
│   ├── (auth)/
│   ├── dashboard/
│   ├── events/
│   ├── organizations/
│   ├── discover/
│   └── admin/
│
├── components/
│   ├── ui/
│   ├── layout/
│   └── shared/
│
├── features/
│   ├── auth/
│   ├── users/
│   ├── organizations/
│   ├── events/
│   ├── discovery/
│   ├── moderation/
│   └── media/
│
├── lib/
│   ├── supabase/
│   ├── validation/
│   ├── permissions/
│   ├── maps/
│   └── utils/
│
├── supabase/
│   ├── migrations/
│   ├── seed/
│   └── config.toml
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
│
├── public/
│
├── context/
│   ├── Architecture.md
│   ├── build-plan.md
│   ├── code-standards.md
│   ├── progress-tracker.md
│   ├── ui-registry.md
│   └── ui-rules.md
│
├── .env.example
├── package.json
├── tsconfig.json
└── ...
```

This structure may evolve when implementation provides evidence for a better structure.

---

# 35. Database Principles

Use relational PostgreSQL modeling.

Prefer:

* foreign keys
* unique constraints
* check constraints
* indexes
* normalized relationships
* explicit join tables
* timestamps
* migrations

Avoid:

* duplicated relational data
* giant JSON blobs
* implicit relationships
* database logic hidden only in frontend code

---

# 36. Testing

Critical flows require tests.

Minimum:

* TypeScript
* ESLint
* production build
* unit tests
* integration tests
* RLS/security tests
* Playwright E2E tests

Critical journeys:

1. Registration
2. Login
3. Organization creation
4. Event creation
5. Event editing
6. Event publishing
7. Public event viewing
8. Event search
9. Event filtering
10. Authorization

---

# 37. Deployment

Production architecture:

```text
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js
   │
   ├── Supabase Auth
   ├── Supabase PostgreSQL
   └── Supabase Storage
```

Environment variables must be separated between:

* local
* preview
* production

Secrets must never be committed.

---

# 38. Future Infrastructure

Possible future additions:

```text
Redis
Dedicated search engine
Background workers
Transactional email provider
Analytics
CDN/object storage expansion
Native payments
Ticketing
Mobile apps
Public API
```

These are not MVP dependencies.

---

# 39. Codex Architecture Rules

Before significant implementation work, Codex must read the relevant context files.

Codex must:

* follow Architecture.md
* preserve modular boundaries
* reuse existing infrastructure
* prefer the simplest solution
* use Supabase
* use PostgreSQL
* use migrations for schema changes
* preserve RLS
* run relevant checks
* update progress-tracker.md after meaningful work

Codex must NOT:

* replace Supabase
* replace PostgreSQL
* introduce microservices
* introduce an ORM without approval
* introduce Redis without approval
* introduce a dedicated search engine without approval
* disable RLS
* expose secrets
* rewrite architecture during normal feature work
* delete major infrastructure without approval
* add large dependencies without justification

If a feature appears to require an architectural change, document the problem and proposed change before implementing it.

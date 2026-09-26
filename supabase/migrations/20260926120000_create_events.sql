-- Events: the core domain object, plus the classification tables it depends on.
--
-- MVP-1 uses the personal publisher model, so an event is owned by a profile
-- and its public URL is /u/:username/:slug. See context/build-plan.md Phase 3
-- for why there is no organizations layer.
--
-- Two deliberate departures from context/Architecture.md:
--
-- 1. There is no `completed` status. Architecture §11 lists one, but whether an
--    event has finished is a fact about `end_at`, not an author's intent, and a
--    stored copy of it needs a scheduled job and disagrees with the date until
--    that job runs. Status holds intent; past-ness is derived in queries.
-- 2. Constraints here are structural only — an end after its start, coordinates
--    in range, a two-letter country. Whether an event is complete enough to
--    publish is a business rule in the BLL, because a draft is allowed to be
--    half-finished and a CHECK would refuse to save one.

create type public.event_type as enum (
  'in_person',
  'online',
  'hybrid'
);

create type public.event_status as enum (
  'draft',
  'published',
  'cancelled',
  'postponed',
  'archived'
);

-- Categories are centrally managed (Architecture §18): they are seeded by
-- migration and have no write policy, so publishers pick from the list but
-- cannot extend it.
create table public.categories (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique
    constraint categories_slug_format check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(slug) between 2 and 48
    ),

  label text not null
    constraint categories_label_length check (
      char_length(trim(label)) between 1 and 48
    ),

  sort_order integer not null default 0
);

insert into public.categories (slug, label, sort_order)
values
  ('concert', 'Concert', 10),
  ('theater', 'Theater', 20),
  ('cinema', 'Cinema', 30),
  ('sports', 'Sports', 40),
  ('conference', 'Conference', 50),
  ('festival', 'Festival', 60),
  ('exhibition', 'Exhibition', 70),
  ('community', 'Community', 80);

-- Tags are free-form but canonical: the slug is the identity, so "Jazz" and
-- "jazz" resolve to one row and tag pages and autocomplete stay coherent.
create table public.tags (
  id uuid primary key default gen_random_uuid(),

  slug text not null unique
    constraint tags_slug_format check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(slug) between 2 and 32
    ),

  label text not null
    constraint tags_label_length check (
      char_length(trim(label)) between 1 and 32
    ),

  created_at timestamptz not null default now()
);

create table public.events (
  id uuid primary key default gen_random_uuid(),

  owner_id uuid not null references public.profiles (id) on delete cascade,

  -- Unique per publisher, not globally: /u/blue-bar/jazz-night and
  -- /u/red-cafe/jazz-night are different events with the same good name.
  slug text not null
    constraint events_slug_format check (
      slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'
      and char_length(slug) between 3 and 160
    ),

  title text not null
    constraint events_title_length check (
      char_length(trim(title)) between 3 and 160
    ),

  short_description text
    constraint events_short_description_length check (
      short_description is null or char_length(short_description) <= 280
    ),

  description text
    constraint events_description_length check (
      description is null or char_length(description) <= 10000
    ),

  -- Restrict, not cascade: deleting a category that events still use should
  -- fail loudly rather than delete the events with it.
  category_id uuid not null references public.categories (id) on delete restrict,

  event_type public.event_type not null default 'in_person',
  status public.event_status not null default 'draft',

  -- Not null even for drafts. Every event has a date, the create form always
  -- asks for one, and a nullable start would put null handling into every
  -- ordering and filtering query for the rest of the project.
  start_at timestamptz not null,
  end_at timestamptz,

  -- IANA identifier. Postgres cannot validate this in a CHECK — the timezone
  -- catalogue is not immutable — so Zod validates it against the runtime's
  -- IANA list at the trust boundary.
  timezone text not null
    constraint events_timezone_length check (
      char_length(timezone) between 3 and 64
    ),

  venue_name text
    constraint events_venue_name_length check (
      venue_name is null or char_length(trim(venue_name)) between 1 and 160
    ),
  address text
    constraint events_address_length check (
      address is null or char_length(trim(address)) between 1 and 240
    ),
  city text
    constraint events_city_length check (
      city is null or char_length(trim(city)) between 1 and 120
    ),
  country_code text
    constraint events_country_code_format check (
      country_code is null or country_code ~ '^[A-Z]{2}$'
    ),
  latitude double precision
    constraint events_latitude_range check (
      latitude is null or latitude between -90 and 90
    ),
  longitude double precision
    constraint events_longitude_range check (
      longitude is null or longitude between -180 and 180
    ),
  online_url text,

  is_free boolean not null default true,
  price_info text
    constraint events_price_info_length check (
      price_info is null or char_length(trim(price_info)) between 1 and 120
    ),
  ticket_url text,
  external_url text,

  cover_image_url text,

  -- Set once, the first time the event goes public. Postponing and
  -- re-publishing does not reset it, so "published on" stays truthful.
  published_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint events_owner_slug_unique unique (owner_id, slug),
  constraint events_end_after_start check (end_at is null or end_at > start_at),

  -- The one non-structural constraint worth keeping in the database: a row
  -- that claims a public status without a publication date is corrupt, not
  -- merely incomplete.
  constraint events_public_status_has_published_at check (
    status in ('draft', 'archived') or published_at is not null
  ),

  -- Written now and unused until the discovery phase. Adding it later would
  -- mean rewriting the table; adding it now costs an index.
  search_vector tsvector generated always as (
    setweight(to_tsvector('simple', coalesce(title, '')), 'A')
    || setweight(to_tsvector('simple', coalesce(short_description, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(city, '')), 'B')
    || setweight(to_tsvector('simple', coalesce(venue_name, '')), 'C')
    || setweight(to_tsvector('simple', coalesce(description, '')), 'D')
  ) stored
);

create table public.event_tags (
  event_id uuid not null references public.events (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,

  primary key (event_id, tag_id)
);

-- The dashboard list: one publisher's events, usually filtered by status.
create index events_owner_status_idx on public.events (owner_id, status);

-- Public upcoming and past lists. Partial, because the anonymous reader never
-- sees the other rows and they would only make the index bigger.
create index events_public_start_at_idx on public.events (start_at)
  where published_at is not null and status not in ('draft', 'archived');

create index events_category_idx on public.events (category_id);
create index events_search_idx on public.events using gin (search_vector);

-- The reverse direction of the join: "which events carry this tag".
create index event_tags_tag_idx on public.event_tags (tag_id);

create trigger events_set_updated_at
  before update on public.events
  for each row
  execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.events enable row level security;
alter table public.event_tags enable row level security;

create policy "Categories are publicly readable"
  on public.categories
  for select
  using (true);

-- Deliberately no write policy: categories change by migration only.

create policy "Tags are publicly readable"
  on public.tags
  for select
  using (true);

-- Any signed-in publisher may mint a tag by using it. Tags carry no ownership
-- and no content beyond their own name, so there is nothing to protect; they
-- are never updated or deleted from the application.
create policy "Signed-in publishers create tags"
  on public.tags
  for insert
  to authenticated
  with check (true);

-- A draft belongs to its owner alone. Cancelled and postponed events stay
-- visible on purpose: someone holding a ticket needs to see that the event was
-- called off, not a 404. Archiving is how a publisher takes a page back down.
create policy "Visible events are publicly readable"
  on public.events
  for select
  using (
    (published_at is not null and status not in ('draft', 'archived'))
    or (select auth.uid()) = owner_id
  );

create policy "Publishers create their own events"
  on public.events
  for insert
  to authenticated
  with check ((select auth.uid()) = owner_id);

create policy "Publishers update their own events"
  on public.events
  for update
  to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

create policy "Publishers delete their own events"
  on public.events
  for delete
  to authenticated
  using ((select auth.uid()) = owner_id);

-- event_tags follows its event: readable when the event is, writable by the
-- event's owner. Referencing public.events from here cannot recurse, and the
-- subqueries are covered by the events primary key.
create policy "Tags of visible events are publicly readable"
  on public.event_tags
  for select
  using (
    exists (
      select 1
      from public.events as event
      where event.id = event_tags.event_id
        and (
          (event.published_at is not null and event.status not in ('draft', 'archived'))
          or (select auth.uid()) = event.owner_id
        )
    )
  );

create policy "Publishers tag their own events"
  on public.event_tags
  for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.events as event
      where event.id = event_tags.event_id
        and event.owner_id = (select auth.uid())
    )
  );

create policy "Publishers untag their own events"
  on public.event_tags
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.events as event
      where event.id = event_tags.event_id
        and event.owner_id = (select auth.uid())
    )
  );

-- Analytics: page views and ticket clicks on a publisher's public surface.
--
-- One row per hit rather than a counter, so the overview can re-window the
-- same data by day (7 days / 30 days / all time). No IP address, user agent,
-- cookie or visitor id is stored: a row says only "someone looked at this"
-- and when.
--
-- Nobody inserts rows directly. Visitors are anonymous, so an insert policy
-- would have to be open to `anon` and could not check that the page is real
-- and public. Writes go through `record_analytics_hit`, a SECURITY DEFINER
-- function that verifies the target itself and derives the owner from the
-- data rather than trusting the caller.

create type public.analytics_metric as enum ('page_view', 'ticket_click');

create table public.analytics_hits (
  id bigint generated always as identity primary key,

  -- The publisher whose surface was hit: the tenant this row belongs to.
  owner_id uuid not null references public.profiles (id) on delete cascade,

  -- The event that was viewed or clicked; null for the publisher page itself.
  event_id uuid references public.events (id) on delete cascade,

  metric public.analytics_metric not null,
  occurred_at timestamptz not null default now(),

  -- A ticket button only exists on an event.
  constraint analytics_hits_click_has_event check (
    metric <> 'ticket_click' or event_id is not null
  )
);

-- Every read is "this owner, this time window".
create index analytics_hits_owner_time_idx
  on public.analytics_hits (owner_id, occurred_at);

-- Covers the foreign key, so deleting an event does not scan the table.
create index analytics_hits_event_idx
  on public.analytics_hits (event_id)
  where event_id is not null;

alter table public.analytics_hits enable row level security;

create policy "Owners read their own analytics"
  on public.analytics_hits
  for select
  to authenticated
  using ((select auth.uid()) = owner_id);

-- No insert, update or delete policy. The table grants are removed as well,
-- so the only write path is the function below.
revoke insert, update, delete, truncate on table public.analytics_hits
  from anon, authenticated;

-- Records one hit on a public page. Returns false, and writes nothing, when
-- the target is unknown or not public — an ordinary outcome for a stale link,
-- not an error.
create function public.record_analytics_hit(
  p_metric public.analytics_metric,
  p_username text,
  p_event_id uuid default null
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  target_owner uuid;
begin
  if p_event_id is null then
    if p_metric <> 'page_view' then
      return false;
    end if;

    select profile.id
      into target_owner
      from public.profiles as profile
     where profile.username = p_username;
  else
    select event.owner_id
      into target_owner
      from public.events as event
      join public.profiles as profile on profile.id = event.owner_id
     where event.id = p_event_id
       and profile.username = p_username
       and event.published_at is not null
       and event.status not in ('draft', 'archived');
  end if;

  if target_owner is null then
    return false;
  end if;

  insert into public.analytics_hits (owner_id, event_id, metric)
  values (target_owner, p_event_id, p_metric);

  return true;
end;
$$;

revoke execute on function public.record_analytics_hit(public.analytics_metric, text, uuid)
  from public;
grant execute on function public.record_analytics_hit(public.analytics_metric, text, uuid)
  to anon, authenticated;

-- Daily counts for one owner. SECURITY INVOKER, so RLS still applies: a caller
-- asking for someone else's id gets no rows. `p_from` null means "all time".
-- Days are UTC, matching the overview's buckets.
create function public.analytics_daily(
  p_owner_id uuid,
  p_from timestamptz,
  p_to timestamptz
)
returns table (day date, metric public.analytics_metric, hits bigint)
language sql
stable
security invoker
set search_path = ''
as $$
  select
    (hit.occurred_at at time zone 'UTC')::date as day,
    hit.metric,
    count(*)::bigint as hits
  from public.analytics_hits as hit
  where hit.owner_id = p_owner_id
    and (p_from is null or hit.occurred_at >= p_from)
    and hit.occurred_at < p_to
  group by 1, 2
  order by 1, 2;
$$;

-- The most-viewed events in a window, with what the overview needs to show
-- and link them. SECURITY INVOKER for the same reason as above.
create function public.analytics_top_events(
  p_owner_id uuid,
  p_from timestamptz,
  p_to timestamptz,
  p_limit integer
)
returns table (
  event_id uuid,
  title text,
  slug text,
  status public.event_status,
  views bigint
)
language sql
stable
security invoker
set search_path = ''
as $$
  select event.id, event.title, event.slug, event.status, count(*)::bigint
  from public.analytics_hits as hit
  join public.events as event on event.id = hit.event_id
  where hit.owner_id = p_owner_id
    and hit.metric = 'page_view'
    and (p_from is null or hit.occurred_at >= p_from)
    and hit.occurred_at < p_to
  group by event.id, event.title, event.slug, event.status
  order by count(*) desc, event.title
  limit least(greatest(p_limit, 1), 20);
$$;

revoke execute on function public.analytics_daily(uuid, timestamptz, timestamptz)
  from public, anon;
grant execute on function public.analytics_daily(uuid, timestamptz, timestamptz)
  to authenticated;

revoke execute on function public.analytics_top_events(uuid, timestamptz, timestamptz, integer)
  from public, anon;
grant execute on function public.analytics_top_events(uuid, timestamptz, timestamptz, integer)
  to authenticated;

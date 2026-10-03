-- A map link the publisher pastes for the venue.
--
-- The "View on map" link was built from the typed address, which lands on the
-- wrong building whenever the address is informal or the geocoder guesses.
-- A publisher already has the exact pin in Google Maps; this lets them share
-- it instead.
--
-- Which hosts count as a map link is decided by the contract
-- (`lib/maps.ts`), not here: the list will change, and a host list in a check
-- constraint would need a migration for every change. The database only
-- guarantees the value is an https link of sane length.
--
-- Nullable, and the UI falls back to the address search: an event without a
-- link keeps working exactly as it did.

alter table public.events
  add column map_url text
    constraint events_map_url_format check (
      map_url is null
      or (map_url ~ '^https://' and char_length(map_url) <= 2048)
    );

comment on column public.events.map_url is
  'Publisher-supplied map link for the venue. Null falls back to an address search.';

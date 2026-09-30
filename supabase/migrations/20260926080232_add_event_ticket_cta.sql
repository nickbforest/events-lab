-- The label on an event's ticket button.
--
-- `ticket_url` already says where the button goes; this says what it reads.
-- A publisher running a free workshop wants "Reserve a seat", a venue wants
-- "Get tickets", a conference wants "Register" — hard-coding one of those in
-- the template made the other two wrong.
--
-- Nullable, and the UI falls back to "Get tickets": an event that only has a
-- URL keeps working exactly as it did.

alter table public.events
  add column ticket_cta_label text
    constraint events_ticket_cta_label_length check (
      ticket_cta_label is null
      or char_length(trim(ticket_cta_label)) between 1 and 40
    );

comment on column public.events.ticket_cta_label is
  'Label for the ticket button. Null falls back to "Get tickets".';

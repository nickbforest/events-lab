import { ImageIcon } from "lucide-react";
import Image from "next/image";

import { countryName } from "@/lib/countries";
import { eventTypeLabel, formatEventDate, isoDateTime } from "@/lib/format";
import type { EventWithRelations } from "@/lib/types";

import { EventRowActions } from "./event-row-actions";

/**
 * The columns a row lays out on from `lg`. Shared with the list's header so
 * the two can never drift apart.
 */
export const EVENT_LIST_COLUMNS =
  "lg:grid lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)_minmax(0,1.3fr)_auto] lg:items-start lg:gap-6";

const labelClass =
  "font-mono text-[0.6875rem] uppercase tracking-widest text-muted-foreground lg:hidden";

/** "OCT 30, 2026 · 8:00 PM" in the event's own timezone. */
function dateTime(iso: string, timeZone: string) {
  const parts = formatEventDate(iso, timeZone);
  return `${parts.month} ${parts.day}, ${parts.year} · ${parts.time}`;
}

/** The end, without repeating the date when it is the same day as the start. */
function endLabel(event: EventWithRelations) {
  if (!event.end_at) {
    return null;
  }
  const start = formatEventDate(event.start_at, event.timezone);
  const end = formatEventDate(event.end_at, event.timezone);
  const sameDay =
    start.day === end.day &&
    start.month === end.month &&
    start.year === end.year;

  return {
    iso: event.end_at,
    label: sameDay ? end.time : dateTime(event.end_at, event.timezone),
  };
}

export interface EventListRowProps {
  event: EventWithRelations;
}

/**
 * One event on the dashboard list: poster first, then everything a publisher
 * checks at a glance — title, category, when it starts and ends, the venue
 * and its address — then the row's actions.
 *
 * Every fact shows at every width: a stacked card below `lg` (each fact
 * labelled, since there is no column header to say what it is, with the
 * actions under a divider) and a four-column row from `lg`.
 */
export function EventListRow({ event }: EventListRowProps) {
  const end = endLabel(event);
  const country = countryName(event.country_code);
  const cityLine = [event.city, country].filter(Boolean).join(", ");
  const isOnline = event.event_type === "online";

  return (
    <li
      className={`flex flex-col gap-4 border-t border-border px-5 py-5 transition-colors first:border-t-0 hover:bg-white/[0.02] ${EVENT_LIST_COLUMNS}`}
    >
      <div className="flex min-w-0 items-start gap-4">
        <div className="relative grid size-16 shrink-0 place-items-center overflow-hidden rounded bg-secondary">
          {event.cover_image_url ? (
            <Image
              src={event.cover_image_url}
              alt=""
              fill
              sizes="4rem"
              className="object-cover"
            />
          ) : (
            <ImageIcon className="size-5 text-muted-foreground" aria-hidden />
          )}
        </div>
        <div className="min-w-0">
          <div className="break-words font-display font-extrabold uppercase tracking-tight">
            {event.title}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {event.category.label}
          </div>
        </div>
      </div>

      <div className="min-w-0 font-mono text-xs leading-relaxed">
        <div className={labelClass}>When</div>
        <div>
          <span className="text-muted-foreground">Starts </span>
          <time dateTime={isoDateTime(event.start_at)}>
            {dateTime(event.start_at, event.timezone)}
          </time>
        </div>
        {end ? (
          <div>
            <span className="text-muted-foreground">Ends </span>
            <time dateTime={isoDateTime(end.iso)}>{end.label}</time>
          </div>
        ) : null}
      </div>

      <div className="min-w-0 font-mono text-xs leading-relaxed">
        <div className={labelClass}>Location</div>
        {event.venue_name ? (
          <div className="break-words">{event.venue_name}</div>
        ) : null}
        {event.address ? (
          <div className="break-words text-muted-foreground">
            {event.address}
          </div>
        ) : null}
        {cityLine ? (
          <div className="text-muted-foreground">{cityLine}</div>
        ) : null}
        {event.event_type !== "in_person" ? (
          <div className="text-muted-foreground">
            {eventTypeLabel(event.event_type)}
          </div>
        ) : null}
        {!isOnline && !event.venue_name && !event.address && !cityLine ? (
          <div className="text-muted-foreground">Not set yet</div>
        ) : null}
      </div>

      {/* On a phone the actions close the card under a divider, so they
          read as the card's controls rather than one more fact. */}
      <div className="border-t border-border pt-4 lg:border-t-0 lg:pt-0">
        <EventRowActions event={event} />
      </div>
    </li>
  );
}

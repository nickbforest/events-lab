import { ArrowUpRight, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { TicketLink } from "@/components/analytics/ticket-link";
import { countryName } from "@/lib/countries";
import {
  DEFAULT_TICKET_LABEL,
  eventTypeLabel,
  formatEventDate,
  formatEventTimeRange,
  isoDateTime,
} from "@/lib/format";
import { mapSearchUrl } from "@/lib/maps";
import { routes } from "@/lib/routes";
import type { EventWithRelations } from "@/lib/types";
import { EventStatusBadge } from "./event-status-badge";

export interface EventCardProps {
  event: EventWithRelations;
}

/**
 * An event in a listing, carrying everything someone needs to decide without
 * opening it: when, where, what it is, and how to get in.
 *
 * The whole card opens the event, but it is not wrapped in an anchor — the
 * ticket and map links inside it would be nested anchors, which is invalid
 * and which browsers handle by breaking one of them. Instead the title's link
 * stretches over the card with `after:absolute after:inset-0`, and the two
 * inner links sit above it on `relative z-10`. One primary target, two real
 * controls, valid markup.
 */
export function EventCard({ event }: EventCardProps) {
  const date = formatEventDate(event.start_at, event.timezone);
  const country = countryName(event.country_code);
  const showStatus = event.status !== "published";

  const mapUrl = mapSearchUrl({
    venueName: event.venue_name,
    address: event.address,
    city: event.city,
    country,
    latitude: event.latitude,
    longitude: event.longitude,
  });

  const cityLine = [event.city, country].filter(Boolean).join(", ");
  const hasLocation = Boolean(event.venue_name ?? event.address ?? cityLine);
  const ticketLabel = event.ticket_cta_label ?? DEFAULT_TICKET_LABEL;
  const isCancelled = event.status === "cancelled";

  return (
    <article className="group relative flex flex-col gap-6 rounded-lg border border-border bg-card/30 p-6 transition-colors hover:border-primary/50 md:flex-row md:gap-8">
      {/* Date rail: category, day, month — the first thing scanned. */}
      <div className="flex shrink-0 flex-row items-center gap-4 md:w-40 md:flex-col md:items-start md:gap-0">
        <div className="min-w-0">
          <div className="font-mono text-xs uppercase tracking-widest text-primary">
            {event.category.label}
          </div>
          <time
            dateTime={isoDateTime(event.start_at)}
            className="block font-display text-4xl font-extrabold leading-none tracking-tight md:text-5xl"
          >
            {date.day}
          </time>
          <div className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {date.month} {date.year}
          </div>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            {formatEventTimeRange(event.start_at, event.end_at, event.timezone)}
          </div>
        </div>

        {event.cover_image_url ? (
          <div className="relative aspect-square w-24 shrink-0 overflow-hidden rounded bg-secondary md:mt-5 md:w-40">
            <Image
              src={event.cover_image_url}
              alt=""
              fill
              sizes="(max-width: 768px) 6rem, 10rem"
              className="object-cover"
            />
          </div>
        ) : null}
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h3 className="font-display text-2xl font-extrabold uppercase tracking-tight transition-colors group-hover:text-primary md:text-3xl">
            <Link
              href={routes.event(event.owner.username, event.slug)}
              className="after:absolute after:inset-0 after:content-['']"
            >
              {event.title}
            </Link>
          </h3>
          {showStatus ? <EventStatusBadge status={event.status} /> : null}
        </div>

        {event.short_description ? (
          <p className="mb-5 text-base text-muted-foreground">
            {event.short_description}
          </p>
        ) : null}

        {hasLocation ? (
          <div className="mb-5 border-l-2 border-primary pl-4">
            <div className="flex items-start gap-2">
              <MapPin
                className="mt-0.5 size-4 shrink-0 text-primary"
                aria-hidden
              />
              <div className="min-w-0 font-mono text-xs uppercase leading-relaxed">
                {event.venue_name ? (
                  <div className="text-foreground">{event.venue_name}</div>
                ) : null}
                {event.address ? (
                  <div className="text-muted-foreground">{event.address}</div>
                ) : null}
                {cityLine ? (
                  <div className="text-muted-foreground">{cityLine}</div>
                ) : null}
                {event.event_type !== "in_person" ? (
                  <div className="text-muted-foreground">
                    {eventTypeLabel(event.event_type)}
                  </div>
                ) : null}
                {mapUrl ? (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative z-10 mt-1 inline-flex items-center gap-1 text-primary transition-opacity hover:opacity-80"
                  >
                    View on map
                    <ArrowUpRight className="size-3" aria-hidden />
                    <span className="sr-only">
                      {" "}
                      for {event.title}, opens in a new tab
                    </span>
                  </a>
                ) : null}
              </div>
            </div>
          </div>
        ) : null}

        {event.description ? (
          // Clamped: a listing where one event runs three screens long stops
          // being a listing. The event page has the whole thing.
          <p className="mb-5 line-clamp-4 text-sm leading-relaxed text-foreground/80">
            {event.description}
          </p>
        ) : null}

        {!isCancelled && event.ticket_url ? (
          <TicketLink
            href={event.ticket_url}
            username={event.owner.username}
            eventId={event.id}
            className="relative z-10 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            {ticketLabel}
            <ArrowUpRight className="size-4" aria-hidden />
            <span className="sr-only">
              {" "}
              for {event.title}, opens in a new tab
            </span>
          </TicketLink>
        ) : null}
      </div>
    </article>
  );
}

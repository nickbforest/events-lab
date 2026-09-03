import Image from "next/image";
import Link from "next/link";
import { EventStatusBadge } from "./event-status-badge";
import {
  eventTypeLabel,
  formatEventDate,
  formatEventTimeRange,
  isoDateTime,
  priceLabel,
} from "@/lib/format";
import type { EventWithRelations } from "@/lib/types";

/**
 * ui-rules.md §5 — one clear clickable area, no controls nested inside.
 * Order of emphasis: date, title, location, organizer, price.
 */
export function EventCard({ event }: { event: EventWithRelations }) {
  const date = formatEventDate(event.start_at, event.timezone);
  const showStatus = event.status !== "published";

  const meta = [
    event.venue_name,
    event.city,
    event.event_type !== "in_person" ? eventTypeLabel(event.event_type) : null,
    priceLabel(event.is_free, event.price_info),
  ].filter(Boolean) as string[];

  return (
    <Link
      href={`/u/${event.owner.username}/${event.slug}`}
      className="group flex flex-col gap-6 rounded-lg border border-border bg-card/30 p-6 transition-colors hover:border-primary/50 md:flex-row"
    >
      <div className="flex shrink-0 flex-row items-baseline gap-3 md:w-32 md:flex-col md:items-start md:gap-1">
        <time
          dateTime={isoDateTime(event.start_at)}
          className="font-mono text-sm text-primary"
        >
          {date.month} {date.day} / {date.year}
        </time>
        <span className="font-mono text-xs uppercase text-muted-foreground">
          {formatEventTimeRange(event.start_at, null, event.timezone)}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <h3 className="font-display text-xl font-extrabold uppercase tracking-tight transition-colors group-hover:text-primary md:text-2xl">
            {event.title}
          </h3>
          {showStatus && <EventStatusBadge status={event.status} />}
        </div>

        {event.short_description && (
          <p className="mb-3 line-clamp-2 text-sm text-muted-foreground">
            {event.short_description}
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase text-muted-foreground">
          <span className="text-foreground/70">{event.category.label}</span>
          {meta.map((item) => (
            <span key={item} className="flex items-center gap-3">
              <span aria-hidden className="size-1 rounded-full bg-border" />
              {item}
            </span>
          ))}
        </div>
      </div>

      {event.cover_image_url && (
        <div className="relative aspect-[4/3] shrink-0 overflow-hidden rounded bg-secondary md:size-32">
          <Image
            src={event.cover_image_url}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 128px"
            className="object-cover"
          />
        </div>
      )}
    </Link>
  );
}

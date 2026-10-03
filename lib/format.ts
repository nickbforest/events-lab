import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { EventStatus, EventType, PublisherType } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats an event's instant in the event's own timezone — not the viewer's.
 * An 8pm concert in Tbilisi reads as 8pm to everyone looking at it.
 */
function partsInZone(iso: string, timeZone: string) {
  const date = new Date(iso);
  const fmt = (options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-US", { ...options, timeZone }).format(date);

  return {
    day: fmt({ day: "2-digit" }),
    month: fmt({ month: "short" }).toUpperCase(),
    year: fmt({ year: "numeric" }),
    weekday: fmt({ weekday: "long" }),
    full: fmt({
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    }),
    time: fmt({ hour: "numeric", minute: "2-digit", hour12: true }),
  };
}

export function formatEventDate(iso: string, timeZone: string) {
  return partsInZone(iso, timeZone);
}

export function formatEventTimeRange(
  startIso: string,
  endIso: string | null,
  timeZone: string,
) {
  const start = partsInZone(startIso, timeZone).time;
  if (!endIso) {
    return start;
  }
  return `${start} — ${partsInZone(endIso, timeZone).time}`;
}

/** Machine-readable datetime for <time dateTime> and JSON-LD. */
export function isoDateTime(iso: string) {
  return new Date(iso).toISOString();
}

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

export function eventTypeLabel(type: EventType) {
  return EVENT_TYPE_LABELS[type];
}

const PUBLISHER_TYPE_LABELS: Record<PublisherType, string> = {
  artist: "Artist",
  band: "Band",
  theater: "Theater",
  cinema: "Cinema",
  sports_team: "Sports team",
  event_organizer: "Event organizer",
  school: "School",
  university: "University",
  conference_organizer: "Conference organizer",
  church: "Church",
  community: "Community",
  venue: "Venue",
  business: "Business",
  other: "Other",
};

export function publisherTypeLabel(type: PublisherType) {
  return PUBLISHER_TYPE_LABELS[type];
}

/**
 * Status presentation. ui-rules.md §16 — status is never communicated by
 * colour alone, so every entry carries a label as well as a tone.
 */
export const EVENT_STATUS_META: Record<
  EventStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Draft",
    className: "border-border bg-white/[0.04] text-muted-foreground",
  },
  published: {
    label: "Published",
    className: "border-primary/30 bg-primary/10 text-primary",
  },
  cancelled: {
    label: "Cancelled",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
  },
  postponed: {
    label: "Postponed",
    className: "border-warning/30 bg-warning/10 text-warning",
  },
  archived: {
    label: "Archived",
    className: "border-border bg-white/[0.04] text-muted-foreground",
  },
};

/** The ticket button's words when the publisher did not choose any. */
export const DEFAULT_TICKET_LABEL = "Get tickets";

export function priceLabel(isFree: boolean, priceInfo: string | null) {
  if (isFree) {
    return "Free";
  }
  return priceInfo?.trim() || "Paid";
}

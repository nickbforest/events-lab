import { EVENTS, PROFILES, CATEGORIES } from "@/lib/mock-data";
import type { EventRecord, EventWithRelations } from "@/lib/types";

export const DATE_RANGES = ["upcoming", "today", "week", "month"] as const;
export type DateRange = (typeof DATE_RANGES)[number];

export interface DiscoverFilters {
  q?: string;
  category?: string;
  range?: DateRange;
}

/**
 * Parses raw searchParams into a valid filter set.
 *
 * Anything unrecognised is dropped rather than thrown — a hand-edited URL
 * should degrade to the default view, never to an error page. Zod replaces
 * this once validation is introduced.
 */
export function parseDiscoverFilters(
  params: Record<string, string | string[] | undefined>,
): DiscoverFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const q = first(params.q)?.trim();
  const category = first(params.category);
  const range = first(params.range);

  return {
    q: q || undefined,
    category: CATEGORIES.some((c) => c.slug === category)
      ? category
      : undefined,
    range: DATE_RANGES.includes(range as DateRange)
      ? (range as DateRange)
      : "upcoming",
  };
}

function rangeEnd(range: DateRange): number | null {
  const end = new Date();
  switch (range) {
    case "today":
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    case "week":
      end.setDate(end.getDate() + 7);
      return end.getTime();
    case "month":
      end.setMonth(end.getMonth() + 1);
      return end.getTime();
    case "upcoming":
      return null;
  }
}

/**
 * Stands in for a single filtered PostgreSQL query against the full-text
 * search vector. The real version filters in the database, not in memory.
 */
export async function discoverEvents(
  filters: DiscoverFilters,
): Promise<EventWithRelations[]> {
  const now = Date.now();
  const until = rangeEnd(filters.range ?? "upcoming");
  const needle = filters.q?.toLowerCase();

  const matchesSearch = (event: EventRecord) => {
    if (!needle) return true;
    const owner = PROFILES.find((p) => p.id === event.owner_id);
    const haystack = [
      event.title,
      event.short_description,
      event.venue_name,
      event.city,
      owner?.display_name,
      ...event.tags,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(needle);
  };

  const matchesCategory = (event: EventRecord) => {
    if (!filters.category) return true;
    const category = CATEGORIES.find((c) => c.id === event.category_id);
    return category?.slug === filters.category;
  };

  return EVENTS.filter((event) => {
    if (event.status !== "published" && event.status !== "postponed") {
      return false;
    }
    const startsAt = Date.parse(event.start_at);
    if (startsAt < now) return false;
    if (until !== null && startsAt > until) return false;
    return matchesSearch(event) && matchesCategory(event);
  })
    .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at))
    .map((event) => {
      const owner = PROFILES.find((p) => p.id === event.owner_id)!;
      const category = CATEGORIES.find((c) => c.id === event.category_id)!;
      return { ...event, owner, category };
    });
}

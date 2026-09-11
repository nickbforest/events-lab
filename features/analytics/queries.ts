import { ANALYTICS, CATEGORIES, EVENTS, PROFILES } from "@/lib/mock-data";
import type {
  AnalyticsRecord,
  EventRecord,
  EventWithRelations,
} from "@/lib/types";

/**
 * Read paths for publisher analytics.
 *
 * Same seam as the other feature queries: async, owner-scoped, and shaped the
 * way the Supabase call will be. In PostgreSQL this becomes one grouped query
 * per window with RLS restricting rows to `owner_id = auth.uid()` — the owner
 * id is never taken from the client.
 *
 * Buckets are UTC days. Windowing must not shift when the viewer travels, and
 * the daily series has to line up with the totals shown beside it.
 */

export const ANALYTICS_RANGES = ["7d", "30d", "all"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

/** Days shown when a range has no recorded traffic to bound it. */
const DEFAULT_WINDOW_DAYS = 30;

const RANGE_DAYS: Record<Exclude<AnalyticsRange, "all">, number> = {
  "7d": 7,
  "30d": 30,
};

export interface AnalyticsPoint {
  /** UTC calendar day, `YYYY-MM-DD`. */
  date: string;
  visits: number;
  clicks: number;
}

export interface MostViewedEntry {
  event: EventWithRelations;
  views: number;
}

export interface AnalyticsOverview {
  range: AnalyticsRange;
  rangeLabel: string;
  siteVisits: number;
  ticketClicks: number;
  series: AnalyticsPoint[];
  mostViewed: MostViewedEntry[];
}

/**
 * Anything unrecognised falls back to the default window rather than throwing.
 * A hand-edited URL should degrade to the normal view, never to an error page.
 * Zod replaces this once validation is introduced.
 */
export function parseAnalyticsRange(
  params: Record<string, string | string[] | undefined>,
): AnalyticsRange {
  const raw = Array.isArray(params.range) ? params.range[0] : params.range;
  return ANALYTICS_RANGES.includes(raw as AnalyticsRange)
    ? (raw as AnalyticsRange)
    : "30d";
}

const DAY_MS = 86_400_000;

/** UTC midnight of the day an instant falls in. */
function dayStart(ms: number) {
  return Math.floor(ms / DAY_MS) * DAY_MS;
}

function dayKey(ms: number) {
  return new Date(ms).toISOString().slice(0, 10);
}

function join(event: EventRecord): EventWithRelations {
  const owner = PROFILES.find((p) => p.id === event.owner_id);
  const category = CATEGORIES.find((c) => c.id === event.category_id);

  if (!owner || !category) {
    throw new Error(`Event ${event.id} references a missing relation`);
  }

  return { ...event, owner, category };
}

/**
 * Inclusive UTC day bounds for a range.
 *
 * `all` starts at the publisher's first recorded hit, so the axis describes
 * the data that exists instead of an arbitrary span of empty days. With no
 * data at all every range still returns a window, because an empty chart with
 * a real axis reads as "no traffic yet" while a chart with no axis reads as
 * broken.
 */
function windowFor(range: AnalyticsRange, rows: AnalyticsRecord[]) {
  const end = dayStart(Date.now());

  if (range !== "all") {
    return { start: end - (RANGE_DAYS[range] - 1) * DAY_MS, end };
  }

  const earliest = rows.reduce<number | null>((min, row) => {
    const day = dayStart(Date.parse(row.occurred_at));
    return min === null || day < min ? day : min;
  }, null);

  return {
    start: Math.min(earliest ?? end, end),
    end,
  };
}

export async function getAnalyticsOverview(
  ownerId: string,
  range: AnalyticsRange,
): Promise<AnalyticsOverview> {
  const owned = ANALYTICS.filter((row) => row.owner_id === ownerId);
  const { start, end } = windowFor(range, owned);

  // A single-day span (no data, or a first day of traffic) has no shape to
  // plot, so `all` widens to the default window rather than drawing one tick.
  const from = start === end && range === "all"
    ? end - (DEFAULT_WINDOW_DAYS - 1) * DAY_MS
    : start;

  const buckets = new Map<string, AnalyticsPoint>();
  for (let day = from; day <= end; day += DAY_MS) {
    buckets.set(dayKey(day), { date: dayKey(day), visits: 0, clicks: 0 });
  }

  const viewsByEvent = new Map<string, number>();
  let siteVisits = 0;
  let ticketClicks = 0;

  for (const row of owned) {
    const day = dayStart(Date.parse(row.occurred_at));
    if (day < from || day > end) continue;

    const bucket = buckets.get(dayKey(day));
    if (!bucket) continue;

    if (row.metric === "page_view") {
      bucket.visits += 1;
      siteVisits += 1;
      if (row.event_id) {
        viewsByEvent.set(row.event_id, (viewsByEvent.get(row.event_id) ?? 0) + 1);
      }
    } else {
      bucket.clicks += 1;
      ticketClicks += 1;
    }
  }

  const mostViewed = [...viewsByEvent.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .flatMap(([eventId, views]) => {
      const event = EVENTS.find((e) => e.id === eventId);
      return event ? [{ event: join(event), views }] : [];
    });

  return {
    range,
    rangeLabel: ANALYTICS_RANGE_LABELS[range],
    siteVisits,
    ticketClicks,
    series: [...buckets.values()],
    mostViewed,
  };
}

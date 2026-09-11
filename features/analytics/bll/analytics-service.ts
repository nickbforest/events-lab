import {
  ANALYTICS_RANGE_LABELS,
  type AnalyticsPoint,
  type AnalyticsRange,
} from "@/features/analytics/contracts";
import type { AnalyticsRepository } from "@/features/analytics/dal/analytics-repository";
import { DataAccessError } from "@/lib/errors";
import type {
  AnalyticsRecord,
  EventRecord,
  EventWithRelations,
} from "@/lib/types";

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

type Clock = () => Date;

const DAY_MS = 86_400_000;
const DEFAULT_WINDOW_DAYS = 30;
const RANGE_DAYS = { "7d": 7, "30d": 30 } as const;

const dayStart = (milliseconds: number) =>
  Math.floor(milliseconds / DAY_MS) * DAY_MS;
const dayKey = (milliseconds: number) =>
  new Date(milliseconds).toISOString().slice(0, 10);

function windowFor(
  range: AnalyticsRange,
  rows: readonly AnalyticsRecord[],
  now: number,
) {
  const end = dayStart(now);
  if (range !== "all") {
    return { start: end - (RANGE_DAYS[range] - 1) * DAY_MS, end };
  }

  const earliest = rows.reduce<number | null>((minimum, row) => {
    const day = dayStart(Date.parse(row.occurred_at));
    return minimum === null || day < minimum ? day : minimum;
  }, null);

  return { start: Math.min(earliest ?? end, end), end };
}

export function createAnalyticsService(
  repository: AnalyticsRepository,
  clock: Clock = () => new Date(),
) {
  return {
    async getOverview(
      ownerId: string,
      range: AnalyticsRange,
    ): Promise<AnalyticsOverview> {
      const [analytics, events, profiles, categories] = await Promise.all([
        repository.listAnalytics(),
        repository.listEvents(),
        repository.listProfiles(),
        repository.listCategories(),
      ]);
      const owned = analytics.filter((row) => row.owner_id === ownerId);
      const { start, end } = windowFor(range, owned, clock().getTime());
      const from =
        start === end && range === "all"
          ? end - (DEFAULT_WINDOW_DAYS - 1) * DAY_MS
          : start;
      const buckets = new Map<string, AnalyticsPoint>();

      for (let day = from; day <= end; day += DAY_MS) {
        buckets.set(dayKey(day), {
          date: dayKey(day),
          visits: 0,
          clicks: 0,
        });
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
            viewsByEvent.set(
              row.event_id,
              (viewsByEvent.get(row.event_id) ?? 0) + 1,
            );
          }
        } else {
          bucket.clicks += 1;
          ticketClicks += 1;
        }
      }

      const join = (event: EventRecord): EventWithRelations => {
        const owner = profiles.find((profile) => profile.id === event.owner_id);
        const category = categories.find(
          (candidate) => candidate.id === event.category_id,
        );
        if (!owner || !category) {
          throw new DataAccessError(
            `Event ${event.id} references a missing relation.`,
          );
        }
        return { ...event, owner, category };
      };

      const mostViewed = [...viewsByEvent.entries()]
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .flatMap(([eventId, views]) => {
          const event = events.find((candidate) => candidate.id === eventId);
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
    },
  };
}

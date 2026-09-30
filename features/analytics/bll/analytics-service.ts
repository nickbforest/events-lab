import {
  ANALYTICS_RANGE_LABELS,
  type AnalyticsHitInput,
  type AnalyticsPoint,
  type AnalyticsRange,
} from "@/features/analytics/contracts";
import type {
  AnalyticsRepository,
  AnalyticsWindow,
  TopEventRow,
} from "@/features/analytics/dal/analytics-repository";
import { createLogger } from "@/lib/logging";
import type { Profile } from "@/lib/types";

const log = createLogger("analytics.service");

/**
 * Publisher lookup lives in the profiles domain. Analytics depends on this
 * narrow port rather than the whole profiles service, as auth does.
 */
export interface PublisherLookupPort {
  getProfileByUsername(username: string): Promise<Profile | null>;
}

export type MostViewedEntry = TopEventRow;

export interface AnalyticsOverview {
  range: AnalyticsRange;
  rangeLabel: string;
  siteVisits: number;
  ticketClicks: number;
  series: AnalyticsPoint[];
  mostViewed: MostViewedEntry[];
}

/**
 * What happened to a reported hit. Only `recorded` wrote a row; the others
 * are ordinary outcomes the caller does not surface to the visitor.
 */
export type RecordHitOutcome = "recorded" | "own_visit" | "not_public";

export interface AnalyticsService {
  getOverview(
    ownerId: string,
    range: AnalyticsRange,
  ): Promise<AnalyticsOverview>;
  /**
   * `viewerId` is the signed-in account looking at the page, from the
   * verified session, or null for an anonymous visitor.
   */
  recordHit(
    viewerId: string | null,
    hit: AnalyticsHitInput,
  ): Promise<RecordHitOutcome>;
}

type Clock = () => Date;

const DAY_MS = 86_400_000;
const EMPTY_WINDOW_DAYS = 30;
const RANGE_DAYS = { "7d": 7, "30d": 30 } as const;
const MOST_VIEWED_LIMIT = 5;

const dayStart = (milliseconds: number) =>
  Math.floor(milliseconds / DAY_MS) * DAY_MS;
const dayKey = (milliseconds: number) =>
  new Date(milliseconds).toISOString().slice(0, 10);

export function createAnalyticsService(
  repository: AnalyticsRepository,
  publishers: PublisherLookupPort,
  clock: Clock = () => new Date(),
): AnalyticsService {
  return {
    async getOverview(ownerId, range) {
      // Days are UTC, matching `analytics_daily`.
      const today = dayStart(clock().getTime());
      const window: AnalyticsWindow = {
        ownerId,
        from:
          range === "all"
            ? null
            : new Date(today - (RANGE_DAYS[range] - 1) * DAY_MS).toISOString(),
        to: new Date(today + DAY_MS).toISOString(),
      };

      const [daily, mostViewed] = await Promise.all([
        repository.dailyCounts(window),
        repository.topEvents(window, MOST_VIEWED_LIMIT),
      ]);

      // "All time" starts at the first recorded day; with too little history
      // to draw a line, it shows the same 30 days a new publisher sees.
      const earliest = daily.length > 0 ? Date.parse(daily[0].day) : null;
      const first =
        window.from !== null
          ? Date.parse(window.from)
          : earliest !== null && earliest < today
            ? earliest
            : today - (EMPTY_WINDOW_DAYS - 1) * DAY_MS;

      const buckets = new Map<string, AnalyticsPoint>();
      for (let day = first; day <= today; day += DAY_MS) {
        buckets.set(dayKey(day), { date: dayKey(day), visits: 0, clicks: 0 });
      }

      let siteVisits = 0;
      let ticketClicks = 0;
      for (const row of daily) {
        const bucket = buckets.get(row.day);
        if (!bucket) {
          continue;
        }
        if (row.metric === "page_view") {
          bucket.visits += row.hits;
          siteVisits += row.hits;
        } else {
          bucket.clicks += row.hits;
          ticketClicks += row.hits;
        }
      }

      return {
        range,
        rangeLabel: ANALYTICS_RANGE_LABELS[range],
        siteVisits,
        ticketClicks,
        series: [...buckets.values()],
        mostViewed,
      };
    },

    async recordHit(viewerId, hit) {
      const publisher = await publishers.getProfileByUsername(hit.username);
      if (!publisher) {
        return "not_public";
      }

      // A publisher checking their own page is not an audience. Counting it
      // would make every edit-and-look cycle read as traffic.
      if (viewerId !== null && viewerId === publisher.id) {
        return "own_visit";
      }

      const recorded = await repository.recordHit(
        hit.metric,
        hit.username,
        hit.eventId,
      );

      if (!recorded) {
        log.debug("Hit ignored: the page is not public.", {
          metric: hit.metric,
          eventId: hit.eventId,
        });
        return "not_public";
      }

      return "recorded";
    },
  };
}

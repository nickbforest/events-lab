import type { AnalyticsMetric } from "@/features/analytics/contracts";
import type { EventStatus } from "@/lib/types";

export interface DailyHitCount {
  /** UTC day, `YYYY-MM-DD`. */
  day: string;
  metric: AnalyticsMetric;
  hits: number;
}

export interface TopEventRow {
  eventId: string;
  title: string;
  slug: string;
  status: EventStatus;
  views: number;
}

export interface AnalyticsWindow {
  ownerId: string;
  /** Inclusive; null means "since the first hit". */
  from: string | null;
  /** Exclusive. */
  to: string;
}

/**
 * Aggregation happens in SQL (`analytics_daily`, `analytics_top_events`), so
 * the application never loads individual hits — an "all time" overview reads
 * one row per day, not one row per visit.
 */
export interface AnalyticsRepository {
  /**
   * Records one hit through `record_analytics_hit`. False when the database
   * found nothing public to attribute it to, which is not an error.
   */
  recordHit(
    metric: AnalyticsMetric,
    username: string,
    eventId: string | null,
  ): Promise<boolean>;

  dailyCounts(window: AnalyticsWindow): Promise<DailyHitCount[]>;

  topEvents(window: AnalyticsWindow, limit: number): Promise<TopEventRow[]>;
}

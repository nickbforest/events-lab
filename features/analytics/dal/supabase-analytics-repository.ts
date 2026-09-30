import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type { AnalyticsRepository } from "@/features/analytics/dal/analytics-repository";
import { DataAccessError } from "@/lib/errors";
import type { Database } from "@/lib/supabase/database.types";

/**
 * `analytics_daily` treats a null start as "all time", but the generated
 * argument type cannot express that, so all time is sent as the epoch.
 */
const ALL_TIME = new Date(0).toISOString();

export function createSupabaseAnalyticsRepository(
  client: SupabaseClient<Database>,
): AnalyticsRepository {
  return {
    async recordHit(metric, username, eventId) {
      const { data, error } = await client.rpc("record_analytics_hit", {
        p_metric: metric,
        p_username: username,
        ...(eventId ? { p_event_id: eventId } : {}),
      });

      if (error) {
        throw new DataAccessError("Failed to record an analytics hit.", error);
      }

      return data === true;
    },

    async dailyCounts({ ownerId, from, to }) {
      const { data, error } = await client.rpc("analytics_daily", {
        p_owner_id: ownerId,
        p_from: from ?? ALL_TIME,
        p_to: to,
      });

      if (error) {
        throw new DataAccessError("Failed to load daily analytics.", error);
      }

      return data.map((row) => ({
        day: row.day,
        metric: row.metric,
        hits: Number(row.hits),
      }));
    },

    async topEvents({ ownerId, from, to }, limit) {
      const { data, error } = await client.rpc("analytics_top_events", {
        p_owner_id: ownerId,
        p_from: from ?? ALL_TIME,
        p_to: to,
        p_limit: limit,
      });

      if (error) {
        throw new DataAccessError("Failed to load most viewed events.", error);
      }

      return data.map((row) => ({
        eventId: row.event_id,
        title: row.title,
        slug: row.slug,
        status: row.status,
        views: Number(row.views),
      }));
    },
  };
}

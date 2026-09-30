import "server-only";

import {
  type AnalyticsService,
  createAnalyticsService,
} from "@/features/analytics/bll/analytics-service";
import { createSupabaseAnalyticsRepository } from "@/features/analytics/dal/supabase-analytics-repository";
import { createProfilesServiceFor } from "@/features/profiles/service";
import { createClient } from "@/lib/supabase/server";

/**
 * The request-scoped client for both directions: reads run as the signed-in
 * owner so RLS scopes them, and writes run as whoever is visiting (anon or
 * signed in), which `record_analytics_hit` accepts from either.
 */
export async function getAnalyticsService(): Promise<AnalyticsService> {
  const client = await createClient();

  return createAnalyticsService(
    createSupabaseAnalyticsRepository(client),
    createProfilesServiceFor(client),
  );
}

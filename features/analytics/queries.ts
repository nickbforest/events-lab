import "server-only";

import {
  type AnalyticsRange,
  analyticsOwnerIdSchema,
} from "@/features/analytics/contracts";
import { getAnalyticsService } from "@/features/analytics/service";

export type {
  AnalyticsOverview,
  MostViewedEntry,
} from "@/features/analytics/bll/analytics-service";
export { parseAnalyticsRange } from "@/features/analytics/contracts";

export async function getAnalyticsOverview(
  ownerId: string,
  range: AnalyticsRange,
) {
  const service = await getAnalyticsService();
  return service.getOverview(analyticsOwnerIdSchema.parse(ownerId), range);
}

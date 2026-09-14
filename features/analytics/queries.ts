import "server-only";

import { createAnalyticsService } from "@/features/analytics/bll/analytics-service";
import {
  type AnalyticsRange,
  analyticsOwnerIdSchema,
} from "@/features/analytics/contracts";
import { InMemoryAnalyticsRepository } from "@/features/analytics/dal/in-memory-analytics-repository";

export type { AnalyticsOverview } from "@/features/analytics/bll/analytics-service";
export { parseAnalyticsRange } from "@/features/analytics/contracts";

const analyticsService = createAnalyticsService(
  new InMemoryAnalyticsRepository(),
);

export async function getAnalyticsOverview(
  ownerId: string,
  range: AnalyticsRange,
) {
  return analyticsService.getOverview(
    analyticsOwnerIdSchema.parse(ownerId),
    range,
  );
}

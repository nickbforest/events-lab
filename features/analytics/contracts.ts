import { z } from "zod";

export const ANALYTICS_RANGES = ["7d", "30d", "all"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export interface AnalyticsPoint {
  date: string;
  visits: number;
  clicks: number;
}

const analyticsRangeSchema = z.enum(ANALYTICS_RANGES);
export const analyticsOwnerIdSchema = z.string().trim().min(1).max(128);

export function parseAnalyticsRange(
  params: Record<string, string | string[] | undefined>,
): AnalyticsRange {
  const raw = Array.isArray(params.range) ? params.range[0] : params.range;
  const result = analyticsRangeSchema.safeParse(raw);
  return result.success ? result.data : "30d";
}

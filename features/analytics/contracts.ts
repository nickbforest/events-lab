import { z } from "zod";

import { usernameSchema } from "@/features/profiles/contracts";
import { Constants } from "@/lib/supabase/database.types";

export const ANALYTICS_RANGES = ["7d", "30d", "all"] as const;
export type AnalyticsRange = (typeof ANALYTICS_RANGES)[number];

export const ANALYTICS_RANGE_LABELS: Record<AnalyticsRange, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  all: "All time",
};

export interface AnalyticsPoint {
  /** UTC day, `YYYY-MM-DD`. */
  date: string;
  visits: number;
  clicks: number;
}

const analyticsRangeSchema = z.enum(ANALYTICS_RANGES);
export const analyticsOwnerIdSchema = z.uuid();

/** Derived from the generated enum, so a new metric is a compile error here. */
export const analyticsMetricSchema = z.enum(
  Constants.public.Enums.analytics_metric,
);
export type AnalyticsMetric = z.infer<typeof analyticsMetricSchema>;

/**
 * One hit, as a public page reports it. Everything here is visitor-supplied,
 * so none of it is trusted: the database function re-checks that the page
 * exists and is public, and derives the owner itself.
 */
export const analyticsHitSchema = z
  .object({
    metric: analyticsMetricSchema,
    username: usernameSchema,
    eventId: z.uuid().nullable().default(null),
  })
  .refine((hit) => hit.metric !== "ticket_click" || hit.eventId !== null, {
    error: "A ticket click belongs to an event.",
    path: ["eventId"],
  });

export type AnalyticsHitInput = z.infer<typeof analyticsHitSchema>;
export type AnalyticsHitPayload = z.input<typeof analyticsHitSchema>;

export const compiledAnalyticsHitSchema = z.compile(analyticsHitSchema);

export function parseAnalyticsRange(
  params: Record<string, string | string[] | undefined>,
): AnalyticsRange {
  const raw = Array.isArray(params.range) ? params.range[0] : params.range;
  const result = analyticsRangeSchema.safeParse(raw);
  return result.success ? result.data : "30d";
}

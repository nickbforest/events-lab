import { z } from "zod";

export const DATE_RANGES = ["upcoming", "today", "week", "month"] as const;

export const discoverFiltersSchema = z.object({
  q: z.string().trim().max(120).optional(),
  category: z.string().trim().max(80).optional(),
  range: z.enum(DATE_RANGES).default("upcoming"),
});

export type DateRange = (typeof DATE_RANGES)[number];
export type DiscoverFilters = z.infer<typeof discoverFiltersSchema>;

export function parseDiscoverFilters(
  params: Record<string, string | string[] | undefined>,
): DiscoverFilters {
  const first = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  const result = discoverFiltersSchema.safeParse({
    q: first(params.q) || undefined,
    category: first(params.category) || undefined,
    range: first(params.range),
  });

  return result.success ? result.data : { range: "upcoming" };
}

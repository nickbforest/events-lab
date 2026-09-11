import Link from "next/link";
import {
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_RANGES,
  type AnalyticsRange,
} from "@/features/analytics/contracts";
import { cn } from "@/lib/format";

/**
 * Time-range selector for the overview.
 *
 * Links rather than buttons: the range is read on the server to build the
 * series, so it belongs in the URL — which also makes a range shareable and
 * survivable across a refresh, and keeps the page a Server Component.
 */
export function RangeTabs({
  active,
  basePath = "/dashboard",
}: {
  active: AnalyticsRange;
  basePath?: string;
}) {
  return (
    <nav
      aria-label="Time range"
      className="inline-flex overflow-hidden rounded-md border border-border"
    >
      {ANALYTICS_RANGES.map((range) => {
        const isActive = range === active;

        return (
          <Link
            key={range}
            href={`${basePath}?range=${range}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "border-l border-border px-4 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors first:border-l-0",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
            )}
          >
            {ANALYTICS_RANGE_LABELS[range]}
          </Link>
        );
      })}
    </nav>
  );
}

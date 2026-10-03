import Link from "next/link";
import {
  ANALYTICS_RANGE_LABELS,
  ANALYTICS_RANGES,
  type AnalyticsRange,
} from "@/features/analytics/contracts";
import { cn } from "@/lib/format";
import { routes } from "@/lib/routes";

export interface RangeTabsProps {
  active: AnalyticsRange;
  basePath?: string;
}

/**
 * Time-range selector for the overview.
 *
 * Links rather than buttons: the range is read on the server to build the
 * series, so it belongs in the URL — which also makes a range shareable and
 * survivable across a refresh, and keeps the page a Server Component.
 */
export function RangeTabs({
  active,
  basePath = routes.dashboard.root(),
}: RangeTabsProps) {
  return (
    <nav
      aria-label="Time range"
      className="inline-flex rounded-full border border-border bg-white/[0.03] p-1"
    >
      {ANALYTICS_RANGES.map((range) => {
        const isActive = range === active;

        return (
          <Link
            key={range}
            href={`${basePath}?range=${range}`}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200",
              isActive
                ? "bg-primary text-primary-foreground shadow-glow"
                : "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
            )}
          >
            {ANALYTICS_RANGE_LABELS[range]}
          </Link>
        );
      })}
    </nav>
  );
}

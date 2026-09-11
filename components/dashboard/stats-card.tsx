import type { ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * A headline metric. Per the dataviz form heuristic a single number is a stat
 * tile, not a chart — the trend beside it is what gets plotted.
 *
 * Tiles sit inside `StatsCardRow` so a set of them reads as one panel divided
 * by hairlines rather than as separate floating cards.
 */
export function StatsCard({
  label,
  value,
  icon,
  accent = false,
}: {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="p-6">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
        {icon && (
          <div className="shrink-0 text-muted-foreground" aria-hidden>
            {icon}
          </div>
        )}
      </div>
      <div
        className={cn(
          "font-display text-4xl font-extrabold tracking-tighter tabular-nums md:text-5xl",
          accent && "text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/** Groups stat tiles into one bordered panel split by hairline dividers. */
export function StatsCardRow({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 divide-y divide-border overflow-hidden rounded-lg border border-border bg-card/30 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
      {children}
    </div>
  );
}

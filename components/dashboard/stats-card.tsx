import type { ReactNode } from "react";
import { cn } from "@/lib/format";

export interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: ReactNode;
  accent?: boolean;
}

/**
 * A headline metric. Per the dataviz form heuristic a single number is a stat
 * tile, not a chart — the trend beside it is what gets plotted.
 *
 * Tiles sit inside `StatsCardRow`. The accent tile (the metric that matters
 * most) carries the lime value and a faint lime glow.
 */
export function StatsCard({
  label,
  value,
  icon,
  accent = false,
}: StatsCardProps) {
  return (
    <div className="surface rounded-2xl relative isolate overflow-hidden p-6">
      {accent ? (
        <div
          aria-hidden
          className="absolute -top-16 -right-16 -z-10 size-40 rounded-full bg-primary/15 blur-3xl"
        />
      ) : null}
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="text-sm font-medium text-muted-foreground">{label}</div>
        {icon ? (
          <div
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-xl ring-1 ring-border",
              accent
                ? "bg-primary/10 text-primary"
                : "bg-white/[0.04] text-muted-foreground",
            )}
            aria-hidden
          >
            {icon}
          </div>
        ) : null}
      </div>
      <div
        className={cn(
          "font-display text-4xl font-semibold tracking-tight tabular-nums md:text-5xl",
          accent && "text-primary",
        )}
      >
        {value}
      </div>
    </div>
  );
}

export interface StatsCardRowProps {
  children: ReactNode;
}

/** Lays stat tiles out side by side from `sm`, stacked on a phone. */
export function StatsCardRow({ children }: StatsCardRowProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
  );
}

"use client";

import { defineChart, lineY } from "@tanstack/charts";
import { crosshair } from "@tanstack/charts/crosshair";
import { Chart } from "@tanstack/charts/react";
import { scaleLinear } from "@tanstack/charts/scales/linear";
import { scalePoint } from "@tanstack/charts/scales/point";
import { tooltip } from "@tanstack/charts/tooltip";
import { useMemo } from "react";
import type { AnalyticsPoint } from "@/features/analytics/contracts";

/**
 * Daily visits against ticket clicks.
 *
 * Two series on one shared y-axis — both are counts of the same thing (a
 * person doing something on a public page), so a second scale would invent a
 * correlation the data does not support.
 *
 * The palette is the project accent stepped down until it clears the dark
 * surface checks; the pair was validated for colour-vision deficiency rather
 * than eyeballed, so do not "brighten" these without re-validating.
 */
const SERIES = [
  { key: "visits", label: "Site visits", color: "#7E9F30", dash: undefined },
  { key: "clicks", label: "Ticket clicks", color: "#3B82F6", dash: "6 4" },
] as const;

/** `2026-09-09` → `09-09`. The year lives in the card title, not on every tick. */
function tickLabel(date: string) {
  return date.slice(5);
}

export function TrendChart({
  series,
  caption,
}: {
  series: AnalyticsPoint[];
  caption: string;
}) {
  const definition = useMemo(
    () =>
      defineChart({
        marks: [
          lineY(series, {
            id: "visits",
            x: "date",
            y: "visits",
            stroke: SERIES[0].color,
            strokeWidth: 2,
          }),
          lineY(series, {
            id: "clicks",
            x: "date",
            y: "clicks",
            stroke: SERIES[1].color,
            strokeWidth: 2,
            strokeDasharray: SERIES[1].dash,
          }),
          crosshair({ x: true, y: false }),
        ],
        scales: {
          x: {
            scale: () => scalePoint<string>().padding(0.25),
            axis: {
              ticks: {
                count: Math.min(8, series.length),
                format: tickLabel,
              },
              tickLabels: { fontSize: 11 },
            },
          },
          y: {
            scale: scaleLinear,
            nice: true,
            grid: true,
            axis: {
              ticks: { count: 3 },
              tickLabels: { fontSize: 11 },
            },
          },
        },
        focus: "group-x",
        maxFocusDistance: Number.POSITIVE_INFINITY,
        svgAnimation: true,
        tooltip,
        theme: {
          foreground: "var(--foreground)",
          muted: "var(--muted-foreground)",
          grid: "var(--border)",
          background: "transparent",
        },
      }),
    [series],
  );

  return (
    <figure className="m-0">
      <div className="font-mono text-[11px] text-muted-foreground">
        <Chart
          definition={definition}
          height={190}
          initialWidth={720}
          ariaLabel={caption}
          ariaDescription="Site visits and ticket clicks by day. A complete data table follows the chart."
        />
      </div>

      <figcaption className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2">
        {SERIES.map((s) => (
          <span
            key={s.key}
            className="flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground"
          >
            <svg aria-hidden width="16" height="2" className="shrink-0">
              <line
                x1="0"
                x2="16"
                y1="1"
                y2="1"
                stroke={s.color}
                strokeWidth={2}
                strokeDasharray={s.dash}
              />
            </svg>
            {s.label}
          </span>
        ))}
      </figcaption>

      {/* Colour alone never carries the numbers — ui-rules.md §16. */}
      <details className="mt-4">
        <summary className="cursor-pointer font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground">
          View as table
        </summary>
        <div className="mt-3 max-h-64 overflow-auto rounded-md border border-border">
          <table className="w-full text-left">
            <caption className="sr-only">{caption}</caption>
            <thead className="sticky top-0 bg-card">
              <tr className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                <th scope="col" className="px-4 py-2 font-normal">
                  Day
                </th>
                <th scope="col" className="px-4 py-2 font-normal">
                  Site visits
                </th>
                <th scope="col" className="px-4 py-2 font-normal">
                  Ticket clicks
                </th>
              </tr>
            </thead>
            <tbody>
              {series.map((point) => (
                <tr key={point.date} className="border-t border-border">
                  <th
                    scope="row"
                    className="px-4 py-2 text-left font-mono text-xs font-normal text-muted-foreground"
                  >
                    {point.date}
                  </th>
                  <td className="px-4 py-2 font-mono text-xs tabular-nums">
                    {point.visits}
                  </td>
                  <td className="px-4 py-2 font-mono text-xs tabular-nums">
                    {point.clicks}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}

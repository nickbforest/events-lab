"use client";

import { useId, useRef, useState } from "react";
import type { AnalyticsPoint } from "@/features/analytics/queries";

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

const VIEW_W = 720;
const VIEW_H = 190;
const PAD = { top: 14, right: 20, bottom: 26, left: 40 };

const PLOT_W = VIEW_W - PAD.left - PAD.right;
const PLOT_H = VIEW_H - PAD.top - PAD.bottom;

/** `2026-09-09` → `09-09`. The year lives in the card title, not on every tick. */
function tickLabel(date: string) {
  return date.slice(5);
}

function niceMax(value: number) {
  if (value <= 4) return 4;
  const magnitude = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / magnitude) * magnitude;
}

export function TrendChart({
  series,
  caption,
}: {
  series: AnalyticsPoint[];
  caption: string;
}) {
  const [hovered, setHovered] = useState<number | null>(null);
  const frameRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  const points = series.length > 0 ? series : [{ date: "", visits: 0, clicks: 0 }];
  const max = niceMax(
    Math.max(...points.flatMap((p) => [p.visits, p.clicks]), 0),
  );

  const step = points.length > 1 ? PLOT_W / (points.length - 1) : 0;
  const x = (index: number) =>
    points.length > 1 ? PAD.left + index * step : PAD.left + PLOT_W / 2;
  const y = (value: number) => PAD.top + PLOT_H - (value / max) * PLOT_H;

  const path = (key: (typeof SERIES)[number]["key"]) =>
    points.map((p, i) => `${i === 0 ? "M" : "L"}${x(i)} ${y(p[key])}`).join(" ");

  // Roughly eight ticks whatever the window length, always including the last day.
  const tickEvery = Math.max(1, Math.ceil(points.length / 8));
  const ticks = points
    .map((point, index) => ({ point, index }))
    .filter(({ index }) => (points.length - 1 - index) % tickEvery === 0);

  function locate(clientX: number) {
    const frame = frameRef.current;
    if (!frame || points.length < 2) return;

    const rect = frame.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    const index = Math.round((ratio * VIEW_W - PAD.left) / step);
    setHovered(Math.min(points.length - 1, Math.max(0, index)));
  }

  const active = hovered === null ? null : points[hovered];

  return (
    <figure className="m-0">
      <div ref={frameRef} className="relative">
        <svg
          viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
          className="h-auto w-full touch-none"
          role="img"
          aria-labelledby={titleId}
          onPointerMove={(event) => locate(event.clientX)}
          onPointerLeave={() => setHovered(null)}
        >
          <title id={titleId}>{caption}</title>

          {[0, 0.5, 1].map((fraction) => {
            const value = Math.round(max * fraction);
            const lineY = y(value);
            return (
              <g key={fraction}>
                <line
                  x1={PAD.left}
                  x2={VIEW_W - PAD.right}
                  y1={lineY}
                  y2={lineY}
                  stroke="currentColor"
                  strokeWidth={1}
                  className="text-border"
                />
                <text
                  x={PAD.left - 10}
                  y={lineY + 4}
                  textAnchor="end"
                  className="fill-current font-mono text-[11px] text-muted-foreground"
                >
                  {value}
                </text>
              </g>
            );
          })}

          {ticks.map(({ point, index }) => (
            <text
              key={point.date}
              x={x(index)}
              y={VIEW_H - 8}
              textAnchor="middle"
              className="fill-current font-mono text-[11px] text-muted-foreground"
            >
              {tickLabel(point.date)}
            </text>
          ))}

          {active && hovered !== null && (
            <line
              x1={x(hovered)}
              x2={x(hovered)}
              y1={PAD.top}
              y2={PAD.top + PLOT_H}
              stroke="currentColor"
              strokeWidth={1}
              className="text-muted-foreground"
            />
          )}

          {SERIES.map((s) => (
            <path
              key={s.key}
              d={path(s.key)}
              fill="none"
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dash}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}

          {active &&
            hovered !== null &&
            SERIES.map((s) => (
              <circle
                key={s.key}
                cx={x(hovered)}
                cy={y(active[s.key])}
                r={4}
                fill={s.color}
                stroke="var(--card)"
                strokeWidth={2}
              />
            ))}
        </svg>

        {active && hovered !== null && (
          <div
            className="pointer-events-none absolute top-2 rounded-md border border-border bg-popover px-3 py-2 font-mono text-xs shadow-lg"
            style={{
              left: `${(x(hovered) / VIEW_W) * 100}%`,
              transform:
                hovered > points.length / 2
                  ? "translateX(calc(-100% - 8px))"
                  : "translateX(8px)",
            }}
          >
            <div className="mb-1 text-muted-foreground">{active.date}</div>
            {SERIES.map((s) => (
              <div key={s.key} className="flex items-center gap-2">
                <span
                  aria-hidden
                  className="size-2 rounded-full"
                  style={{ background: s.color }}
                />
                <span className="text-muted-foreground">{s.label}</span>
                <span className="ml-auto tabular-nums">{active[s.key]}</span>
              </div>
            ))}
          </div>
        )}
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
                <th scope="col" className="px-4 py-2 font-normal">Day</th>
                <th scope="col" className="px-4 py-2 font-normal">Site visits</th>
                <th scope="col" className="px-4 py-2 font-normal">Ticket clicks</th>
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

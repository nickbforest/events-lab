import { cn, EVENT_STATUS_META } from "@/lib/format";
import type { EventStatus } from "@/lib/types";

export interface EventStatusBadgeProps {
  status: EventStatus;
  className?: string;
}

/**
 * ui-rules.md §16 — status carries a text label as well as a colour, so it
 * survives greyscale, low vision, and colour-blind viewing.
 */
export function EventStatusBadge({ status, className }: EventStatusBadgeProps) {
  const meta = EVENT_STATUS_META[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded border px-2 py-0.5 font-mono text-[11px] uppercase tracking-widest",
        meta.className,
        className,
      )}
    >
      {meta.label}
    </span>
  );
}

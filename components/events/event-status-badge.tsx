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
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        meta.className,
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-current" />
      {meta.label}
    </span>
  );
}

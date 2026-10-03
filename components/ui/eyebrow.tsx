import type { ReactNode } from "react";

import { cn } from "@/lib/format";

export interface EyebrowProps {
  children: ReactNode;
  /** A pulsing lime dot before the text — for "live", "new" or "free" hooks. */
  dot?: boolean;
  className?: string;
}

/**
 * The kicker above a title, as a soft pill. ui-rules.md §4: kicker → title →
 * context line. Use it for section and page kickers; plain mono labels stay
 * for metadata.
 */
export function Eyebrow({ children, dot = false, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1 text-xs font-medium text-muted-foreground",
        className,
      )}
    >
      {dot ? (
        <span aria-hidden className="relative flex size-1.5">
          <span className="absolute inline-flex size-full animate-ping rounded-full bg-primary opacity-60" />
          <span className="relative inline-flex size-1.5 rounded-full bg-primary" />
        </span>
      ) : null}
      {children}
    </span>
  );
}

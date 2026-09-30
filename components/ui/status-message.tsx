import type { ReactNode } from "react";

import { cn } from "@/lib/format";

/** The one lime action on a status screen. */
export const statusPrimaryActionClass =
  "rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110";

/** A second, quieter way out. */
export const statusSecondaryActionClass =
  "rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5";

export interface StatusMessageProps {
  /** Short mono label above the title, e.g. "404" or "Error". */
  kicker: string;
  title: string;
  description: string;
  /** Links or buttons, primary first. */
  actions?: ReactNode;
  /** `page` fills a public page; `panel` sits inside the dashboard shell. */
  size?: "page" | "panel";
  className?: string;
}

/**
 * A whole-screen state: not found, something broke. The same kicker → display
 * title → muted line hierarchy as every other screen, centred, with a way out.
 *
 * Presentational only, so the not-found pages (Server Components) and the
 * error boundaries (Client Components) share it.
 */
export function StatusMessage({
  kicker,
  title,
  description,
  actions,
  size = "page",
  className,
}: StatusMessageProps) {
  return (
    <div
      className={cn(
        "flex flex-1 flex-col items-center justify-center px-6 text-center",
        size === "page" ? "py-24 md:py-32" : "py-20",
        className,
      )}
    >
      <p className="mb-4 font-mono text-xs uppercase tracking-widest text-primary">
        {kicker}
      </p>
      <h1
        className={cn(
          "mb-4 font-display font-extrabold uppercase tracking-tighter",
          size === "page" ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl",
        )}
      >
        {title}
      </h1>
      <p className="mb-8 max-w-md leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actions ? (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

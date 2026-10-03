import { cn } from "@/lib/format";

export interface AmbientBackgroundProps {
  /**
   * `hero` — grid plus drifting violet and lime glows (landing page).
   * `soft` — a still violet wash at the top (public pages, auth).
   * `quiet` — the faintest wash, for the dashboard.
   */
  variant?: "hero" | "soft" | "quiet";
  className?: string;
}

/**
 * The atmosphere behind a page or section: grid and glows only, never
 * content. Decorative, so hidden from assistive technology and from the
 * pointer. Position its parent `relative isolate` and it fills it.
 *
 * Pure CSS — blurred gradients on composited layers, no JavaScript, and the
 * drift stops under reduced motion (globals.css).
 */
export function AmbientBackground({
  variant = "soft",
  className,
}: AmbientBackgroundProps) {
  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {variant === "hero" ? (
        <>
          <div className="bg-grid absolute inset-0" />
          <div className="absolute -top-40 left-1/2 h-[36rem] w-[56rem] -translate-x-1/2 rounded-full bg-glow/25 blur-[120px]" />
          <div className="animate-drift absolute top-1/3 -left-40 size-[28rem] rounded-full bg-glow-2/20 blur-[110px]" />
          <div className="animate-drift-slow absolute -right-32 bottom-0 size-[26rem] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        </>
      ) : (
        // A radial wash rather than a blurred blob: it fades to nothing on
        // every side, so the box that clips it never shows an edge.
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-[36rem]",
            variant === "soft"
              ? "bg-[radial-gradient(60%_70%_at_50%_0%,color-mix(in_oklab,var(--glow)_16%,transparent),transparent)]"
              : "bg-[radial-gradient(55%_60%_at_50%_0%,color-mix(in_oklab,var(--glow)_9%,transparent),transparent)]",
          )}
        />
      )}
    </div>
  );
}

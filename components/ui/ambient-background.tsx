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
 * Pure CSS — radial gradients, never `filter: blur()` (big blurs left phones
 * painting blank tiles mid-scroll), no JavaScript, and the
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
          <div className="absolute -top-64 left-1/2 h-[52rem] w-[72rem] -translate-x-1/2 bg-radial from-glow/25 to-transparent to-70%" />
          <div className="animate-drift absolute top-1/4 -left-56 size-[40rem] bg-radial from-glow-2/20 to-transparent to-70%" />
          <div className="animate-drift-slow absolute -right-48 -bottom-24 size-[40rem] bg-radial from-primary/10 to-transparent to-70%" />
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

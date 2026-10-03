import { cn } from "@/lib/format";

/**
 * The tail: the final "l" of "eventail", drawn as a stem that sweeps along
 * the baseline and tapers to a point — a tail trailing behind the word. The
 * same path, on a dark tile, is `app/icon.svg`; change both together and
 * regenerate `favicon.ico` / `apple-icon.png`.
 *
 * viewBox 90×80: the ascender top is y=0 and the baseline is y=72, so the
 * sweep dips just below the baseline like a descender.
 */
export const TAIL_PATH =
  "M4 6.5 A6.5 6.5 0 0 1 17 6.5 V50 C17 62 27 67.5 43 67 C60 66.5 76 56 87 35 C80 63 63 80 41 79 C17 79 4 70 4 50 Z";

export interface LogoMarkProps {
  className?: string;
}

/** The tail glyph on its own, coloured by `currentColor`. Decorative. */
export function LogoMark({ className }: LogoMarkProps) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 90 80"
      fill="currentColor"
      className={cn("shrink-0", className)}
    >
      <path d={TAIL_PATH} />
    </svg>
  );
}

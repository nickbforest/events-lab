import { cn } from "@/lib/format";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonClassOptions {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Extra classes (width, margins). Merged last, so they win. */
  className?: string;
}

const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full text-center font-medium transition-all duration-200 ease-[var(--ease-studio)] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50";

const VARIANTS: Record<ButtonVariant, string> = {
  // ui-rules.md §15 — the one lime action per view or card.
  primary:
    "bg-primary text-primary-foreground shadow-glow hover:-translate-y-px hover:brightness-110",
  secondary:
    "border border-border bg-white/[0.04] text-foreground hover:border-white/20 hover:bg-white/[0.08]",
  ghost: "text-muted-foreground hover:bg-white/[0.06] hover:text-foreground",
  // Outlined, never filled.
  destructive:
    "border border-destructive/40 text-destructive hover:border-destructive/70 hover:bg-destructive/10",
};

const SIZES: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-sm",
  lg: "px-7 py-3.5 text-base",
};

/**
 * The one button recipe. A class string rather than a component so the same
 * look applies to a `<button>`, a `<Link>` and a plain `<a>` without a Slot
 * dependency — and so Server Components can use it.
 */
export function buttonClass({
  variant = "primary",
  size = "md",
  className,
}: ButtonClassOptions = {}): string {
  return cn(BASE, VARIANTS[variant], SIZES[size], className);
}

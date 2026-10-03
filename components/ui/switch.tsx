"use client";

import { cn } from "@/lib/format";

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Named for screen readers; the visible text sits beside the track. */
  label: string;
  /** The word shown next to the track, which usually changes with state. */
  stateLabel?: string;
  disabled?: boolean;
  /** Tooltip; use it to say why a disabled switch cannot be changed. */
  title?: string;
  className?: string;
}

/**
 * An on/off toggle.
 *
 * A real `<button role="switch">` with `aria-checked`, not a styled checkbox
 * and not a div: the role is what makes a screen reader announce "switch,
 * on", and the button gives keyboard reach with Space and Enter for free.
 *
 * **The button wraps the label as well as the track.** The text beside a
 * toggle is the obvious thing to aim at, so leaving it outside the control
 * gives a dead zone that shows an arrow and does nothing when clicked. The
 * whole thing is one target.
 *
 * The state is also spelled out in text (ui-rules.md §16): a colour change on
 * its own does not survive greyscale or colour blindness, and "is lime on or
 * off?" is not a question anyone should have to answer.
 */
export function Switch({
  checked,
  onChange,
  label,
  stateLabel,
  disabled = false,
  title,
  className,
}: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      title={title}
      onClick={() => onChange(!checked)}
      className={cn(
        "group inline-flex cursor-pointer items-center gap-3 rounded-md",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full ring-1 transition-all duration-200",
          checked
            ? "bg-primary shadow-glow ring-primary/50"
            : "bg-white/[0.06] ring-border group-hover:bg-white/[0.1]",
        )}
      >
        <span
          className={cn(
            "inline-block size-5 rounded-full shadow-sm transition-transform duration-200 ease-[var(--ease-studio)]",
            checked ? "bg-primary-foreground" : "bg-foreground/80",
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5",
          )}
        />
      </span>

      {stateLabel ? (
        <span
          aria-hidden
          className="text-xs font-medium text-muted-foreground transition-colors group-hover:text-foreground"
        >
          {stateLabel}
        </span>
      ) : null}
    </button>
  );
}

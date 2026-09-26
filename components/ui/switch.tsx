"use client";

import { cn } from "@/lib/format";

export interface SwitchProps {
  checked: boolean;
  onChange: (next: boolean) => void;
  /** Named for screen readers; the visible text sits beside the control. */
  label: string;
  /** The word shown next to the track, which usually changes with state. */
  stateLabel?: string;
  disabled?: boolean;
  className?: string;
}

/**
 * An on/off toggle.
 *
 * A real `<button role="switch">` with `aria-checked`, not a styled checkbox
 * and not a div: the role is what makes a screen reader announce "switch, on"
 * and the button is what makes it reachable by keyboard and operable with
 * Space and Enter for free.
 *
 * The state is also spelled out in text beside the track. ui-rules.md §16 —
 * a colour change on its own does not survive greyscale or colour blindness,
 * and "is lime on or off?" is not a question anyone should have to answer.
 */
export function Switch({
  checked,
  onChange,
  label,
  stateLabel,
  disabled = false,
  className,
}: SwitchProps) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          checked ? "bg-primary" : "bg-secondary",
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        <span className="sr-only">{label}</span>
        <span
          aria-hidden
          className={cn(
            "inline-block size-5 rounded-full bg-background transition-transform",
            checked ? "translate-x-[1.375rem]" : "translate-x-0.5",
          )}
        />
      </button>

      {stateLabel ? (
        <span
          aria-hidden
          className="font-mono text-xs uppercase tracking-widest text-muted-foreground"
        >
          {stateLabel}
        </span>
      ) : null}
    </div>
  );
}

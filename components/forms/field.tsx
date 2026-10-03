import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { cn } from "@/lib/format";

/**
 * 16px text below `sm`: iOS Safari zooms the page into any focused control
 * smaller than that, and the zoom stays after the keyboard closes.
 */
export const fieldControlClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none sm:text-sm";

export type SelectControlProps = ComponentProps<"select">;

/**
 * A native `<select>` the same height as a text input.
 *
 * Browsers draw a select with their own box, which ignores padding and comes
 * out shorter than the inputs beside it (Safari most of all). Dropping the
 * native appearance lets `fieldControlClass` size it like every other field,
 * pinned to the input's height (46px below `sm`, 42px above), with a
 * chevron drawn in its place.
 */
export function SelectControl({
  className,
  children,
  ...props
}: SelectControlProps) {
  return (
    <div className="relative">
      <select
        {...props}
        className={cn(
          fieldControlClass,
          "h-[2.875rem] cursor-pointer appearance-none pr-10 sm:h-[2.625rem]",
          className,
        )}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden
        className="pointer-events-none absolute top-1/2 right-4 size-4 -translate-y-1/2 text-muted-foreground"
      />
    </div>
  );
}

/** The one lime submit button a dashboard form carries. */
export const formSubmitClass =
  "rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * The submit button and its status line closing a full-page form (Profile,
 * Settings): the button spans the form, edge to edge, with the status above.
 */
export const formFooterClass = "flex flex-col gap-4";
export const formSubmitWideClass = `${formSubmitClass} w-full`;

export interface FieldProps {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}

/**
 * Label + control + optional hint, wired together by id.
 *
 * ui-rules.md §13 — every control carries a real `<label>`, and a hint is
 * associated with `aria-describedby` rather than left floating next to it, so
 * screen-reader users get the same guidance sighted users do.
 */
export function Field({ id, label, hint, error, children }: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
      </label>
      {children}
      {/* The error replaces the hint rather than stacking under it: once a
          control is invalid, the correction is the only guidance that matters. */}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 font-mono text-xs leading-relaxed text-destructive"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${id}-hint`}
            className="mt-1.5 font-mono text-xs leading-relaxed text-muted-foreground"
          >
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/** Points a control at whichever message is currently rendered beneath it. */
export function fieldDescribedBy({
  id,
  hasHint = false,
  hasError = false,
}: {
  id: string;
  hasHint?: boolean;
  hasError?: boolean;
}): string | undefined {
  if (hasError) {
    return `${id}-error`;
  }
  if (hasHint) {
    return `${id}-hint`;
  }
  return undefined;
}

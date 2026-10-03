import { ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";
import { cn } from "@/lib/format";

/**
 * 16px text below `sm`: iOS Safari zooms the page into any focused control
 * smaller than that, and the zoom stays after the keyboard closes.
 */
export const fieldControlClass =
  "w-full rounded-lg border border-input bg-white/[0.03] px-4 py-2.5 text-base shadow-[inset_0_1px_2px_hsl(0_0%_0%/0.25)] transition-[border-color,background-color,box-shadow] duration-200 placeholder:text-muted-foreground/70 hover:border-white/20 focus:border-primary/60 focus:bg-white/[0.05] focus:shadow-[0_0_0_4px_color-mix(in_oklab,var(--color-primary)_14%,transparent)] focus:outline-none disabled:cursor-not-allowed disabled:opacity-60 read-only:hover:border-input aria-invalid:border-destructive/60 sm:text-sm";

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
          "h-[2.875rem] cursor-pointer appearance-none pr-10 sm:h-[2.625rem] [&>option]:bg-popover",
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

/**
 * The submit button and its status line closing a full-page form (Profile,
 * Settings). Below `sm` the button spans the form, edge to edge, with the
 * status above it; from `sm` they share a row, status left, button right.
 *
 * The button pins itself right with `ml-auto` rather than relying on
 * `justify-between`, which puts a lone button on the left whenever the
 * status line is empty. One fixed width from `sm`, so every form's submit
 * is the same size whatever its label says.
 */
export const formFooterClass =
  "flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between";
export const formSubmitWideClass = buttonClass({
  className: "w-full sm:ml-auto sm:w-48",
});

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
        className="mb-2 block text-sm font-medium text-foreground/90"
      >
        {label}
      </label>
      {children}
      {/* The error replaces the hint rather than stacking under it: once a
          control is invalid, the correction is the only guidance that matters. */}
      {error ? (
        <p
          id={`${id}-error`}
          className="mt-1.5 text-xs leading-relaxed text-destructive"
        >
          {error}
        </p>
      ) : (
        hint && (
          <p
            id={`${id}-hint`}
            className="mt-1.5 text-xs leading-relaxed text-muted-foreground"
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

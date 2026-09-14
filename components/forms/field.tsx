import type { ReactNode } from "react";

export const fieldControlClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none";

/**
 * Label + control + optional hint, wired together by id.
 *
 * ui-rules.md §13 — every control carries a real `<label>`, and a hint is
 * associated with `aria-describedby` rather than left floating next to it, so
 * screen-reader users get the same guidance sighted users do.
 */
export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
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
  if (hasError) return `${id}-error`;
  if (hasHint) return `${id}-hint`;
  return undefined;
}

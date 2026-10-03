import type { ReactNode } from "react";

export interface FormSectionProps {
  title: string;
  /** One line on what the section is for, when the title is not enough. */
  description?: string;
  children: ReactNode;
}

/**
 * A titled group of fields. The display heading with a short lime bar, over a
 * hairline rule, is the section marker used across dashboard forms — reuse it
 * rather than inventing a per-form heading.
 */
export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 flex items-center gap-2.5 border-b border-border pb-3 font-display text-lg font-semibold tracking-tight">
        <span aria-hidden className="h-4 w-1 rounded-full bg-primary" />
        {title}
      </h2>
      {description ? (
        <p className="-mt-2 mb-5 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

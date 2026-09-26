import type { ReactNode } from "react";

export interface FormSectionProps {
  title: string;
  /** One line on what the section is for, when the title is not enough. */
  description?: string;
  children: ReactNode;
}

/**
 * A titled group of fields. The mono accent heading over a hairline rule is
 * the section marker used across dashboard forms — reuse it rather than
 * inventing a per-form heading.
 */
export function FormSection({
  title,
  description,
  children,
}: FormSectionProps) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 border-b border-border pb-2 font-mono text-xs uppercase tracking-widest text-primary">
        {title}
      </h2>
      {description ? (
        <p className="-mt-3 mb-5 text-sm text-muted-foreground">
          {description}
        </p>
      ) : null}
      {children}
    </section>
  );
}

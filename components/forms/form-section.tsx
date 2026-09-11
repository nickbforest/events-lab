import type { ReactNode } from "react";

/**
 * A titled group of fields. The mono accent heading over a hairline rule is
 * the section marker used across dashboard forms — reuse it rather than
 * inventing a per-form heading.
 */
export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="mb-10">
      <h2 className="mb-5 border-b border-border pb-2 font-mono text-xs uppercase tracking-widest text-primary">
        {title}
      </h2>
      {children}
    </section>
  );
}

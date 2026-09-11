import Link from "next/link";
import type { ReactNode } from "react";

/**
 * ui-rules.md §10 — an empty state says what is empty, why, and what to do
 * next. All three are required, so `description` and the action are not
 * optional decoration.
 */
export function EmptyState({
  icon,
  title,
  description,
  action,
  actionSlot,
}: {
  icon?: ReactNode;
  title: string;
  description: string;
  /** A link out. Use `actionSlot` instead when the action opens a dialog. */
  action?: { href: string; label: string };
  actionSlot?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center rounded-lg border border-dashed border-border px-6 py-20 text-center">
      {icon && <div className="mb-5 text-muted-foreground">{icon}</div>}
      <h3 className="mb-2 font-display text-xl font-extrabold uppercase tracking-tight">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionSlot}
      {action && (
        <Link
          href={action.href}
          className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

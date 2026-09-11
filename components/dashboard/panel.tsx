import Link from "next/link";
import type { ReactNode } from "react";

/**
 * A titled section of the dashboard: bordered card, hairline-separated header,
 * an optional link out to the full view.
 *
 * Used for the trend chart and the two summary lists so they read as one
 * family instead of three separately-invented cards.
 */
export function Panel({
  title,
  subtitle,
  action,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  children: ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/30">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="font-display text-sm font-extrabold uppercase tracking-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>
        {action && (
          <Link
            href={action.href}
            className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            {action.label}
          </Link>
        )}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

/** The quiet "nothing here yet" line used inside a panel. */
export function PanelEmpty({ children }: { children: ReactNode }) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

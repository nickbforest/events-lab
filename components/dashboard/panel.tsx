import Link from "next/link";
import type { ReactNode } from "react";

export interface PanelProps {
  title: string;
  subtitle?: string;
  action?: { href: string; label: string };
  children: ReactNode;
}

/**
 * A titled section of the dashboard: bordered card, hairline-separated header,
 * an optional link out to the full view.
 *
 * Used for the trend chart and the two summary lists so they read as one
 * family instead of three separately-invented cards.
 */
export function Panel({ title, subtitle, action, children }: PanelProps) {
  return (
    <section className="overflow-hidden rounded-lg border border-border bg-card/30">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="font-display text-sm font-extrabold uppercase tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="shrink-0 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-primary"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      <div className="p-6">{children}</div>
    </section>
  );
}

export interface PanelEmptyProps {
  children: ReactNode;
}

/** The quiet "nothing here yet" line used inside a panel. */
export function PanelEmpty({ children }: PanelEmptyProps) {
  return (
    <p className="py-10 text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

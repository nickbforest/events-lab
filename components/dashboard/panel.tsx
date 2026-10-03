import { ArrowUpRight } from "lucide-react";
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
    <section className="surface rounded-2xl overflow-hidden">
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-5">
        <div>
          <h2 className="font-display text-base font-semibold tracking-tight">
            {title}
          </h2>
          {subtitle ? (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
        {action ? (
          <Link
            href={action.href}
            className="group -mr-2 inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
          >
            {action.label}
            <ArrowUpRight
              aria-hidden
              className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
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

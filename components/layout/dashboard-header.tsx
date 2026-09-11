import type { ReactNode } from "react";

/**
 * The header every dashboard screen opens with: a mono kicker, the screen
 * title, an optional line of context, and the screen's actions.
 *
 * One component rather than three copies so the kicker/title rhythm cannot
 * drift between Overview, Events and Profile.
 */
export function DashboardHeader({
  kicker,
  title,
  description,
  actions,
}: {
  kicker: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
      <div>
        <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
          {kicker}
        </div>
        <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl">
          {title}
        </h1>
        {description && (
          <div className="mt-2 font-mono text-sm text-muted-foreground">
            {description}
          </div>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

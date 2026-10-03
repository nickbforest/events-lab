import type { ReactNode } from "react";

export interface DashboardHeaderProps {
  kicker: string;
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
}

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
}: DashboardHeaderProps) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4 md:mb-10">
      <div>
        <div className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-primary">
          {kicker}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
          {title}
        </h1>
        {description ? (
          <div className="mt-1.5 text-sm text-muted-foreground">
            {description}
          </div>
        ) : null}
      </div>
      {actions ? (
        <div className="flex w-full items-center gap-3 sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

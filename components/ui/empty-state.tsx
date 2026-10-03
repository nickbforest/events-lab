import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClass } from "@/components/ui/button";

export interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  /** A link out. Use `actionSlot` instead when the action opens a dialog. */
  action?: { href: string; label: string };
  actionSlot?: ReactNode;
}

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
}: EmptyStateProps) {
  return (
    <div className="relative isolate flex flex-col items-center overflow-hidden rounded-2xl border border-dashed border-white/15 bg-white/[0.015] px-6 py-20 text-center">
      <div
        aria-hidden
        className="absolute -top-16 left-1/2 -z-10 h-72 w-[28rem] -translate-x-1/2 bg-radial from-glow/10 to-transparent to-70%"
      />
      {icon ? (
        <div className="mb-5 grid size-14 place-items-center rounded-2xl bg-white/[0.04] text-primary ring-1 ring-border">
          {icon}
        </div>
      ) : null}
      <h3 className="mb-2 font-display text-xl font-semibold tracking-tight">
        {title}
      </h3>
      <p className="mb-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
      {actionSlot}
      {action ? (
        <Link href={action.href} className={buttonClass()}>
          {action.label}
        </Link>
      ) : null}
    </div>
  );
}

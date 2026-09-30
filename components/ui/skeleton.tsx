import type { ReactNode } from "react";

import { cn } from "@/lib/format";

export interface SkeletonProps {
  className?: string;
}

/**
 * A placeholder block in the shape of content that is on its way. Sized by
 * the caller to match what replaces it, so nothing jumps when it arrives.
 * The pulse stops under reduced motion (global rule in `globals.css`).
 */
export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      aria-hidden
      className={cn("animate-pulse rounded-md bg-card", className)}
    />
  );
}

export interface LoadingRegionProps {
  /** What is loading, for screen readers: "Loading your events". */
  label: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wraps a skeleton layout so assistive technology hears one "loading"
 * announcement instead of nothing, since the skeleton blocks are hidden.
 */
export function LoadingRegion({
  label,
  children,
  className,
}: LoadingRegionProps) {
  return (
    <div role="status" aria-live="polite" className={className}>
      <span className="sr-only">{label}</span>
      {children}
    </div>
  );
}

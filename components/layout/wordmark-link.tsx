"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/format";

export interface WordmarkLinkProps {
  /** Where the logo leads: home on public pages, Overview in the dashboard. */
  href: string;
  className?: string;
}

/**
 * The Eventail logo as a link.
 *
 * From anywhere else it is an ordinary client-side navigation. On the page it
 * already points at, it is a plain anchor, so clicking it reloads the page —
 * a `<Link>` to the current URL would do nothing visible, and "click the logo
 * to start over" is what people expect it to do.
 */
export function WordmarkLink({ href, className }: WordmarkLinkProps) {
  const pathname = usePathname();
  const classes = cn(
    "font-display text-xl font-extrabold uppercase tracking-tighter",
    className,
  );
  const wordmark = (
    <>
      eventail<span className="text-primary">.</span>
    </>
  );

  if (pathname === href) {
    return (
      <a href={href} className={classes}>
        {wordmark}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {wordmark}
    </Link>
  );
}

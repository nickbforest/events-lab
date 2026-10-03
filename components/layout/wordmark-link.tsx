"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "@/components/layout/logo-mark";
import { cn } from "@/lib/format";

export interface WordmarkLinkProps {
  /** Where the logo leads: home on public pages, Overview in the dashboard. */
  href: string;
  className?: string;
}

/**
 * The Eventail logo as a link: the word, with its last letter drawn as a
 * lime tail (`LogoMark`).
 *
 * From anywhere else it is an ordinary client-side navigation. On the page it
 * already points at, it is a plain anchor, so clicking it reloads the page —
 * a `<Link>` to the current URL would do nothing visible, and "click the logo
 * to start over" is what people expect it to do.
 */
export function WordmarkLink({ href, className }: WordmarkLinkProps) {
  const pathname = usePathname();
  const classes = cn(
    "group inline-flex items-center font-display text-2xl font-semibold leading-none tracking-[-0.03em]",
    className,
  );
  // ".eventai" + the tail, which is the final "l". Screen readers get the
  // plain word instead of "eventai" and an unnamed picture. The tail is sized
  // to Bricolage's "l" (0.70em ascender, 0.125em stem).
  const wordmark = (
    <>
      <span aria-hidden className="whitespace-nowrap">
        <span className="text-primary">.</span>
        eventai
        <LogoMark className="ml-[0.03em] inline-block h-[0.78em] w-auto origin-[10%_90%] align-[-0.078em] text-primary transition-transform duration-500 ease-[var(--ease-studio)] group-hover:-rotate-[8deg]" />
      </span>
      <span className="sr-only">eventail</span>
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

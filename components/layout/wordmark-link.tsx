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
  const wordmark = (
    <>
      <Wordmark />
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

export interface WordmarkProps {
  /** Classes for the tail, e.g. a softer colour on the giant footer mark. */
  tailClassName?: string;
  dotClassName?: string;
}

/**
 * ".eventai" + the tail, which is the final "l". Decorative (`aria-hidden`):
 * callers name it ("eventail") themselves. Size it with the parent's font
 * size; the tail is fitted to Bricolage's "l" (0.70em ascender, 0.125em
 * stem).
 *
 * At rest it is never quite still: every 7s the dot hops and the tail wags
 * (`animate-dot-hop`, `animate-tail-wag`, off under reduced motion). A
 * hovered parent `group` tilts the tail as well.
 */
export function Wordmark({ tailClassName, dotClassName }: WordmarkProps) {
  return (
    <span aria-hidden className="whitespace-nowrap">
      <span
        className={cn(
          "inline-block animate-dot-hop text-primary",
          dotClassName,
        )}
      >
        .
      </span>
      eventai
      <LogoMark
        className={cn(
          "ml-[0.03em] inline-block h-[0.78em] w-auto origin-[12%_88%] animate-tail-wag align-[-0.078em] text-primary transition-[rotate] duration-500 ease-[var(--ease-studio)] group-hover:-rotate-[10deg]",
          tailClassName,
        )}
      />
    </span>
  );
}

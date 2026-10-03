import { ArrowUp, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { LANDING_SECTIONS } from "@/components/layout/site-header";
import { Wordmark, WordmarkLink } from "@/components/layout/wordmark-link";
import { routes } from "@/lib/routes";

const LINK_GROUPS = [
  {
    label: "Product",
    links: LANDING_SECTIONS.map(({ id, label }) => ({
      href: `${routes.home()}#${id}`,
      label,
    })),
  },
  {
    label: "Account",
    links: [
      { href: routes.auth.signUp(), label: "Create your page" },
      { href: routes.auth.signIn(), label: "Log in" },
    ],
  },
];

/**
 * The public footer: a sign-off line, link groups, and an oversized
 * ".eventail" fading into the page edge. A statement, not a sales pitch —
 * it also closes publishers' own pages (ui-rules.md §19).
 */
export function SiteFooter() {
  return (
    <footer className="relative isolate overflow-hidden border-t border-border">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-glow/60 to-transparent"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/2 -z-10 h-64 w-[48rem] max-w-[120%] -translate-x-1/2 translate-y-1/2 rounded-full bg-glow/25 blur-[110px]"
      />

      <div className="mx-auto max-w-6xl px-6 pt-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-[1.5fr_1fr] md:items-end">
          <div>
            <WordmarkLink href={routes.home()} className="mb-8" />
            <p className="max-w-lg font-display text-3xl leading-[1.1] font-semibold tracking-tight md:text-4xl">
              Made for people who bring{" "}
              <span className="font-accent text-gradient">
                people together.
              </span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8">
            {LINK_GROUPS.map((group) => (
              <nav key={group.label} aria-label={group.label}>
                <h2 className="mb-4 font-mono text-xs text-muted-foreground">
                  {group.label}
                </h2>
                <ul className="space-y-2.5">
                  {group.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-foreground/80 transition-colors hover:text-primary"
                      >
                        {link.label}
                        <ArrowUpRight
                          aria-hidden
                          className="size-3.5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100"
                        />
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-border py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 eventail.space · All rights reserved
          </p>
          {/* "#top" scrolls to the top of the document by spec, no target
              element needed. */}
          <a
            href="#top"
            className="group inline-flex items-center gap-2 self-start rounded-full border border-border bg-white/[0.03] px-4 py-2 text-xs font-medium text-muted-foreground transition-colors hover:border-white/20 hover:text-foreground sm:self-auto"
          >
            Back to top
            <ArrowUp
              aria-hidden
              className="size-3.5 transition-transform duration-300 group-hover:-translate-y-0.5"
            />
          </a>
        </div>
      </div>

      {/* The oversized mark, fading out into the page edge. Decorative. */}
      <div
        aria-hidden
        className="pointer-events-none -mb-[0.22em] overflow-hidden text-center font-display text-[clamp(4.5rem,21vw,19rem)] leading-none font-semibold tracking-[-0.04em] text-white/[0.07] select-none [mask-image:linear-gradient(to_bottom,black_25%,transparent_95%)]"
      >
        <Wordmark
          dotClassName="text-primary/30"
          tailClassName="text-primary/30"
        />
      </div>
    </footer>
  );
}

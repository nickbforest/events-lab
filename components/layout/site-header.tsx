import Link from "next/link";
import { WordmarkLink } from "@/components/layout/wordmark-link";
import { buttonClass } from "@/components/ui/button";
import { routes } from "@/lib/routes";

/** In-page anchors on the landing page. */
export const LANDING_SECTIONS = [
  { id: "features", label: "Features" },
  { id: "how-it-works", label: "How it works" },
  { id: "audience", label: "Who it's for" },
] as const;

export interface SiteHeaderProps {
  /**
   * Show the landing page's section links. Off everywhere else: a publisher's
   * page is theirs, not a marketing funnel (ui-rules.md §19).
   */
  showSections?: boolean;
}

/**
 * The public header: a floating glass bar that stays in reach while the page
 * scrolls under it.
 */
export function SiteHeader({ showSections = false }: SiteHeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-3 sm:px-6 sm:pt-4">
      <nav
        aria-label="Main"
        className="glass mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 rounded-full pr-2.5 pl-5 shadow-card sm:pl-6"
      >
        <WordmarkLink href={routes.home()} />

        {showSections ? (
          <ul className="hidden items-center gap-1 md:flex">
            {LANDING_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  className="rounded-full px-4 py-2 text-sm text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-foreground"
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        ) : null}

        <div className="flex items-center gap-1 sm:gap-2">
          <Link
            href={routes.auth.signIn()}
            className={buttonClass({ variant: "ghost", size: "sm" })}
          >
            Log in
          </Link>
          <Link
            href={routes.auth.signUp()}
            className={buttonClass({ size: "sm" })}
          >
            Get started
          </Link>
        </div>
      </nav>
    </header>
  );
}

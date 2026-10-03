import Link from "next/link";
import { LANDING_SECTIONS } from "@/components/layout/site-header";
import { WordmarkLink } from "@/components/layout/wordmark-link";
import { routes } from "@/lib/routes";

const linkClass =
  "text-sm text-muted-foreground transition-colors hover:text-foreground";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 mx-auto h-px max-w-3xl bg-gradient-to-r from-transparent via-glow/50 to-transparent"
      />
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-6 py-14 sm:grid-cols-[1.5fr_1fr_1fr]">
        <div className="col-span-2 sm:col-span-1">
          <WordmarkLink href={routes.home()} />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
            The publishing toolkit for artists, venues and organizers to share
            what is coming up.
          </p>
        </div>

        <nav aria-label="Product">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-foreground/70">
            Product
          </h2>
          <ul className="space-y-2.5">
            {LANDING_SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <Link href={`${routes.home()}#${id}`} className={linkClass}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Account">
          <h2 className="mb-4 text-xs font-medium uppercase tracking-[0.14em] text-foreground/70">
            Account
          </h2>
          <ul className="space-y-2.5">
            <li>
              <Link href={routes.auth.signUp()} className={linkClass}>
                Create your page
              </Link>
            </li>
            <li>
              <Link href={routes.auth.signIn()} className={linkClass}>
                Log in
              </Link>
            </li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-xs text-muted-foreground">
            © 2026 eventail.space. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Made for people who bring people together.
          </p>
        </div>
      </div>
    </footer>
  );
}

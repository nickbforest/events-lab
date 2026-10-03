"use client";

import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  User,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { WordmarkLink } from "@/components/layout/wordmark-link";
import { AmbientBackground } from "@/components/ui/ambient-background";
import { signOutAction } from "@/features/auth/actions";
import { cn } from "@/lib/format";
import { routes } from "@/lib/routes";

const NAV_ITEMS = [
  {
    href: routes.dashboard.root(),
    label: "Overview",
    Icon: LayoutDashboard,
    exact: true,
  },
  {
    href: routes.dashboard.events(),
    label: "Events",
    Icon: CalendarDays,
    exact: false,
  },
  {
    href: routes.dashboard.profile(),
    label: "Profile",
    Icon: User,
    exact: false,
  },
  {
    href: routes.dashboard.settings(),
    label: "Settings",
    Icon: Settings,
    exact: false,
  },
];

export interface DashboardShellProps {
  children: ReactNode;
  username: string;
}

export function DashboardShell({ children, username }: DashboardShellProps) {
  const pathname = usePathname();
  // The path the mobile menu was opened on. Any navigation changes the path,
  // so the menu closes itself without an effect to reset it.
  const [menuOpenedOn, setMenuOpenedOn] = useState<string | null>(null);
  const isMenuOpen = menuOpenedOn === pathname;

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside
        className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-xl md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r md:bg-card/50"
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setMenuOpenedOn(null);
          }
        }}
      >
        <div className="flex h-full flex-col md:p-6">
          <div className="flex h-16 items-center justify-between px-6 md:mb-10 md:block md:h-auto md:px-0">
            {/* Inside the dashboard the logo means "back to Overview", never
                the public landing page a signed-in publisher has no use for. */}
            <WordmarkLink href={routes.dashboard.root()} className="flex" />

            {/* Below `md` the nav folds behind a burger rather than stacking
                four links and a footer above every screen. */}
            <button
              type="button"
              aria-expanded={isMenuOpen}
              aria-controls="dashboard-menu"
              className="-mr-2 inline-flex size-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground md:hidden"
              onClick={() => setMenuOpenedOn(isMenuOpen ? null : pathname)}
            >
              {isMenuOpen ? (
                <X className="size-5" aria-hidden />
              ) : (
                <Menu className="size-5" aria-hidden />
              )}
              <span className="sr-only">
                {isMenuOpen ? "Close menu" : "Open menu"}
              </span>
            </button>
          </div>

          <div
            id="dashboard-menu"
            className={cn(
              "flex-1 flex-col px-6 pb-6 md:flex md:px-0 md:pb-0",
              isMenuOpen ? "flex" : "hidden",
            )}
          >
            <nav aria-label="Dashboard" className="flex flex-1 flex-col gap-1">
              {NAV_ITEMS.map(({ href, label, Icon, exact }) => {
                const isActive = exact
                  ? pathname === href
                  : pathname.startsWith(href);

                return (
                  <Link
                    key={href}
                    href={href}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white/[0.06] text-foreground ring-1 ring-border"
                        : "text-muted-foreground hover:bg-white/[0.04] hover:text-foreground",
                    )}
                  >
                    {isActive ? (
                      <span
                        aria-hidden
                        className="absolute top-1/2 -left-px h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary"
                      />
                    ) : null}
                    <Icon
                      className={cn("size-4", isActive && "text-primary")}
                      aria-hidden
                    />
                    {label}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-4 space-y-1 border-t border-border pt-4 md:mt-0 md:pt-6">
              {/* A new tab, like every other preview link: the publisher keeps
                their place in the dashboard. */}
              <a
                href={routes.publisherPreview(username)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-primary"
              >
                <ExternalLink className="size-3" aria-hidden />
                <span className="truncate">{routes.publisher(username)}</span>
                <span className="sr-only">, opens in a new tab</span>
              </a>
              {/* A form posting to a Server Action, not a click handler: it
                works before hydration and without client JavaScript. */}
              <form action={signOutAction}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
                >
                  <LogOut className="size-4" aria-hidden />
                  Sign out
                </button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      <main className="relative isolate min-w-0 flex-1 md:ml-64">
        <AmbientBackground variant="quiet" />
        {children}
      </main>
    </div>
  );
}

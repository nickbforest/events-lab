"use client";

import {
  CalendarDays,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { WordmarkLink } from "@/components/layout/wordmark-link";
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

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-card/40 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-6">
          {/* Inside the dashboard the logo means "back to Overview", never the
              public landing page a signed-in publisher has no use for. */}
          <WordmarkLink
            href={routes.dashboard.root()}
            className="mb-10 block"
          />

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
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-white/5 text-foreground"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </Link>
              );
            })}
          </nav>

          <div className="space-y-1 border-t border-border pt-6">
            {/* A new tab, like every other preview link: the publisher keeps
                their place in the dashboard. */}
            <a
              href={routes.publisherPreview(username)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="size-3" aria-hidden />
              events-lab/{username}
              <span className="sr-only">, opens in a new tab</span>
            </a>
            {/* A form, not a click handler: signing out clears httpOnly
                cookies, which only the server can do. */}
            <form action={signOutAction}>
              <button
                type="submit"
                className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <LogOut className="size-4" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">{children}</main>
    </div>
  );
}

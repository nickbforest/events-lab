"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { CalendarDays, ExternalLink, LayoutDashboard, User } from "lucide-react";
import { cn } from "@/lib/format";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/dashboard/events", label: "Events", Icon: CalendarDays, exact: false },
  { href: "/dashboard/profile", label: "Profile", Icon: User, exact: false },
];

export function DashboardShell({
  children,
  username,
}: {
  children: ReactNode;
  username: string;
}) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-border bg-card/40 md:fixed md:inset-y-0 md:left-0 md:w-64 md:border-b-0 md:border-r">
        <div className="flex h-full flex-col p-6">
          <Link
            href="/"
            className="mb-10 block font-display text-xl font-extrabold uppercase tracking-tighter"
          >
            events<span className="text-primary">-</span>lab
          </Link>

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

          <div className="border-t border-border pt-6">
            <Link
              href={`/u/${username}`}
              className="flex items-center gap-2 px-3 py-2 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
            >
              <ExternalLink className="size-3" aria-hidden />
              events-lab/{username}
            </Link>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64">{children}</main>
    </div>
  );
}

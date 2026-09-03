import type { Metadata } from "next";
import { Suspense } from "react";
import { CalendarSearch } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EventCard } from "@/components/events/event-card";
import { DiscoverFilters } from "@/components/events/discover-filters";
import { EmptyState } from "@/components/ui/empty-state";
import { discoverEvents, parseDiscoverFilters } from "@/features/discovery/queries";
import { CATEGORIES } from "@/lib/mock-data";

export const metadata: Metadata = {
  title: "Discover upcoming events",
  description:
    "Browse upcoming concerts, theatre, sport, conferences and community events from publishers worldwide.",
};

export default async function DiscoverPage({
  searchParams,
}: PageProps<"/discover">) {
  const params = await searchParams;
  const filters = parseDiscoverFilters(params);
  const events = await discoverEvents(filters);

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border px-6 py-12">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
              Directory
            </div>
            <h1 className="mb-8 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
              Discover upcoming events
            </h1>

            <Suspense fallback={<div className="h-32" />}>
              <DiscoverFilters categories={CATEGORIES} />
            </Suspense>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <p
              aria-live="polite"
              className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              {events.length} {events.length === 1 ? "event" : "events"}
            </p>

            {events.length > 0 ? (
              <div className="space-y-4">
                {events.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarSearch className="size-8" aria-hidden />}
                title="No events match those filters"
                description="Nothing is scheduled for this combination of search, date range and category. Try widening the date range or clearing the category."
                action={{ href: "/discover", label: "Clear all filters" }}
              />
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

import Link from "next/link";
import { CalendarPlus, Plus } from "lucide-react";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import { getDashboardSummary } from "@/features/events/queries";
import { getCurrentProfile } from "@/features/profiles/queries";

function StatsCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-lg border border-border bg-card/30 p-6">
      <div className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <div className="font-display text-4xl font-extrabold tracking-tighter">
        {value}
      </div>
    </div>
  );
}

export default async function DashboardOverviewPage() {
  const profile = await getCurrentProfile();
  const { upcoming, publishedCount, draftCount } = await getDashboardSummary(
    profile.id,
  );

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
              Overview
            </div>
            <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl">
              {profile.display_name}
            </h1>
          </div>
          <Link
            href="/dashboard/events/new"
            className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            <Plus className="size-4" aria-hidden />
            New event
          </Link>
        </div>

        <div className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard label="Upcoming" value={upcoming.length} />
          <StatsCard label="Published" value={publishedCount} />
          <StatsCard label="Drafts" value={draftCount} />
        </div>

        <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Next up
        </h2>

        {upcoming.length > 0 ? (
          <div className="space-y-4">
            {upcoming.slice(0, 3).map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<CalendarPlus className="size-8" aria-hidden />}
            title="No upcoming events yet"
            description="Nothing is scheduled ahead of today. Create an event to start promoting it on your public page."
            action={{ href: "/dashboard/events/new", label: "Create event" }}
          />
        )}
      </div>
    </div>
  );
}

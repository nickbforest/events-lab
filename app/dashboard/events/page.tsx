import Link from "next/link";
import { CalendarPlus, Eye, Pencil, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { getOwnedEvents } from "@/features/events/queries";
import { getCurrentProfile } from "@/features/profiles/queries";
import { formatEventDate, isoDateTime } from "@/lib/format";

export default async function DashboardEventsPage() {
  const profile = await getCurrentProfile();
  const events = await getOwnedEvents(profile.id);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <DashboardHeader
          kicker="Events"
          title="Events"
          actions={
            <>
              <Link
                href={`/u/${profile.username}`}
                className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              >
                <Eye className="size-4" aria-hidden />
                Preview
                <span className="sr-only"> your public page</span>
              </Link>
              <Link
                href="/dashboard/events/new"
                className="flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                <Plus className="size-4" aria-hidden />
                New
                <span className="sr-only"> event</span>
              </Link>
            </>
          }
        />

        {events.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left">
              <caption className="sr-only">
                All events you have created, with their status and date
              </caption>
              <thead className="bg-card/50">
                <tr className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  <th scope="col" className="px-5 py-3 font-normal">Event</th>
                  <th scope="col" className="hidden px-5 py-3 font-normal sm:table-cell">Date</th>
                  <th scope="col" className="px-5 py-3 font-normal">Status</th>
                  <th scope="col" className="px-5 py-3 font-normal">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event) => {
                  const date = formatEventDate(event.start_at, event.timezone);
                  return (
                    <tr
                      key={event.id}
                      className="border-t border-border transition-colors hover:bg-white/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <div className="font-display font-extrabold uppercase tracking-tight">
                          {event.title}
                        </div>
                        <div className="font-mono text-xs text-muted-foreground">
                          {event.category.label}
                          {event.city ? ` / ${event.city}` : ""}
                        </div>
                      </td>
                      <td className="hidden px-5 py-4 sm:table-cell">
                        <time
                          dateTime={isoDateTime(event.start_at)}
                          className="font-mono text-sm text-muted-foreground"
                        >
                          {date.month} {date.day} / {date.year}
                        </time>
                      </td>
                      <td className="px-5 py-4">
                        <EventStatusBadge status={event.status} />
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/dashboard/events/new`}
                          className="inline-flex items-center gap-1.5 font-mono text-xs uppercase text-muted-foreground transition-colors hover:text-primary"
                        >
                          <Pencil className="size-3" aria-hidden />
                          Edit
                          <span className="sr-only"> {event.title}</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            icon={<CalendarPlus className="size-8" aria-hidden />}
            title="No events yet"
            description="You have not created any events. Your first one takes about a minute and gets a shareable public link."
            action={{ href: "/dashboard/events/new", label: "Create your first event" }}
          />
        )}
      </div>
    </div>
  );
}

import { CalendarPlus, Eye, Plus } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { buttonClass } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { getOwnedEvents, listEventCategories } from "@/features/events/queries";
import { getCurrentProfile } from "@/features/profiles/queries";
import { routes } from "@/lib/routes";

import { NewEventProvider, NewEventTrigger } from "./event-dialog";
import { EVENT_LIST_COLUMNS, EventListRow } from "./event-list-row";

export default async function DashboardEventsPage() {
  const profile = await getCurrentProfile();
  const [events, categories] = await Promise.all([
    getOwnedEvents(profile.id),
    listEventCategories(),
  ]);

  return (
    <div className="px-6 py-10 md:px-10">
      <NewEventProvider categories={categories}>
        <div className="mx-auto max-w-6xl">
          <DashboardHeader
            kicker="Events"
            title="Events"
            actions={
              <>
                <a
                  href={routes.publisherPreview(profile.username)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={buttonClass({ variant: "secondary", size: "sm" })}
                >
                  <Eye className="size-4" aria-hidden />
                  Preview
                  <span className="sr-only">
                    {" "}
                    your public page, opens in a new tab
                  </span>
                </a>
                {/* The primary action, so the wider of the two: the rest of
                    the row on mobile, a fixed minimum from `sm`. */}
                <NewEventTrigger
                  className={buttonClass({
                    size: "sm",
                    className: "flex-1 sm:min-w-36 sm:flex-none",
                  })}
                >
                  <Plus className="size-4" aria-hidden />
                  New
                  <span className="sr-only"> event</span>
                </NewEventTrigger>
              </>
            }
          />

          {events.length > 0 ? (
            <div className="surface rounded-2xl overflow-hidden">
              {/* Column labels for the `lg` grid. Below it each row labels
                  its own facts, so this header would only repeat them. */}
              <div
                aria-hidden
                className={`hidden border-b border-border bg-white/[0.02] px-5 py-3 text-xs font-medium text-muted-foreground ${EVENT_LIST_COLUMNS}`}
              >
                <span>Event</span>
                <span>When</span>
                <span>Location</span>
                <span className="text-right">Status</span>
              </div>
              <ul aria-label="Your events">
                {events.map((event) => (
                  <EventListRow key={event.id} event={event} />
                ))}
              </ul>
            </div>
          ) : (
            <EmptyState
              icon={<CalendarPlus className="size-8" aria-hidden />}
              title="No events yet"
              description="You have not created any events. Your first one takes about a minute and gets a shareable public link."
              actionSlot={
                <NewEventTrigger className={buttonClass()}>
                  <Plus className="size-4" aria-hidden />
                  Create your first event
                </NewEventTrigger>
              }
            />
          )}
        </div>
      </NewEventProvider>
    </div>
  );
}

import { Eye } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventStatusBadge } from "@/components/events/event-status-badge";
import { getOwnedEvent, listEventCategories } from "@/features/events/queries";
import { getCurrentProfile } from "@/features/profiles/queries";
import { routes } from "@/lib/routes";
import { EventForm } from "../../event-form";
import { EventLifecycle } from "./event-lifecycle";

export default async function EditEventPage({
  params,
}: PageProps<"/dashboard/events/[id]/edit">) {
  const { id } = await params;
  const profile = await getCurrentProfile();
  const [event, categories] = await Promise.all([
    getOwnedEvent(id, profile.id),
    listEventCategories(),
  ]);

  // An event owned by someone else is indistinguishable from one that does not
  // exist: the query is already scoped to the session's own rows.
  if (!event) {
    notFound();
  }

  const isPublic = event.status !== "draft" && event.status !== "archived";

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-2 flex items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.14em] text-primary">
              Edit
            </span>
            <EventStatusBadge status={event.status} />
          </div>
          <h1 className="font-display text-3xl font-semibold tracking-tight md:text-4xl">
            {event.title}
          </h1>
          {isPublic ? (
            <Link
              href={routes.event(profile.username, event.slug)}
              className="mt-3 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary"
            >
              <Eye className="size-3.5" aria-hidden />
              View public page
            </Link>
          ) : null}
        </div>

        <div className="mb-10">
          <EventLifecycle eventId={event.id} status={event.status} />
        </div>

        <EventForm categories={categories} event={event} />
      </div>
    </div>
  );
}

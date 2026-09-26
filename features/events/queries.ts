import "server-only";

import {
  eventIdSchema,
  eventRouteParamsSchema,
  ownerIdSchema,
  relatedEventLimitSchema,
} from "@/features/events/contracts";
import {
  getEventsService,
  getPublicEventsService,
} from "@/features/events/service";
import { usernameSchema } from "@/features/profiles/contracts";
import type { EventWithRelations } from "@/lib/types";

export type { DashboardSummary } from "@/features/events/bll/events-service";

export async function listEventCategories() {
  return getPublicEventsService().listCategories();
}

export async function getPublishedEventBySlug(
  username: string,
  slug: string,
): Promise<EventWithRelations | null> {
  // A malformed route parameter is a 404, not a crash: this runs on public
  // route segments, so anything the constraints would reject has no event.
  const parsed = eventRouteParamsSchema.safeParse({ username, slug });
  if (!parsed.success) return null;

  return getPublicEventsService().getPublishedEventBySlug(
    parsed.data.username,
    parsed.data.slug,
  );
}

export async function getUpcomingEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return [];

  return getPublicEventsService().getUpcomingEventsByUsername(parsed.data);
}

export async function getPastEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return [];

  return getPublicEventsService().getPastEventsByUsername(parsed.data);
}

export async function getOwnedEvents(
  ownerId: string,
): Promise<EventWithRelations[]> {
  const service = await getEventsService();
  return service.getOwnedEvents(ownerIdSchema.parse(ownerId));
}

export async function getOwnedEvent(
  id: string,
  ownerId: string,
): Promise<EventWithRelations | null> {
  const parsed = eventIdSchema.safeParse(id);
  if (!parsed.success) return null;

  const service = await getEventsService();
  return service.getOwnedEvent(parsed.data, ownerIdSchema.parse(ownerId));
}

export async function getDashboardSummary(ownerId: string) {
  const service = await getEventsService();
  return service.getDashboardSummary(ownerIdSchema.parse(ownerId));
}

export async function getRelatedEvents(
  event: EventWithRelations,
  limit = 3,
): Promise<EventWithRelations[]> {
  return getPublicEventsService().getRelatedEvents(
    event,
    relatedEventLimitSchema.parse(limit),
  );
}

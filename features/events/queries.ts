import "server-only";

import { createEventsService } from "@/features/events/bll/events-service";
import {
  eventRouteParamsSchema,
  ownerIdSchema,
  relatedEventLimitSchema,
  usernameSchema,
} from "@/features/events/contracts";
import { InMemoryEventsRepository } from "@/features/events/dal/in-memory-events-repository";
import type { EventWithRelations } from "@/lib/types";

export type { DashboardSummary } from "@/features/events/bll/events-service";

const eventsService = createEventsService(new InMemoryEventsRepository());

export async function listEventCategories() {
  return eventsService.listCategories();
}

export async function getPublishedEventBySlug(
  username: string,
  slug: string,
): Promise<EventWithRelations | null> {
  const input = eventRouteParamsSchema.parse({ username, slug });
  return eventsService.getPublishedEventBySlug(input.username, input.slug);
}

export async function getUpcomingEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  return eventsService.getUpcomingEventsByUsername(
    usernameSchema.parse(username),
  );
}

export async function getPastEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  return eventsService.getPastEventsByUsername(usernameSchema.parse(username));
}

export async function getOwnedEvents(
  ownerId: string,
): Promise<EventWithRelations[]> {
  return eventsService.getOwnedEvents(ownerIdSchema.parse(ownerId));
}

export async function getDashboardSummary(ownerId: string) {
  return eventsService.getDashboardSummary(ownerIdSchema.parse(ownerId));
}

export async function getRelatedEvents(
  event: EventWithRelations,
  limit = 3,
): Promise<EventWithRelations[]> {
  return eventsService.getRelatedEvents(
    event,
    relatedEventLimitSchema.parse(limit),
  );
}

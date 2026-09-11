import type { EventsRepository } from "@/features/events/dal/events-repository";
import { DataAccessError } from "@/lib/errors";
import type { Category, EventRecord, EventWithRelations } from "@/lib/types";

export interface DashboardSummary {
  upcoming: EventWithRelations[];
  publishedCount: number;
  draftCount: number;
}

export interface EventsService {
  getDashboardSummary(ownerId: string): Promise<DashboardSummary>;
  getOwnedEvents(ownerId: string): Promise<EventWithRelations[]>;
  getPastEventsByUsername(username: string): Promise<EventWithRelations[]>;
  getPublishedEventBySlug(
    username: string,
    slug: string,
  ): Promise<EventWithRelations | null>;
  getRelatedEvents(
    event: EventWithRelations,
    limit: number,
  ): Promise<EventWithRelations[]>;
  getUpcomingEventsByUsername(username: string): Promise<EventWithRelations[]>;
  listCategories(): Promise<readonly Category[]>;
}

type Clock = () => Date;

const isPubliclyVisible = (event: EventRecord) =>
  event.status !== "draft" && event.status !== "archived";

const byStartAscending = (a: EventRecord, b: EventRecord) =>
  Date.parse(a.start_at) - Date.parse(b.start_at);

export function createEventsService(
  repository: EventsRepository,
  clock: Clock = () => new Date(),
): EventsService {
  async function loadData() {
    const [events, profiles, categories] = await Promise.all([
      repository.listEvents(),
      repository.listProfiles(),
      repository.listCategories(),
    ]);

    const join = (event: EventRecord): EventWithRelations => {
      const owner = profiles.find((profile) => profile.id === event.owner_id);
      const category = categories.find(
        (candidate) => candidate.id === event.category_id,
      );

      if (!owner || !category) {
        throw new DataAccessError(
          `Event ${event.id} references a missing relation.`,
        );
      }

      return { ...event, owner, category };
    };

    return { events, profiles, join };
  }

  return {
    listCategories: () => repository.listCategories(),

    async getPublishedEventBySlug(username, slug) {
      const { events, profiles, join } = await loadData();
      const owner = profiles.find((profile) => profile.username === username);
      if (!owner) return null;

      const event = events.find(
        (candidate) =>
          candidate.owner_id === owner.id &&
          candidate.slug === slug &&
          isPubliclyVisible(candidate),
      );

      return event ? join(event) : null;
    },

    async getUpcomingEventsByUsername(username) {
      const { events, profiles, join } = await loadData();
      const owner = profiles.find((profile) => profile.username === username);
      if (!owner) return [];
      const now = clock().getTime();

      return events
        .filter(
          (event) =>
            event.owner_id === owner.id &&
            isPubliclyVisible(event) &&
            Date.parse(event.start_at) >= now,
        )
        .sort(byStartAscending)
        .map(join);
    },

    async getPastEventsByUsername(username) {
      const { events, profiles, join } = await loadData();
      const owner = profiles.find((profile) => profile.username === username);
      if (!owner) return [];
      const now = clock().getTime();

      return events
        .filter(
          (event) =>
            event.owner_id === owner.id &&
            isPubliclyVisible(event) &&
            Date.parse(event.start_at) < now,
        )
        .sort((a, b) => Date.parse(b.start_at) - Date.parse(a.start_at))
        .map(join);
    },

    async getOwnedEvents(ownerId) {
      const { events, join } = await loadData();
      return events
        .filter((event) => event.owner_id === ownerId)
        .sort(byStartAscending)
        .map(join);
    },

    async getDashboardSummary(ownerId) {
      const { events, join } = await loadData();
      const owned = events.filter((event) => event.owner_id === ownerId);
      const now = clock().getTime();
      const upcoming = owned
        .filter(
          (event) =>
            event.status === "published" && Date.parse(event.start_at) >= now,
        )
        .sort(byStartAscending)
        .map(join);

      return {
        upcoming,
        publishedCount: owned.filter((event) => event.status === "published")
          .length,
        draftCount: owned.filter((event) => event.status === "draft").length,
      };
    },

    async getRelatedEvents(event, limit) {
      const { events, join } = await loadData();
      const now = clock().getTime();

      return events
        .filter(
          (candidate) =>
            candidate.id !== event.id &&
            isPubliclyVisible(candidate) &&
            Date.parse(candidate.start_at) >= now &&
            (candidate.category_id === event.category_id ||
              candidate.owner_id === event.owner_id),
        )
        .sort(byStartAscending)
        .slice(0, limit)
        .map(join);
    },
  };
}

import type {
  EventDraftInput,
  EventTransition,
} from "@/features/events/contracts";
import type {
  EventsRepository,
  EventWriteRow,
} from "@/features/events/dal/events-repository";
import { ApplicationError } from "@/lib/errors";
import type {
  Category,
  EventRecord,
  EventStatus,
  EventWithRelations,
} from "@/lib/types";

export interface DashboardSummary {
  upcoming: EventWithRelations[];
  publishedCount: number;
  draftCount: number;
}

/** Field-keyed reasons an event cannot go public yet. */
export type PublishBlockers = Partial<Record<string, string>>;

export interface EventsService {
  getDashboardSummary(ownerId: string): Promise<DashboardSummary>;
  getOwnedEvents(ownerId: string): Promise<EventWithRelations[]>;
  getOwnedEvent(
    id: string,
    ownerId: string,
  ): Promise<EventWithRelations | null>;
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

  createEvent(
    ownerId: string,
    input: EventDraftInput,
    publish: boolean,
  ): Promise<EventRecord>;
  updateEvent(
    id: string,
    ownerId: string,
    input: EventDraftInput,
  ): Promise<EventRecord>;
  transitionEvent(
    id: string,
    ownerId: string,
    to: EventTransition,
  ): Promise<EventRecord>;
  deleteEvent(id: string, ownerId: string): Promise<void>;
  uploadCoverImage(ownerId: string, file: File): Promise<string>;
}

type Clock = () => Date;

/**
 * Whether an event has finished. Derived rather than stored: Architecture §11
 * lists a `completed` status, but completion is a fact about the clock, and a
 * stored copy needs a scheduled job and contradicts the date until it runs.
 */
export function hasFinished(event: EventRecord, now: Date): boolean {
  return Date.parse(event.end_at ?? event.start_at) < now.getTime();
}

/**
 * Titles become URLs. Anything outside the `events_slug_format` constraint is
 * folded away rather than rejected: the publisher typed a title, not a slug,
 * and should not have to think about the difference.
 */
export function toEventSlug(title: string): string {
  const slug = title
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 160)
    .replace(/-+$/g, "");

  // A title of pure punctuation or non-Latin script leaves nothing usable.
  // "event" keeps the URL valid; the publisher can set a better one by hand.
  return slug.length >= 3 ? slug : "event";
}

/**
 * Reasons this event cannot go public, keyed by the field that fixes each.
 *
 * Plain predicates rather than a stricter Zod schema: these run against
 * already-parsed input, where cleared fields are `null`, and they are business
 * rules about readiness rather than statements about the shape of a payload.
 */
export function publishBlockers(input: EventDraftInput): PublishBlockers {
  const blockers: PublishBlockers = {};

  if (input.eventType !== "in_person" && !input.onlineUrl) {
    blockers.onlineUrl = "An online event needs a link for attendees to join.";
  }

  if (input.eventType !== "online" && !input.city) {
    blockers.city = "An in-person event needs at least a city.";
  }

  if (!input.isFree && !input.priceInfo && !input.ticketUrl) {
    blockers.priceInfo = "A paid event needs price details or a ticket link.";
  }

  return blockers;
}

const PUBLIC_STATUSES: readonly EventStatus[] = [
  "published",
  "cancelled",
  "postponed",
];

function toWriteRow(input: EventDraftInput, slug: string): EventWriteRow {
  return {
    slug,
    title: input.title,
    short_description: input.shortDescription,
    description: input.description,
    category_id: input.categoryId,
    event_type: input.eventType,
    start_at: input.startAt,
    end_at: input.endAt,
    timezone: input.timezone,
    venue_name: input.venueName,
    address: input.address,
    city: input.city,
    country_code: input.countryCode,
    latitude: input.latitude,
    longitude: input.longitude,
    online_url: input.onlineUrl,
    is_free: input.isFree,
    price_info: input.isFree ? null : input.priceInfo,
    ticket_url: input.ticketUrl,
    external_url: input.externalUrl,
    cover_image_url: input.coverImageUrl,
  };
}

export function createEventsService(
  repository: EventsRepository,
  clock: Clock = () => new Date(),
): EventsService {
  /**
   * Finds a free slug for this owner. Collisions are resolved with a suffix
   * rather than an error: two venues may well both run a "jazz night", and so
   * may one venue twice.
   */
  async function resolveSlug(
    ownerId: string,
    requested: string | null,
    title: string,
    exceptEventId?: string,
  ): Promise<string> {
    const base = requested ?? toEventSlug(title);

    for (let attempt = 1; attempt <= 50; attempt += 1) {
      const candidate = attempt === 1 ? base : `${base}-${attempt}`;
      if (!(await repository.slugExists(ownerId, candidate, exceptEventId))) {
        return candidate;
      }
    }

    // 50 events with one title is not a naming collision, it is a loop.
    throw new ApplicationError(
      "VALIDATION_FAILED",
      "Could not find a free link for this title. Set one by hand.",
    );
  }

  function requirePublishable(input: EventDraftInput): void {
    const blockers = publishBlockers(input);
    const first = Object.values(blockers)[0];
    if (first) {
      throw new ApplicationError("VALIDATION_FAILED", first);
    }
  }

  async function loadOwned(
    id: string,
    ownerId: string,
  ): Promise<EventWithRelations> {
    const event = await repository.findByIdForOwner(id, ownerId);
    if (!event) {
      // Indistinguishable from "belongs to someone else" on purpose: a
      // stranger must not learn that an event id exists.
      throw new ApplicationError("NOT_FOUND", "Event not found.");
    }
    return event;
  }

  return {
    listCategories: () => repository.listCategories(),

    getPublishedEventBySlug: (username, slug) =>
      repository.findVisibleBySlug(username, slug),

    getUpcomingEventsByUsername: (username) =>
      repository.listVisibleByUsername(username, {
        from: clock().toISOString(),
        order: "asc",
      }),

    getPastEventsByUsername: (username) =>
      repository.listVisibleByUsername(username, {
        until: clock().toISOString(),
        order: "desc",
      }),

    getOwnedEvents: (ownerId) => repository.listByOwner(ownerId),

    getOwnedEvent: (id, ownerId) => repository.findByIdForOwner(id, ownerId),

    async getDashboardSummary(ownerId) {
      const now = clock();
      const [owned, counts] = await Promise.all([
        repository.listByOwner(ownerId),
        repository.countByOwnerStatus(ownerId),
      ]);

      return {
        upcoming: owned.filter(
          (event) => event.status === "published" && !hasFinished(event, now),
        ),
        publishedCount: counts.published ?? 0,
        draftCount: counts.draft ?? 0,
      };
    },

    getRelatedEvents: (event, limit) =>
      repository.listRelated({
        excludeId: event.id,
        categoryId: event.category_id,
        ownerId: event.owner_id,
        from: clock().toISOString(),
        limit,
      }),

    async createEvent(ownerId, input, publish) {
      if (publish) {
        requirePublishable(input);
      }

      const slug = await resolveSlug(ownerId, input.slug, input.title);
      const now = clock().toISOString();
      const tagIds = await repository.resolveTags(input.tags);

      const event = await repository.insertEvent(
        ownerId,
        toWriteRow(input, slug),
        publish ? "published" : "draft",
        publish ? now : null,
      );

      try {
        if (tagIds.length > 0) {
          await repository.setEventTags(event.id, tagIds);
        }
      } catch (cause) {
        // The event is not yet visible to anyone else, so removing it is
        // cheaper than leaving a half-saved row the publisher did not ask for.
        await repository.deleteEvent(event.id, ownerId).catch(() => undefined);
        throw cause;
      }

      return event;
    },

    async updateEvent(id, ownerId, input) {
      const existing = await loadOwned(id, ownerId);

      // A published slug is a public URL and MVP-1 keeps no redirect history,
      // so it is fixed once the event has been seen.
      const slug = PUBLIC_STATUSES.includes(existing.status)
        ? existing.slug
        : await resolveSlug(ownerId, input.slug, input.title, id);

      if (PUBLIC_STATUSES.includes(existing.status)) {
        requirePublishable(input);
      }

      const tagIds = await repository.resolveTags(input.tags);
      const event = await repository.updateEvent(
        id,
        ownerId,
        toWriteRow(input, slug),
      );
      await repository.setEventTags(id, tagIds);

      // Cleanup last: a failure here costs an orphaned object, whereas
      // deleting first would cost a live page a working image.
      const replaced = existing.cover_image_url;
      if (replaced && replaced !== input.coverImageUrl) {
        await repository.removeCoverImage(replaced).catch(() => undefined);
      }

      return event;
    },

    async transitionEvent(id, ownerId, to) {
      const existing = await loadOwned(id, ownerId);

      if (to === "published" && existing.status === "draft") {
        requirePublishable({
          title: existing.title,
          slug: existing.slug,
          shortDescription: existing.short_description,
          description: existing.description,
          categoryId: existing.category_id,
          eventType: existing.event_type,
          startAt: existing.start_at,
          endAt: existing.end_at,
          timezone: existing.timezone,
          venueName: existing.venue_name,
          address: existing.address,
          city: existing.city,
          countryCode: existing.country_code,
          latitude: existing.latitude,
          longitude: existing.longitude,
          onlineUrl: existing.online_url,
          isFree: existing.is_free,
          priceInfo: existing.price_info,
          ticketUrl: existing.ticket_url,
          externalUrl: existing.external_url,
          coverImageUrl: existing.cover_image_url,
          tags: [],
        });
      }

      if (to === "draft" && PUBLIC_STATUSES.includes(existing.status)) {
        throw new ApplicationError(
          "VALIDATION_FAILED",
          "A public event cannot go back to draft. Archive it instead.",
        );
      }

      return repository.updateEvent(id, ownerId, {
        status: to,
        // Set once, the first time the event goes public. Un-postponing keeps
        // the original date so "published on" stays truthful.
        published_at:
          to !== "draft" && to !== "archived" && !existing.published_at
            ? clock().toISOString()
            : existing.published_at,
      });
    },

    async deleteEvent(id, ownerId) {
      const existing = await loadOwned(id, ownerId);
      await repository.deleteEvent(id, ownerId);
      if (existing.cover_image_url) {
        await repository
          .removeCoverImage(existing.cover_image_url)
          .catch(() => undefined);
      }
    },

    uploadCoverImage: (ownerId, file) =>
      repository.uploadCoverImage(ownerId, file),
  };
}

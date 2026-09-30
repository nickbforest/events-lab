import {
  EVENT_TRANSITIONS,
  type EventDraftInput,
  type EventTransition,
  PUBLIC_EVENT_STATUSES,
} from "@/features/events/contracts";
import type {
  EventsRepository,
  EventWriteRow,
} from "@/features/events/dal/events-repository";
import { ApplicationError } from "@/lib/errors";
import { createLogger } from "@/lib/logging";
import type {
  Category,
  EventRecord,
  EventStatus,
  EventWithRelations,
} from "@/lib/types";

const log = createLogger("events.service");

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
 * Whether an event has finished. Derived rather than stored: completion is a
 * fact about the clock, and a stored copy needs a scheduled job and
 * contradicts the date until it runs.
 */
export function hasFinished(event: EventRecord, now: Date): boolean {
  return Date.parse(event.end_at ?? event.start_at) < now.getTime();
}

export function isPublicStatus(status: EventStatus): boolean {
  return PUBLIC_EVENT_STATUSES.includes(status);
}

/** Whether `to` is a status change the product allows from `from`. */
export function canTransition(from: EventStatus, to: EventTransition): boolean {
  return EVENT_TRANSITIONS[from].includes(to);
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

  // A labelled button with nowhere to go is worse than no button: it looks
  // like the event is on sale and does nothing when clicked.
  if (input.ticketCtaLabel && !input.ticketUrl) {
    blockers.ticketUrl = "The ticket button needs a link to send people to.";
  }

  return blockers;
}

/** The stored row, read back as the draft contract the rules are written for. */
function toDraftInput(event: EventRecord): EventDraftInput {
  return {
    title: event.title,
    slug: event.slug,
    shortDescription: event.short_description,
    description: event.description,
    categoryId: event.category_id,
    eventType: event.event_type,
    startAt: event.start_at,
    endAt: event.end_at,
    timezone: event.timezone,
    venueName: event.venue_name,
    address: event.address,
    city: event.city,
    countryCode: event.country_code,
    latitude: event.latitude,
    longitude: event.longitude,
    onlineUrl: event.online_url,
    isFree: event.is_free,
    priceInfo: event.price_info,
    ticketUrl: event.ticket_url,
    ticketCtaLabel: event.ticket_cta_label,
    externalUrl: event.external_url,
    coverImageUrl: event.cover_image_url,
    tags: [],
  };
}

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
    ticket_cta_label: input.ticketCtaLabel,
    external_url: input.externalUrl,
    cover_image_url: input.coverImageUrl,
  };
}

const STATUS_WORDS: Record<EventStatus, string> = {
  draft: "a draft",
  published: "a published event",
  postponed: "a postponed event",
  cancelled: "a cancelled event",
  archived: "an unpublished event",
};

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

  /**
   * A cover URL arrives in the payload, so it is user input. Only an object
   * this owner uploaded may be written: anything else could point the page
   * at another publisher's file or at an arbitrary host.
   */
  function requireOwnCover(
    ownerId: string,
    url: string | null,
    alreadyStored: string | null = null,
  ): void {
    if (
      url &&
      url !== alreadyStored &&
      !repository.isOwnedCoverUrl(ownerId, url)
    ) {
      throw new ApplicationError(
        "VALIDATION_FAILED",
        "That image could not be used. Upload it again.",
      );
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

  /**
   * Cleanup after a write that already succeeded. A failure here costs an
   * orphaned file, never a broken page, so it is logged rather than thrown —
   * failing the save over it would be worse.
   */
  async function removeCoverQuietly(
    url: string,
    context: Record<string, unknown>,
  ): Promise<void> {
    try {
      await repository.removeCoverImage(url);
    } catch (error) {
      log.error("Replaced event cover could not be removed.", error, context);
    }
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
      requireOwnCover(ownerId, input.coverImageUrl);

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
        try {
          await repository.deleteEvent(event.id, ownerId);
        } catch (rollbackError) {
          log.error(
            "Event saved without its tags could not be rolled back.",
            rollbackError,
            { eventId: event.id, ownerId },
          );
        }
        throw cause;
      }

      log.info("Event created.", {
        eventId: event.id,
        ownerId,
        status: event.status,
      });
      return event;
    },

    async updateEvent(id, ownerId, input) {
      const existing = await loadOwned(id, ownerId);
      requireOwnCover(ownerId, input.coverImageUrl, existing.cover_image_url);

      // Once an event has been public its slug is a URL someone may have
      // shared, and the MVP keeps no redirect history — so it stays fixed
      // even after the event is unpublished.
      const slug =
        existing.published_at !== null
          ? existing.slug
          : await resolveSlug(ownerId, input.slug, input.title, id);

      if (isPublicStatus(existing.status)) {
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
        await removeCoverQuietly(replaced, { eventId: id, ownerId });
      }

      log.info("Event updated.", { eventId: id, ownerId });
      return event;
    },

    async transitionEvent(id, ownerId, to) {
      const existing = await loadOwned(id, ownerId);

      if (!canTransition(existing.status, to)) {
        throw new ApplicationError(
          "VALIDATION_FAILED",
          `That change is not available for ${STATUS_WORDS[existing.status]}.`,
        );
      }

      // Every way into public view passes the same readiness rules — a draft
      // being published and an unpublished event coming back alike, since
      // either may have been edited while nobody could see it.
      if (isPublicStatus(to) && !isPublicStatus(existing.status)) {
        requirePublishable(toDraftInput(existing));
      }

      const event = await repository.updateEvent(id, ownerId, {
        status: to,
        // Set once, the first time the event goes public. Un-postponing keeps
        // the original date so "published on" stays truthful.
        published_at:
          isPublicStatus(to) && !existing.published_at
            ? clock().toISOString()
            : existing.published_at,
      });

      log.info("Event status changed.", {
        eventId: id,
        ownerId,
        from: existing.status,
        to,
      });
      return event;
    },

    async deleteEvent(id, ownerId) {
      const existing = await loadOwned(id, ownerId);
      await repository.deleteEvent(id, ownerId);
      if (existing.cover_image_url) {
        await removeCoverQuietly(existing.cover_image_url, {
          eventId: id,
          ownerId,
        });
      }
      log.info("Event deleted.", { eventId: id, ownerId });
    },

    uploadCoverImage: (ownerId, file) =>
      repository.uploadCoverImage(ownerId, file),
  };
}

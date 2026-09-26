import type { EventTagInput } from "@/features/events/contracts";
import type {
  Category,
  EventRecord,
  EventStatus,
  EventWithRelations,
} from "@/lib/types";

/**
 * The row an event write puts on the wire. Snake_case because it maps
 * one-to-one onto the `events` columns; the BLL builds it from the validated
 * camelCase contract so the DAL never has to know about form shapes.
 *
 * `owner_id` is absent on purpose — the DAL takes it as a separate argument
 * that always comes from the verified session, never from a payload.
 */
export type EventWriteRow = Omit<
  EventRecord,
  "id" | "owner_id" | "tags" | "status" | "published_at"
>;

export interface EventVisibleListOptions {
  /** Only events starting at or after this instant. */
  from?: string;
  /** Only events starting before this instant. */
  until?: string;
  order: "asc" | "desc";
  limit?: number;
}

export interface RelatedEventOptions {
  excludeId: string;
  categoryId: string;
  ownerId: string;
  from: string;
  limit: number;
}

/**
 * Filtering lives in SQL, not in the service. The in-memory prototype could
 * load every event and filter in JavaScript; a real table cannot, and a
 * repository interface that invites it would make that mistake permanent.
 */
export interface EventsRepository {
  listCategories(): Promise<readonly Category[]>;

  /** Upserts each tag by slug and returns the canonical ids. */
  resolveTags(tags: readonly EventTagInput[]): Promise<readonly string[]>;

  findVisibleBySlug(
    username: string,
    slug: string,
  ): Promise<EventWithRelations | null>;

  listVisibleByUsername(
    username: string,
    options: EventVisibleListOptions,
  ): Promise<EventWithRelations[]>;

  listRelated(options: RelatedEventOptions): Promise<EventWithRelations[]>;

  listByOwner(ownerId: string): Promise<EventWithRelations[]>;

  findByIdForOwner(
    id: string,
    ownerId: string,
  ): Promise<EventWithRelations | null>;

  countByOwnerStatus(ownerId: string): Promise<Record<EventStatus, number>>;

  /** True when this owner already uses the slug on a different event. */
  slugExists(
    ownerId: string,
    slug: string,
    exceptEventId?: string,
  ): Promise<boolean>;

  insertEvent(
    ownerId: string,
    row: EventWriteRow,
    status: EventStatus,
    publishedAt: string | null,
  ): Promise<EventRecord>;

  updateEvent(
    id: string,
    ownerId: string,
    patch: Partial<EventWriteRow> & {
      status?: EventStatus;
      published_at?: string | null;
    },
  ): Promise<EventRecord>;

  deleteEvent(id: string, ownerId: string): Promise<void>;

  setEventTags(eventId: string, tagIds: readonly string[]): Promise<void>;

  /** Returns the public URL of the stored object. */
  uploadCoverImage(ownerId: string, file: File): Promise<string>;

  /** Ignores an object that is already gone; removal is best-effort cleanup. */
  removeCoverImage(url: string): Promise<void>;
}

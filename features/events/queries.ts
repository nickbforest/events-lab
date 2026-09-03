import { CATEGORIES, EVENTS, PROFILES } from "@/lib/mock-data";
import type { EventRecord, EventWithRelations } from "@/lib/types";

/**
 * Read paths for events.
 *
 * These are async on purpose: they have the same shape the Supabase queries
 * will have, so introducing the real client changes only this file.
 *
 * Public reads return published events only. That rule is enforced by RLS in
 * the real system — mirrored here so the prototype behaves honestly.
 */

function join(event: EventRecord): EventWithRelations {
  const owner = PROFILES.find((p) => p.id === event.owner_id);
  const category = CATEGORIES.find((c) => c.id === event.category_id);

  if (!owner || !category) {
    throw new Error(`Event ${event.id} references a missing relation`);
  }

  return { ...event, owner, category };
}

function byStartAscending(a: EventRecord, b: EventRecord) {
  return Date.parse(a.start_at) - Date.parse(b.start_at);
}

const isPubliclyVisible = (event: EventRecord) =>
  event.status !== "draft" && event.status !== "archived";

export async function getPublishedEventBySlug(
  username: string,
  slug: string,
): Promise<EventWithRelations | null> {
  const owner = PROFILES.find((p) => p.username === username);
  if (!owner) return null;

  const event = EVENTS.find(
    (e) => e.owner_id === owner.id && e.slug === slug && isPubliclyVisible(e),
  );

  return event ? join(event) : null;
}

/** Upcoming published events for a publisher's public page. */
export async function getUpcomingEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  const owner = PROFILES.find((p) => p.username === username);
  if (!owner) return [];

  const now = Date.now();
  return EVENTS.filter(
    (e) =>
      e.owner_id === owner.id &&
      isPubliclyVisible(e) &&
      Date.parse(e.start_at) >= now,
  )
    .sort(byStartAscending)
    .map(join);
}

export async function getPastEventsByUsername(
  username: string,
): Promise<EventWithRelations[]> {
  const owner = PROFILES.find((p) => p.username === username);
  if (!owner) return [];

  const now = Date.now();
  return EVENTS.filter(
    (e) =>
      e.owner_id === owner.id &&
      isPubliclyVisible(e) &&
      Date.parse(e.start_at) < now,
  )
    .sort((a, b) => Date.parse(b.start_at) - Date.parse(a.start_at))
    .map(join);
}

/**
 * Every event owned by the signed-in publisher, drafts included.
 * Stands in for the authenticated dashboard query.
 */
export async function getOwnedEvents(
  ownerId: string,
): Promise<EventWithRelations[]> {
  return EVENTS.filter((e) => e.owner_id === ownerId)
    .sort(byStartAscending)
    .map(join);
}

export interface DashboardSummary {
  upcoming: EventWithRelations[];
  publishedCount: number;
  draftCount: number;
}

/**
 * Counts and upcoming list for the dashboard overview.
 *
 * Time-based partitioning lives here rather than in the page: reading the
 * clock during render is impure, and code-standard.md §5 keeps business
 * rules out of components regardless.
 */
export async function getDashboardSummary(
  ownerId: string,
): Promise<DashboardSummary> {
  const owned = EVENTS.filter((e) => e.owner_id === ownerId);
  const now = Date.now();

  const upcoming = owned
    .filter((e) => e.status === "published" && Date.parse(e.start_at) >= now)
    .sort(byStartAscending)
    .map(join);

  return {
    upcoming,
    publishedCount: owned.filter((e) => e.status === "published").length,
    draftCount: owned.filter((e) => e.status === "draft").length,
  };
}

export async function getRelatedEvents(
  event: EventWithRelations,
  limit = 3,
): Promise<EventWithRelations[]> {
  const now = Date.now();
  return EVENTS.filter(
    (e) =>
      e.id !== event.id &&
      isPubliclyVisible(e) &&
      Date.parse(e.start_at) >= now &&
      (e.category_id === event.category_id || e.owner_id === event.owner_id),
  )
    .sort(byStartAscending)
    .slice(0, limit)
    .map(join);
}

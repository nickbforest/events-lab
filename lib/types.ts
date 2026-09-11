/**
 * Domain types for events-lab.
 *
 * These mirror the PostgreSQL schema agreed in the MVP-1 blueprint. When
 * Supabase is introduced these are replaced by generated database types —
 * field names are snake_case here for exactly that reason.
 */

export type PublisherType =
  | "artist"
  | "band"
  | "theater"
  | "cinema"
  | "sports_team"
  | "event_organizer"
  | "school"
  | "university"
  | "conference_organizer"
  | "church"
  | "community"
  | "venue"
  | "business"
  | "other";

export type EventType = "in_person" | "online" | "hybrid";

export type EventStatus =
  | "draft"
  | "published"
  | "cancelled"
  | "postponed"
  | "completed"
  | "archived";

export interface Profile {
  id: string;
  username: string;
  display_name: string;
  publisher_type: PublisherType;
  bio: string | null;
  avatar_url: string | null;
  cover_url: string | null;
  website_url: string | null;
  city: string | null;
  country_code: string | null;
  social_links: Record<string, string>;
}

export interface Category {
  id: string;
  slug: string;
  label: string;
}

export interface EventRecord {
  id: string;
  owner_id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  category_id: string;
  event_type: EventType;
  status: EventStatus;

  /** ISO 8601 with offset. Never a formatted display string. */
  start_at: string;
  end_at: string | null;
  /** IANA identifier, e.g. "Asia/Tbilisi". */
  timezone: string;

  venue_name: string | null;
  address: string | null;
  city: string | null;
  country_code: string | null;
  latitude: number | null;
  longitude: number | null;
  online_url: string | null;

  is_free: boolean;
  price_info: string | null;
  ticket_url: string | null;
  external_url: string | null;

  cover_image_url: string | null;
  published_at: string | null;
  tags: string[];
}

/** An event joined with its publisher and category, as the UI consumes it. */
export interface EventWithRelations extends EventRecord {
  owner: Profile;
  category: Category;
}

/**
 * A single recorded interaction with a publisher's public surface.
 *
 * One row per hit rather than a pre-aggregated counter: the dashboard needs
 * to re-window the same data by day (7 / 30 / all), and totals cannot be
 * re-bucketed after the fact. Aggregation happens in the query layer.
 */
export type AnalyticsMetric = "page_view" | "ticket_click";

export interface AnalyticsRecord {
  id: string;
  /** The publisher whose surface was hit — the tenant this row is scoped to. */
  owner_id: string;
  /** The event that was viewed, or null for the publisher's profile page. */
  event_id: string | null;
  metric: AnalyticsMetric;
  /** ISO 8601 with offset. */
  occurred_at: string;
}

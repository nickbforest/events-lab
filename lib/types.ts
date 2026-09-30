/**
 * Domain types for events-lab.
 *
 * The shapes the UI and the BLL work with. DAL adapters map generated Supabase
 * rows onto them, which is why field names stay snake_case. Enums are derived
 * from the generated database types rather than restated.
 */

import type { Enums } from "@/lib/supabase/database.types";

export type PublisherType = Enums<"publisher_type">;

export type EventType = Enums<"event_type">;

/**
 * Derived from the generated enum, so a migration that adds or removes a value
 * is a compile error everywhere it is handled rather than a silent mismatch.
 *
 * There is deliberately no `completed`: whether an event has finished is a
 * fact about `end_at`, not an author's intent. See `hasFinished` in the events
 * service and the note in the events migration.
 */
export type EventStatus = Enums<"event_status">;

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
  /** Label for the ticket button. Null falls back to "Get tickets". */
  ticket_cta_label: string | null;
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

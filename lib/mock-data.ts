import type {
  AnalyticsRecord,
  Category,
  EventRecord,
  Profile,
} from "./types";

/**
 * Placeholder content for the visual prototype.
 *
 * This module is the single seam between the UI and its data. When Supabase
 * arrives, the query functions in `features/*\/queries.ts` switch to real
 * queries and this file is deleted — no component changes.
 *
 * The dataset is intentionally empty: only the fixed category list and the
 * single signed-in publisher exist. Every screen therefore renders the state
 * a real new account starts in, so empty states are exercised by default
 * instead of being hidden behind demo content.
 */

export const CATEGORIES: Category[] = [
  { id: "cat-concert", slug: "concert", label: "Concert" },
  { id: "cat-theater", slug: "theater", label: "Theater" },
  { id: "cat-cinema", slug: "cinema", label: "Cinema" },
  { id: "cat-sports", slug: "sports", label: "Sports" },
  { id: "cat-conference", slug: "conference", label: "Conference" },
  { id: "cat-festival", slug: "festival", label: "Festival" },
  { id: "cat-exhibition", slug: "exhibition", label: "Exhibition" },
  { id: "cat-community", slug: "community", label: "Community" },
];

/**
 * The publisher the dashboard is acting as.
 *
 * Stands in for the row `requireUser()` will read from the Supabase session.
 * A fresh account with nothing filled in, which is what the dashboard should
 * look like before the first event exists.
 */
export const CURRENT_USER: Profile = {
  id: "usr-current",
  username: "your-page",
  display_name: "Your Page",
  publisher_type: "event_organizer",
  bio: null,
  avatar_url: null,
  cover_url: null,
  website_url: null,
  city: null,
  country_code: null,
  social_links: {},
};

/**
 * Only the signed-in publisher exists, so their public page resolves from the
 * dashboard preview link while discovery has nothing to list.
 */
export const PROFILES: Profile[] = [CURRENT_USER];

export const EVENTS: EventRecord[] = [];

/**
 * Recorded page views and ticket clicks for the dashboard overview.
 *
 * Empty for the same reason `EVENTS` is: a new account has no traffic, so the
 * overview renders the zero state a real publisher sees on day one. Writes
 * arrive with the tracking endpoint; until then nothing produces rows.
 */
export const ANALYTICS: AnalyticsRecord[] = [];

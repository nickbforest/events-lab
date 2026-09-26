import type { Profile } from "@/lib/types";

/**
 * Shared fixture values for profile tests.
 *
 * Every identifier, username and URL a profile test needs lives here rather
 * than being retyped at each assertion. A literal repeated across a file is
 * the same problem in a test as in production code: when the shape changes,
 * some copies get updated and the rest quietly keep asserting the old world.
 *
 * Host names come from `TEST_ENV` below so nothing in a test hard-codes a
 * real domain.
 */

/** Test-only environment, overridable without touching an assertion. */
export const TEST_ENV = {
  /** Stands in for the Supabase Storage public host. */
  mediaHost: process.env.TEST_MEDIA_HOST ?? "https://storage.test.invalid",
  /** Stands in for an external site a publisher might link to. */
  externalHost: process.env.TEST_EXTERNAL_HOST ?? "https://example.invalid",
} as const;

export const OWNER_ID = "owner-1";
export const OTHER_OWNER_ID = "owner-2";
export const OWNER_USERNAME = "nickb";
export const OWNER_DISPLAY_NAME = "Nick B";

export const AVATAR_PATH = `${OWNER_ID}/avatar-new.png`;
export const AVATAR_URL = `${TEST_ENV.mediaHost}/${AVATAR_PATH}`;
export const PROFILE_WEBSITE_URL = `${TEST_ENV.externalHost}/nickb`;
export const PROFILE_TWITTER_URL = `${TEST_ENV.externalHost}/twitter/nickb`;

export const storedProfile: Profile = {
  id: OWNER_ID,
  username: OWNER_USERNAME,
  display_name: OWNER_DISPLAY_NAME,
  publisher_type: "artist",
  bio: null,
  avatar_url: null,
  cover_url: null,
  website_url: null,
  city: null,
  country_code: null,
  social_links: {},
};

/** The empty social-link map, so a test states only the links it cares about. */
export const emptySocialLinks = {
  twitter: null,
  instagram: null,
  facebook: null,
  youtube: null,
  soundcloud: null,
  spotify: null,
  apple_music: null,
} as const;

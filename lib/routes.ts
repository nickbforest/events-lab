/**
 * Every URL in the application, in one place.
 *
 * A route written as a string literal at a call site is a magic string: it
 * cannot be renamed safely, it cannot be found reliably, and a typo in one is
 * a broken link nobody notices until someone clicks it. Import from here
 * instead — renaming a route should be one edit in this file.
 *
 * Two shapes live here and they are not interchangeable:
 *
 * - `routes.*` build a concrete href for a link or a redirect.
 * - `routePatterns.*` are Next.js segment patterns, for `revalidatePath` with
 *   its "page" type. Passing a concrete href where a pattern is expected
 *   silently revalidates nothing.
 */

/** Everything a signed-out visitor can reach. */
const PUBLIC = {
  home: "/",
  discover: "/discover",
} as const;

/**
 * `/publishers` rather than `/u`: the segment is read by people, shared in
 * messages and read aloud, and a single letter says nothing about what is on
 * the other side of it. Renamed 2026-09-26 in review.
 */
const PUBLISHERS_SEGMENT = "publishers";

export type AuthMode = "login" | "signup";

/** Notices an auth screen can be asked to show. Never free text in a URL. */
export const AUTH_NOTICES = ["password-changed"] as const;
export type AuthNotice = (typeof AUTH_NOTICES)[number];

/** Reasons `/auth/confirm` sends someone onward. */
export const routes = {
  home: () => PUBLIC.home,
  discover: () => PUBLIC.discover,

  /** A publisher's public page. */
  publisher: (username: string) => `/${PUBLISHERS_SEGMENT}/${username}`,

  /** A single public event under its publisher. */
  event: (username: string, slug: string) =>
    `/${PUBLISHERS_SEGMENT}/${username}/${slug}`,

  auth: {
    /** The combined sign-in / sign-up screen, in the given mode. */
    mode: (mode: AuthMode, notice?: AuthNotice) =>
      notice ? `/auth?mode=${mode}&notice=${notice}` : `/auth?mode=${mode}`,
    signIn: () => "/auth?mode=login",
    signUp: () => "/auth?mode=signup",
    forgotPassword: () => "/auth/forgot-password",
    updatePassword: () => "/auth/update-password",
    linkExpired: () => "/auth/link-expired",
    confirm: () => "/auth/confirm",
    checkEmail: (email?: string) =>
      email
        ? `/auth/check-email?email=${encodeURIComponent(email)}`
        : "/auth/check-email",
  },

  dashboard: {
    root: () => "/dashboard",
    events: () => "/dashboard/events",
    newEvent: () => "/dashboard/events/new",
    profile: () => "/dashboard/profile",
    settings: () => "/dashboard/settings",
  },

  api: {
    usernameAvailable: (username: string) =>
      `/api/auth/username-available?username=${encodeURIComponent(username)}`,
  },
} as const;

/**
 * Segment patterns for `revalidatePath(path, "page")`.
 *
 * These must match the file-system route exactly, brackets included. A
 * concrete href here is not an error Next.js reports — it just does nothing.
 */
export const routePatterns = {
  publisher: `/${PUBLISHERS_SEGMENT}/[username]` as const,
  event: `/${PUBLISHERS_SEGMENT}/[username]/[slug]` as const,
} as const;

/**
 * Usernames become the first segment of a public URL, so any first-level
 * route name is a username nobody may take. Kept here, beside the routes it
 * protects, so adding a route and reserving its name is one change.
 */
export const RESERVED_ROUTE_SEGMENTS: readonly string[] = [
  "api",
  "auth",
  "dashboard",
  "discover",
  PUBLISHERS_SEGMENT,
];

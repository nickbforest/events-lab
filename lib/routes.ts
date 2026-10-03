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

/** Everything a signed-out visitor can reach outside publisher pages. */
const PUBLIC = {
  home: "/",
} as const;

/**
 * `/publisher` rather than `/u`: the segment is read by people, shared in
 * messages and read aloud, and a single letter says nothing about what is on
 * the other side of it. Renamed from `/u` 2026-09-26 in review, and from
 * `/publishers` to the singular 2026-10-03 — a link names one publisher.
 * `next.config.ts` redirects the old plural permanently, so links shared
 * before the rename still land.
 */
export const PUBLISHER_SEGMENT = "publisher";

/** The plural segment used until 2026-10-03; only ever a redirect now. */
export const LEGACY_PUBLISHER_SEGMENT = "publishers";

/** Marks a public page as being previewed by its own publisher. */
export const PREVIEW_PARAM = "preview";

export type AuthMode = "login" | "signup";

/** Notices an auth screen can be asked to show. Never free text in a URL. */
export const AUTH_NOTICES = ["password-changed"] as const;
export type AuthNotice = (typeof AUTH_NOTICES)[number];

/** Reasons `/auth/confirm` sends someone onward. */
export const routes = {
  home: () => PUBLIC.home,

  /** A publisher's public page. */
  publisher: (username: string) => `/${PUBLISHER_SEGMENT}/${username}`,

  /**
   * The same page without the site header, for a publisher checking their
   * own work. Opened in a new tab, so the dashboard stays where it was.
   */
  publisherPreview: (username: string) =>
    `/${PUBLISHER_SEGMENT}/${username}?${PREVIEW_PARAM}=1`,

  /** A single public event under its publisher. */
  event: (username: string, slug: string) =>
    `/${PUBLISHER_SEGMENT}/${username}/${slug}`,

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
    // No standalone create page: events are created in a modal over the
    // events list, so there is one create path rather than two.
    editEvent: (eventId: string) => `/dashboard/events/${eventId}/edit`,
    profile: () => "/dashboard/profile",
    settings: () => "/dashboard/settings",
  },

  /**
   * Route Handlers, as paths relative to `apiClient`'s `/api` base URL —
   * Axios prefixes the base, so these never repeat it.
   */
  api: {
    usernameAvailable: () => "/auth/username-available",
    analytics: () => "/analytics",
  },
} as const;

/**
 * Segment patterns for `revalidatePath(path, "page")`.
 *
 * These must match the file-system route exactly, brackets included. A
 * concrete href here is not an error Next.js reports — it just does nothing.
 */
export const routePatterns = {
  publisher: `/${PUBLISHER_SEGMENT}/[username]` as const,
  event: `/${PUBLISHER_SEGMENT}/[username]/[slug]` as const,
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
  // No page yet: discovery is post-MVP, and the name is held for it.
  "discover",
  PUBLISHER_SEGMENT,
  LEGACY_PUBLISHER_SEGMENT,
];

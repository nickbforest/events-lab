import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import type { Profile } from "@/lib/types";

/**
 * Usernames become public URLs and appear alongside product surfaces, so a few
 * are held back: routes we may add later, and names that would let an account
 * pass itself off as part of events-lab.
 */
const RESERVED_USERNAMES = new Set([
  "about",
  "admin",
  "administrator",
  "api",
  "auth",
  "contact",
  "dashboard",
  "discover",
  "event",
  "events",
  "events-lab",
  "eventslab",
  "help",
  "login",
  "logout",
  "me",
  "moderator",
  "new",
  "privacy",
  "profile",
  "root",
  "settings",
  "signup",
  "staff",
  "support",
  "system",
  "terms",
  "u",
  "user",
]);

export interface ProfilesService {
  getProfileById(id: string): Promise<Profile | null>;
  getProfileByUsername(username: string): Promise<Profile | null>;
  isUsernameAvailable(username: string): Promise<boolean>;
}

export function createProfilesService(
  repository: ProfilesRepository,
): ProfilesService {
  return {
    getProfileById: (id) => repository.findById(id),

    getProfileByUsername: (username) => repository.findByUsername(username),

    async isUsernameAvailable(username) {
      if (RESERVED_USERNAMES.has(username)) return false;
      return !(await repository.isUsernameTaken(username));
    },
  };
}

import type {
  ProfileMediaInput,
  ProfileUpdateInput,
} from "@/features/profiles/contracts";
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
  /**
   * `ownerId` comes from the verified session at the composition root, never
   * from the submitted payload — it is the whole authorization decision.
   */
  updateProfile(ownerId: string, input: ProfileUpdateInput): Promise<Profile>;
  updateProfileMedia(
    ownerId: string,
    input: ProfileMediaInput,
  ): Promise<Profile>;
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

    updateProfile(ownerId, input) {
      // Links the publisher cleared are dropped from the map rather than
      // stored as null, so `social_links` only ever holds live links.
      const socialLinks: Record<string, string> = {};
      for (const [key, value] of Object.entries(input.socialLinks)) {
        if (value) socialLinks[key] = value;
      }

      return repository.update(ownerId, {
        display_name: input.displayName,
        publisher_type: input.publisherType,
        bio: input.bio,
        city: input.city,
        country_code: input.countryCode,
        website_url: input.websiteUrl,
        social_links: socialLinks,
      });
    },

    async updateProfileMedia(ownerId, { kind, file }) {
      // Upload, then repoint the profile, then clean up. In this order a
      // failure at any step leaves the page showing a working image: at worst
      // an unreferenced file is left behind, never a broken one referenced.
      const stored = await repository.uploadMedia(ownerId, kind, file);
      const profile = await repository.setMediaUrl(
        ownerId,
        kind,
        stored.publicUrl,
      );

      try {
        await repository.removeMediaExcept(ownerId, kind, stored.path);
      } catch (error) {
        console.error("Replaced profile media could not be removed.", error);
      }

      return profile;
    },
  };
}

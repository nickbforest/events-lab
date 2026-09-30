import type {
  ProfileMediaInput,
  ProfileMediaKind,
  ProfileUpdateInput,
} from "@/features/profiles/contracts";
import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import { createLogger } from "@/lib/logging";
import { RESERVED_ROUTE_SEGMENTS } from "@/lib/routes";
import type { Profile } from "@/lib/types";

const log = createLogger("profiles.service");

/**
 * Usernames become public URLs, so a few are held back: the route segments
 * the application already owns, plus names that would let an account pass
 * itself off as part of events-lab.
 *
 * The route segments come from `lib/routes.ts` rather than being restated
 * here, so adding a top-level route and reserving its name is one change.
 *
 * The `handle_new_user` trigger enforces the same list for sign-ups that
 * bypass the application (latest `*_harden_profiles.sql` migration). A test
 * compares the two and fails when they drift — change both together.
 */
export const RESERVED_USERNAMES: ReadonlySet<string> = new Set<string>([
  ...RESERVED_ROUTE_SEGMENTS,
  "about",
  "admin",
  "administrator",
  "contact",
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
  "publisher",
  "root",
  "settings",
  "signup",
  "staff",
  "support",
  "system",
  "terms",
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
  removeProfileMedia(ownerId: string, kind: ProfileMediaKind): Promise<Profile>;
}

export function createProfilesService(
  repository: ProfilesRepository,
): ProfilesService {
  return {
    getProfileById: (id) => repository.findById(id),

    getProfileByUsername: (username) => repository.findByUsername(username),

    async isUsernameAvailable(username) {
      if (RESERVED_USERNAMES.has(username)) {
        return false;
      }
      return !(await repository.isUsernameTaken(username));
    },

    updateProfile(ownerId, input) {
      // Links the publisher cleared are dropped from the map rather than
      // stored as null, so `social_links` only ever holds live links.
      const socialLinks: Record<string, string> = {};
      for (const [key, value] of Object.entries(input.socialLinks)) {
        if (value) {
          socialLinks[key] = value;
        }
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
        // Swallowed on purpose: the new image is already live, so failing the
        // upload over a leftover file would be worse than leaking one. The
        // log is what makes that leak findable.
        log.error("Replaced profile media could not be removed.", error, {
          ownerId,
          kind,
        });
      }

      return profile;
    },

    async removeProfileMedia(ownerId, kind) {
      // Unlink first, then delete the files: the same ordering as a replace,
      // so a failure never leaves the profile pointing at a missing image.
      const profile = await repository.setMediaUrl(ownerId, kind, null);

      try {
        await repository.removeMediaExcept(ownerId, kind, null);
      } catch (error) {
        // Swallowed for the same reason as above: the image is already gone
        // from the page, which is what the publisher asked for.
        log.error("Removed profile media could not be deleted.", error, {
          ownerId,
          kind,
        });
      }

      return profile;
    },
  };
}

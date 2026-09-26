import type { ProfileMediaKind } from "@/features/profiles/contracts";
import type { Profile } from "@/lib/types";

export interface StoredMedia {
  path: string;
  publicUrl: string;
}

/**
 * The owner-editable columns, derived from the domain type so a new profile
 * field cannot be added to one and forgotten in the other.
 */
export type ProfileUpdate = Pick<
  Profile,
  | "display_name"
  | "publisher_type"
  | "bio"
  | "city"
  | "country_code"
  | "website_url"
  | "social_links"
>;

export interface ProfilesRepository {
  findById(id: string): Promise<Profile | null>;
  findByUsername(username: string): Promise<Profile | null>;
  isUsernameTaken(username: string): Promise<boolean>;
  update(id: string, patch: ProfileUpdate): Promise<Profile>;
  uploadMedia(
    ownerId: string,
    kind: ProfileMediaKind,
    file: File,
  ): Promise<StoredMedia>;
  /** `null` clears the image, so the public page renders without it. */
  setMediaUrl(
    ownerId: string,
    kind: ProfileMediaKind,
    url: string | null,
  ): Promise<Profile>;
  /**
   * Removes every stored object of `kind` for the owner except `keepPath`;
   * with `null`, removes all of them.
   */
  removeMediaExcept(
    ownerId: string,
    kind: ProfileMediaKind,
    keepPath: string | null,
  ): Promise<void>;
}

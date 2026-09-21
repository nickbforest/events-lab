import type { Profile } from "@/lib/types";

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
}

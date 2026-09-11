import type { Profile } from "@/lib/types";

export interface ProfilesRepository {
  getCurrentProfile(): Promise<Profile>;
  listProfiles(): Promise<readonly Profile[]>;
}

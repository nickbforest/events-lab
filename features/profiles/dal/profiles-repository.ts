import type { Profile } from "@/lib/types";

export interface ProfilesRepository {
  findById(id: string): Promise<Profile | null>;
  findByUsername(username: string): Promise<Profile | null>;
  isUsernameTaken(username: string): Promise<boolean>;
  listProfiles(): Promise<readonly Profile[]>;
}

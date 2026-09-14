import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import type { Profile } from "@/lib/types";

export interface ProfilesService {
  getCurrentProfile(): Promise<Profile>;
  getProfileByUsername(username: string): Promise<Profile | null>;
  listProfileUsernames(): Promise<string[]>;
}

export function createProfilesService(
  repository: ProfilesRepository,
): ProfilesService {
  return {
    getCurrentProfile: () => repository.getCurrentProfile(),

    async getProfileByUsername(username) {
      const profiles = await repository.listProfiles();
      return profiles.find((profile) => profile.username === username) ?? null;
    },

    async listProfileUsernames() {
      const profiles = await repository.listProfiles();
      return profiles.map((profile) => profile.username);
    },
  };
}

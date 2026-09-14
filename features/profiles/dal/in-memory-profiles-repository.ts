import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import { CURRENT_USER, PROFILES } from "@/lib/mock-data";
import type { Profile } from "@/lib/types";

export class InMemoryProfilesRepository implements ProfilesRepository {
  constructor(
    private readonly profiles: readonly Profile[] = PROFILES,
    private readonly currentProfile: Profile = CURRENT_USER,
  ) {}

  async getCurrentProfile(): Promise<Profile> {
    return this.currentProfile;
  }

  async listProfiles(): Promise<readonly Profile[]> {
    return this.profiles;
  }
}

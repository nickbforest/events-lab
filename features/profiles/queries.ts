import "server-only";

import { createProfilesService } from "@/features/profiles/bll/profiles-service";
import { profileUsernameSchema } from "@/features/profiles/contracts";
import { InMemoryProfilesRepository } from "@/features/profiles/dal/in-memory-profiles-repository";
import type { Profile } from "@/lib/types";

const profilesService = createProfilesService(new InMemoryProfilesRepository());

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  return profilesService.getProfileByUsername(
    profileUsernameSchema.parse(username),
  );
}

export async function listProfileUsernames(): Promise<string[]> {
  return profilesService.listProfileUsernames();
}

export async function getCurrentProfile(): Promise<Profile> {
  return profilesService.getCurrentProfile();
}

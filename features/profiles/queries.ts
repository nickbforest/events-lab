import "server-only";

import { verifySession } from "@/features/auth/queries";
import { profileUsernameSchema } from "@/features/profiles/contracts";
import {
  getProfilesService,
  getPublicProfilesService,
} from "@/features/profiles/service";
import { ApplicationError } from "@/lib/errors";
import type { Profile } from "@/lib/types";

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  return getPublicProfilesService().getProfileByUsername(
    profileUsernameSchema.parse(username),
  );
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  return getPublicProfilesService().isUsernameAvailable(
    profileUsernameSchema.parse(username),
  );
}

export async function getCurrentProfile(): Promise<Profile> {
  const user = await verifySession();
  const service = await getProfilesService();
  const profile = await service.getProfileById(user.id);

  if (!profile) {
    // The signup trigger makes this unreachable; if it happens the account is
    // genuinely broken and should not be papered over with a placeholder.
    throw new ApplicationError(
      "NOT_FOUND",
      "Signed-in account has no profile.",
    );
  }

  return profile;
}

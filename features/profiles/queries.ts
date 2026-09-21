import "server-only";

import { verifySession } from "@/features/auth/queries";
import { usernameSchema } from "@/features/profiles/contracts";
import {
  getProfilesService,
  getPublicProfilesService,
} from "@/features/profiles/service";
import { ApplicationError } from "@/lib/errors";
import type { Profile } from "@/lib/types";

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  // A malformed username is a 404, not a crash: this runs on a public route
  // parameter, so anything the constraint would reject simply has no profile.
  const parsed = usernameSchema.safeParse(username);
  if (!parsed.success) return null;

  return getPublicProfilesService().getProfileByUsername(parsed.data);
}

export async function isUsernameAvailable(username: string): Promise<boolean> {
  return getPublicProfilesService().isUsernameAvailable(
    usernameSchema.parse(username),
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

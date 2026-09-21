"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/features/auth/queries";
import { profileUpdateSchema } from "@/features/profiles/contracts";
import { getProfilesService } from "@/features/profiles/service";
import { type FormResult, firstFieldErrors } from "@/lib/forms";

export type ProfileField =
  | "displayName"
  | "publisherType"
  | "bio"
  | "city"
  | "countryCode"
  | "websiteUrl"
  | "socialLinks";

export async function updateProfileAction(
  input: unknown,
): Promise<FormResult<ProfileField>> {
  const parsed = profileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<ProfileField>(parsed.error),
    };
  }

  const user = await verifySession();
  const service = await getProfilesService();
  const profile = await service.updateProfile(user.id, parsed.data);

  revalidatePath("/dashboard/profile");
  revalidatePath(`/u/${profile.username}`);

  return { status: "success" };
}

"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/features/auth/queries";
import {
  profileMediaSchema,
  profileUpdateSchema,
} from "@/features/profiles/contracts";
import { getProfilesService } from "@/features/profiles/service";
import { DataAccessError } from "@/lib/errors";
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

export async function updateProfileMediaAction(
  formData: FormData,
): Promise<FormResult<"file">> {
  const parsed = profileMediaSchema.safeParse({
    kind: formData.get("kind"),
    file: formData.get("file"),
  });

  if (!parsed.success) {
    const { file, kind } = firstFieldErrors<"file" | "kind">(parsed.error);
    return kind
      ? { status: "error", message: "Unknown image type." }
      : { status: "error", fieldErrors: { file } };
  }

  const user = await verifySession();
  const service = await getProfilesService();

  let username: string;
  try {
    ({ username } = await service.updateProfileMedia(user.id, parsed.data));
  } catch (error) {
    if (!(error instanceof DataAccessError)) throw error;
    console.error(error);
    return {
      status: "error",
      message: "The image could not be uploaded. Please try again.",
    };
  }

  revalidatePath("/dashboard/profile");
  revalidatePath(`/u/${username}`);

  return { status: "success" };
}

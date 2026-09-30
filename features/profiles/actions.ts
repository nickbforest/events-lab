"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/features/auth/queries";
import {
  compiledProfileMediaKindSchema,
  compiledProfileMediaSchema,
  compiledProfileUpdateSchema,
} from "@/features/profiles/contracts";
import { getProfilesService } from "@/features/profiles/service";
import { actionFailure } from "@/lib/action-errors";
import { type FormResult, firstFieldErrors } from "@/lib/forms";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("profiles.actions");

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
  const parsed = compiledProfileUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<ProfileField>(parsed.error),
    };
  }

  const user = await verifySession();
  const service = await getProfilesService();

  try {
    const profile = await service.updateProfile(user.id, parsed.data);
    revalidatePath(routes.dashboard.profile());
    revalidatePath(routes.publisher(profile.username));
    return { status: "success" };
  } catch (error) {
    return actionFailure<ProfileField>(log, "updateProfile", error);
  }
}

export async function updateProfileMediaAction(
  formData: FormData,
): Promise<FormResult<"file">> {
  const parsed = compiledProfileMediaSchema.safeParse({
    kind: formData.get("kind"),
    file: formData.get("file"),
  });

  if (!parsed.success) {
    const { file, kind } = firstFieldErrors<"file" | "kind">(parsed.error);
    // A bad `kind` is not something the person typed — it means the form and
    // this action disagree, so it gets a form-level message, not a field one.
    if (kind !== undefined) {
      log.warn("Profile media upload sent an unknown kind.", { kind });
      return { status: "error", message: "Unknown image type." };
    }
    return { status: "error", fieldErrors: { file } };
  }

  const user = await verifySession();
  const service = await getProfilesService();

  try {
    const { username } = await service.updateProfileMedia(user.id, parsed.data);
    revalidatePath(routes.dashboard.profile());
    revalidatePath(routes.publisher(username));
    return { status: "success" };
  } catch (error) {
    return actionFailure<"file">(log, "updateProfileMedia", error);
  }
}

export async function removeProfileMediaAction(
  kind: unknown,
): Promise<FormResult<"file">> {
  const parsed = compiledProfileMediaKindSchema.safeParse(kind);
  if (!parsed.success) {
    log.warn("Profile media removal sent an unknown kind.", { kind });
    return { status: "error", message: "Unknown image type." };
  }

  const user = await verifySession();
  const service = await getProfilesService();

  try {
    const { username } = await service.removeProfileMedia(user.id, parsed.data);
    revalidatePath(routes.dashboard.profile());
    revalidatePath(routes.publisher(username));
    return { status: "success" };
  } catch (error) {
    return actionFailure<"file">(log, "removeProfileMedia", error);
  }
}

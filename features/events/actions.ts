"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/features/auth/queries";
import {
  eventDraftSchema,
  eventIdSchema,
  eventMediaSchema,
  eventTransitionSchema,
} from "@/features/events/contracts";
import { getEventsService } from "@/features/events/service";
import { getCurrentProfile } from "@/features/profiles/queries";
import { ApplicationError } from "@/lib/errors";
import { type FormResult, firstFieldErrors } from "@/lib/forms";

export type EventField =
  | "title"
  | "slug"
  | "shortDescription"
  | "description"
  | "categoryId"
  | "eventType"
  | "startAt"
  | "endAt"
  | "timezone"
  | "venueName"
  | "address"
  | "city"
  | "countryCode"
  | "latitude"
  | "longitude"
  | "onlineUrl"
  | "isFree"
  | "priceInfo"
  | "ticketUrl"
  | "externalUrl"
  | "coverImageUrl"
  | "tags";

export type SaveEventResult = FormResult<EventField> & { eventId?: string };

async function revalidateFor(username: string, slug?: string): Promise<void> {
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/events");
  revalidatePath(`/u/${username}`);
  if (slug) revalidatePath(`/u/${username}/${slug}`);
}

/**
 * Publish-readiness failures arrive as an ApplicationError carrying the first
 * blocking message, which belongs on the form rather than in a crash.
 */
function toFormError(error: unknown): SaveEventResult {
  if (error instanceof ApplicationError && error.code === "VALIDATION_FAILED") {
    return { status: "error", message: error.message };
  }
  throw error;
}

export async function createEventAction(
  input: unknown,
  publish = false,
): Promise<SaveEventResult> {
  const parsed = eventDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<EventField>(parsed.error),
    };
  }

  const profile = await getCurrentProfile();
  const service = await getEventsService();

  try {
    const event = await service.createEvent(profile.id, parsed.data, publish);
    await revalidateFor(profile.username, event.slug);
    return { status: "success", eventId: event.id };
  } catch (error) {
    return toFormError(error);
  }
}

export async function updateEventAction(
  eventId: unknown,
  input: unknown,
): Promise<SaveEventResult> {
  const id = eventIdSchema.safeParse(eventId);
  if (!id.success) return { status: "error", message: "Unknown event." };

  const parsed = eventDraftSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<EventField>(parsed.error),
    };
  }

  const profile = await getCurrentProfile();
  const service = await getEventsService();

  try {
    const event = await service.updateEvent(id.data, profile.id, parsed.data);
    await revalidateFor(profile.username, event.slug);
    return { status: "success", eventId: event.id };
  } catch (error) {
    return toFormError(error);
  }
}

export async function transitionEventAction(
  eventId: unknown,
  to: unknown,
): Promise<FormResult> {
  const id = eventIdSchema.safeParse(eventId);
  const transition = eventTransitionSchema.safeParse(to);

  if (!id.success || !transition.success) {
    return { status: "error", message: "Unknown event change." };
  }

  const profile = await getCurrentProfile();
  const service = await getEventsService();

  try {
    const event = await service.transitionEvent(
      id.data,
      profile.id,
      transition.data,
    );
    await revalidateFor(profile.username, event.slug);
    return { status: "success" };
  } catch (error) {
    return toFormError(error) as FormResult;
  }
}

export async function deleteEventAction(eventId: unknown): Promise<FormResult> {
  const id = eventIdSchema.safeParse(eventId);
  if (!id.success) return { status: "error", message: "Unknown event." };

  const profile = await getCurrentProfile();
  const service = await getEventsService();

  await service.deleteEvent(id.data, profile.id);
  await revalidateFor(profile.username);

  return { status: "success" };
}

export type UploadCoverResult =
  | { status: "success"; url: string }
  | { status: "error"; message?: string; fieldErrors?: { file?: string } };

/**
 * Uploads on selection, before the event row necessarily exists, so the object
 * is keyed by owner alone. The returned URL is held by the form and written to
 * the row when it saves.
 */
export async function uploadEventCoverAction(
  formData: FormData,
): Promise<UploadCoverResult> {
  const parsed = eventMediaSchema.safeParse({ file: formData.get("file") });
  if (!parsed.success) {
    const { file } = firstFieldErrors<"file">(parsed.error);
    return { status: "error", fieldErrors: { file } };
  }

  const user = await verifySession();
  const service = await getEventsService();
  const url = await service.uploadCoverImage(user.id, parsed.data.file);

  return { status: "success", url };
}

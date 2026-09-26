"use server";

import { revalidatePath } from "next/cache";

import { verifySession } from "@/features/auth/queries";
import {
  compiledEventDraftSchema,
  compiledEventIdSchema,
  compiledEventMediaSchema,
  compiledEventTransitionSchema,
} from "@/features/events/contracts";
import { getEventsService } from "@/features/events/service";
import { getCurrentProfile } from "@/features/profiles/queries";
import { ApplicationError, toUserMessage } from "@/lib/errors";
import { type FormResult, firstFieldErrors } from "@/lib/forms";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("events.actions");

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
  revalidatePath(routes.dashboard.root());
  revalidatePath(routes.dashboard.events());
  revalidatePath(routes.publisher(username));
  if (slug) {
    revalidatePath(routes.event(username, slug));
  }
}

/**
 * Publish-readiness failures arrive as an ApplicationError carrying the first
 * blocking message, which belongs on the form rather than in a crash.
 */
function toFormError(scope: string, error: unknown): SaveEventResult {
  if (!(error instanceof ApplicationError)) {
    log.error("Unhandled failure in an event action.", error, { scope });
    throw error;
  }

  log.error("Event action failed.", error, { scope });
  return { status: "error", message: toUserMessage(error) };
}

export async function createEventAction(
  input: unknown,
  publish = false,
): Promise<SaveEventResult> {
  const parsed = compiledEventDraftSchema.safeParse(input);
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
    return toFormError("createEvent", error);
  }
}

export async function updateEventAction(
  eventId: unknown,
  input: unknown,
): Promise<SaveEventResult> {
  const id = compiledEventIdSchema.safeParse(eventId);
  if (!id.success) {
    return { status: "error", message: "Unknown event." };
  }

  const parsed = compiledEventDraftSchema.safeParse(input);
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
    return toFormError("updateEvent", error);
  }
}

export async function transitionEventAction(
  eventId: unknown,
  to: unknown,
): Promise<FormResult> {
  const id = compiledEventIdSchema.safeParse(eventId);
  const transition = compiledEventTransitionSchema.safeParse(to);

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
    return toFormError("transitionEvent", error) as FormResult;
  }
}

export async function deleteEventAction(eventId: unknown): Promise<FormResult> {
  const id = compiledEventIdSchema.safeParse(eventId);
  if (!id.success) {
    return { status: "error", message: "Unknown event." };
  }

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
  const parsed = compiledEventMediaSchema.safeParse({
    file: formData.get("file"),
  });
  if (!parsed.success) {
    const { file } = firstFieldErrors<"file">(parsed.error);
    return { status: "error", fieldErrors: { file } };
  }

  const user = await verifySession();
  const service = await getEventsService();
  const url = await service.uploadCoverImage(user.id, parsed.data.file);

  return { status: "success", url };
}

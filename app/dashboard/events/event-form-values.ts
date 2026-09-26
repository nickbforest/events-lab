import type { EventDraftValues } from "@/features/events/contracts";
import {
  defaultTimeZone,
  instantToWallClock,
  wallClockToIso,
} from "@/lib/datetime";
import type { Category, EventType, EventWithRelations } from "@/lib/types";

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

/**
 * The form's own shape, shared by the create dialog and the edit page.
 *
 * One shape for both on purpose: the dialog shows a subset of the fields, but
 * the values behind it are identical, so both can build the same payload and
 * neither needs its own contract. A second shape would be a second thing to
 * keep in step with `eventDraftSchema`.
 *
 * Dates are held as `datetime-local` readings rather than instants, because
 * that is what the control produces. They are resolved against the chosen
 * zone at submit, so changing the zone reinterprets the reading rather than
 * shifting the moment.
 */
export interface EventFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  eventType: EventType;
  startLocal: string;
  endLocal: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  countryCode: string;
  onlineUrl: string;
  isFree: boolean;
  priceInfo: string;
  ticketUrl: string;
  externalUrl: string;
  coverImageUrl: string;
  tags: string[];
}

export function toFormValues(
  event: EventWithRelations | null,
  categories: readonly Category[],
): EventFormValues {
  const timezone = event?.timezone ?? defaultTimeZone();

  return {
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    shortDescription: event?.short_description ?? "",
    description: event?.description ?? "",
    categoryId: event?.category_id ?? categories[0]?.id ?? "",
    eventType: event?.event_type ?? "in_person",
    startLocal: instantToWallClock(event?.start_at ?? null, timezone),
    endLocal: instantToWallClock(event?.end_at ?? null, timezone),
    timezone,
    venueName: event?.venue_name ?? "",
    address: event?.address ?? "",
    city: event?.city ?? "",
    countryCode: event?.country_code ?? "",
    onlineUrl: event?.online_url ?? "",
    isFree: event?.is_free ?? true,
    priceInfo: event?.price_info ?? "",
    ticketUrl: event?.ticket_url ?? "",
    externalUrl: event?.external_url ?? "",
    coverImageUrl: event?.cover_image_url ?? "",
    tags: event?.tags ?? [],
  };
}

export function toPayload(values: EventFormValues): EventDraftValues {
  return {
    title: values.title,
    slug: values.slug,
    shortDescription: values.shortDescription,
    description: values.description,
    categoryId: values.categoryId,
    eventType: values.eventType,
    startAt: wallClockToIso(values.startLocal, values.timezone),
    endAt: wallClockToIso(values.endLocal, values.timezone),
    timezone: values.timezone,
    venueName: values.venueName,
    address: values.address,
    city: values.city,
    countryCode: values.countryCode,
    latitude: "",
    longitude: "",
    onlineUrl: values.onlineUrl,
    isFree: values.isFree,
    priceInfo: values.priceInfo,
    ticketUrl: values.ticketUrl,
    externalUrl: values.externalUrl,
    coverImageUrl: values.coverImageUrl,
    tags: values.tags,
  };
}

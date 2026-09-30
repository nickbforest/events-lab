import type { EventField } from "@/features/events/actions";
import type { EventDraftValues } from "@/features/events/contracts";
import { countryName } from "@/lib/countries";
import {
  defaultTimeZone,
  instantToWallClock,
  wallClockToIso,
} from "@/lib/datetime";
import { DEFAULT_TICKET_LABEL } from "@/lib/format";
import type { Category, EventType, EventWithRelations } from "@/lib/types";

/** What the ticket button reads when a publisher does not change it. */
export const DEFAULT_TICKET_CTA = DEFAULT_TICKET_LABEL;

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
  /**
   * Whether the event shows a ticket button. Form-only: the row stores the
   * URL and the label, and "no button" is simply both of them empty. Holding
   * it as a checkbox means unticking the box does not lose what was typed
   * until the form is actually submitted.
   */
  ticketEnabled: boolean;
  ticketCtaLabel: string;
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
    // The field is typed by hand, so it shows the name; the contract
    // resolves it back to the code the column stores.
    countryCode: countryName(event?.country_code) ?? "",
    onlineUrl: event?.online_url ?? "",
    isFree: event?.is_free ?? true,
    priceInfo: event?.price_info ?? "",
    ticketEnabled: Boolean(event?.ticket_url),
    ticketCtaLabel: event?.ticket_cta_label ?? DEFAULT_TICKET_CTA,
    ticketUrl: event?.ticket_url ?? "",
    externalUrl: event?.external_url ?? "",
    coverImageUrl: event?.cover_image_url ?? "",
    tags: event?.tags ?? [],
  };
}

/** Which fields the form currently puts on screen. */
export function renderedFields(
  values: EventFormValues,
  layout: "page" | "dialog",
  isEdit: boolean,
): ReadonlySet<EventField> {
  const fields = new Set<EventField>([
    "title",
    "shortDescription",
    "description",
    "categoryId",
    "eventType",
    "startAt",
    "endAt",
    "coverImageUrl",
  ]);

  if (isEdit) {
    fields.add("slug");
  }
  if (values.eventType !== "online") {
    for (const field of [
      "venueName",
      "address",
      "city",
      "countryCode",
    ] as const) {
      fields.add(field);
    }
  }
  if (values.eventType !== "in_person") {
    fields.add("onlineUrl");
  }
  if (values.ticketEnabled) {
    fields.add("ticketCtaLabel");
    fields.add("ticketUrl");
  }
  if (layout === "page") {
    for (const field of [
      "timezone",
      "isFree",
      "externalUrl",
      "tags",
    ] as const) {
      fields.add(field);
    }
    if (!values.isFree) {
      fields.add("priceInfo");
    }
  }

  return fields;
}

/**
 * The payload a save sends.
 *
 * Fields that do not apply are sent empty, not merely hidden. Otherwise an
 * event switched from in person to online would keep its venue — and show it
 * on the public page — and an invalid value typed before the switch would
 * block Save with an error nobody can see.
 */
export function toPayload(values: EventFormValues): EventDraftValues {
  const hasVenue = values.eventType !== "online";
  const hasJoinLink = values.eventType !== "in_person";

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
    venueName: hasVenue ? values.venueName : "",
    address: hasVenue ? values.address : "",
    city: hasVenue ? values.city : "",
    countryCode: hasVenue ? values.countryCode : "",
    // Not collected yet (the map layer is post-MVP), so always empty.
    latitude: "",
    longitude: "",
    onlineUrl: hasJoinLink ? values.onlineUrl : "",
    isFree: values.isFree,
    priceInfo: values.isFree ? "" : values.priceInfo,
    // Unticking the box clears both columns, so a disabled button cannot
    // leave a stale URL behind for the next person to wonder about.
    ticketUrl: values.ticketEnabled ? values.ticketUrl : "",
    ticketCtaLabel: values.ticketEnabled ? values.ticketCtaLabel : "",
    externalUrl: values.externalUrl,
    coverImageUrl: values.coverImageUrl,
    tags: values.tags,
  };
}

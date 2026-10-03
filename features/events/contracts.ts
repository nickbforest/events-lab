import { z } from "zod";

import { usernameSchema } from "@/features/profiles/contracts";
import { countryCodeFromInput } from "@/lib/countries";
import { optionalMapUrlSchema } from "@/lib/maps";
import { Constants } from "@/lib/supabase/database.types";
import { optionalHttpUrlSchema } from "@/lib/urls";

export const eventRouteParamsSchema = z.object({
  username: usernameSchema,
  slug: z.string().trim().min(1).max(160),
});

export const ownerIdSchema = z.uuid();
export const eventIdSchema = z.uuid();

export const relatedEventLimitSchema = z.number().int().positive().max(12);

/**
 * Derived from the generated enums rather than restated, so a migration that
 * adds a value is a compile error here until it is handled.
 */
export const eventTypeSchema = z.enum(Constants.public.Enums.event_type);
export const eventStatusSchema = z.enum(Constants.public.Enums.event_status);

/** Mirrors the `events_slug_format` check constraint. */
export const eventSlugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "The link must be at least 3 characters." })
  .max(160, { error: "The link must be 160 characters or fewer." })
  .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, {
    error: "Use lowercase letters, numbers and single hyphens.",
  });

/**
 * IANA identifiers, validated against the runtime's own list. Postgres cannot
 * do this in a CHECK — its timezone catalogue is not immutable — so this is
 * the only place the value is proven real before it reaches the column.
 */
const SUPPORTED_TIME_ZONES: readonly string[] = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : [];

export const timezoneSchema = z
  .string()
  .trim()
  .min(3)
  .max(64)
  .refine(
    (value) =>
      SUPPORTED_TIME_ZONES.length === 0 || SUPPORTED_TIME_ZONES.includes(value),
    { error: "Choose a time zone from the list." },
  );

/** A cleared input arrives as `""` and is stored as NULL, never as "". */
function optionalText(max: number, error: string) {
  return z
    .string()
    .trim()
    .max(max, { error })
    .transform((value) => (value === "" ? null : value));
}

const optionalUrl = optionalHttpUrlSchema;

/**
 * A country, typed by hand.
 *
 * The column stores an ISO alpha-2 code, because "Georgia", "georgia" and
 * "GE" must not become three different countries the day discovery filters
 * by one. So the field is free text and this resolves it — the person writes
 * a country, the row keeps a code.
 */
const countryCode = z
  .string()
  .trim()
  .transform((value, ctx) => {
    if (value === "") {
      return null;
    }

    const code = countryCodeFromInput(value);
    if (!code) {
      ctx.addIssue({
        code: "custom",
        error: `We do not recognise “${value}” as a country.`,
      });
      return null;
    }

    return code;
  });

const optionalCoordinate = (max: number, error: string) =>
  z
    .union([z.literal(""), z.coerce.number().min(-max).max(max, { error })])
    .transform((value) => (value === "" ? null : (value as number)));

export const EVENT_TAG_LIMIT = 10;

/**
 * Tags are entered as free text but stored canonically: the slug is the
 * identity, so "Live Music", "live music" and "live-music" are one tag. The
 * label keeps the first spelling a publisher used.
 */
export const tagInputSchema = z
  .string()
  .trim()
  .min(2, { error: "Tags need at least 2 characters." })
  .max(32, { error: "Tags must be 32 characters or fewer." });

export function toTagSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const eventTagsSchema = z
  .array(tagInputSchema)
  .max(EVENT_TAG_LIMIT, {
    error: `Use ${EVENT_TAG_LIMIT} tags or fewer.`,
  })
  .transform((values) => {
    const seen = new Map<string, string>();
    for (const value of values) {
      const slug = toTagSlug(value);
      if (slug.length >= 2 && !seen.has(slug)) {
        seen.set(slug, value.trim());
      }
    }
    return [...seen].map(([slug, label]) => ({ slug, label }));
  });

export type EventTagInput = z.infer<typeof eventTagsSchema>[number];

/**
 * Everything a publisher may set on an event.
 *
 * This is the *draft* contract: it is deliberately permissive, because a draft
 * is allowed to be half-finished. What an event needs before it can go public
 * is a business rule — `publishBlockers` in the events service — not a shape
 * rule, and not a CHECK constraint.
 */
export const eventDraftSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, { error: "Give the event a title of at least 3 characters." })
      .max(160, { error: "Title must be 160 characters or fewer." }),
    slug: z
      .union([z.literal(""), eventSlugSchema])
      .transform((value) => (value === "" ? null : value)),
    shortDescription: optionalText(
      280,
      "The summary must be 280 characters or fewer.",
    ),
    description: optionalText(
      10000,
      "The description must be 10,000 characters or fewer.",
    ),
    categoryId: z.uuid({ error: "Choose a category." }),
    eventType: eventTypeSchema,

    startAt: z.iso.datetime({
      offset: true,
      error: "Choose when the event starts.",
    }),
    endAt: z
      .union([z.literal(""), z.iso.datetime({ offset: true })])
      .transform((value) => (value === "" ? null : value)),
    timezone: timezoneSchema,

    venueName: optionalText(160, "Venue must be 160 characters or fewer."),
    address: optionalText(240, "Address must be 240 characters or fewer."),
    city: optionalText(120, "City must be 120 characters or fewer."),
    countryCode: countryCode,
    latitude: optionalCoordinate(90, "Latitude must be between -90 and 90."),
    longitude: optionalCoordinate(
      180,
      "Longitude must be between -180 and 180.",
    ),
    /** A pasted Google Maps, Apple Maps or OpenStreetMap link to the venue. */
    mapUrl: optionalMapUrlSchema,
    onlineUrl: optionalUrl,

    isFree: z.boolean(),
    priceInfo: optionalText(
      120,
      "Price details must be 120 characters or fewer.",
    ),
    ticketUrl: optionalUrl,
    /** The words on the ticket button. Blank falls back to "Get tickets". */
    ticketCtaLabel: optionalText(
      40,
      "The button text must be 40 characters or fewer.",
    ),
    externalUrl: optionalUrl,

    coverImageUrl: optionalUrl,
    tags: eventTagsSchema,
  })
  // Mirrors the `events_end_after_start` constraint so the publisher sees a
  // field error rather than an opaque database failure.
  .refine((value) => !value.endAt || value.endAt > value.startAt, {
    error: "The event must end after it starts.",
    path: ["endAt"],
  });

export type EventDraftInput = z.infer<typeof eventDraftSchema>;
export type EventDraftValues = z.input<typeof eventDraftSchema>;

/**
 * Transitions a publisher can ask for. `published` covers both publishing a
 * draft and un-postponing; the service decides what each means for the row.
 */
export const eventTransitionSchema = z.enum([
  "published",
  "cancelled",
  "postponed",
  "archived",
  "draft",
]);

export type EventTransition = z.infer<typeof eventTransitionSchema>;

type EventStatusValue = z.infer<typeof eventStatusSchema>;

/**
 * Every status change the product allows, keyed by the current status.
 *
 * The single source for both sides: the events service refuses anything not
 * listed here, and the editor's lifecycle panel offers exactly these. A
 * change that is only hidden in the UI is not a rule — a crafted request
 * would still make it.
 *
 * Deliberately absent: going back to `draft` once public (the page has been
 * seen), and `cancelled → published` (a cancellation is only undone by
 * unpublishing and publishing again, which is a visible, deliberate act).
 */
export const EVENT_TRANSITIONS: Readonly<
  Record<EventStatusValue, readonly EventTransition[]>
> = {
  draft: ["published"],
  published: ["postponed", "cancelled", "archived"],
  postponed: ["published", "cancelled", "archived"],
  cancelled: ["archived"],
  archived: ["published"],
};

/** Statuses a visitor can see. Mirrors the events select policy. */
export const PUBLIC_EVENT_STATUSES: readonly EventStatusValue[] = [
  "published",
  "cancelled",
  "postponed",
];

/** Whether a create request should publish immediately. */
export const publishFlagSchema = z.boolean();

/** Mirrors the `event-media` bucket's own limits, which are the authority. */
export const EVENT_MEDIA_MAX_BYTES = 5 * 1024 * 1024;
export const EVENT_MEDIA_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;

export const eventMediaSchema = z.object({
  file: z
    .file({ error: "Choose an image to upload." })
    .min(1, { error: "That file is empty." })
    .max(EVENT_MEDIA_MAX_BYTES, { error: "Images must be 5MB or smaller." })
    .mime([...EVENT_MEDIA_MIME_TYPES], {
      error: "Use a PNG, JPG or WebP image.",
    }),
});

export type EventMediaInput = z.infer<typeof eventMediaSchema>;

/**
 * Compiled parsers for the schemas a request hits on every save. See the note
 * in `features/profiles/contracts.ts` — compiled once at module scope, never
 * inside a handler.
 */
export const compiledEventDraftSchema = z.compile(eventDraftSchema);
export const compiledEventMediaSchema = z.compile(eventMediaSchema);
export const compiledEventIdSchema = z.compile(eventIdSchema);
export const compiledEventTransitionSchema = z.compile(eventTransitionSchema);
export const compiledPublishFlagSchema = z.compile(publishFlagSchema);

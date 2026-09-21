import { z } from "zod";

import { Constants } from "@/lib/supabase/database.types";

/**
 * Mirrors the `profiles_username_format` check constraint. Keeping the two in
 * sync matters: the database is the authority, and a value this schema accepts
 * but the constraint rejects would surface as an opaque signup failure.
 *
 * This lives here rather than in `features/auth` because `username` is a
 * `profiles` column; auth writes it at signup but does not own it.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "Username must be at least 3 characters." })
  .max(32, { error: "Username must be 32 characters or fewer." })
  .regex(/^[a-z0-9_](-?[a-z0-9_])*$/, {
    error:
      "Use lowercase letters, numbers and underscores. Hyphens must sit between characters.",
  });

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a name." })
  .max(80, { error: "Name must be 80 characters or fewer." });

/**
 * Derived from the generated enum rather than restated, so adding a publisher
 * type to the database migration is a compile error here until it is handled.
 */
export const publisherTypeSchema = z.enum(
  Constants.public.Enums.publisher_type,
);

/**
 * Optional free text. A cleared input arrives as `""` and is stored as NULL —
 * an empty string and "not set" must not be two different states in the row.
 */
function optionalText(max: number, error: string) {
  return z
    .string()
    .trim()
    .max(max, { error })
    .transform((value) => (value === "" ? null : value));
}

const optionalUrl = z
  .string()
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      z.url({ error: "Enter a full URL, including https://" }),
    ]),
  )
  .transform((value) => (value === "" ? null : value));

const countryCode = z
  .string()
  .trim()
  .toUpperCase()
  .pipe(
    z.union([
      z.literal(""),
      z.string().regex(/^[A-Z]{2}$/, {
        error: "Use a two-letter country code, for example GE.",
      }),
    ]),
  )
  .transform((value) => (value === "" ? null : value));

/**
 * Platforms a publisher can link to. These live in the `social_links` JSON map
 * rather than as columns so adding one never requires a migration.
 */
export const SOCIAL_LINK_KEYS = [
  "twitter",
  "instagram",
  "facebook",
  "youtube",
  "soundcloud",
  "spotify",
  "apple_music",
] as const;

export type SocialLinkKey = (typeof SOCIAL_LINK_KEYS)[number];

export const socialLinksSchema = z.object({
  twitter: optionalUrl,
  instagram: optionalUrl,
  facebook: optionalUrl,
  youtube: optionalUrl,
  soundcloud: optionalUrl,
  spotify: optionalUrl,
  apple_music: optionalUrl,
});

/**
 * Everything an owner may change about their public page.
 *
 * `username` is deliberately absent: it is the public URL, and MVP-1 keeps no
 * redirect history, so renaming would silently break every shared link.
 */
export const profileUpdateSchema = z.object({
  displayName: displayNameSchema,
  publisherType: publisherTypeSchema,
  bio: optionalText(500, "About must be 500 characters or fewer."),
  city: optionalText(100, "City must be 100 characters or fewer."),
  countryCode: countryCode,
  websiteUrl: optionalUrl,
  socialLinks: socialLinksSchema,
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;
export type ProfileUpdateValues = z.input<typeof profileUpdateSchema>;

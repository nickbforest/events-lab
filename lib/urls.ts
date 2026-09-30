import { z } from "zod";

/**
 * A link a publisher types: website, social profile, ticket shop, join link.
 *
 * `z.url()` alone accepts any scheme the URL parser understands, which
 * includes `javascript:`, `data:` and `ftp:`. React 19 happens to neutralise
 * `javascript:` in `href`, but a stored link should be safe on its own, not
 * because of the renderer. Only http and https are links a visitor can use.
 */
export const httpUrlSchema = z.url({
  protocol: /^https?$/,
  error: "Enter a full web address, starting with https://",
});

/**
 * The optional form of the same field. A cleared input arrives as `""` and is
 * stored as NULL, so an empty string and "not set" are never two states.
 */
export const optionalHttpUrlSchema = z
  .string()
  .trim()
  .pipe(z.union([z.literal(""), httpUrlSchema]))
  .transform((value) => (value === "" ? null : value));

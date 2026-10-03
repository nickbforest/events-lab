import { z } from "zod";

import { httpUrlSchema } from "@/lib/urls";

/**
 * "View on map" links: the one the publisher pasted, or else one built from
 * the address they typed.
 *
 * Both are plain hyperlinks, never an SDK — no key, no dependency, no vendor
 * lock. `Architecture.md` §11 keeps Mapbox as the selected map provider for
 * the embedded map; linking out to a map someone else hosts does not
 * introduce a second one.
 *
 * Swapping the fallback provider later is `mapSearchUrl`.
 */

/** Google's country domains: google.com, google.ge, google.co.uk, google.com.tr. */
const GOOGLE_HOST =
  /^(www\.|maps\.)?google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/;

/**
 * Whether a link points at a map service.
 *
 * The button reads "View on map", so the link behind it must be a map — an
 * allowlist rather than any https URL, otherwise the venue line becomes a
 * place to send visitors anywhere under a trusted label.
 */
export function isMapLink(value: string): boolean {
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return false;
  }

  if (url.protocol !== "https:" || url.port !== "") {
    return false;
  }

  const host = url.hostname.toLowerCase();
  const path = url.pathname;

  return (
    // Google Maps share links, and the long form copied from the address bar.
    host === "maps.app.goo.gl" ||
    (host === "goo.gl" && path.startsWith("/maps")) ||
    (GOOGLE_HOST.test(host) &&
      (host.startsWith("maps.") || path.startsWith("/maps"))) ||
    // Apple Maps, both the classic and the short share domain.
    host === "maps.apple.com" ||
    host === "maps.apple" ||
    // OpenStreetMap.
    host === "openstreetmap.org" ||
    host === "www.openstreetmap.org" ||
    host === "osm.org"
  );
}

const MAP_LINK_ERROR =
  "Paste a link from Google Maps, Apple Maps or OpenStreetMap.";

/**
 * The event form's map link. A cleared input is stored as NULL, the same
 * convention as `optionalHttpUrlSchema`.
 */
export const optionalMapUrlSchema = z
  .string()
  .trim()
  .pipe(
    z.union([
      z.literal(""),
      httpUrlSchema
        .max(2048, { error: "That link is too long." })
        .refine(isMapLink, { error: MAP_LINK_ERROR }),
    ]),
  )
  .transform((value) => (value === "" ? null : value));

export interface MapAddress {
  /** A map link the publisher pasted. Wins over everything else. */
  mapUrl?: string | null;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  /** The full country name, not the stored ISO code. */
  country?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

/**
 * A link to this place on a map, or null when there is not enough to find it.
 *
 * A venue name alone is not enough — "Warehouse 41" with no city lands
 * somewhere arbitrary, which is worse than no link at all.
 */
export function mapSearchUrl(place: MapAddress): string | null {
  // The publisher's own pin is the most exact thing we have. Rechecked here
  // so a row written before the allowlist, or by hand, cannot put an
  // arbitrary link behind "View on map".
  if (place.mapUrl && isMapLink(place.mapUrl)) {
    return place.mapUrl;
  }

  // Coordinates win when we have them: they are unambiguous, and Phase 5
  // will start populating them.
  if (
    typeof place.latitude === "number" &&
    typeof place.longitude === "number"
  ) {
    const { latitude, longitude } = place;
    return `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=17/${latitude}/${longitude}`;
  }

  if (!place.city) {
    return null;
  }

  const query = [place.venueName, place.address, place.city, place.country]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part))
    .join(", ");

  return `https://www.openstreetmap.org/search?query=${encodeURIComponent(query)}`;
}

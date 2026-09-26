/**
 * "View on map" links, built from the address a publisher typed.
 *
 * Deliberately OpenStreetMap and not Google Maps: `Architecture.md` §14
 * selects Mapbox as the mapping provider and says not to introduce another
 * one without approval. This is a hyperlink rather than an SDK — no key, no
 * dependency, no vendor lock — so it stays neutral until Phase 5 adds
 * coordinates and a real embedded map.
 *
 * Swapping providers later is this one function.
 */

export interface MapAddress {
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

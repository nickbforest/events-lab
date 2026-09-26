import { describe, expect, it } from "vitest";

import { mapSearchUrl } from "./maps";

describe("mapSearchUrl", () => {
  it("prefers coordinates, which are unambiguous", () => {
    const url = mapSearchUrl({
      city: "Tbilisi",
      latitude: 41.7151,
      longitude: 44.8271,
    });
    expect(url).toContain("mlat=41.7151");
    expect(url).toContain("mlon=44.8271");
  });

  it("falls back to the written address", () => {
    const url = mapSearchUrl({
      venueName: "Warehouse 41",
      address: "41 Kakheti Highway",
      city: "Tbilisi",
      country: "Georgia",
    });
    expect(url).toBe(
      "https://www.openstreetmap.org/search?query=Warehouse%2041%2C%2041%20Kakheti%20Highway%2C%20Tbilisi%2C%20Georgia",
    );
  });

  it("returns nothing without a city, rather than a link that lands anywhere", () => {
    expect(mapSearchUrl({ venueName: "Warehouse 41" })).toBeNull();
    expect(mapSearchUrl({})).toBeNull();
  });
});

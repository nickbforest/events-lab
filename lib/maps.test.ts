import { describe, expect, it } from "vitest";

import { isMapLink, mapSearchUrl, optionalMapUrlSchema } from "./maps";

const GOOGLE_SHARE_LINK = "https://maps.app.goo.gl/AbC123xyz";

describe("mapSearchUrl", () => {
  it("prefers the link the publisher pasted", () => {
    expect(
      mapSearchUrl({
        mapUrl: GOOGLE_SHARE_LINK,
        city: "Tbilisi",
        latitude: 41.7151,
        longitude: 44.8271,
      }),
    ).toBe(GOOGLE_SHARE_LINK);
  });

  it("uses the pasted link even without a city", () => {
    expect(mapSearchUrl({ mapUrl: GOOGLE_SHARE_LINK })).toBe(GOOGLE_SHARE_LINK);
  });

  it("ignores a stored link that is not a map", () => {
    expect(
      mapSearchUrl({ mapUrl: "https://phish.test/maps", city: "Tbilisi" }),
    ).toContain("openstreetmap.org/search");
  });

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

describe("isMapLink", () => {
  it("accepts the map links publishers paste", () => {
    for (const value of [
      GOOGLE_SHARE_LINK,
      "https://goo.gl/maps/AbC123",
      "https://www.google.com/maps/place/Fabrika/@41.7,44.8,17z",
      "https://www.google.ge/maps/place/Rustavi",
      "https://google.co.uk/maps?q=London",
      "https://maps.google.com/?q=41.7,44.8",
      "https://maps.apple.com/?q=Rustavi",
      "https://maps.apple/p/AbC123",
      "https://www.openstreetmap.org/#map=17/41.7/44.8",
    ]) {
      expect(isMapLink(value), value).toBe(true);
    }
  });

  it("rejects links that are not maps, or only look like them", () => {
    for (const value of [
      "http://maps.app.goo.gl/AbC123",
      "https://www.google.com/search?q=maps",
      "https://goo.gl/AbC123",
      "https://maps.google.evil.test/",
      "https://google.com.evil.test/maps",
      "https://maps.app.goo.gl.evil.test/x",
      "https://evil.test/?u=https://maps.app.goo.gl",
      "https://maps.app.goo.gl:8443/AbC123",
      "javascript:alert(1)",
      "not a url",
    ]) {
      expect(isMapLink(value), value).toBe(false);
    }
  });
});

describe("optionalMapUrlSchema", () => {
  it("stores a cleared field as null", () => {
    expect(optionalMapUrlSchema.parse("  ")).toBeNull();
  });

  it("trims and keeps a map link", () => {
    expect(optionalMapUrlSchema.parse(` ${GOOGLE_SHARE_LINK} `)).toBe(
      GOOGLE_SHARE_LINK,
    );
  });

  it("explains what kind of link it wants", () => {
    const result = optionalMapUrlSchema.safeParse("https://tickets.test/show");
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toMatch(/Google Maps/);
  });
});

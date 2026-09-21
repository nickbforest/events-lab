import { describe, expect, it } from "vitest";

import { profileUpdateSchema, usernameSchema } from "./contracts";

const validUpdate = {
  displayName: "Nick B",
  publisherType: "artist",
  bio: "",
  city: "",
  countryCode: "",
  websiteUrl: "",
  socialLinks: {
    twitter: "",
    instagram: "",
    facebook: "",
    youtube: "",
    soundcloud: "",
    spotify: "",
    apple_music: "",
  },
};

describe("usernameSchema", () => {
  it("normalises case and surrounding whitespace", () => {
    expect(usernameSchema.parse("  NickB  ")).toBe("nickb");
  });

  it.each(["ab", "-leading", "trailing-", "double--hyphen", "has space", "É"])(
    "rejects %j because the database check constraint would too",
    (value) => {
      expect(usernameSchema.safeParse(value).success).toBe(false);
    },
  );

  it.each(["abc", "nick_b", "nick-b", "a1_b-c2"])("accepts %j", (value) => {
    expect(usernameSchema.safeParse(value).success).toBe(true);
  });

  it("rejects anything longer than the 32 character column limit", () => {
    expect(usernameSchema.safeParse("a".repeat(33)).success).toBe(false);
    expect(usernameSchema.safeParse("a".repeat(32)).success).toBe(true);
  });
});

describe("profileUpdateSchema", () => {
  it("stores cleared optional fields as null rather than empty strings", () => {
    const parsed = profileUpdateSchema.parse(validUpdate);

    expect(parsed.bio).toBeNull();
    expect(parsed.city).toBeNull();
    expect(parsed.countryCode).toBeNull();
    expect(parsed.websiteUrl).toBeNull();
    expect(parsed.socialLinks.twitter).toBeNull();
  });

  it("uppercases a country code and rejects a non-ISO one", () => {
    expect(
      profileUpdateSchema.parse({ ...validUpdate, countryCode: "ge" })
        .countryCode,
    ).toBe("GE");

    expect(
      profileUpdateSchema.safeParse({ ...validUpdate, countryCode: "Geo" })
        .success,
    ).toBe(false);
  });

  it("requires a protocol on links so the public page cannot render a relative href", () => {
    expect(
      profileUpdateSchema.safeParse({
        ...validUpdate,
        websiteUrl: "example.com",
      }).success,
    ).toBe(false);

    expect(
      profileUpdateSchema.parse({
        ...validUpdate,
        websiteUrl: "https://example.com",
      }).websiteUrl,
    ).toBe("https://example.com");
  });

  it("rejects a display name that is only whitespace", () => {
    expect(
      profileUpdateSchema.safeParse({ ...validUpdate, displayName: "   " })
        .success,
    ).toBe(false);
  });

  it("rejects a publisher type the database enum does not contain", () => {
    expect(
      profileUpdateSchema.safeParse({
        ...validUpdate,
        publisherType: "influencer",
      }).success,
    ).toBe(false);
  });

  it("rejects a bio beyond the 500 character limit", () => {
    expect(
      profileUpdateSchema.safeParse({ ...validUpdate, bio: "a".repeat(501) })
        .success,
    ).toBe(false);
  });
});

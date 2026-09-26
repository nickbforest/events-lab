import { describe, expect, it } from "vitest";

import {
  PROFILE_MEDIA_MAX_BYTES,
  profileMediaSchema,
  profileUpdateSchema,
  usernameSchema,
} from "./contracts";

function imageOfSize(bytes: number, type = "image/png") {
  return new File([new Uint8Array(bytes)], "image", { type });
}

describe("profileMediaSchema", () => {
  it("accepts an image exactly at the 5MB limit", () => {
    expect(
      profileMediaSchema.safeParse({
        kind: "avatar",
        file: imageOfSize(PROFILE_MEDIA_MAX_BYTES),
      }).success,
    ).toBe(true);
  });

  it("rejects one byte over the limit", () => {
    expect(
      profileMediaSchema.safeParse({
        kind: "avatar",
        file: imageOfSize(PROFILE_MEDIA_MAX_BYTES + 1),
      }).success,
    ).toBe(false);
  });

  it.each(["image/gif", "image/svg+xml", "application/pdf"])(
    "rejects %s, which the bucket would refuse",
    (type) => {
      expect(
        profileMediaSchema.safeParse({
          kind: "cover",
          file: imageOfSize(100, type),
        }).success,
      ).toBe(false);
    },
  );

  it("rejects an empty file and an unknown kind", () => {
    expect(
      profileMediaSchema.safeParse({ kind: "avatar", file: imageOfSize(0) })
        .success,
    ).toBe(false);
    expect(
      profileMediaSchema.safeParse({ kind: "banner", file: imageOfSize(100) })
        .success,
    ).toBe(false);
  });
});

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

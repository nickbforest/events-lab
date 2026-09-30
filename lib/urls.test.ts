import { describe, expect, it } from "vitest";

import { httpUrlSchema, optionalHttpUrlSchema } from "./urls";

describe("httpUrlSchema", () => {
  it("accepts web addresses", () => {
    expect(httpUrlSchema.safeParse("https://tickets.test/show").success).toBe(
      true,
    );
    expect(httpUrlSchema.safeParse("http://venue.test").success).toBe(true);
  });

  it("rejects schemes a visitor cannot safely follow", () => {
    for (const value of [
      "javascript:alert(1)",
      "data:text/html,<b>x</b>",
      "ftp://files.test/a",
      "mailto:someone@test.invalid",
    ]) {
      expect(httpUrlSchema.safeParse(value).success).toBe(false);
    }
  });
});

describe("optionalHttpUrlSchema", () => {
  it("stores a cleared field as null", () => {
    expect(optionalHttpUrlSchema.parse("  ")).toBeNull();
  });

  it("trims and keeps a valid address", () => {
    expect(optionalHttpUrlSchema.parse(" https://site.test ")).toBe(
      "https://site.test",
    );
  });
});

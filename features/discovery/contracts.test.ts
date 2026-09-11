import { describe, expect, it } from "vitest";

import { parseDiscoverFilters } from "./contracts";

describe("parseDiscoverFilters", () => {
  it("normalizes valid search parameters", () => {
    expect(
      parseDiscoverFilters({
        q: "  jazz  ",
        category: "concert",
        range: "week",
      }),
    ).toEqual({ q: "jazz", category: "concert", range: "week" });
  });

  it("falls back safely when a parameter is invalid", () => {
    expect(parseDiscoverFilters({ range: "forever" })).toEqual({
      range: "upcoming",
    });
  });
});

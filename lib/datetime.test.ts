import { describe, expect, it } from "vitest";

import {
  instantToWallClock,
  wallClockToInstant,
  wallClockToIso,
  zoneOffsetMinutes,
} from "./datetime";

describe("zoneOffsetMinutes", () => {
  it("reads a fixed-offset zone", () => {
    // Tbilisi is UTC+4 all year.
    expect(
      zoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "Asia/Tbilisi"),
    ).toBe(240);
    expect(
      zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "Asia/Tbilisi"),
    ).toBe(240);
  });

  it("follows a daylight-saving change", () => {
    expect(
      zoneOffsetMinutes(new Date("2026-01-15T12:00:00Z"), "Europe/Berlin"),
    ).toBe(60);
    expect(
      zoneOffsetMinutes(new Date("2026-07-15T12:00:00Z"), "Europe/Berlin"),
    ).toBe(120);
  });
});

describe("wallClockToInstant", () => {
  it("reads a local reading as the chosen zone, not the runtime's", () => {
    expect(
      wallClockToInstant("2026-10-01T19:00", "Asia/Tbilisi")?.toISOString(),
    ).toBe("2026-10-01T15:00:00.000Z");
  });

  it("resolves a summer reading at the summer offset", () => {
    // 20:00 CEST is 18:00Z, not 19:00Z as a winter-offset guess would give.
    expect(
      wallClockToInstant("2026-07-15T20:00", "Europe/Berlin")?.toISOString(),
    ).toBe("2026-07-15T18:00:00.000Z");
  });

  it("rejects a value that is not a wall clock", () => {
    expect(wallClockToInstant("", "UTC")).toBeNull();
    expect(wallClockToInstant("not a date", "UTC")).toBeNull();
  });
});

describe("instantToWallClock", () => {
  it("round-trips through the same zone", () => {
    const zone = "America/New_York";
    const wall = "2026-11-20T18:30";
    expect(instantToWallClock(wallClockToIso(wall, zone), zone)).toBe(wall);
  });

  it("renders midnight as 00, not 24", () => {
    expect(instantToWallClock("2026-10-01T20:00:00Z", "Asia/Tbilisi")).toBe(
      "2026-10-02T00:00",
    );
  });

  it("treats an absent instant as an empty field", () => {
    expect(instantToWallClock(null, "UTC")).toBe("");
    expect(instantToWallClock("nonsense", "UTC")).toBe("");
  });
});

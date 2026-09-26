import { describe, expect, it } from "vitest";

import { COUNTRIES, countryCodeFromInput, countryName } from "./countries";

describe("COUNTRIES", () => {
  it("resolves names from the runtime and sorts them", () => {
    expect(COUNTRIES.length).toBeGreaterThan(200);
    expect(COUNTRIES.find((c) => c.code === "GE")?.name).toBe("Georgia");

    const names = COUNTRIES.map((c) => c.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe("countryCodeFromInput", () => {
  it("accepts a full name in any casing", () => {
    expect(countryCodeFromInput("Georgia")).toBe("GE");
    expect(countryCodeFromInput("  georgia ")).toBe("GE");
    expect(countryCodeFromInput("UNITED KINGDOM")).toBe("GB");
  });

  it("accepts the code itself, so someone who knows it is not made to spell it", () => {
    expect(countryCodeFromInput("ge")).toBe("GE");
    expect(countryCodeFromInput("GE")).toBe("GE");
  });

  it("rejects something that is not a country", () => {
    expect(countryCodeFromInput("Narnia")).toBeNull();
    expect(countryCodeFromInput("ZZ")).toBeNull();
  });

  it("treats blank as absent, not as an error", () => {
    expect(countryCodeFromInput("")).toBeNull();
    expect(countryCodeFromInput("   ")).toBeNull();
  });
});

describe("countryName", () => {
  it("renders a stored code for a person", () => {
    expect(countryName("GE")).toBe("Georgia");
    expect(countryName("ge")).toBe("Georgia");
  });

  it("passes an unknown code through rather than losing it", () => {
    expect(countryName("ZZ")).toBe("ZZ");
    expect(countryName(null)).toBeNull();
  });
});

import { describe, expect, it } from "vitest";

import { clientEnvSchema } from "./client";

describe("clientEnvSchema", () => {
  it("accepts the public Supabase connection contract", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
    });
    expect(result.success).toBe(true);
  });

  it("rejects a missing site URL, since auth emails cannot be built without it", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_example",
    });
    expect(result.success).toBe(false);
  });

  it("rejects malformed URLs and missing keys", () => {
    const result = clientEnvSchema.safeParse({
      NEXT_PUBLIC_SUPABASE_URL: "not-a-url",
      NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "",
    });
    expect(result.success).toBe(false);
  });
});

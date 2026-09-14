import { describe, expect, it } from "vitest";

import {
  emailSchema,
  passwordSchema,
  signUpSchema,
  usernameSchema,
} from "./contracts";

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

describe("emailSchema", () => {
  it("trims and lowercases before validating", () => {
    expect(emailSchema.parse("  Nick@Example.COM ")).toBe("nick@example.com");
  });

  it("rejects a malformed address", () => {
    expect(emailSchema.safeParse("nick@").success).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("requires at least 8 characters", () => {
    expect(passwordSchema.safeParse("7chars!").success).toBe(false);
    expect(passwordSchema.safeParse("8chars!!").success).toBe(true);
  });

  it("rejects beyond 72 bytes rather than letting bcrypt truncate silently", () => {
    expect(passwordSchema.safeParse("a".repeat(73)).success).toBe(false);
  });
});

describe("signUpSchema", () => {
  it("returns one message per invalid field", () => {
    const result = signUpSchema.safeParse({
      displayName: "   ",
      username: "no",
      email: "nope",
      password: "short",
    });

    expect(result.success).toBe(false);
    const fields = new Set(result.error?.issues.map((issue) => issue.path[0]));
    expect(fields).toEqual(
      new Set(["displayName", "username", "email", "password"]),
    );
  });
});

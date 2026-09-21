import { describe, expect, it } from "vitest";

import {
  changePasswordSchema,
  emailSchema,
  passwordSchema,
  signUpSchema,
} from "./contracts";

describe("changePasswordSchema", () => {
  it("rejects reusing the current password, against the new-password field", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "samesecret",
      newPassword: "samesecret",
      confirmPassword: "samesecret",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["newPassword"]);
  });

  it("requires the current password", () => {
    expect(
      changePasswordSchema.safeParse({
        currentPassword: "",
        newPassword: "newsecret1",
        confirmPassword: "newsecret1",
      }).success,
    ).toBe(false);
  });

  it("rejects a confirmation that does not match, so a typo cannot lock the owner out", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "oldsecret",
      newPassword: "newsecret1",
      confirmPassword: "newsecret2",
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path).toEqual(["confirmPassword"]);
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

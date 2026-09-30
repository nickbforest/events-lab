import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AuthProviderError,
  type AuthRepository,
  type AuthUser,
} from "@/features/auth/dal/auth-repository";
import { ApplicationError } from "@/lib/errors";

import { createAuthService } from "./auth-service";

const SIGN_UP_INPUT = {
  displayName: "Nick",
  username: "nick",
  email: "nick@example.com",
  password: "supersecret",
};

const ACTOR: AuthUser = {
  id: "user-1",
  email: SIGN_UP_INPUT.email,
  emailVerified: true,
  pendingEmail: null,
};

function createRepository(
  overrides: Partial<AuthRepository> = {},
): AuthRepository {
  return {
    signUp: vi.fn(async () => ({
      user: {
        id: "user-1",
        email: SIGN_UP_INPUT.email,
        emailVerified: false,
        pendingEmail: null,
      },
      hasSession: true,
    })),
    verifyEmailToken: vi.fn(async () => ({ userId: "user-1" })),
    exchangeAuthCode: vi.fn(async () => ({
      isRecovery: false,
      userId: "user-1",
    })),
    signInWithPassword: vi.fn(async () => ACTOR),
    signOut: vi.fn(async () => {}),
    getAuthenticatedUser: vi.fn(async () => null),
    sendPasswordResetEmail: vi.fn(async () => {}),
    resendConfirmationEmail: vi.fn(async () => {}),
    updatePassword: vi.fn(async () => {}),
    requestEmailChange: vi.fn(async () => {}),
    ...overrides,
  };
}

function createService(
  repository: AuthRepository,
  isUsernameAvailable = vi.fn(async () => true),
) {
  return {
    service: createAuthService({
      authRepository: repository,
      usernames: { isUsernameAvailable },
      urls: { confirmUrl: "https://events.test/auth/confirm" },
    }),
    isUsernameAvailable,
  };
}

describe("signUp", () => {
  it("refuses a taken username before touching the auth provider", async () => {
    const repository = createRepository();
    const { service } = createService(
      repository,
      vi.fn(async () => false),
    );

    const outcome = await service.signUp(SIGN_UP_INPUT);

    expect(outcome).toEqual({ ok: false, reason: "USERNAME_TAKEN" });
    expect(repository.signUp).not.toHaveBeenCalled();
  });

  it("passes the username through so the profile trigger can read it", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await service.signUp(SIGN_UP_INPUT);

    expect(repository.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        username: "nick",
        displayName: "Nick",
        emailRedirectTo: "https://events.test/auth/confirm",
      }),
    );
  });

  it("reports whether a session was issued, which decides the next screen", async () => {
    const repository = createRepository({
      signUp: vi.fn(async () => ({
        user: {
          id: "user-1",
          email: SIGN_UP_INPUT.email,
          emailVerified: false,
          pendingEmail: null,
        },
        hasSession: false,
      })),
    });
    const { service } = createService(repository);

    await expect(service.signUp(SIGN_UP_INPUT)).resolves.toEqual({
      ok: true,
      email: SIGN_UP_INPUT.email,
      hasSession: false,
    });
  });

  it("blames the username when the trigger fails and the name is now taken", async () => {
    const repository = createRepository({
      signUp: vi.fn(async () => {
        throw new AuthProviderError(
          "PROFILE_CREATION_FAILED",
          "Database error saving new user",
        );
      }),
    });

    // Available on the pre-check, taken by the time the insert ran.
    const isUsernameAvailable = vi
      .fn<() => Promise<boolean>>()
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(false);

    const { service } = createService(repository, isUsernameAvailable);

    await expect(service.signUp(SIGN_UP_INPUT)).resolves.toEqual({
      ok: false,
      reason: "USERNAME_TAKEN",
    });
  });

  it("does not blame the username for an unrelated database fault", async () => {
    const repository = createRepository({
      signUp: vi.fn(async () => {
        throw new AuthProviderError("PROFILE_CREATION_FAILED", "disk on fire");
      }),
    });
    const { service } = createService(repository);

    await expect(service.signUp(SIGN_UP_INPUT)).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });

  it("maps a duplicate email to a field-level outcome", async () => {
    const repository = createRepository({
      signUp: vi.fn(async () => {
        throw new AuthProviderError("EMAIL_TAKEN", "already registered");
      }),
    });
    const { service } = createService(repository);

    await expect(service.signUp(SIGN_UP_INPUT)).resolves.toEqual({
      ok: false,
      reason: "EMAIL_TAKEN",
    });
  });
});

describe("signIn", () => {
  it.each([
    ["INVALID_CREDENTIALS"],
    ["EMAIL_NOT_CONFIRMED"],
    ["RATE_LIMITED"],
  ] as const)(
    "surfaces %s to the caller rather than throwing",
    async (reason) => {
      const repository = createRepository({
        signInWithPassword: vi.fn(async () => {
          throw new AuthProviderError(reason, reason);
        }),
      });
      const { service } = createService(repository);

      await expect(
        service.signIn({ email: SIGN_UP_INPUT.email, password: "supersecret" }),
      ).resolves.toEqual({ ok: false, reason });
    },
  );

  it("escalates an unexpected provider failure", async () => {
    const repository = createRepository({
      signInWithPassword: vi.fn(async () => {
        throw new AuthProviderError("UNKNOWN", "boom");
      }),
    });
    const { service } = createService(repository);

    await expect(
      service.signIn({ email: SIGN_UP_INPUT.email, password: "supersecret" }),
    ).rejects.toBeInstanceOf(ApplicationError);
  });
});

describe("confirmEmail", () => {
  it("treats an expired link as a normal negative outcome", async () => {
    const repository = createRepository({
      verifyEmailToken: vi.fn(async () => {
        throw new AuthProviderError("INVALID_TOKEN", "expired");
      }),
    });
    const { service } = createService(repository);

    await expect(service.confirmEmail("hash", "signup")).resolves.toEqual({
      ok: false,
    });
  });

  it("returns the link type so the caller knows where to send the user", async () => {
    const { service } = createService(createRepository());

    await expect(service.confirmEmail("hash", "recovery")).resolves.toEqual({
      ok: true,
      type: "recovery",
      userId: "user-1",
    });
  });
});

describe("exchangeAuthCode", () => {
  it("reports a password-reset link so the caller can send the user to set one", async () => {
    const { service } = createService(
      createRepository({
        exchangeAuthCode: vi.fn(async () => ({
          isRecovery: true,
          userId: "user-1",
        })),
      }),
    );

    await expect(service.exchangeAuthCode("code")).resolves.toEqual({
      ok: true,
      isRecovery: true,
      userId: "user-1",
    });
  });

  it("treats a reused code or one from another browser as an expired link", async () => {
    const { service } = createService(
      createRepository({
        exchangeAuthCode: vi.fn(async () => {
          throw new AuthProviderError("INVALID_TOKEN", "no verifier");
        }),
      }),
    );

    await expect(service.exchangeAuthCode("code")).resolves.toEqual({
      ok: false,
    });
  });

  it("escalates a provider outage instead of blaming the link", async () => {
    const { service } = createService(
      createRepository({
        exchangeAuthCode: vi.fn(async () => {
          throw new AuthProviderError("UNKNOWN", "503");
        }),
      }),
    );

    await expect(service.exchangeAuthCode("code")).rejects.toBeInstanceOf(
      ApplicationError,
    );
  });
});

describe("requestPasswordReset", () => {
  let repository: AuthRepository;

  beforeEach(() => {
    repository = createRepository();
  });

  it("succeeds without revealing whether the address exists", async () => {
    const { service } = createService(repository);

    await expect(
      service.requestPasswordReset({ email: "nobody@example.com" }),
    ).resolves.toEqual({ ok: true });
  });

  it("reports rate limiting, which the user can act on", async () => {
    const limited = createRepository({
      sendPasswordResetEmail: vi.fn(async () => {
        throw new AuthProviderError("RATE_LIMITED", "slow down");
      }),
    });
    const { service } = createService(limited);

    await expect(
      service.requestPasswordReset({ email: SIGN_UP_INPUT.email }),
    ).resolves.toEqual({ ok: false, reason: "RATE_LIMITED" });
  });
});

describe("changeEmail", () => {
  it("refuses the address already on the account without calling the provider", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(
      service.changeEmail(ACTOR, { email: ACTOR.email ?? "" }),
    ).resolves.toEqual({ ok: false, reason: "SAME_EMAIL" });
    expect(repository.requestEmailChange).not.toHaveBeenCalled();
  });

  it("sends the confirmation link back through the confirm route", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(
      service.changeEmail(ACTOR, { email: "new@example.com" }),
    ).resolves.toEqual({ ok: true });
    expect(repository.requestEmailChange).toHaveBeenCalledWith(
      "new@example.com",
      "https://events.test/auth/confirm",
    );
  });

  it("reports an address another account already uses", async () => {
    const repository = createRepository({
      requestEmailChange: vi.fn(async () => {
        throw new AuthProviderError("EMAIL_TAKEN", "exists");
      }),
    });
    const { service } = createService(repository);

    await expect(
      service.changeEmail(ACTOR, { email: "taken@example.com" }),
    ).resolves.toEqual({ ok: false, reason: "EMAIL_TAKEN" });
  });
});

describe("changePassword", () => {
  const input = {
    currentPassword: "oldsecret",
    newPassword: "newsecret1",
    confirmPassword: "newsecret1",
  };

  it("checks the current password against the actor's own email first", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(service.changePassword(ACTOR, input)).resolves.toEqual({
      ok: true,
    });
    expect(repository.signInWithPassword).toHaveBeenCalledWith(
      ACTOR.email,
      "oldsecret",
    );
    expect(repository.updatePassword).toHaveBeenCalledWith("newsecret1");
  });

  it("ends every session once the password has changed", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await service.changePassword(ACTOR, input);

    expect(repository.signOut).toHaveBeenCalledWith("global");
  });

  it("still reports success when ending sessions fails, since the password did change", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const repository = createRepository({
      signOut: vi.fn(async () => {
        throw new AuthProviderError("UNKNOWN", "signout failed");
      }),
    });
    const { service } = createService(repository);

    await expect(service.changePassword(ACTOR, input)).resolves.toEqual({
      ok: true,
    });
    consoleError.mockRestore();
  });

  it("never changes the password when the current one is wrong", async () => {
    const repository = createRepository({
      signInWithPassword: vi.fn(async () => {
        throw new AuthProviderError("INVALID_CREDENTIALS", "bad");
      }),
    });
    const { service } = createService(repository);

    await expect(service.changePassword(ACTOR, input)).resolves.toEqual({
      ok: false,
      reason: "WRONG_PASSWORD",
    });
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("reports a password the provider rejects as unchanged", async () => {
    const repository = createRepository({
      updatePassword: vi.fn(async () => {
        throw new AuthProviderError("SAME_PASSWORD", "same");
      }),
    });
    const { service } = createService(repository);

    await expect(service.changePassword(ACTOR, input)).resolves.toEqual({
      ok: false,
      reason: "SAME_PASSWORD",
    });
  });
});

describe("updatePassword (finishing a reset)", () => {
  const INPUT = { password: "brandnew99" };

  it("sets the password when the reset link was opened for this account", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(
      service.updatePassword(ACTOR, INPUT, ACTOR.id),
    ).resolves.toEqual({ ok: true });
    expect(repository.updatePassword).toHaveBeenCalledWith("brandnew99");
  });

  it("refuses an ordinary session with no reset link behind it", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(service.updatePassword(ACTOR, INPUT, null)).resolves.toEqual({
      ok: false,
      reason: "RECOVERY_REQUIRED",
    });
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("refuses a reset link that was opened for a different account", async () => {
    const repository = createRepository();
    const { service } = createService(repository);

    await expect(
      service.updatePassword(ACTOR, INPUT, "someone-else"),
    ).resolves.toEqual({ ok: false, reason: "RECOVERY_REQUIRED" });
    expect(repository.updatePassword).not.toHaveBeenCalled();
  });

  it("reports reusing the current password instead of crashing", async () => {
    const { service } = createService(
      createRepository({
        updatePassword: vi.fn(async () => {
          throw new AuthProviderError("SAME_PASSWORD", "same");
        }),
      }),
    );

    await expect(
      service.updatePassword(ACTOR, INPUT, ACTOR.id),
    ).resolves.toEqual({ ok: false, reason: "SAME_PASSWORD" });
  });

  it("escalates an unexpected provider failure as an application error", async () => {
    const { service } = createService(
      createRepository({
        updatePassword: vi.fn(async () => {
          throw new AuthProviderError("UNKNOWN", "503");
        }),
      }),
    );

    await expect(
      service.updatePassword(ACTOR, INPUT, ACTOR.id),
    ).rejects.toBeInstanceOf(ApplicationError);
  });
});

describe("signOut", () => {
  it("reports a provider failure as an application error", async () => {
    const { service } = createService(
      createRepository({
        signOut: vi.fn(async () => {
          throw new AuthProviderError("UNKNOWN", "network");
        }),
      }),
    );

    await expect(service.signOut()).rejects.toBeInstanceOf(ApplicationError);
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  AuthProviderError,
  type AuthRepository,
} from "@/features/auth/dal/auth-repository";
import { ApplicationError } from "@/lib/errors";

import { createAuthService } from "./auth-service";

const SIGN_UP_INPUT = {
  displayName: "Nick",
  username: "nick",
  email: "nick@example.com",
  password: "supersecret",
};

function createRepository(
  overrides: Partial<AuthRepository> = {},
): AuthRepository {
  return {
    signUp: vi.fn(async () => ({
      user: { id: "user-1", email: SIGN_UP_INPUT.email, emailVerified: false },
      hasSession: true,
    })),
    verifyEmailToken: vi.fn(async () => {}),
    signInWithPassword: vi.fn(async () => ({
      id: "user-1",
      email: SIGN_UP_INPUT.email,
      emailVerified: true,
    })),
    signOut: vi.fn(async () => {}),
    getAuthenticatedUser: vi.fn(async () => null),
    sendPasswordResetEmail: vi.fn(async () => {}),
    resendConfirmationEmail: vi.fn(async () => {}),
    updatePassword: vi.fn(async () => {}),
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
    });
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

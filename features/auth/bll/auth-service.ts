import type {
  ChangeEmailInput,
  ChangePasswordInput,
  PasswordResetRequestInput,
  SignInInput,
  SignUpInput,
  UpdatePasswordInput,
} from "@/features/auth/contracts";
import {
  AuthProviderError,
  type AuthRepository,
  type AuthUser,
  type EmailConfirmationType,
} from "@/features/auth/dal/auth-repository";
import { ApplicationError } from "@/lib/errors";
import { createLogger } from "@/lib/logging";

/**
 * Username ownership lives in the profiles domain. Auth depends on this narrow
 * port rather than the whole profiles service so the two features stay
 * independently testable.
 */
export interface UsernameAvailabilityPort {
  isUsernameAvailable(username: string): Promise<boolean>;
}

export interface AuthUrls {
  /** Where the confirmation and recovery emails send the user back to. */
  confirmUrl: string;
}

export type SignUpFailure =
  | "USERNAME_TAKEN"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED";

export type SignInFailure =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "RATE_LIMITED";

export type SignUpOutcome =
  | { ok: true; email: string; hasSession: boolean }
  | { ok: false; reason: SignUpFailure };

export type SignInOutcome =
  | { ok: true; user: AuthUser }
  | { ok: false; reason: SignInFailure };

export type PasswordResetOutcome =
  | { ok: true }
  | { ok: false; reason: "RATE_LIMITED" };

export type UpdatePasswordOutcome =
  | { ok: true }
  | {
      ok: false;
      reason: "RECOVERY_REQUIRED" | "WEAK_PASSWORD" | "SAME_PASSWORD";
    };

export type ChangeEmailOutcome =
  | { ok: true }
  | { ok: false; reason: "SAME_EMAIL" | "EMAIL_TAKEN" | "RATE_LIMITED" };

export type ChangePasswordOutcome =
  | { ok: true }
  | {
      ok: false;
      reason:
        | "WRONG_PASSWORD"
        | "WEAK_PASSWORD"
        | "SAME_PASSWORD"
        | "RATE_LIMITED";
    };

export type ConfirmEmailOutcome =
  | { ok: true; type: EmailConfirmationType; userId: string }
  | { ok: false };

export type ExchangeAuthCodeOutcome =
  | { ok: true; isRecovery: boolean; userId: string }
  | { ok: false };

const log = createLogger("auth.service");

export interface AuthService {
  signUp(input: SignUpInput): Promise<SignUpOutcome>;
  confirmEmail(
    tokenHash: string,
    type: EmailConfirmationType,
  ): Promise<ConfirmEmailOutcome>;
  exchangeAuthCode(code: string): Promise<ExchangeAuthCodeOutcome>;
  signIn(input: SignInInput): Promise<SignInOutcome>;
  signOut(): Promise<void>;
  requestPasswordReset(
    input: PasswordResetRequestInput,
  ): Promise<PasswordResetOutcome>;
  resendConfirmation(
    input: PasswordResetRequestInput,
  ): Promise<PasswordResetOutcome>;
  /**
   * Finishes a password reset. There is no current password to check, so the
   * proof of ownership is the reset link itself: `recoveryUserId` is the
   * account the link was opened for (from the recovery marker), and it must
   * be the account now signed in. Any other session — a stale tab, someone
   * at an unlocked computer — is sent to Settings, which asks for the
   * current password.
   */
  updatePassword(
    actor: AuthUser,
    input: UpdatePasswordInput,
    recoveryUserId: string | null,
  ): Promise<UpdatePasswordOutcome>;
  changeEmail(
    actor: AuthUser,
    input: ChangeEmailInput,
  ): Promise<ChangeEmailOutcome>;
  /**
   * Unlike `updatePassword`, which finishes a reset whose email link already
   * proved ownership, this runs on an ordinary session, so the current
   * password is re-checked first.
   */
  changePassword(
    actor: AuthUser,
    input: ChangePasswordInput,
  ): Promise<ChangePasswordOutcome>;
  getAuthenticatedUser(): Promise<AuthUser | null>;
}

export function createAuthService(dependencies: {
  authRepository: AuthRepository;
  usernames: UsernameAvailabilityPort;
  urls: AuthUrls;
}): AuthService {
  const { authRepository, usernames, urls } = dependencies;

  return {
    async signUp(input) {
      if (!(await usernames.isUsernameAvailable(input.username))) {
        return { ok: false, reason: "USERNAME_TAKEN" };
      }

      try {
        const result = await authRepository.signUp({
          email: input.email,
          password: input.password,
          username: input.username,
          displayName: input.displayName,
          emailRedirectTo: urls.confirmUrl,
        });

        return {
          ok: true,
          email: input.email,
          hasSession: result.hasSession,
        };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "EMAIL_TAKEN":
            return { ok: false, reason: "EMAIL_TAKEN" };
          case "WEAK_PASSWORD":
            return { ok: false, reason: "WEAK_PASSWORD" };
          case "RATE_LIMITED":
            return { ok: false, reason: "RATE_LIMITED" };
          case "PROFILE_CREATION_FAILED": {
            // Someone claimed the username between the check above and the
            // insert. Confirm that before blaming it, so unrelated database
            // faults are not silently reported as a naming problem.
            if (!(await usernames.isUsernameAvailable(input.username))) {
              return { ok: false, reason: "USERNAME_TAKEN" };
            }
            throw new ApplicationError(
              "DATA_ACCESS_FAILED",
              "Could not create the account profile.",
              error,
            );
          }
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Sign-up failed.",
              error,
            );
        }
      }
    },

    async confirmEmail(tokenHash, type) {
      try {
        const { userId } = await authRepository.verifyEmailToken(
          tokenHash,
          type,
        );
        return { ok: true, type, userId };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        // An expired or already-used link is ordinary user behaviour, not a
        // fault worth surfacing as an error page.
        if (
          error.reason === "INVALID_TOKEN" ||
          error.reason === "RATE_LIMITED"
        ) {
          return { ok: false };
        }

        throw new ApplicationError(
          "EXTERNAL_SERVICE_FAILED",
          "Could not confirm the email link.",
          error,
        );
      }
    },

    async exchangeAuthCode(code) {
      try {
        const { isRecovery, userId } =
          await authRepository.exchangeAuthCode(code);
        return { ok: true, isRecovery, userId };
      } catch (error) {
        if (
          error instanceof AuthProviderError &&
          error.reason === "INVALID_TOKEN"
        ) {
          return { ok: false };
        }
        throw new ApplicationError(
          "EXTERNAL_SERVICE_FAILED",
          "Could not complete the email link.",
          error,
        );
      }
    },

    async signIn(input) {
      try {
        const user = await authRepository.signInWithPassword(
          input.email,
          input.password,
        );
        return { ok: true, user };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "INVALID_CREDENTIALS":
            return { ok: false, reason: "INVALID_CREDENTIALS" };
          case "EMAIL_NOT_CONFIRMED":
            return { ok: false, reason: "EMAIL_NOT_CONFIRMED" };
          case "RATE_LIMITED":
            return { ok: false, reason: "RATE_LIMITED" };
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Sign-in failed.",
              error,
            );
        }
      }
    },

    async signOut() {
      try {
        await authRepository.signOut("global");
      } catch (error) {
        throw new ApplicationError(
          "EXTERNAL_SERVICE_FAILED",
          "Sign-out failed.",
          error,
        );
      }
    },

    async requestPasswordReset(input) {
      try {
        await authRepository.sendPasswordResetEmail(
          input.email,
          urls.confirmUrl,
        );
        return { ok: true };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }
        if (error.reason === "RATE_LIMITED") {
          return { ok: false, reason: "RATE_LIMITED" };
        }
        throw new ApplicationError(
          "EXTERNAL_SERVICE_FAILED",
          "Could not send the password reset email.",
          error,
        );
      }
    },

    async resendConfirmation(input) {
      try {
        await authRepository.resendConfirmationEmail(
          input.email,
          urls.confirmUrl,
        );
        return { ok: true };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }
        if (error.reason === "RATE_LIMITED") {
          return { ok: false, reason: "RATE_LIMITED" };
        }
        throw new ApplicationError(
          "EXTERNAL_SERVICE_FAILED",
          "Could not resend the confirmation email.",
          error,
        );
      }
    },

    async updatePassword(actor, input, recoveryUserId) {
      if (recoveryUserId !== actor.id) {
        log.warn("Password reset refused without a matching recovery link.", {
          userId: actor.id,
          hasMarker: recoveryUserId !== null,
        });
        return { ok: false, reason: "RECOVERY_REQUIRED" };
      }

      try {
        await authRepository.updatePassword(input.password);
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "WEAK_PASSWORD":
            return { ok: false, reason: "WEAK_PASSWORD" };
          case "SAME_PASSWORD":
            return { ok: false, reason: "SAME_PASSWORD" };
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Password reset failed.",
              error,
            );
        }
      }

      log.info("Password reset completed.", { userId: actor.id });
      return { ok: true };
    },

    async changeEmail(actor, input) {
      if (input.email === actor.email) {
        return { ok: false, reason: "SAME_EMAIL" };
      }

      try {
        await authRepository.requestEmailChange(input.email, urls.confirmUrl);
        return { ok: true };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "EMAIL_TAKEN":
            return { ok: false, reason: "EMAIL_TAKEN" };
          case "RATE_LIMITED":
            return { ok: false, reason: "RATE_LIMITED" };
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Email change failed.",
              error,
            );
        }
      }
    },

    async changePassword(actor, input) {
      if (!actor.email) {
        throw new ApplicationError(
          "FORBIDDEN",
          "This account has no email, so it has no password to change.",
        );
      }

      try {
        await authRepository.signInWithPassword(
          actor.email,
          input.currentPassword,
        );
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "INVALID_CREDENTIALS":
            return { ok: false, reason: "WRONG_PASSWORD" };
          case "RATE_LIMITED":
            return { ok: false, reason: "RATE_LIMITED" };
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Could not verify the current password.",
              error,
            );
        }
      }

      try {
        await authRepository.updatePassword(input.newPassword);
      } catch (error) {
        if (!(error instanceof AuthProviderError)) {
          throw error;
        }

        switch (error.reason) {
          case "WEAK_PASSWORD":
            return { ok: false, reason: "WEAK_PASSWORD" };
          case "SAME_PASSWORD":
            return { ok: false, reason: "SAME_PASSWORD" };
          default:
            throw new ApplicationError(
              "EXTERNAL_SERVICE_FAILED",
              "Password change failed.",
              error,
            );
        }
      }

      // A password is often changed because someone else may know it, so
      // every session ends — including any on a device the owner lost.
      try {
        await authRepository.signOut("global");
      } catch (error) {
        // Swallowed on purpose: the password did change, so reporting a
        // failure here would be wrong. The log is the only evidence that the
        // other sessions outlived it.
        log.error("Password changed but sessions were not ended.", error);
      }

      return { ok: true };
    },

    getAuthenticatedUser: () => authRepository.getAuthenticatedUser(),
  };
}

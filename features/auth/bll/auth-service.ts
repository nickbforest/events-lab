import type {
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
  | { ok: false; reason: "WEAK_PASSWORD" };

export type ConfirmEmailOutcome =
  | { ok: true; type: EmailConfirmationType }
  | { ok: false };

export interface AuthService {
  signUp(input: SignUpInput): Promise<SignUpOutcome>;
  confirmEmail(
    tokenHash: string,
    type: EmailConfirmationType,
  ): Promise<ConfirmEmailOutcome>;
  signIn(input: SignInInput): Promise<SignInOutcome>;
  signOut(): Promise<void>;
  requestPasswordReset(
    input: PasswordResetRequestInput,
  ): Promise<PasswordResetOutcome>;
  resendConfirmation(
    input: PasswordResetRequestInput,
  ): Promise<PasswordResetOutcome>;
  updatePassword(input: UpdatePasswordInput): Promise<UpdatePasswordOutcome>;
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
        if (!(error instanceof AuthProviderError)) throw error;

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
        await authRepository.verifyEmailToken(tokenHash, type);
        return { ok: true, type };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) throw error;

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

    async signIn(input) {
      try {
        const user = await authRepository.signInWithPassword(
          input.email,
          input.password,
        );
        return { ok: true, user };
      } catch (error) {
        if (!(error instanceof AuthProviderError)) throw error;

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

    signOut: () => authRepository.signOut(),

    async requestPasswordReset(input) {
      try {
        await authRepository.sendPasswordResetEmail(
          input.email,
          urls.confirmUrl,
        );
        return { ok: true };
      } catch (error) {
        if (
          error instanceof AuthProviderError &&
          error.reason === "RATE_LIMITED"
        ) {
          return { ok: false, reason: "RATE_LIMITED" };
        }
        throw error;
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
        if (
          error instanceof AuthProviderError &&
          error.reason === "RATE_LIMITED"
        ) {
          return { ok: false, reason: "RATE_LIMITED" };
        }
        throw error;
      }
    },

    async updatePassword(input) {
      try {
        await authRepository.updatePassword(input.password);
        return { ok: true };
      } catch (error) {
        if (
          error instanceof AuthProviderError &&
          error.reason === "WEAK_PASSWORD"
        ) {
          return { ok: false, reason: "WEAK_PASSWORD" };
        }
        throw error;
      }
    },

    getAuthenticatedUser: () => authRepository.getAuthenticatedUser(),
  };
}

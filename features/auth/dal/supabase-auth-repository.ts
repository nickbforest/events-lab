import "server-only";

import type { AuthError, SupabaseClient, User } from "@supabase/supabase-js";

import {
  type AuthFailureReason,
  AuthProviderError,
  type AuthRepository,
  type AuthUser,
  type EmailConfirmationType,
  type SignUpCommand,
  type SignUpResult,
} from "@/features/auth/dal/auth-repository";
import type { Database } from "@/lib/supabase/database.types";

function toAuthUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? null,
    emailVerified: user.email_confirmed_at != null,
  };
}

function reasonFor(error: AuthError): AuthFailureReason {
  switch (error.code) {
    case "invalid_credentials":
      return "INVALID_CREDENTIALS";
    case "email_not_confirmed":
      return "EMAIL_NOT_CONFIRMED";
    case "user_already_exists":
    case "email_exists":
      return "EMAIL_TAKEN";
    case "weak_password":
      return "WEAK_PASSWORD";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "RATE_LIMITED";
    case "otp_expired":
    case "validation_failed":
      return "INVALID_TOKEN";
    default:
      break;
  }

  // A failing `handle_new_user` trigger aborts the auth.users insert and
  // surfaces as a generic server fault. The username unique constraint is by
  // far the likeliest cause, so the BLL re-checks to produce a precise message.
  if (error.status != null && error.status >= 500) {
    return "PROFILE_CREATION_FAILED";
  }

  return "UNKNOWN";
}

function fail(error: AuthError): never {
  throw new AuthProviderError(reasonFor(error), error.message, error);
}

export function createSupabaseAuthRepository(
  client: SupabaseClient<Database>,
): AuthRepository {
  return {
    async signUp(command: SignUpCommand): Promise<SignUpResult> {
      const { data, error } = await client.auth.signUp({
        email: command.email,
        password: command.password,
        options: {
          emailRedirectTo: command.emailRedirectTo,
          // The trigger reads these to build the profile row.
          data: {
            username: command.username,
            display_name: command.displayName,
          },
        },
      });

      if (error) fail(error);
      if (!data.user) {
        throw new AuthProviderError(
          "UNKNOWN",
          "Sign-up returned no user record.",
        );
      }

      return {
        user: toAuthUser(data.user),
        hasSession: data.session != null,
      };
    },

    async verifyEmailToken(tokenHash: string, type: EmailConfirmationType) {
      const { error } = await client.auth.verifyOtp({
        token_hash: tokenHash,
        type,
      });
      if (error) fail(error);
    },

    async signInWithPassword(email, password) {
      const { data, error } = await client.auth.signInWithPassword({
        email,
        password,
      });

      if (error) fail(error);
      if (!data.user) {
        throw new AuthProviderError(
          "UNKNOWN",
          "Sign-in returned no user record.",
        );
      }

      return toAuthUser(data.user);
    },

    async signOut() {
      const { error } = await client.auth.signOut();
      if (error) fail(error);
    },

    async getAuthenticatedUser() {
      const { data, error } = await client.auth.getUser();

      // A missing or expired session is an expected state, not a failure.
      if (error) return null;
      return data.user ? toAuthUser(data.user) : null;
    },

    async sendPasswordResetEmail(email, redirectTo) {
      const { error } = await client.auth.resetPasswordForEmail(email, {
        redirectTo,
      });
      if (error) fail(error);
    },

    async resendConfirmationEmail(email, redirectTo) {
      const { error } = await client.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: redirectTo },
      });
      if (error) fail(error);
    },

    async updatePassword(password) {
      const { error } = await client.auth.updateUser({ password });
      if (error) fail(error);
    },
  };
}

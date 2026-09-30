"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  compiledChangeEmailSchema,
  compiledChangePasswordSchema,
  compiledPasswordResetRequestSchema,
  compiledSignInSchema,
  compiledSignUpSchema,
  compiledUpdatePasswordSchema,
} from "@/features/auth/contracts";
import { verifySession } from "@/features/auth/queries";
import {
  clearRecoveryMarker,
  readRecoveryMarker,
} from "@/features/auth/recovery-marker";
import { getAuthService } from "@/features/auth/service";
import { actionFailure } from "@/lib/action-errors";
import { type FormResult, firstFieldErrors } from "@/lib/forms";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("auth.actions");

type SignUpField = "displayName" | "username" | "email" | "password";
type SignInField = "email" | "password";

const RATE_LIMITED_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

// Every action below keeps `redirect()` outside its `try`: a redirect is
// thrown, and `actionFailure` would otherwise report navigation as a failure.

export async function signUpAction(
  input: unknown,
): Promise<FormResult<SignUpField>> {
  const parsed = compiledSignUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<SignUpField>(parsed.error),
    };
  }

  let destination: string;
  try {
    const service = await getAuthService();
    const outcome = await service.signUp(parsed.data);

    if (!outcome.ok) {
      switch (outcome.reason) {
        case "USERNAME_TAKEN":
          return {
            status: "error",
            fieldErrors: { username: "That username is already taken." },
          };
        case "EMAIL_TAKEN":
          return {
            status: "error",
            fieldErrors: {
              email: "An account with this email already exists.",
            },
          };
        case "WEAK_PASSWORD":
          return {
            status: "error",
            fieldErrors: { password: "Please choose a stronger password." },
          };
        case "RATE_LIMITED":
          return { status: "error", message: RATE_LIMITED_MESSAGE };
      }
    }

    destination = outcome.hasSession
      ? routes.dashboard.root()
      : routes.auth.checkEmail(outcome.email);
  } catch (error) {
    return actionFailure<SignUpField>(log, "signUp", error);
  }

  revalidatePath("/", "layout");
  redirect(destination);
}

export async function signInAction(
  input: unknown,
): Promise<FormResult<SignInField>> {
  const parsed = compiledSignInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<SignInField>(parsed.error),
    };
  }

  try {
    const service = await getAuthService();
    const outcome = await service.signIn(parsed.data);

    if (!outcome.ok) {
      switch (outcome.reason) {
        case "INVALID_CREDENTIALS":
          return { status: "error", message: "Invalid email or password." };
        case "EMAIL_NOT_CONFIRMED":
          return {
            status: "error",
            message:
              "Confirm your email address before logging in. Check your inbox for the link.",
          };
        case "RATE_LIMITED":
          return { status: "error", message: RATE_LIMITED_MESSAGE };
      }
    }
  } catch (error) {
    return actionFailure<SignInField>(log, "signIn", error);
  }

  revalidatePath("/", "layout");
  redirect(routes.dashboard.root());
}

export async function signOutAction(): Promise<void> {
  try {
    const service = await getAuthService();
    await service.signOut();
  } catch (error) {
    // The form has nowhere to show a message, so the failure is logged and
    // the person is still taken home; the proxy re-checks the session there.
    actionFailure(log, "signOut", error);
  }

  revalidatePath("/", "layout");
  redirect(routes.home());
}

export async function requestPasswordResetAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = compiledPasswordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  try {
    const service = await getAuthService();
    const outcome = await service.requestPasswordReset(parsed.data);

    // Deliberately reports success even for unknown addresses: telling the
    // difference would turn this form into an account-existence oracle.
    return outcome.ok
      ? { status: "success" }
      : { status: "error", message: RATE_LIMITED_MESSAGE };
  } catch (error) {
    return actionFailure<"email">(log, "requestPasswordReset", error);
  }
}

export async function resendConfirmationAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = compiledPasswordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  try {
    const service = await getAuthService();
    const outcome = await service.resendConfirmation(parsed.data);

    return outcome.ok
      ? { status: "success" }
      : { status: "error", message: RATE_LIMITED_MESSAGE };
  } catch (error) {
    return actionFailure<"email">(log, "resendConfirmation", error);
  }
}

export async function updatePasswordAction(
  input: unknown,
): Promise<FormResult<"password">> {
  const parsed = compiledUpdatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"password">(parsed.error),
    };
  }

  const actor = await verifySession();

  try {
    const service = await getAuthService();
    const outcome = await service.updatePassword(
      actor,
      parsed.data,
      await readRecoveryMarker(),
    );

    if (!outcome.ok) {
      switch (outcome.reason) {
        case "RECOVERY_REQUIRED":
          return {
            status: "error",
            message:
              "This reset link has expired. Request a new one, or change your password from Settings.",
          };
        case "WEAK_PASSWORD":
          return {
            status: "error",
            fieldErrors: { password: "Please choose a stronger password." },
          };
        case "SAME_PASSWORD":
          return {
            status: "error",
            fieldErrors: {
              password: "Choose a password different from your current one.",
            },
          };
      }
    }

    await clearRecoveryMarker();
  } catch (error) {
    return actionFailure<"password">(log, "updatePassword", error);
  }

  revalidatePath("/", "layout");
  redirect(routes.dashboard.root());
}

export async function changeEmailAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = compiledChangeEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  const actor = await verifySession();

  try {
    const service = await getAuthService();
    const outcome = await service.changeEmail(actor, parsed.data);

    if (!outcome.ok) {
      switch (outcome.reason) {
        case "SAME_EMAIL":
          return {
            status: "error",
            fieldErrors: { email: "That is already your email address." },
          };
        case "EMAIL_TAKEN":
          return {
            status: "error",
            fieldErrors: {
              email: "Another account already uses this email address.",
            },
          };
        case "RATE_LIMITED":
          return { status: "error", message: RATE_LIMITED_MESSAGE };
      }
    }
  } catch (error) {
    return actionFailure<"email">(log, "changeEmail", error, {
      userId: actor.id,
    });
  }

  revalidatePath(routes.dashboard.settings());
  return { status: "success" };
}

type ChangePasswordField =
  | "currentPassword"
  | "newPassword"
  | "confirmPassword";

export async function changePasswordAction(
  input: unknown,
): Promise<FormResult<ChangePasswordField>> {
  const parsed = compiledChangePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<ChangePasswordField>(parsed.error),
    };
  }

  const actor = await verifySession();

  try {
    const service = await getAuthService();
    const outcome = await service.changePassword(actor, parsed.data);

    if (!outcome.ok) {
      switch (outcome.reason) {
        case "WRONG_PASSWORD":
          return {
            status: "error",
            fieldErrors: { currentPassword: "That password is not correct." },
          };
        case "WEAK_PASSWORD":
          return {
            status: "error",
            fieldErrors: { newPassword: "Please choose a stronger password." },
          };
        case "SAME_PASSWORD":
          return {
            status: "error",
            fieldErrors: {
              newPassword: "Choose a password different from your current one.",
            },
          };
        case "RATE_LIMITED":
          return { status: "error", message: RATE_LIMITED_MESSAGE };
      }
    }
  } catch (error) {
    return actionFailure<ChangePasswordField>(log, "changePassword", error, {
      userId: actor.id,
    });
  }

  // The service has ended every session, so the owner proves the new
  // password straight away rather than discovering a typo later.
  revalidatePath("/", "layout");
  redirect(routes.auth.mode("login", "password-changed"));
}

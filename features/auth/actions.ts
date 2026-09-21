"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  changeEmailSchema,
  changePasswordSchema,
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/features/auth/contracts";
import { verifySession } from "@/features/auth/queries";
import { getAuthService } from "@/features/auth/service";
import { type FormResult, firstFieldErrors } from "@/lib/forms";

type SignUpField = "displayName" | "username" | "email" | "password";
type SignInField = "email" | "password";

const RATE_LIMITED_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

export async function signUpAction(
  input: unknown,
): Promise<FormResult<SignUpField>> {
  const parsed = signUpSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<SignUpField>(parsed.error),
    };
  }

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
          fieldErrors: { email: "An account with this email already exists." },
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

  revalidatePath("/", "layout");

  // Redirect throws, so it must sit outside any try/catch above it.
  redirect(
    outcome.hasSession
      ? "/dashboard"
      : `/auth/check-email?email=${encodeURIComponent(outcome.email)}`,
  );
}

export async function signInAction(
  input: unknown,
): Promise<FormResult<SignInField>> {
  const parsed = signInSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<SignInField>(parsed.error),
    };
  }

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

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function signOutAction(): Promise<void> {
  const service = await getAuthService();
  await service.signOut();

  revalidatePath("/", "layout");
  redirect("/");
}

export async function requestPasswordResetAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  const service = await getAuthService();
  const outcome = await service.requestPasswordReset(parsed.data);

  // Deliberately reports success even for unknown addresses: telling the
  // difference would turn this form into an account-existence oracle.
  return outcome.ok
    ? { status: "success" }
    : { status: "error", message: RATE_LIMITED_MESSAGE };
}

export async function resendConfirmationAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = passwordResetRequestSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  const service = await getAuthService();
  const outcome = await service.resendConfirmation(parsed.data);

  return outcome.ok
    ? { status: "success" }
    : { status: "error", message: RATE_LIMITED_MESSAGE };
}

export async function updatePasswordAction(
  input: unknown,
): Promise<FormResult<"password">> {
  const parsed = updatePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"password">(parsed.error),
    };
  }

  const service = await getAuthService();
  const outcome = await service.updatePassword(parsed.data);

  if (!outcome.ok) {
    return {
      status: "error",
      fieldErrors: { password: "Please choose a stronger password." },
    };
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function changeEmailAction(
  input: unknown,
): Promise<FormResult<"email">> {
  const parsed = changeEmailSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<"email">(parsed.error),
    };
  }

  const actor = await verifySession();
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

  revalidatePath("/dashboard/settings");
  return { status: "success" };
}

export async function changePasswordAction(
  input: unknown,
): Promise<FormResult<"currentPassword" | "newPassword" | "confirmPassword">> {
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return {
      status: "error",
      fieldErrors: firstFieldErrors<
        "currentPassword" | "newPassword" | "confirmPassword"
      >(parsed.error),
    };
  }

  const actor = await verifySession();
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

  // The service has ended every session, so the owner proves the new
  // password straight away rather than discovering a typo later.
  revalidatePath("/", "layout");
  redirect("/auth?mode=login&notice=password-changed");
}

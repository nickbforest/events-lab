"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import {
  type FormResult,
  passwordResetRequestSchema,
  signInSchema,
  signUpSchema,
  updatePasswordSchema,
} from "@/features/auth/contracts";
import { getAuthService } from "@/features/auth/service";

type SignUpField = "displayName" | "username" | "email" | "password";
type SignInField = "email" | "password";

const RATE_LIMITED_MESSAGE =
  "Too many attempts. Please wait a few minutes and try again.";

function firstFieldErrors<TField extends string>(
  error: z.ZodError,
): Partial<Record<TField, string>> {
  const { fieldErrors } = z.flattenError(error);
  const result: Partial<Record<TField, string>> = {};

  for (const [field, messages] of Object.entries(fieldErrors)) {
    const message = (messages as string[] | undefined)?.[0];
    if (message) result[field as TField] = message;
  }

  return result;
}

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

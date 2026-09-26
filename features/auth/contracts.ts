import { z } from "zod";

import {
  displayNameSchema,
  usernameSchema,
} from "@/features/profiles/contracts";
import { AUTH_NOTICES } from "@/lib/routes";

export const emailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .pipe(z.email({ error: "Enter a valid email address." }));

export const passwordSchema = z
  .string()
  .min(8, { error: "Password must be at least 8 characters." })
  // bcrypt silently truncates beyond 72 bytes, so reject rather than mislead.
  .max(72, { error: "Password must be 72 characters or fewer." });

export const signUpSchema = z.object({
  displayName: displayNameSchema,
  username: usernameSchema,
  email: emailSchema,
  password: passwordSchema,
});

export const signInSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const passwordResetRequestSchema = z.object({
  email: emailSchema,
});

export const updatePasswordSchema = z.object({
  password: passwordSchema,
});

export const changeEmailSchema = z.object({
  email: emailSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, { error: "Enter your current password." }),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((value) => value.newPassword !== value.currentPassword, {
    path: ["newPassword"],
    error: "Choose a password different from your current one.",
  })
  // The new password is never shown, so a single typo would lock the owner out.
  .refine((value) => value.confirmPassword === value.newPassword, {
    path: ["confirmPassword"],
    error: "The passwords do not match.",
  });

export const usernameAvailabilitySchema = z.object({
  username: usernameSchema,
});

/** The `code` Supabase's default email templates append to the redirect. */
export const authCodeSchema = z.object({
  code: z.string().min(1),
});

/** Query parameters Supabase appends to confirmation and recovery links. */
export const emailConfirmationSchema = z.object({
  tokenHash: z.string().min(1),
  type: z.enum(["signup", "recovery", "email_change"]),
});

/**
 * Which form `/auth` shows. A query parameter is user-controlled, so it is
 * parsed rather than compared: `.catch` makes an absent, misspelled or
 * hand-edited value fall back to signup instead of rendering nothing.
 */
export const authModeSchema = z.enum(["login", "signup"]).catch("signup");

/**
 * The one-off notice an auth screen may show after a redirect. An enum, not
 * free text — a URL that can put arbitrary strings on the page is how content
 * injection starts.
 */
export const authNoticeSchema = z.enum(AUTH_NOTICES).nullable().catch(null);

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

/**
 * Compiled parsers for the auth schemas on a per-request path. See the note
 * in `features/profiles/contracts.ts` for why these are built at module
 * scope rather than inside the handler.
 */
export const compiledSignUpSchema = z.compile(signUpSchema);
export const compiledSignInSchema = z.compile(signInSchema);
export const compiledPasswordResetRequestSchema = z.compile(
  passwordResetRequestSchema,
);
export const compiledUpdatePasswordSchema = z.compile(updatePasswordSchema);
export const compiledChangeEmailSchema = z.compile(changeEmailSchema);
export const compiledChangePasswordSchema = z.compile(changePasswordSchema);
export const compiledUsernameAvailabilitySchema = z.compile(
  usernameAvailabilitySchema,
);
export const compiledAuthCodeSchema = z.compile(authCodeSchema);
export const compiledEmailConfirmationSchema = z.compile(
  emailConfirmationSchema,
);

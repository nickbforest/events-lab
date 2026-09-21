import { z } from "zod";

import {
  displayNameSchema,
  usernameSchema,
} from "@/features/profiles/contracts";

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

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;
export type ChangeEmailInput = z.infer<typeof changeEmailSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

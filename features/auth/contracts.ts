import { z } from "zod";

/**
 * Mirrors the `profiles_username_format` check constraint. Keeping the two in
 * sync matters: the database is the authority, and a value this schema accepts
 * but the constraint rejects would surface as an opaque signup failure.
 */
export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(3, { error: "Username must be at least 3 characters." })
  .max(32, { error: "Username must be 32 characters or fewer." })
  .regex(/^[a-z0-9_](-?[a-z0-9_])*$/, {
    error:
      "Use lowercase letters, numbers and underscores. Hyphens must sit between characters.",
  });

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

export const displayNameSchema = z
  .string()
  .trim()
  .min(1, { error: "Enter a name." })
  .max(80, { error: "Name must be 80 characters or fewer." });

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

export const usernameAvailabilitySchema = z.object({
  username: usernameSchema,
});

/** Query parameters Supabase appends to confirmation and recovery links. */
export const emailConfirmationSchema = z.object({
  tokenHash: z.string().min(1),
  type: z.enum(["signup", "recovery", "email_change"]),
});

/**
 * What a Server Action hands back to a form: either it succeeded, or it failed
 * with a message for the form and/or messages attached to specific fields.
 */
export type FormResult<TField extends string = never> =
  | { status: "success" }
  | {
      status: "error";
      message?: string;
      fieldErrors?: Partial<Record<TField, string>>;
    };

export type SignUpInput = z.infer<typeof signUpSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type PasswordResetRequestInput = z.infer<
  typeof passwordResetRequestSchema
>;
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>;

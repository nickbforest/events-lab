import { z } from "zod";

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

/**
 * Collapses a Zod error to one message per field, which is all a `Field` can
 * render. Nested paths flatten to their top-level key, so an invalid entry in a
 * grouped object surfaces against the group.
 */
export function firstFieldErrors<TField extends string>(
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

/**
 * TanStack Form surfaces Standard Schema issues as objects carrying `message`,
 * while some validation paths still yield plain strings. Normalising here keeps
 * every form from restating the same narrowing.
 */
export function firstErrorMessage(
  errors: readonly unknown[],
): string | undefined {
  for (const error of errors) {
    if (typeof error === "string" && error.length > 0) return error;

    if (error !== null && typeof error === "object" && "message" in error) {
      const { message } = error as { message?: unknown };
      if (typeof message === "string" && message.length > 0) return message;
    }
  }

  return undefined;
}

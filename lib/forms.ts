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

/**
 * Application errors and the one place their user-facing wording lives.
 *
 * Three things were scattered before this: the codes themselves, the sentence
 * shown to the person when something failed, and the decision about whether
 * to log. A message written at the throw site is invisible to translation and
 * drifts from the message a sibling path shows for the same failure, so the
 * wording is keyed here and looked up once at the boundary.
 */

export const APPLICATION_ERROR_CODES = [
  "VALIDATION_FAILED",
  "NOT_FOUND",
  "UNAUTHORIZED",
  "FORBIDDEN",
  "CONFLICT",
  "RATE_LIMITED",
  "DATA_ACCESS_FAILED",
  "EXTERNAL_SERVICE_FAILED",
  "UNEXPECTED",
] as const;

export type ApplicationErrorCode = (typeof APPLICATION_ERROR_CODES)[number];

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;

  constructor(code: ApplicationErrorCode, message: string, cause?: unknown) {
    // `cause` goes through Error's own option so the chain is walkable by
    // anything that understands a standard error, including the logger.
    super(message, { cause });
    this.name = "ApplicationError";
    this.code = code;
  }
}

export class DataAccessError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super("DATA_ACCESS_FAILED", message, cause);
    this.name = "DataAccessError";
  }
}

/**
 * Wording shown to the person, keyed by code.
 *
 * Every sentence here says what happened and what they can do. None of them
 * leak a provider name, a table, an id or a stack — those belong in the log,
 * which is why `toUserMessage` never reads `error.message`.
 */
export const USER_FACING_MESSAGES: Record<ApplicationErrorCode, string> = {
  VALIDATION_FAILED: "Check the highlighted fields and try again.",
  NOT_FOUND: "That is not here any more.",
  UNAUTHORIZED: "Sign in to continue.",
  FORBIDDEN: "You do not have access to that.",
  CONFLICT: "Someone else changed this first. Reload and try again.",
  RATE_LIMITED: "Too many attempts. Wait a moment and try again.",
  DATA_ACCESS_FAILED: "That could not be saved. Please try again.",
  EXTERNAL_SERVICE_FAILED:
    "A service we depend on is not responding. Please try again shortly.",
  UNEXPECTED: "Something went wrong. Please try again.",
};

/**
 * The sentence to show for a thrown value.
 *
 * A `VALIDATION_FAILED` error carries wording written for one specific field
 * ("An online event needs a link"), so its own message is used. Every other
 * code falls back to the table above, because their messages are written for
 * a developer reading a log, not for the person who hit the failure.
 */
export function toUserMessage(error: unknown): string {
  if (error instanceof ApplicationError) {
    return error.code === "VALIDATION_FAILED"
      ? error.message
      : USER_FACING_MESSAGES[error.code];
  }
  return USER_FACING_MESSAGES.UNEXPECTED;
}

/** Narrows to one specific code, for a `catch` that handles only that case. */
export function isApplicationError(
  error: unknown,
  code?: ApplicationErrorCode,
): error is ApplicationError {
  if (!(error instanceof ApplicationError)) {
    return false;
  }
  return code === undefined || error.code === code;
}

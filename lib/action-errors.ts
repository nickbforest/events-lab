import "server-only";

import { ApplicationError, toUserMessage } from "@/lib/errors";
import type { FormResult } from "@/lib/forms";
import type { Logger } from "@/lib/logging";

/**
 * Turns a failure thrown inside a Server Action into a form result.
 *
 * Every action funnels its failures through here, so three things hold
 * everywhere: the sentence a person reads comes from `USER_FACING_MESSAGES`,
 * every failure leaves a log line with the action that produced it, and a
 * value that is not an `ApplicationError` — a bug, not a handled outcome — is
 * logged and rethrown so the route's error boundary still sees it.
 *
 * Call it only from a `catch`, and keep `redirect()` outside the `try`: a
 * redirect is thrown, and catching it here would turn navigation into an
 * error.
 */
export function actionFailure<TField extends string = never>(
  log: Logger,
  action: string,
  error: unknown,
  context?: Record<string, unknown>,
): Extract<FormResult<TField>, { status: "error" }> {
  if (!(error instanceof ApplicationError)) {
    log.error("Unhandled failure in a Server Action.", error, {
      action,
      ...context,
    });
    throw error;
  }

  // A refused business rule is expected behaviour; everything else is a fault
  // someone may need to look at.
  if (error.code === "VALIDATION_FAILED" || error.code === "NOT_FOUND") {
    log.warn("Server Action refused the request.", {
      action,
      code: error.code,
      reason: error.message,
      ...context,
    });
  } else {
    log.error("Server Action failed.", error, { action, ...context });
  }

  return { status: "error", message: toUserMessage(error) };
}

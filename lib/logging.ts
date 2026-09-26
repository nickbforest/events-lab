/**
 * Structured logging.
 *
 * Before this existed, failures reached `console.error` from three places in
 * three different shapes, and nothing that was swallowed on purpose left a
 * trace at all. A log line is the only evidence a handled failure happened,
 * so it has to carry enough to act on: what happened, where, and the error
 * itself.
 *
 * Deliberately not a dependency. Pino and Winston bring transports, worker
 * threads and a bundler story that a single Next.js app does not need yet;
 * this is the interface they expose, so swapping one in later is a change to
 * `emit` alone.
 *
 * Isomorphic: the same call works in a Server Component, a Server Action and
 * the browser. In development it prints a readable line; everywhere else it
 * prints one JSON object per event, which is what a log collector wants.
 */

export const LOG_LEVELS = ["debug", "info", "warn", "error"] as const;
export type LogLevel = (typeof LOG_LEVELS)[number];

/**
 * Structured detail attached to an event. Values must survive
 * `JSON.stringify`, so no class instances beyond the `error` field, which is
 * normalised separately.
 */
export type LogContext = Record<string, unknown>;

export interface LogEvent {
  level: LogLevel;
  /** Dot-separated origin, e.g. `profiles.actions.updateProfileMedia`. */
  scope: string;
  message: string;
  context?: LogContext;
  error?: SerializedError;
}

export interface SerializedError {
  name: string;
  message: string;
  /** Present on `ApplicationError` and its subclasses. */
  code?: string;
  stack?: string;
  /** The `cause` chain, flattened to its messages, outermost first. */
  causes?: string[];
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

function minimumLevel(): LogLevel {
  const configured = process.env.NEXT_PUBLIC_LOG_LEVEL;
  if (configured && (LOG_LEVELS as readonly string[]).includes(configured)) {
    return configured as LogLevel;
  }
  return process.env.NODE_ENV === "production" ? "info" : "debug";
}

/**
 * Flattens an unknown thrown value into something loggable.
 *
 * `catch` gives `unknown`, and a thrown string or object is rare but real;
 * this never throws while trying to report a throw.
 */
export function serializeError(error: unknown): SerializedError {
  if (!(error instanceof Error)) {
    return { name: "NonError", message: String(error) };
  }

  const causes: string[] = [];
  let cause: unknown = error.cause;
  // Bounded: a cause chain that loops would otherwise hang the logger.
  for (let depth = 0; cause instanceof Error && depth < 5; depth += 1) {
    causes.push(`${cause.name}: ${cause.message}`);
    cause = cause.cause;
  }

  const code =
    "code" in error && typeof error.code === "string" ? error.code : undefined;

  return {
    name: error.name,
    message: error.message,
    ...(code ? { code } : {}),
    ...(error.stack ? { stack: error.stack } : {}),
    ...(causes.length > 0 ? { causes } : {}),
  };
}

function emit(event: LogEvent): void {
  if (LEVEL_ORDER[event.level] < LEVEL_ORDER[minimumLevel()]) {
    return;
  }

  const line = {
    level: event.level,
    scope: event.scope,
    message: event.message,
    timestamp: new Date().toISOString(),
    ...(event.context ? { context: event.context } : {}),
    ...(event.error ? { error: event.error } : {}),
  };

  // biome-ignore lint/suspicious/noConsole: this module is the log transport.
  const sink = console[event.level === "debug" ? "log" : event.level];

  if (process.env.NODE_ENV === "development") {
    sink(`[${event.level}] ${event.scope}: ${event.message}`, line);
    return;
  }

  sink(JSON.stringify(line));
}

export interface Logger {
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  /** `error` is the thrown value; it is serialized, never spread into context. */
  error(message: string, error?: unknown, context?: LogContext): void;
  /** A logger for a narrower scope, e.g. `createLogger("a").child("b")`. */
  child(scope: string): Logger;
}

/**
 * A logger bound to a scope.
 *
 * Scope names read outside-in and name the code, not the feature: use
 * `profiles.actions.updateProfileMedia`, not `Profile upload`.
 */
export function createLogger(scope: string): Logger {
  return {
    debug: (message, context) =>
      emit({ level: "debug", scope, message, context }),
    info: (message, context) =>
      emit({ level: "info", scope, message, context }),
    warn: (message, context) =>
      emit({ level: "warn", scope, message, context }),
    error: (message, error, context) =>
      emit({
        level: "error",
        scope,
        message,
        context,
        ...(error === undefined ? {} : { error: serializeError(error) }),
      }),
    child: (childScope) => createLogger(`${scope}.${childScope}`),
  };
}

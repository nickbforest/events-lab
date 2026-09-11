export type ApplicationErrorCode =
  | "VALIDATION_FAILED"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "DATA_ACCESS_FAILED"
  | "EXTERNAL_SERVICE_FAILED";

export class ApplicationError extends Error {
  readonly code: ApplicationErrorCode;
  readonly cause?: unknown;

  constructor(code: ApplicationErrorCode, message: string, cause?: unknown) {
    super(message);
    this.name = "ApplicationError";
    this.code = code;
    this.cause = cause;
  }
}

export class DataAccessError extends ApplicationError {
  constructor(message: string, cause?: unknown) {
    super("DATA_ACCESS_FAILED", message, cause);
    this.name = "DataAccessError";
  }
}

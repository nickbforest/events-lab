import axios from "axios";

import { ApplicationError } from "@/lib/errors";

export class HttpError extends ApplicationError {
  readonly status: number | null;

  constructor(message: string, status: number | null, cause?: unknown) {
    super("EXTERNAL_SERVICE_FAILED", message, cause);
    this.name = "HttpError";
    this.status = status;
  }
}

export function mapHttpError(error: unknown): HttpError {
  if (axios.isAxiosError(error)) {
    return new HttpError(
      "The HTTP request failed.",
      error.response?.status ?? null,
      error,
    );
  }

  return new HttpError("The HTTP request failed.", null, error);
}

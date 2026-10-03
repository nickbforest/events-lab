"use client";

import "./globals.css";

import { useEffect } from "react";

import {
  StatusMessage,
  statusPrimaryActionClass,
} from "@/components/ui/status-message";
import { createLogger } from "@/lib/logging";

const log = createLogger("app.globalError");

export interface GlobalErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * The last line: the root layout itself failed. It replaces the whole
 * document, so it brings its own `<html>`, `<body>` and stylesheet, and uses
 * nothing that depends on the layout (header, fonts, providers). The design
 * tokens still apply; the fonts fall back to the system stack.
 */
export default function GlobalError({ error, retry }: GlobalErrorProps) {
  useEffect(() => {
    log.error("The root layout failed to render.", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <title>Something went wrong — Eventail</title>
        <main className="flex flex-1 flex-col">
          <StatusMessage
            kicker="Eventail"
            title="Something went wrong"
            description="Eventail could not load. It is usually temporary — try again in a moment."
            actions={
              <button
                type="button"
                onClick={() => retry()}
                className={statusPrimaryActionClass}
              >
                Try again
              </button>
            }
          />
        </main>
      </body>
    </html>
  );
}

"use client";

import Link from "next/link";
import { useEffect } from "react";

import { PublicShell } from "@/components/layout/public-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import {
  StatusMessage,
  statusPrimaryActionClass,
  statusSecondaryActionClass,
} from "@/components/ui/status-message";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("app.errorBoundary");

export interface RootErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * Something failed while rendering a public or auth page. The message never
 * shows `error.message` — in production a server error arrives redacted
 * anyway — and the digest is logged so the server-side entry can be found.
 */
export default function RootError({ error, retry }: RootErrorProps) {
  useEffect(() => {
    log.error("A page failed to render.", error, { digest: error.digest });
  }, [error]);

  return (
    <PublicShell>
      <SiteHeader />
      <main className="flex flex-1 flex-col">
        <StatusMessage
          kicker="Error"
          title="Something went wrong"
          description="This page could not be loaded. It is usually temporary — try again in a moment."
          actions={
            <>
              <button
                type="button"
                onClick={() => retry()}
                className={statusPrimaryActionClass}
              >
                Try again
              </button>
              <Link href={routes.home()} className={statusSecondaryActionClass}>
                Go to the home page
              </Link>
            </>
          }
        />
      </main>
      <SiteFooter />
    </PublicShell>
  );
}

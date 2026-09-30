"use client";

import Link from "next/link";
import { useEffect } from "react";

import {
  StatusMessage,
  statusPrimaryActionClass,
  statusSecondaryActionClass,
} from "@/components/ui/status-message";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("dashboard.errorBoundary");

export interface DashboardErrorProps {
  error: Error & { digest?: string };
  retry: () => void;
}

/**
 * A dashboard screen failed. The sidebar is in the layout above this
 * boundary, so it stays and the publisher can go elsewhere without a reload.
 */
export default function DashboardError({ error, retry }: DashboardErrorProps) {
  useEffect(() => {
    log.error("A dashboard screen failed to render.", error, {
      digest: error.digest,
    });
  }, [error]);

  return (
    <StatusMessage
      size="panel"
      kicker="Error"
      title="This screen did not load"
      description="Nothing you saved is lost. Try again, or go back to the overview."
      actions={
        <>
          <button
            type="button"
            onClick={() => retry()}
            className={statusPrimaryActionClass}
          >
            Try again
          </button>
          <Link
            href={routes.dashboard.root()}
            className={statusSecondaryActionClass}
          >
            Back to Overview
          </Link>
        </>
      }
    />
  );
}

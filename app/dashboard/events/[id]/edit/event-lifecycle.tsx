"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormAlert } from "@/components/auth/auth-card";
import {
  deleteEventAction,
  transitionEventAction,
} from "@/features/events/actions";
import type { EventTransition } from "@/features/events/contracts";
import type { EventStatus } from "@/lib/types";

const buttonClass =
  "rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60";

const primaryClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const dangerClass =
  "rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60";

/**
 * Which transitions make sense from where. Kept as data rather than a chain of
 * conditions so the set a publisher sees is obvious at a glance — and so the
 * UI cannot offer one the service will refuse.
 */
const AVAILABLE: Record<
  EventStatus,
  { to: EventTransition; label: string; tone: "primary" | "default" }[]
> = {
  draft: [{ to: "published", label: "Publish", tone: "primary" }],
  published: [
    { to: "postponed", label: "Postpone", tone: "default" },
    { to: "cancelled", label: "Cancel event", tone: "default" },
    { to: "archived", label: "Unpublish", tone: "default" },
  ],
  postponed: [
    { to: "published", label: "Back on", tone: "primary" },
    { to: "cancelled", label: "Cancel event", tone: "default" },
  ],
  cancelled: [{ to: "archived", label: "Unpublish", tone: "default" }],
  archived: [{ to: "published", label: "Publish again", tone: "primary" }],
};

export function EventLifecycle({
  eventId,
  status,
}: {
  eventId: string;
  status: EventStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(action: () => Promise<{ status: string; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.status === "error") {
        setError(result.message ?? "That change could not be saved.");
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="space-y-4 rounded-lg border border-border bg-card/40 p-5">
      <div>
        <h2 className="font-mono text-xs uppercase tracking-widest text-primary">
          Status
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {status === "draft"
            ? "Only you can see this event."
            : status === "archived"
              ? "Taken down. The public page returns a not found."
              : "Live on your public page."}
        </p>
      </div>

      {error && <FormAlert message={error} />}

      <div className="flex flex-wrap gap-3">
        {AVAILABLE[status].map((option) => (
          <button
            key={option.to}
            type="button"
            className={option.tone === "primary" ? primaryClass : buttonClass}
            disabled={pending}
            onClick={() => run(() => transitionEventAction(eventId, option.to))}
          >
            {option.label}
          </button>
        ))}

        {confirmingDelete ? (
          <>
            <button
              type="button"
              className={dangerClass}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await deleteEventAction(eventId);
                  router.push("/dashboard/events");
                })
              }
            >
              Delete permanently
            </button>
            <button
              type="button"
              className={buttonClass}
              disabled={pending}
              onClick={() => setConfirmingDelete(false)}
            >
              Keep it
            </button>
          </>
        ) : (
          <button
            type="button"
            className={dangerClass}
            disabled={pending}
            onClick={() => setConfirmingDelete(true)}
          >
            Delete
          </button>
        )}
      </div>

      {confirmingDelete && (
        <p className="text-sm text-muted-foreground">
          Deleting removes the event and its cover image for good. Unpublishing
          keeps both and only hides the page.
        </p>
      )}
    </div>
  );
}

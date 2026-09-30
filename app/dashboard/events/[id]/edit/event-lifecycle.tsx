"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { FormAlert } from "@/components/auth/auth-card";
import {
  deleteEventAction,
  transitionEventAction,
} from "@/features/events/actions";
import {
  EVENT_TRANSITIONS,
  type EventTransition,
} from "@/features/events/contracts";
import { USER_FACING_MESSAGES } from "@/lib/errors";
import type { FormResult } from "@/lib/forms";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";
import type { EventStatus } from "@/lib/types";

const log = createLogger("events.lifecycle");

const buttonClass =
  "rounded-md border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60";

const primaryClass =
  "rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

const dangerClass =
  "rounded-md border border-destructive/40 px-4 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60";

/** The words for a move, which depend on where the event is coming from. */
function transitionLabel(from: EventStatus, to: EventTransition): string {
  switch (to) {
    case "published":
      return from === "draft"
        ? "Publish"
        : from === "postponed"
          ? "Back on"
          : "Publish again";
    case "postponed":
      return "Postpone";
    case "cancelled":
      return "Cancel event";
    case "archived":
      return "Unpublish";
    case "draft":
      return "Back to draft";
  }
}

export interface EventLifecycleProps {
  eventId: string;
  status: EventStatus;
}

/**
 * Status changes for one event. The buttons come from `EVENT_TRANSITIONS`,
 * the same table the events service enforces, so the panel can only offer a
 * change the server will accept.
 */
export function EventLifecycle({ eventId, status }: EventLifecycleProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  function run(
    label: string,
    action: () => Promise<FormResult>,
    onSuccess: () => void,
  ) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.status === "error") {
          setError(result.message ?? USER_FACING_MESSAGES.UNEXPECTED);
          return;
        }
        onSuccess();
      } catch (thrown) {
        log.error(`${label} failed before a result came back.`, thrown, {
          eventId,
        });
        setError(USER_FACING_MESSAGES.UNEXPECTED);
      }
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

      {error ? <FormAlert message={error} /> : null}

      <div className="flex flex-wrap gap-3">
        {EVENT_TRANSITIONS[status].map((to) => (
          <button
            key={to}
            type="button"
            className={to === "published" ? primaryClass : buttonClass}
            disabled={pending}
            onClick={() =>
              run(
                "Status change",
                () => transitionEventAction(eventId, to),
                () => router.refresh(),
              )
            }
          >
            {transitionLabel(status, to)}
          </button>
        ))}

        {confirmingDelete ? (
          <>
            <button
              type="button"
              className={dangerClass}
              disabled={pending}
              onClick={() =>
                run(
                  "Delete",
                  () => deleteEventAction(eventId),
                  () => router.push(routes.dashboard.events()),
                )
              }
            >
              {pending ? "Deleting…" : "Delete permanently"}
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

      {confirmingDelete ? (
        <p className="text-sm text-muted-foreground">
          Deleting removes the event and its cover image for good. Unpublishing
          keeps both and only hides the page.
        </p>
      ) : null}
    </div>
  );
}

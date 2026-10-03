"use client";

import { Check, Link2, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import {
  deleteEventAction,
  transitionEventAction,
} from "@/features/events/actions";
import { PUBLIC_EVENT_STATUSES } from "@/features/events/contracts";
import { USER_FACING_MESSAGES } from "@/lib/errors";
import { EVENT_STATUS_META } from "@/lib/format";
import type { FormResult } from "@/lib/forms";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";
import type { EventStatus, EventWithRelations } from "@/lib/types";

import { useEventDialog } from "./event-dialog";

const log = createLogger("events.rowActions");

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

const dangerIconClass =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Statuses the list toggle can move between. On is `published`, off is
 * `archived` (or still a draft). Cancelled and postponed events are public
 * too, but toggling them would silently turn "cancelled" into "published", so
 * their status is changed on the edit page, where the choice is explicit.
 */
const TOGGLEABLE: readonly EventStatus[] = ["draft", "published", "archived"];

/** How long the copy button shows its tick before going back to the link. */
const COPIED_FEEDBACK_MS = 2000;

export interface EventRowActionsProps {
  event: EventWithRelations;
}

/**
 * Per-row controls on the events list: publish/unpublish, edit, delete.
 *
 * Every control names the event for screen readers, since a row of identical
 * icons is otherwise unusable without sighted context. Every result is shown:
 * a refused publish explains what is missing, right under the row's controls.
 */
export function EventRowActions({ event }: EventRowActionsProps) {
  const router = useRouter();
  const { openEdit } = useEventDialog();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { id: eventId, title, status } = event;
  const isOn = status === "published";
  const canToggle = TOGGLEABLE.includes(status);
  // A draft or archived event's link is a 404 for everyone else, so there is
  // nothing worth sharing yet.
  const isPublic = PUBLIC_EVENT_STATUSES.includes(status);

  async function copyLink() {
    setError(null);
    const url = new URL(
      routes.event(event.owner.username, event.slug),
      window.location.origin,
    ).toString();

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch (thrown) {
      log.error("Copying the event link failed.", thrown, { eventId });
      setError(`Could not copy the link. It is ${url}`);
    }
  }

  function run(label: string, action: () => Promise<FormResult>) {
    setError(null);
    startTransition(async () => {
      try {
        const result = await action();
        if (result.status === "error") {
          setError(result.message ?? USER_FACING_MESSAGES.UNEXPECTED);
          return;
        }
        setConfirmingDelete(false);
        router.refresh();
      } catch (thrown) {
        log.error(`${label} failed before a result came back.`, thrown, {
          eventId,
        });
        setError(USER_FACING_MESSAGES.UNEXPECTED);
      }
    });
  }

  const feedback = error ? (
    <p
      role="alert"
      className="mt-2 max-w-xs text-right text-xs leading-relaxed text-destructive"
    >
      {error}
    </p>
  ) : null;

  if (confirmingDelete) {
    return (
      <div>
        <div className="flex items-center justify-end gap-2">
          <span className="font-mono text-xs uppercase text-muted-foreground">
            Delete?
          </span>
          <button
            type="button"
            disabled={pending}
            className="rounded-md border border-destructive/40 px-3 py-1 font-mono text-xs uppercase text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            onClick={() => run("Delete", () => deleteEventAction(eventId))}
          >
            {pending ? "Deleting…" : "Yes"}
            <span className="sr-only">, delete {title}</span>
          </button>
          <button
            type="button"
            disabled={pending}
            className="rounded-md border border-border px-3 py-1 font-mono text-xs uppercase transition-colors hover:bg-white/5 disabled:opacity-50"
            onClick={() => {
              setError(null);
              setConfirmingDelete(false);
            }}
          >
            No
          </button>
        </div>
        {feedback}
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-end gap-1">
        <Switch
          checked={isOn || !canToggle}
          disabled={pending || !canToggle}
          label={isOn ? `Unpublish ${title}` : `Publish ${title}`}
          title={
            canToggle
              ? undefined
              : "Change a cancelled or postponed event from its edit page."
          }
          // The word beside the track is the event's real status, so a
          // cancelled, postponed or unpublished event says so.
          stateLabel={EVENT_STATUS_META[status].label}
          onChange={(next) =>
            run("Status change", () =>
              transitionEventAction(eventId, next ? "published" : "archived"),
            )
          }
          className="mr-2"
        />

        <button
          type="button"
          disabled={!isPublic}
          className={iconButtonClass}
          title={
            isPublic
              ? "Copy link"
              : "Publish this event to get a link you can share."
          }
          onClick={() => void copyLink()}
        >
          {copied ? (
            <Check className="size-4 text-primary" aria-hidden />
          ) : (
            <Link2 className="size-4" aria-hidden />
          )}
          <span className="sr-only">Copy link to {title}</span>
        </button>
        {/* Announced politely, so a screen reader hears the copy worked. */}
        <span aria-live="polite" className="sr-only">
          {copied ? `Link to ${title} copied.` : ""}
        </span>

        <button
          type="button"
          className={iconButtonClass}
          title="Edit"
          onClick={() => openEdit(event)}
        >
          <Pencil className="size-4" aria-hidden />
          <span className="sr-only">Edit {title}</span>
        </button>

        <button
          type="button"
          disabled={pending}
          className={dangerIconClass}
          title="Delete"
          onClick={() => {
            setError(null);
            setConfirmingDelete(true);
          }}
        >
          <Trash2 className="size-4" aria-hidden />
          <span className="sr-only">Delete {title}</span>
        </button>
      </div>
      {feedback}
    </div>
  );
}

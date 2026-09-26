"use client";

import { Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Switch } from "@/components/ui/switch";
import {
  deleteEventAction,
  transitionEventAction,
} from "@/features/events/actions";
import { EVENT_STATUS_META } from "@/lib/format";
import type { EventStatus, EventWithRelations } from "@/lib/types";

import { useEventDialog } from "./event-dialog";

const iconButtonClass =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50";

const dangerIconClass =
  "inline-flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-50";

/** Statuses that are live on the publisher's public page. */
const PUBLIC_STATUSES: readonly EventStatus[] = [
  "published",
  "cancelled",
  "postponed",
];

export interface EventRowActionsProps {
  event: EventWithRelations;
}

/**
 * Per-row controls on the events list: publish/unpublish, edit, delete.
 *
 * The toggle is the one action worth having inline — everything else about an
 * event is an edit. Cancel and postpone stay on the edit page, because both
 * change what a ticket holder sees and neither should be one stray click away
 * in a list.
 *
 * Every control names the event for screen readers, since a row of identical
 * icons is otherwise unusable without sighted context.
 */
export function EventRowActions({ event }: EventRowActionsProps) {
  const router = useRouter();
  const { openEdit } = useEventDialog();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { id: eventId, title, status } = event;
  const isPublic = PUBLIC_STATUSES.includes(status);

  function run(action: () => Promise<{ status: string }>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  if (confirmingDelete) {
    return (
      <div className="flex items-center justify-end gap-2">
        <span className="font-mono text-xs uppercase text-muted-foreground">
          Delete?
        </span>
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-destructive/40 px-3 py-1 font-mono text-xs uppercase text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
          onClick={() =>
            startTransition(async () => {
              await deleteEventAction(eventId);
              router.refresh();
            })
          }
        >
          Yes
          <span className="sr-only">, delete {title}</span>
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-md border border-border px-3 py-1 font-mono text-xs uppercase transition-colors hover:bg-white/5 disabled:opacity-50"
          onClick={() => setConfirmingDelete(false)}
        >
          No
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-end gap-1">
      <Switch
        checked={isPublic}
        disabled={pending}
        label={isPublic ? `Unpublish ${title}` : `Publish ${title}`}
        // The word beside the track is the event's real status, so a
        // cancelled or postponed event says so rather than just "on".
        stateLabel={isPublic ? EVENT_STATUS_META[status].label : "Draft"}
        onChange={(next) =>
          run(() =>
            transitionEventAction(eventId, next ? "published" : "archived"),
          )
        }
        className="mr-2"
      />

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
        onClick={() => setConfirmingDelete(true)}
      >
        <Trash2 className="size-4" aria-hidden />
        <span className="sr-only">Delete {title}</span>
      </button>
    </div>
  );
}

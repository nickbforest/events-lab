"use client";

import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import {
  deleteEventAction,
  transitionEventAction,
} from "@/features/events/actions";
import { routes } from "@/lib/routes";
import type { EventStatus } from "@/lib/types";

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
  eventId: string;
  title: string;
  status: EventStatus;
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
export function EventRowActions({
  eventId,
  title,
  status,
}: EventRowActionsProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

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
      <button
        type="button"
        disabled={pending}
        className={iconButtonClass}
        title={isPublic ? "Unpublish" : "Publish"}
        onClick={() =>
          run(() =>
            transitionEventAction(eventId, isPublic ? "archived" : "published"),
          )
        }
      >
        {isPublic ? (
          <EyeOff className="size-4" aria-hidden />
        ) : (
          <Eye className="size-4" aria-hidden />
        )}
        <span className="sr-only">
          {isPublic ? `Unpublish ${title}` : `Publish ${title}`}
        </span>
      </button>

      <Link
        href={routes.dashboard.editEvent(eventId)}
        className={iconButtonClass}
        title="Edit"
      >
        <Pencil className="size-4" aria-hidden />
        <span className="sr-only">Edit {title}</span>
      </Link>

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

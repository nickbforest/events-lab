"use client";

import { X } from "lucide-react";
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { routes } from "@/lib/routes";
import type { Category, EventWithRelations } from "@/lib/types";

import { EventForm } from "./event-form";

/**
 * Creating *and* editing an event, in a modal over the events list.
 *
 * Built on the native `<dialog>` with `showModal()` rather than a hand-rolled
 * overlay: focus trapping, Escape to close, the inert background and
 * top-layer stacking all come from the platform, and every one of those is
 * something custom modals routinely get wrong.
 *
 * The provider owns the single dialog instance so the header button and the
 * empty-state button open the same one. Two mounted copies would duplicate
 * every field id on the page.
 *
 * The form inside is the same `EventForm` the edit page uses, in its `dialog`
 * layout. Creating is not a different form from editing, only a shorter one —
 * so the same dialog serves both, with the event it was opened on deciding
 * which.
 */

interface EventDialogApi {
  openCreate: () => void;
  openEdit: (event: EventWithRelations) => void;
}

const EventDialogContext = createContext<EventDialogApi | null>(null);

export function useEventDialog(): EventDialogApi {
  const api = useContext(EventDialogContext);
  if (!api) {
    throw new Error("useEventDialog must be used inside NewEventProvider");
  }
  return api;
}

export interface NewEventProviderProps {
  categories: readonly Category[];
  children: ReactNode;
}

export function NewEventProvider({
  categories,
  children,
}: NewEventProviderProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [editing, setEditing] = useState<EventWithRelations | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const openCreate = useCallback(() => {
    setEditing(null);
    setIsOpen(true);
  }, []);

  const openEdit = useCallback((event: EventWithRelations) => {
    setEditing(event);
    setIsOpen(true);
  }, []);

  const close = useCallback(() => setIsOpen(false), []);

  // `showModal()` is imperative, so open state is mirrored onto the element
  // rather than the element being the source of truth.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (isOpen && !dialog.open) {
      dialog.showModal();
    }
    if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  return (
    <EventDialogContext.Provider value={{ openCreate, openEdit }}>
      {children}

      {/* biome-ignore lint/a11y/useKeyWithClickEvents: the keyboard path is
          Escape, which <dialog> handles natively and reports through onClose. */}
      <dialog
        ref={dialogRef}
        aria-labelledby="new-event-title"
        onClose={close}
        // A backdrop click lands on the dialog itself, never on its content.
        onClick={(clickEvent) => {
          if (clickEvent.target === dialogRef.current) {
            close();
          }
        }}
        className="m-auto max-h-[90vh] w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-2xl border border-border bg-card p-0 text-foreground shadow-lift backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {/* Mounted only while open, so the form resets between creations
            instead of keeping the last event's half-typed values. */}
        {isOpen ? (
          <div className="flex max-h-[90vh] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
              <h2
                id="new-event-title"
                className="font-display text-lg font-semibold tracking-tight"
              >
                {editing ? "Edit event" : "New event"}
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-white/[0.08] hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <EventForm
              // Keyed by event so switching rows rebuilds the form rather
              // than leaving the previous event's values in the inputs.
              key={editing?.id ?? "new"}
              categories={categories}
              event={editing}
              layout="dialog"
              onSaved={close}
              footerSlot={
                editing ? (
                  <a
                    href={routes.dashboard.editEvent(editing.id)}
                    className="text-sm font-medium text-muted-foreground underline-offset-4 transition-colors hover:text-foreground hover:underline"
                  >
                    Full editor
                  </a>
                ) : null
              }
            />
          </div>
        ) : null}
      </dialog>
    </EventDialogContext.Provider>
  );
}

export interface NewEventTriggerProps {
  className?: string;
  children: ReactNode;
}

/** Opens the shared dialog to create. Styling comes from the caller. */
export function NewEventTrigger({ className, children }: NewEventTriggerProps) {
  const { openCreate } = useEventDialog();

  return (
    <button type="button" onClick={openCreate} className={className}>
      {children}
    </button>
  );
}

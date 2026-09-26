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

import type { Category } from "@/lib/types";

import { EventForm } from "./event-form";

/**
 * Event creation, in a modal over the events list.
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
 * layout. Creating is not a different form from editing, only a shorter one.
 */

const NewEventContext = createContext<(() => void) | null>(null);

function useOpenNewEvent() {
  const open = useContext(NewEventContext);
  if (!open) {
    throw new Error("NewEventTrigger must be rendered inside NewEventProvider");
  }
  return open;
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
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
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
    <NewEventContext.Provider value={open}>
      {children}

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
        className="m-auto max-h-[90vh] w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card p-0 text-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {/* Mounted only while open, so the form resets between creations
            instead of keeping the last event's half-typed values. */}
        {isOpen ? (
          <div className="flex max-h-[90vh] flex-col">
            <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
              <h2
                id="new-event-title"
                className="font-display text-sm font-extrabold uppercase tracking-tight"
              >
                New event
              </h2>
              <button
                type="button"
                onClick={close}
                className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
              >
                <X className="size-4" aria-hidden />
                <span className="sr-only">Close</span>
              </button>
            </div>

            <EventForm
              categories={categories}
              layout="dialog"
              onSaved={close}
            />
          </div>
        ) : null}
      </dialog>
    </NewEventContext.Provider>
  );
}

export interface NewEventTriggerProps {
  className?: string;
  children: ReactNode;
}

/** A button that opens the shared dialog. Styling comes from the caller. */
export function NewEventTrigger({ className, children }: NewEventTriggerProps) {
  const open = useOpenNewEvent();

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

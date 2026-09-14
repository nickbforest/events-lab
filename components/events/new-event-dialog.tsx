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
import { Field, fieldControlClass } from "@/components/forms/field";
import { FormSection } from "@/components/forms/form-section";
import { ImageUploader } from "@/components/forms/image-uploader";
import { cn } from "@/lib/format";
import type { Category } from "@/lib/types";

/**
 * Event creation, in a modal over the events list.
 *
 * Built on the native `<dialog>` element rather than a hand-rolled overlay:
 * focus trapping, Escape to close, inert background and the top layer all
 * come from the platform, and every one of those is a thing custom modals
 * routinely get wrong.
 *
 * The provider holds the single dialog instance so that the header button and
 * the empty-state button open the same one — two triggers, one form, one set
 * of field ids.
 */

const NewEventContext = createContext<(() => void) | null>(null);

function useOpenNewEvent() {
  const open = useContext(NewEventContext);
  if (!open) {
    throw new Error("NewEventTrigger must be rendered inside NewEventProvider");
  }
  return open;
}

export function NewEventProvider({
  categories,
  children,
}: {
  categories: readonly Category[];
  children: ReactNode;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);

  // `showModal()` is imperative, so open state is mirrored onto the element
  // rather than the element being the source of truth.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) dialog.showModal();
    if (!isOpen && dialog.open) dialog.close();
  }, [isOpen]);

  return (
    <NewEventContext.Provider value={open}>
      {children}

      <dialog
        ref={dialogRef}
        aria-labelledby="new-event-title"
        onClose={() => setIsOpen(false)}
        // Clicking the backdrop lands on the dialog itself, never on its content.
        onClick={(event) => {
          if (event.target === dialogRef.current) setIsOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === "Escape") setIsOpen(false);
        }}
        className="m-auto max-h-[90vh] w-[min(46rem,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-card p-0 text-foreground backdrop:bg-black/70 backdrop:backdrop-blur-sm"
      >
        {isOpen && (
          <NewEventForm
            categories={categories}
            onClose={() => setIsOpen(false)}
          />
        )}
      </dialog>
    </NewEventContext.Provider>
  );
}

/** A button that opens the shared dialog. Styling is passed in by the caller. */
export function NewEventTrigger({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const open = useOpenNewEvent();

  return (
    <button type="button" onClick={open} className={className}>
      {children}
    </button>
  );
}

function NewEventForm({
  categories,
  onClose,
}: {
  categories: readonly Category[];
  onClose: () => void;
}) {
  const [ticketsEnabled, setTicketsEnabled] = useState(false);

  return (
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
          onClick={onClose}
          className="rounded-md p-1 text-muted-foreground transition-colors hover:bg-white/5 hover:text-foreground"
        >
          <X className="size-4" aria-hidden />
          <span className="sr-only">Close</span>
        </button>
      </div>

      <form className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
        <FormSection title="Basic information">
          <div className="space-y-5">
            <Field id="title" label="Event title">
              <input
                id="title"
                name="title"
                required
                className={fieldControlClass}
                placeholder="Summer Solstice Festival"
              />
            </Field>

            <Field
              id="short_description"
              label="Short description"
              hint="A one-line teaser. Appears in lists and previews."
            >
              <input
                id="short_description"
                name="short_description"
                aria-describedby="short_description-hint"
                className={fieldControlClass}
                placeholder="An evening of music, light, and..."
              />
            </Field>

            <Field id="description" label="Full description">
              <textarea
                id="description"
                name="description"
                rows={5}
                className={fieldControlClass}
              />
            </Field>

            <Field id="category" label="Category">
              <select
                id="category"
                name="category"
                required
                className={fieldControlClass}
                defaultValue=""
              >
                <option value="" disabled>
                  Choose a category
                </option>
                {categories.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>

        <FormSection title="Date & time">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <Field id="event_date" label="Event date">
              <input
                id="event_date"
                name="event_date"
                type="date"
                required
                className={fieldControlClass}
              />
            </Field>
            <Field id="start_time" label="Start time">
              <input
                id="start_time"
                name="start_time"
                type="time"
                required
                className={fieldControlClass}
              />
            </Field>
            <Field id="end_time" label="End time (optional)">
              <input
                id="end_time"
                name="end_time"
                type="time"
                className={fieldControlClass}
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Media">
          <ImageUploader
            id="cover_image_url"
            label="Event image"
            description="Square or wide image. Shown in lists and as the hero."
            className="aspect-square max-w-xs"
          />
        </FormSection>

        <FormSection title="Location">
          <div className="space-y-5">
            <Field id="venue_name" label="Venue name">
              <input
                id="venue_name"
                name="venue_name"
                className={fieldControlClass}
                placeholder="The Vanguard Hall"
              />
            </Field>

            <Field id="address" label="Address">
              <input
                id="address"
                name="address"
                className={fieldControlClass}
              />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field id="city" label="City">
                <input id="city" name="city" className={fieldControlClass} />
              </Field>
              <Field id="country" label="Country">
                <input
                  id="country"
                  name="country"
                  className={fieldControlClass}
                />
              </Field>
            </div>

            <Field id="maps_url" label="Google Maps URL (optional)">
              <input
                id="maps_url"
                name="maps_url"
                type="url"
                inputMode="url"
                className={fieldControlClass}
                placeholder="https://maps.google.com/..."
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Tickets">
          <div className="space-y-5">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                name="tickets_enabled"
                checked={ticketsEnabled}
                onChange={(event) => setTicketsEnabled(event.target.checked)}
                className="size-4 accent-primary"
              />
              Enable ticket button
            </label>

            {/* The button needs somewhere to point, so the URL follows the toggle. */}
            {ticketsEnabled && (
              <Field
                id="ticket_url"
                label="Ticket URL"
                hint="events-lab does not sell tickets. This sends people to your provider."
              >
                <input
                  id="ticket_url"
                  name="ticket_url"
                  type="url"
                  inputMode="url"
                  required
                  aria-describedby="ticket_url-hint"
                  className={fieldControlClass}
                  placeholder="https://"
                />
              </Field>
            )}
          </div>
        </FormSection>
      </form>

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border bg-card px-6 py-4">
        {/* Saving needs the Supabase write path — see Architecture.md §24. */}
        <p className="font-mono text-xs text-muted-foreground">
          Layout preview — saving is not wired up yet.
        </p>
        <button
          type="button"
          disabled
          className={cn(
            "rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all",
            "hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
          )}
        >
          Create event
        </button>
      </div>
    </div>
  );
}

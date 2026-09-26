"use client";

import { useForm } from "@tanstack/react-form";
import { X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { FormAlert } from "@/components/auth/auth-card";
import {
  Field,
  fieldControlClass,
  fieldDescribedBy,
  formSubmitClass,
} from "@/components/forms/field";
import { FormSection } from "@/components/forms/form-section";
import { ImageUploader } from "@/components/forms/image-uploader";
import {
  createEventAction,
  type EventField,
  updateEventAction,
  uploadEventCoverAction,
} from "@/features/events/actions";
import { EVENT_TAG_LIMIT } from "@/features/events/contracts";
import { COUNTRIES } from "@/lib/countries";
import { COMMON_TIME_ZONES } from "@/lib/datetime";
import { routes } from "@/lib/routes";
import type { Category, EventType, EventWithRelations } from "@/lib/types";

import {
  DEFAULT_TICKET_CTA,
  EVENT_TYPE_LABELS,
  type EventFormValues,
  toFormValues,
  toPayload,
} from "./event-form-values";

/**
 * Suggestions for the country field. The field stays free text — this only
 * saves typing, it does not constrain what can be entered.
 */
const COUNTRY_LIST_ID = "event-country-options";

function CountryOptions() {
  return (
    <datalist id={COUNTRY_LIST_ID}>
      {COUNTRIES.map((country) => (
        <option key={country.code} value={country.name} />
      ))}
    </datalist>
  );
}

export interface EventFormProps {
  categories: readonly Category[];
  event?: EventWithRelations | null;
  /**
   * `page` is the full editor: every field, laid out down the page.
   * `dialog` is the create modal: the essential fields in a scrolling body
   * with the submit pinned to a footer. Both drive the same values and the
   * same Server Actions — the layout changes, the data does not.
   */
  layout?: "page" | "dialog";
  /** Called after a successful save, so a dialog can close itself. */
  onSaved?: (eventId: string) => void;
}

export function EventForm({
  categories,
  event = null,
  layout = "page",
  onSaved,
}: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);
  const isDialog = layout === "dialog";
  // A public event's slug is a live URL and MVP-1 keeps no redirect history.
  const slugLocked = isEdit && event !== null && event.status !== "draft";

  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<EventField, string>>
  >({});
  const [tagDraft, setTagDraft] = useState("");
  const [coverError, setCoverError] = useState<string | undefined>();
  const [coverBusy, setCoverBusy] = useState(false);

  // A ref, not state: the button's click handler runs in the same tick as the
  // submit that reads it, so a state update would not have landed yet and the
  // first click on Publish would save a draft.
  const publishIntent = useRef(false);

  const form = useForm({
    defaultValues: toFormValues(event, categories),
    onSubmit: async ({ value }) => {
      await submit(value, publishIntent.current);
    },
  });

  async function submit(values: EventFormValues, publish: boolean) {
    setFormError(null);
    setSaved(false);
    setServerFieldErrors({});

    const payload = toPayload(values);
    const result = event
      ? await updateEventAction(event.id, payload)
      : await createEventAction(payload, publish);

    if (result.status === "error") {
      setFormError(result.message ?? null);
      setServerFieldErrors(result.fieldErrors ?? {});
      return;
    }

    setSaved(true);

    if (!event && result.eventId) {
      onSaved?.(result.eventId);
      router.push(routes.dashboard.editEvent(result.eventId));
      return;
    }

    router.refresh();
  }

  function clearServerError(field: EventField) {
    setSaved(false);
    setServerFieldErrors((current) =>
      field in current ? { ...current, [field]: undefined } : current,
    );
  }

  async function uploadCover(file: File) {
    setCoverError(undefined);
    setCoverBusy(true);

    const body = new FormData();
    body.set("file", file);
    const result = await uploadEventCoverAction(body);

    setCoverBusy(false);

    if (result.status === "error") {
      setCoverError(result.fieldErrors?.file ?? result.message);
      return;
    }

    form.setFieldValue("coverImageUrl", result.url);
  }

  /**
   * A plain text input bound to a field, which most of this form is.
   *
   * Called as a function, never rendered as a JSX element. A component
   * declared inside another component is a new type on every render, so React
   * would unmount and remount each input and the field would lose focus after
   * every keystroke.
   */
  function textField({
    name,
    label,
    hint,
    placeholder,
    type = "text",
    maxLength,
    list,
  }: {
    name: keyof EventFormValues & string;
    label: string;
    hint?: string;
    placeholder?: string;
    type?: string;
    maxLength?: number;
    /** Attaches a `<datalist>`; the field stays free text. */
    list?: string;
  }) {
    const serverError = serverFieldErrors[name as EventField];

    return (
      <form.Field name={name as "title"}>
        {(field) => (
          <Field id={field.name} label={label} hint={hint} error={serverError}>
            <input
              id={field.name}
              name={field.name}
              type={type}
              maxLength={maxLength}
              list={list}
              className={fieldControlClass}
              placeholder={placeholder}
              value={field.state.value}
              aria-invalid={serverError ? true : undefined}
              aria-describedby={fieldDescribedBy({
                id: field.name,
                hasHint: Boolean(hint),
                hasError: Boolean(serverError),
              })}
              onBlur={field.handleBlur}
              onChange={(changeEvent) => {
                clearServerError(name as EventField);
                field.handleChange(changeEvent.target.value);
              }}
            />
          </Field>
        )}
      </form.Field>
    );
  }

  const basics = (
    <div className="space-y-5">
      {textField({
        name: "title",
        label: "Event title",
        placeholder: "Midnight Frequencies Vol. 9",
      })}

      {isEdit ? (
        <form.Field name="slug">
          {(field) => (
            <Field
              id={field.name}
              label="Link"
              hint={
                slugLocked
                  ? "Fixed once the event is public — changing it would break shared links."
                  : "The last part of the public address. Left blank, it follows the title."
              }
              error={serverFieldErrors.slug}
            >
              <input
                id={field.name}
                name={field.name}
                className={fieldControlClass}
                value={field.state.value}
                disabled={slugLocked}
                onBlur={field.handleBlur}
                onChange={(changeEvent) => {
                  clearServerError("slug");
                  field.handleChange(changeEvent.target.value);
                }}
              />
            </Field>
          )}
        </form.Field>
      ) : null}

      {textField({
        name: "shortDescription",
        label: "Short description",
        hint: "A one-line teaser. Appears in lists and previews.",
        placeholder: "Six hours of modular synthesis across two rooms.",
        maxLength: 280,
      })}

      <form.Field name="description">
        {(field) => (
          <Field
            id={field.name}
            label="Full description"
            error={serverFieldErrors.description}
          >
            <textarea
              id={field.name}
              name={field.name}
              rows={5}
              className={fieldControlClass}
              placeholder="Line-up, doors, age policy, anything people need to know."
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(changeEvent) => {
                clearServerError("description");
                field.handleChange(changeEvent.target.value);
              }}
            />
          </Field>
        )}
      </form.Field>

      <form.Field name="categoryId">
        {(field) => (
          <Field
            id={field.name}
            label="Category"
            error={serverFieldErrors.categoryId}
          >
            <select
              id={field.name}
              name={field.name}
              className={fieldControlClass}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(changeEvent) => {
                clearServerError("categoryId");
                field.handleChange(changeEvent.target.value);
              }}
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </form.Field>
    </div>
  );

  const dateAndTime = (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <form.Field name="startLocal">
          {(field) => (
            <Field
              id={field.name}
              label="Starts"
              error={serverFieldErrors.startAt}
            >
              <input
                id={field.name}
                name={field.name}
                type="datetime-local"
                className={fieldControlClass}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(changeEvent) => {
                  clearServerError("startAt");
                  field.handleChange(changeEvent.target.value);
                }}
              />
            </Field>
          )}
        </form.Field>

        <form.Field name="endLocal">
          {(field) => (
            <Field id={field.name} label="Ends" error={serverFieldErrors.endAt}>
              <input
                id={field.name}
                name={field.name}
                type="datetime-local"
                className={fieldControlClass}
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(changeEvent) => {
                  clearServerError("endAt");
                  field.handleChange(changeEvent.target.value);
                }}
              />
            </Field>
          )}
        </form.Field>
      </div>
    </div>
  );

  /**
   * Only on the edit page. The dialog reads the times in the browser's own
   * zone, which is right for the publisher creating the event in front of
   * them; a zone they did not choose is a control they do not need yet.
   */
  const timezoneField = (
    <div className="space-y-5">
      <form.Field name="timezone">
        {(field) => (
          <Field
            id={field.name}
            label="Time zone"
            hint="The times above are read in this zone."
            error={serverFieldErrors.timezone}
          >
            <select
              id={field.name}
              name={field.name}
              className={fieldControlClass}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(changeEvent) => {
                clearServerError("timezone");
                field.handleChange(changeEvent.target.value);
              }}
            >
              {/* The saved zone may sit outside the shortlist. */}
              {COMMON_TIME_ZONES.includes(
                field.state.value as (typeof COMMON_TIME_ZONES)[number],
              ) ? null : (
                <option value={field.state.value}>{field.state.value}</option>
              )}
              {COMMON_TIME_ZONES.map((zone) => (
                <option key={zone} value={zone}>
                  {zone}
                </option>
              ))}
            </select>
          </Field>
        )}
      </form.Field>
    </div>
  );

  const location = (
    <div className="space-y-5">
      <form.Field name="eventType">
        {(field) => (
          <Field id={field.name} label="Event type">
            <select
              id={field.name}
              name={field.name}
              className={fieldControlClass}
              value={field.state.value}
              onBlur={field.handleBlur}
              onChange={(changeEvent) =>
                field.handleChange(changeEvent.target.value as EventType)
              }
            >
              {Object.entries(EVENT_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </Field>
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.values.eventType}>
        {(eventType) => (
          <>
            {/* Shown only when it is needed, because an online event cannot be
                published without somewhere for attendees to go. */}
            {eventType === "in_person"
              ? null
              : textField({
                  name: "onlineUrl",
                  label: "Join link",
                  type: "url",
                  hint: "Where attendees go when the event starts.",
                  placeholder: "https://",
                })}

            {eventType === "online" ? null : (
              <>
                {textField({
                  name: "venueName",
                  label: "Venue name",
                  placeholder: "Warehouse 41",
                })}
                {textField({
                  name: "address",
                  label: "Address",
                  placeholder: "41 Kakheti Highway",
                })}
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                  {textField({
                    name: "city",
                    label: "City",
                    placeholder: "Tbilisi",
                  })}

                  {textField({
                    name: "countryCode",
                    label: "Country",
                    placeholder: "Georgia",
                    list: COUNTRY_LIST_ID,
                  })}
                </div>
              </>
            )}
          </>
        )}
      </form.Subscribe>
    </div>
  );

  const poster = (
    <form.Field name="coverImageUrl">
      {(field) => (
        <ImageUploader
          id="cover-image"
          label="Event image"
          hint="PNG, JPG up to 5MB"
          description="Square or wide image. Shown in lists and as the hero."
          accept="image/png,image/jpeg,image/webp"
          // A poster is the thing people look at first, so the target is a
          // large one rather than a thin band that reads as a minor field.
          className="aspect-[4/3] max-h-[28rem] py-0"
          previewUrl={field.state.value || null}
          busy={coverBusy}
          error={coverError}
          onSelect={(file) => void uploadCover(file)}
        />
      )}
    </form.Field>
  );

  const pricing = (
    <div className="space-y-5">
      <form.Field name="isFree">
        {(field) => (
          <fieldset>
            <legend className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Price
            </legend>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="isFree"
                  value="true"
                  checked={field.state.value}
                  onChange={() => field.handleChange(true)}
                />
                Free
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="isFree"
                  value="false"
                  checked={!field.state.value}
                  onChange={() => field.handleChange(false)}
                />
                Paid
              </label>
            </div>
          </fieldset>
        )}
      </form.Field>

      {/* A paid event cannot be published without a price or a ticket link,
          so the field appears the moment Paid is chosen. */}
      <form.Subscribe selector={(state) => state.values.isFree}>
        {(isFree) =>
          isFree
            ? null
            : textField({
                name: "priceInfo",
                label: "Price details",
                hint: "Free text, for example “20 GEL / 15 GEL advance”.",
                maxLength: 120,
              })
        }
      </form.Subscribe>
    </div>
  );

  const tickets = (
    <div className="space-y-5">
      <form.Field name="ticketEnabled">
        {(field) => (
          <label className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              name={field.name}
              checked={field.state.value}
              onChange={(changeEvent) =>
                field.handleChange(changeEvent.target.checked)
              }
              className="size-4 accent-primary"
            />
            Enable ticket button
          </label>
        )}
      </form.Field>

      {/* The button needs somewhere to point and something to say, so both
          follow the toggle rather than sitting there disabled. */}
      <form.Subscribe selector={(state) => state.values.ticketEnabled}>
        {(enabled) =>
          enabled ? (
            <div className="space-y-5 border-l border-border pl-5">
              {textField({
                name: "ticketCtaLabel",
                label: "Button text",
                placeholder: DEFAULT_TICKET_CTA,
                maxLength: 40,
              })}
              {textField({
                name: "ticketUrl",
                label: "Ticket purchase URL",
                type: "url",
                hint: "events-lab does not sell tickets. This sends people to your provider.",
                placeholder: "https://tickets.example.com/...",
              })}
            </div>
          ) : null
        }
      </form.Subscribe>
    </div>
  );

  const externalLink = textField({
    name: "externalUrl",
    label: "More information",
    type: "url",
    hint: "Your own page for this event, if it has one.",
    placeholder: "https://",
  });

  const tags = (
    <form.Field name="tags">
      {(field) => {
        const current = field.state.value;

        const addTag = () => {
          const value = tagDraft.trim();
          if (!value || current.length >= EVENT_TAG_LIMIT) {
            return;
          }
          if (
            !current.some((tag) => tag.toLowerCase() === value.toLowerCase())
          ) {
            field.handleChange([...current, value]);
          }
          setTagDraft("");
        };

        return (
          <Field
            id="tag-input"
            label="Tags"
            hint={`Enter or comma adds a tag. Up to ${EVENT_TAG_LIMIT}.`}
            error={serverFieldErrors.tags}
          >
            <div className="space-y-3">
              <input
                id="tag-input"
                className={fieldControlClass}
                placeholder="jazz, open-air, weekend"
                value={tagDraft}
                disabled={current.length >= EVENT_TAG_LIMIT}
                onChange={(changeEvent) => {
                  const raw = changeEvent.target.value;
                  if (raw.endsWith(",")) {
                    setTagDraft(raw.slice(0, -1));
                    queueMicrotask(addTag);
                    return;
                  }
                  setTagDraft(raw);
                }}
                onKeyDown={(keyEvent) => {
                  if (keyEvent.key === "Enter") {
                    keyEvent.preventDefault();
                    addTag();
                  }
                  if (
                    keyEvent.key === "Backspace" &&
                    tagDraft === "" &&
                    current.length > 0
                  ) {
                    field.handleChange(current.slice(0, -1));
                  }
                }}
                onBlur={addTag}
              />

              {current.length > 0 ? (
                <ul className="flex flex-wrap gap-2">
                  {current.map((tag) => (
                    <li key={tag}>
                      <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs uppercase text-muted-foreground">
                        {tag}
                        <button
                          type="button"
                          className="text-muted-foreground transition-colors hover:text-destructive"
                          onClick={() =>
                            field.handleChange(
                              current.filter((item) => item !== tag),
                            )
                          }
                        >
                          <X className="size-3" aria-hidden />
                          <span className="sr-only">Remove {tag}</span>
                        </button>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </Field>
        );
      }}
    </form.Field>
  );

  const feedback = (
    <>
      {formError ? <FormAlert message={formError} /> : null}
      {saved ? (
        <p role="status" className="text-sm text-primary">
          Saved.
        </p>
      ) : null}
    </>
  );

  const onSubmit = (submitEvent: React.FormEvent) => {
    submitEvent.preventDefault();
    void form.handleSubmit();
  };

  if (isDialog) {
    return (
      <form
        className="flex min-h-0 flex-1 flex-col"
        noValidate
        onSubmit={onSubmit}
      >
        <div className="min-h-0 flex-1 overflow-y-auto px-6 pt-6">
          <FormSection title="Basic information">{basics}</FormSection>
          <FormSection title="Date & time">{dateAndTime}</FormSection>
          <FormSection title="Location">{location}</FormSection>
          <FormSection title="Media">{poster}</FormSection>
          <FormSection title="Tickets">{tickets}</FormSection>
          <CountryOptions />
        </div>

        {/* Pinned, with a solid background so content scrolls under it. */}
        <div className="border-t border-border bg-card px-6 py-4">
          <div className="mb-3 empty:mb-0">{feedback}</div>
          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="submit"
                  className="rounded-md border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
                  disabled={isSubmitting}
                  onClick={() => {
                    publishIntent.current = false;
                  }}
                >
                  Save as draft
                </button>
                <button
                  type="submit"
                  className={formSubmitClass}
                  disabled={isSubmitting}
                  onClick={() => {
                    publishIntent.current = true;
                  }}
                >
                  {isSubmitting ? "Publishing…" : "Publish"}
                </button>
              </div>
            )}
          </form.Subscribe>
        </div>
      </form>
    );
  }

  return (
    <form className="pb-4" noValidate onSubmit={onSubmit}>
      <FormSection
        title="Basic information"
        description="What the event is, in the words someone searching would use."
      >
        {basics}
      </FormSection>

      <FormSection
        title="Date & time"
        description="Stored with a timezone, so the time reads correctly wherever it is viewed."
      >
        <div className="space-y-5">
          {dateAndTime}
          {timezoneField}
        </div>
      </FormSection>

      <FormSection title="Location">{location}</FormSection>

      <FormSection
        title="Media"
        description="A cover image is the single biggest factor in whether people click."
      >
        {poster}
      </FormSection>

      <FormSection title="Price">{pricing}</FormSection>

      <FormSection title="Tickets">{tickets}</FormSection>

      <FormSection title="Links">{externalLink}</FormSection>

      <CountryOptions />

      <FormSection title="Tags">{tags}</FormSection>

      <FormSection
        title="Publishing"
        description="Drafts stay private to you. Publishing makes the page public and shareable."
      >
        <div className="space-y-4">
          {feedback}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex flex-wrap gap-3">
                {isEdit ? null : (
                  <button
                    type="submit"
                    className={formSubmitClass}
                    disabled={isSubmitting}
                    onClick={() => {
                      publishIntent.current = true;
                    }}
                  >
                    {isSubmitting ? "Publishing…" : "Publish event"}
                  </button>
                )}

                <button
                  type="submit"
                  className={
                    isEdit
                      ? formSubmitClass
                      : "rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
                  }
                  disabled={isSubmitting}
                  onClick={() => {
                    publishIntent.current = false;
                  }}
                >
                  {isEdit
                    ? isSubmitting
                      ? "Saving…"
                      : "Save changes"
                    : "Save as draft"}
                </button>

                <Link
                  href={routes.dashboard.events()}
                  className="rounded-md px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                >
                  Cancel
                </Link>
              </div>
            )}
          </form.Subscribe>
        </div>
      </FormSection>
    </form>
  );
}

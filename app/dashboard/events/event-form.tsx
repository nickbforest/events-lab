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
import {
  EVENT_TAG_LIMIT,
  type EventDraftValues,
} from "@/features/events/contracts";
import {
  COMMON_TIME_ZONES,
  defaultTimeZone,
  instantToWallClock,
  wallClockToIso,
} from "@/lib/datetime";
import { routes } from "@/lib/routes";
import type { Category, EventType, EventWithRelations } from "@/lib/types";

const EVENT_TYPE_LABELS: Record<EventType, string> = {
  in_person: "In person",
  online: "Online",
  hybrid: "Hybrid",
};

/**
 * The form's own shape. Dates are held as `datetime-local` readings rather
 * than instants, because that is what the control produces; they are resolved
 * against the chosen zone at submit, so changing the zone reinterprets the
 * reading instead of shifting it.
 */
interface EventFormValues {
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  categoryId: string;
  eventType: EventType;
  startLocal: string;
  endLocal: string;
  timezone: string;
  venueName: string;
  address: string;
  city: string;
  countryCode: string;
  onlineUrl: string;
  isFree: boolean;
  priceInfo: string;
  ticketUrl: string;
  externalUrl: string;
  coverImageUrl: string;
  tags: string[];
}

function toFormValues(
  event: EventWithRelations | null,
  categories: readonly Category[],
): EventFormValues {
  const timezone = event?.timezone ?? defaultTimeZone();

  return {
    title: event?.title ?? "",
    slug: event?.slug ?? "",
    shortDescription: event?.short_description ?? "",
    description: event?.description ?? "",
    categoryId: event?.category_id ?? categories[0]?.id ?? "",
    eventType: event?.event_type ?? "in_person",
    startLocal: instantToWallClock(event?.start_at ?? null, timezone),
    endLocal: instantToWallClock(event?.end_at ?? null, timezone),
    timezone,
    venueName: event?.venue_name ?? "",
    address: event?.address ?? "",
    city: event?.city ?? "",
    countryCode: event?.country_code ?? "",
    onlineUrl: event?.online_url ?? "",
    isFree: event?.is_free ?? true,
    priceInfo: event?.price_info ?? "",
    ticketUrl: event?.ticket_url ?? "",
    externalUrl: event?.external_url ?? "",
    coverImageUrl: event?.cover_image_url ?? "",
    tags: event?.tags ?? [],
  };
}

function toPayload(values: EventFormValues): EventDraftValues {
  return {
    title: values.title,
    slug: values.slug,
    shortDescription: values.shortDescription,
    description: values.description,
    categoryId: values.categoryId,
    eventType: values.eventType,
    startAt: wallClockToIso(values.startLocal, values.timezone),
    endAt: wallClockToIso(values.endLocal, values.timezone),
    timezone: values.timezone,
    venueName: values.venueName,
    address: values.address,
    city: values.city,
    countryCode: values.countryCode,
    latitude: "",
    longitude: "",
    onlineUrl: values.onlineUrl,
    isFree: values.isFree,
    priceInfo: values.priceInfo,
    ticketUrl: values.ticketUrl,
    externalUrl: values.externalUrl,
    coverImageUrl: values.coverImageUrl,
    tags: values.tags,
  };
}

export interface EventFormProps {
  categories: readonly Category[];
  event?: EventWithRelations | null;
}

export function EventForm({ categories, event = null }: EventFormProps) {
  const router = useRouter();
  const isEdit = Boolean(event);
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
  // first click on Publish would save a draft instead.
  const publishIntent = useRef(false);

  const form = useForm({
    defaultValues: toFormValues(event, categories),
    onSubmit: async ({ value }) => {
      // Publishing is a different request from saving, not a different form.
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

  return (
    <form
      className="pb-4"
      noValidate
      onSubmit={(submitEvent) => {
        submitEvent.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FormSection
        title="Basic information"
        description="What the event is, in the words someone searching would use."
      >
        <div className="space-y-5">
          <form.Field name="title">
            {(field) => (
              <Field
                id={field.name}
                label="Title"
                error={serverFieldErrors.title}
              >
                <input
                  id={field.name}
                  name={field.name}
                  className={fieldControlClass}
                  placeholder="Midnight Frequencies Vol. 9"
                  value={field.state.value}
                  aria-invalid={serverFieldErrors.title ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasError: Boolean(serverFieldErrors.title),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => {
                    clearServerError("title");
                    field.handleChange(changeEvent.target.value);
                  }}
                />
              </Field>
            )}
          </form.Field>

          {isEdit && (
            <form.Field name="slug">
              {(field) => (
                <Field
                  id={field.name}
                  label="Link"
                  hint={
                    slugLocked
                      ? "Fixed once the event is public — changing it would break shared links."
                      : "The last part of the event's public address. Left blank, it follows the title."
                  }
                  error={serverFieldErrors.slug}
                >
                  <input
                    id={field.name}
                    name={field.name}
                    className={fieldControlClass}
                    value={field.state.value}
                    disabled={slugLocked}
                    aria-describedby={fieldDescribedBy({
                      id: field.name,
                      hasHint: true,
                      hasError: Boolean(serverFieldErrors.slug),
                    })}
                    onBlur={field.handleBlur}
                    onChange={(changeEvent) => {
                      clearServerError("slug");
                      field.handleChange(changeEvent.target.value);
                    }}
                  />
                </Field>
              )}
            </form.Field>
          )}

          <form.Field name="shortDescription">
            {(field) => (
              <Field
                id={field.name}
                label="Short description"
                hint="One or two lines. Shown on cards and in search results."
                error={serverFieldErrors.shortDescription}
              >
                <input
                  id={field.name}
                  name={field.name}
                  className={fieldControlClass}
                  placeholder="Six hours of modular synthesis across two rooms."
                  value={field.state.value}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(serverFieldErrors.shortDescription),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => {
                    clearServerError("shortDescription");
                    field.handleChange(changeEvent.target.value);
                  }}
                />
              </Field>
            )}
          </form.Field>

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
      </FormSection>

      <FormSection
        title="Date & time"
        description="Stored with a timezone, so the time reads correctly wherever it is viewed."
      >
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
                <Field
                  id={field.name}
                  label="Ends"
                  error={serverFieldErrors.endAt}
                >
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
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(serverFieldErrors.timezone),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => {
                    clearServerError("timezone");
                    field.handleChange(changeEvent.target.value);
                  }}
                >
                  {/* The saved zone may sit outside the shortlist. */}
                  {!COMMON_TIME_ZONES.includes(
                    field.state.value as (typeof COMMON_TIME_ZONES)[number],
                  ) && (
                    <option value={field.state.value}>
                      {field.state.value}
                    </option>
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
      </FormSection>

      <FormSection title="Location">
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
                {eventType !== "in_person" && (
                  <form.Field name="onlineUrl">
                    {(field) => (
                      <Field
                        id={field.name}
                        label="Join link"
                        hint="Where attendees go when the event starts."
                        error={serverFieldErrors.onlineUrl}
                      >
                        <input
                          id={field.name}
                          name={field.name}
                          type="url"
                          className={fieldControlClass}
                          placeholder="https://"
                          value={field.state.value}
                          aria-describedby={fieldDescribedBy({
                            id: field.name,
                            hasHint: true,
                            hasError: Boolean(serverFieldErrors.onlineUrl),
                          })}
                          onBlur={field.handleBlur}
                          onChange={(changeEvent) => {
                            clearServerError("onlineUrl");
                            field.handleChange(changeEvent.target.value);
                          }}
                        />
                      </Field>
                    )}
                  </form.Field>
                )}

                {eventType !== "online" && (
                  <>
                    <form.Field name="venueName">
                      {(field) => (
                        <Field id={field.name} label="Venue name">
                          <input
                            id={field.name}
                            name={field.name}
                            className={fieldControlClass}
                            placeholder="Warehouse 41"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(changeEvent) =>
                              field.handleChange(changeEvent.target.value)
                            }
                          />
                        </Field>
                      )}
                    </form.Field>

                    <form.Field name="address">
                      {(field) => (
                        <Field id={field.name} label="Address">
                          <input
                            id={field.name}
                            name={field.name}
                            className={fieldControlClass}
                            placeholder="41 Kakheti Highway"
                            value={field.state.value}
                            onBlur={field.handleBlur}
                            onChange={(changeEvent) =>
                              field.handleChange(changeEvent.target.value)
                            }
                          />
                        </Field>
                      )}
                    </form.Field>

                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                      <form.Field name="city">
                        {(field) => (
                          <Field
                            id={field.name}
                            label="City"
                            error={serverFieldErrors.city}
                          >
                            <input
                              id={field.name}
                              name={field.name}
                              className={fieldControlClass}
                              placeholder="Tbilisi"
                              value={field.state.value}
                              onBlur={field.handleBlur}
                              onChange={(changeEvent) => {
                                clearServerError("city");
                                field.handleChange(changeEvent.target.value);
                              }}
                            />
                          </Field>
                        )}
                      </form.Field>

                      <form.Field name="countryCode">
                        {(field) => (
                          <Field
                            id={field.name}
                            label="Country code"
                            hint="Two letters, for example GE."
                            error={serverFieldErrors.countryCode}
                          >
                            <input
                              id={field.name}
                              name={field.name}
                              maxLength={2}
                              className={fieldControlClass}
                              placeholder="GE"
                              value={field.state.value}
                              aria-describedby={fieldDescribedBy({
                                id: field.name,
                                hasHint: true,
                                hasError: Boolean(
                                  serverFieldErrors.countryCode,
                                ),
                              })}
                              onBlur={field.handleBlur}
                              onChange={(changeEvent) => {
                                clearServerError("countryCode");
                                field.handleChange(
                                  changeEvent.target.value.toUpperCase(),
                                );
                              }}
                            />
                          </Field>
                        )}
                      </form.Field>
                    </div>
                  </>
                )}
              </>
            )}
          </form.Subscribe>
        </div>
      </FormSection>

      <FormSection
        title="Cover image"
        description="A cover image is the single biggest factor in whether people click."
      >
        <form.Field name="coverImageUrl">
          {(field) => (
            <ImageUploader
              id="cover-image"
              label="Cover"
              hint="PNG, JPG or WebP up to 5MB"
              description="Shown on cards, on the event page and when the link is shared."
              accept="image/png,image/jpeg,image/webp"
              previewUrl={field.state.value || null}
              busy={coverBusy}
              error={coverError}
              onSelect={(file) => void uploadCover(file)}
            />
          )}
        </form.Field>
      </FormSection>

      <FormSection title="Tickets & links">
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

          <form.Subscribe selector={(state) => state.values.isFree}>
            {(isFree) =>
              !isFree && (
                <form.Field name="priceInfo">
                  {(field) => (
                    <Field
                      id={field.name}
                      label="Price details"
                      hint="Free text, for example “20 GEL / 15 GEL advance”."
                      error={serverFieldErrors.priceInfo}
                    >
                      <input
                        id={field.name}
                        name={field.name}
                        className={fieldControlClass}
                        value={field.state.value}
                        aria-describedby={fieldDescribedBy({
                          id: field.name,
                          hasHint: true,
                          hasError: Boolean(serverFieldErrors.priceInfo),
                        })}
                        onBlur={field.handleBlur}
                        onChange={(changeEvent) => {
                          clearServerError("priceInfo");
                          field.handleChange(changeEvent.target.value);
                        }}
                      />
                    </Field>
                  )}
                </form.Field>
              )
            }
          </form.Subscribe>

          <form.Field name="ticketUrl">
            {(field) => (
              <Field
                id={field.name}
                label="Ticket link"
                hint="events-lab does not sell tickets. This sends people to your provider."
                error={serverFieldErrors.ticketUrl}
              >
                <input
                  id={field.name}
                  name={field.name}
                  type="url"
                  className={fieldControlClass}
                  placeholder="https://"
                  value={field.state.value}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(serverFieldErrors.ticketUrl),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => {
                    clearServerError("ticketUrl");
                    field.handleChange(changeEvent.target.value);
                  }}
                />
              </Field>
            )}
          </form.Field>

          <form.Field name="externalUrl">
            {(field) => (
              <Field
                id={field.name}
                label="More information"
                hint="Your own page for this event, if it has one."
                error={serverFieldErrors.externalUrl}
              >
                <input
                  id={field.name}
                  name={field.name}
                  type="url"
                  className={fieldControlClass}
                  placeholder="https://"
                  value={field.state.value}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(serverFieldErrors.externalUrl),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(changeEvent) => {
                    clearServerError("externalUrl");
                    field.handleChange(changeEvent.target.value);
                  }}
                />
              </Field>
            )}
          </form.Field>
        </div>
      </FormSection>

      <FormSection title="Tags">
        <form.Field name="tags">
          {(field) => {
            const tags = field.state.value;

            const addTag = () => {
              const value = tagDraft.trim();
              if (!value || tags.length >= EVENT_TAG_LIMIT) {
                return;
              }
              if (
                !tags.some((tag) => tag.toLowerCase() === value.toLowerCase())
              ) {
                field.handleChange([...tags, value]);
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
                    disabled={tags.length >= EVENT_TAG_LIMIT}
                    aria-describedby={fieldDescribedBy({
                      id: "tag-input",
                      hasHint: true,
                      hasError: Boolean(serverFieldErrors.tags),
                    })}
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
                        tags.length > 0
                      ) {
                        field.handleChange(tags.slice(0, -1));
                      }
                    }}
                    onBlur={addTag}
                  />

                  {tags.length > 0 && (
                    <ul className="flex flex-wrap gap-2">
                      {tags.map((tag) => (
                        <li key={tag}>
                          <span className="flex items-center gap-1.5 rounded-full border border-border px-3 py-1 font-mono text-xs uppercase text-muted-foreground">
                            {tag}
                            <button
                              type="button"
                              className="text-muted-foreground transition-colors hover:text-destructive"
                              onClick={() =>
                                field.handleChange(
                                  tags.filter((item) => item !== tag),
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
                  )}
                </div>
              </Field>
            );
          }}
        </form.Field>
      </FormSection>

      <FormSection
        title="Publishing"
        description="Drafts stay private to you. Publishing makes the page public and shareable."
      >
        <div className="space-y-4">
          {formError ? <FormAlert message={formError} /> : null}
          {saved ? (
            <p role="status" className="text-sm text-primary">
              Saved.
            </p>
          ) : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <div className="flex flex-wrap gap-3">
                {!isEdit && (
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

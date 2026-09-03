import Link from "next/link";
import { Info } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";

/**
 * Visual scaffold of the event creation form.
 *
 * Sections follow ui-rules.md §7. Nothing submits yet — the Server Action,
 * Zod schema and React Hook Form wiring arrive with the Supabase phase.
 */

const inputClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

function Section({
  step,
  title,
  description,
  children,
}: {
  step: number;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="mb-5">
        <div className="mb-1 font-mono text-xs uppercase tracking-widest text-primary">
          Step {step}
        </div>
        <h2 className="font-display text-xl font-extrabold uppercase tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
      >
        {label}
        {required && (
          <span className="ml-1 text-primary" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function NewEventPage() {
  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            Create
          </div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl">
            New event
          </h1>
        </div>

        <div
          role="note"
          className="mb-10 flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>
            Layout preview — this form does not save yet. Validation and
            publishing arrive with the database phase.
          </span>
        </div>

        <form className="space-y-0">
          <Section
            step={1}
            title="Basic information"
            description="What the event is, in the words someone searching would use."
          >
            <Field label="Title" htmlFor="title" required>
              <input
                id="title"
                name="title"
                className={inputClass}
                placeholder="Midnight Frequencies Vol. 9"
              />
            </Field>

            <Field
              label="Short description"
              htmlFor="short_description"
              hint="One or two lines. Shown on cards and in search results."
            >
              <input
                id="short_description"
                name="short_description"
                className={inputClass}
                placeholder="Six hours of modular synthesis across two rooms."
              />
            </Field>

            <Field label="Full description" htmlFor="description">
              <textarea
                id="description"
                name="description"
                rows={5}
                className={inputClass}
                placeholder="Line-up, doors, age policy, anything people need to know."
              />
            </Field>

            <Field label="Category" htmlFor="category" required>
              <select id="category" name="category" className={inputClass} defaultValue="">
                <option value="" disabled>
                  Choose a category
                </option>
                {CATEGORIES.map((category) => (
                  <option key={category.id} value={category.slug}>
                    {category.label}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          <Section
            step={2}
            title="Date & time"
            description="Stored with a timezone, so the time reads correctly wherever it is viewed."
          >
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="Starts" htmlFor="start_at" required>
                <input
                  id="start_at"
                  name="start_at"
                  type="datetime-local"
                  className={inputClass}
                />
              </Field>
              <Field label="Ends" htmlFor="end_at">
                <input
                  id="end_at"
                  name="end_at"
                  type="datetime-local"
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Timezone" htmlFor="timezone" required>
              <select id="timezone" name="timezone" className={inputClass} defaultValue="Asia/Tbilisi">
                <option value="Asia/Tbilisi">Asia/Tbilisi</option>
                <option value="Europe/Berlin">Europe/Berlin</option>
                <option value="Europe/London">Europe/London</option>
                <option value="America/New_York">America/New_York</option>
              </select>
            </Field>
          </Section>

          <Section step={3} title="Location">
            <Field label="Event type" htmlFor="event_type" required>
              <select id="event_type" name="event_type" className={inputClass} defaultValue="in_person">
                <option value="in_person">In person</option>
                <option value="online">Online</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </Field>

            <Field label="Venue name" htmlFor="venue_name">
              <input id="venue_name" name="venue_name" className={inputClass} placeholder="Warehouse 41" />
            </Field>

            <Field label="Address" htmlFor="address">
              <input id="address" name="address" className={inputClass} placeholder="41 Kakheti Highway" />
            </Field>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              <Field label="City" htmlFor="city">
                <input id="city" name="city" className={inputClass} placeholder="Tbilisi" />
              </Field>
              <Field label="Country" htmlFor="country">
                <input id="country" name="country" className={inputClass} placeholder="Georgia" />
              </Field>
            </div>
          </Section>

          <Section
            step={4}
            title="Media"
            description="A cover image is the single biggest factor in whether people click."
          >
            <div className="grid place-items-center rounded-lg border border-dashed border-border px-6 py-12 text-center">
              <p className="mb-1 text-sm">Drop a cover image here</p>
              <p className="font-mono text-xs uppercase text-muted-foreground">
                JPG or PNG / 16:9 recommended / max 5MB
              </p>
            </div>
          </Section>

          <Section step={5} title="Tickets & links">
            <fieldset>
              <legend className="mb-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Price
              </legend>
              <div className="flex gap-6">
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="is_free" value="true" defaultChecked />
                  Free
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <input type="radio" name="is_free" value="false" />
                  Paid
                </label>
              </div>
            </fieldset>

            <Field
              label="Ticket URL"
              htmlFor="ticket_url"
              hint="events-lab does not sell tickets. This sends people to your provider."
            >
              <input
                id="ticket_url"
                name="ticket_url"
                type="url"
                className={inputClass}
                placeholder="https://"
              />
            </Field>
          </Section>

          <Section step={6} title="Tags">
            <Field
              label="Tags"
              htmlFor="tags"
              hint="Comma separated. Helps people find the event through search."
            >
              <input
                id="tags"
                name="tags"
                className={inputClass}
                placeholder="jazz, open-air, weekend"
              />
            </Field>
          </Section>

          <Section
            step={7}
            title="Publishing"
            description="Drafts stay private to you. Publishing makes the page public and shareable."
          >
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Publish event
              </button>
              <button
                type="button"
                className="rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
              >
                Save as draft
              </button>
              <Link
                href="/dashboard/events"
                className="rounded-md px-6 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                Cancel
              </Link>
            </div>
          </Section>
        </form>
      </div>
    </div>
  );
}

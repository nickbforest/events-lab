import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Field, fieldControlClass } from "@/components/forms/field";
import { FormSection } from "@/components/forms/form-section";
import { ImageUploader } from "@/components/forms/image-uploader";
import { getCurrentProfile } from "@/features/profiles/queries";
import { PUBLISHER_TYPE_LABELS } from "@/lib/format";
import type { PublisherType } from "@/lib/types";

/**
 * The links a publisher can surface on their public page.
 *
 * `website` is a first-class profile column; the rest live in the
 * `social_links` JSON map, which is why they are keyed rather than typed as
 * individual fields — adding a platform must not require a migration.
 */
const SOCIAL_FIELDS = [
  { key: "website", label: "Website", placeholder: "https://..." },
  { key: "twitter", label: "Twitter / X", placeholder: "https://twitter.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
  { key: "soundcloud", label: "SoundCloud", placeholder: "https://soundcloud.com/..." },
  { key: "spotify", label: "Spotify", placeholder: "https://open.spotify.com/..." },
  { key: "apple_music", label: "Apple Music", placeholder: "https://music.apple.com/..." },
] as const;

export default async function DashboardProfilePage() {
  const profile = await getCurrentProfile();

  const socialValue = (key: (typeof SOCIAL_FIELDS)[number]["key"]) =>
    key === "website"
      ? (profile.website_url ?? "")
      : (profile.social_links[key] ?? "");

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          kicker="Public page"
          title="Profile"
          description={`events-lab/${profile.username}`}
          actions={
            <Link
              href={`/u/${profile.username}`}
              className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white/5"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              View page
            </Link>
          }
        />

        <form className="pb-4">
          <FormSection title="Identity">
            <div className="space-y-5">
              <Field
                id="display_name"
                label="Display name"
                hint="The name shown publicly as the host of your events (e.g. your name or organization)."
              >
                <input
                  id="display_name"
                  name="display_name"
                  aria-describedby="display_name-hint"
                  className={fieldControlClass}
                  defaultValue={profile.display_name}
                />
              </Field>

              <Field
                id="username"
                label="Username"
                hint="This is your public URL. Changing it breaks existing links."
              >
                <input
                  id="username"
                  name="username"
                  aria-describedby="username-hint"
                  className={fieldControlClass}
                  defaultValue={profile.username}
                />
              </Field>

              <Field id="publisher_type" label="Publisher type">
                <select
                  id="publisher_type"
                  name="publisher_type"
                  className={fieldControlClass}
                  defaultValue={profile.publisher_type}
                >
                  {Object.entries(PUBLISHER_TYPE_LABELS).map(([value, label]) => (
                    <option key={value} value={value as PublisherType}>
                      {label}
                    </option>
                  ))}
                </select>
              </Field>

              <Field
                id="bio"
                label="About"
                hint="Tell visitors who you are. Up to 500 characters."
              >
                <textarea
                  id="bio"
                  name="bio"
                  rows={5}
                  maxLength={500}
                  aria-describedby="bio-hint"
                  className={fieldControlClass}
                  defaultValue={profile.bio ?? ""}
                />
              </Field>
            </div>
          </FormSection>

          <FormSection title="Media">
            <ImageUploader id="cover_url" label="Cover image" />
          </FormSection>

          <FormSection title="Social links">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
              {SOCIAL_FIELDS.map(({ key, label, placeholder }) => (
                <Field key={key} id={`social_${key}`} label={label}>
                  <input
                    id={`social_${key}`}
                    name={`social_${key}`}
                    type="url"
                    inputMode="url"
                    placeholder={placeholder}
                    className={fieldControlClass}
                    defaultValue={socialValue(key)}
                  />
                </Field>
              ))}
            </div>
          </FormSection>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
            {/* Saving needs the Supabase write path — see Architecture.md §24. */}
            <p className="font-mono text-xs text-muted-foreground">
              Layout preview — saving is not wired up yet.
            </p>
            <button
              type="button"
              disabled
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { FormAlert } from "@/components/auth/auth-card";
import {
  Field,
  fieldControlClass,
  fieldDescribedBy,
} from "@/components/forms/field";
import { FormSection } from "@/components/forms/form-section";
import {
  type ProfileField,
  updateProfileAction,
} from "@/features/profiles/actions";
import {
  profileUpdateSchema,
  publisherTypeSchema,
  SOCIAL_LINK_KEYS,
  type SocialLinkKey,
} from "@/features/profiles/contracts";
import { publisherTypeLabel } from "@/lib/format";
import { firstErrorMessage } from "@/lib/forms";
import type { Profile, PublisherType } from "@/lib/types";

import { ProfileMediaField } from "./profile-media-field";

const SOCIAL_LABELS: Record<
  SocialLinkKey,
  { label: string; placeholder: string }
> = {
  twitter: { label: "Twitter / X", placeholder: "https://twitter.com/..." },
  instagram: {
    label: "Instagram",
    placeholder: "https://instagram.com/...",
  },
  facebook: { label: "Facebook", placeholder: "https://facebook.com/..." },
  youtube: { label: "YouTube", placeholder: "https://youtube.com/..." },
  soundcloud: {
    label: "SoundCloud",
    placeholder: "https://soundcloud.com/...",
  },
  spotify: { label: "Spotify", placeholder: "https://open.spotify.com/..." },
  apple_music: {
    label: "Apple Music",
    placeholder: "https://music.apple.com/...",
  },
};

export function ProfileForm({ profile }: { profile: Profile }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<ProfileField, string>>
  >({});

  const form = useForm({
    defaultValues: {
      displayName: profile.display_name,
      publisherType: profile.publisher_type,
      bio: profile.bio ?? "",
      city: profile.city ?? "",
      countryCode: profile.country_code ?? "",
      websiteUrl: profile.website_url ?? "",
      socialLinks: Object.fromEntries(
        SOCIAL_LINK_KEYS.map((key) => [key, profile.social_links[key] ?? ""]),
      ) as Record<SocialLinkKey, string>,
    },
    validators: { onChange: profileUpdateSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setSaved(false);
      setServerFieldErrors({});

      const result = await updateProfileAction(value);

      if (result.status === "error") {
        setFormError(result.message ?? null);
        setServerFieldErrors(result.fieldErrors ?? {});
        return;
      }

      setSaved(true);
    },
  });

  function clearServerError(field: ProfileField) {
    setSaved(false);
    setServerFieldErrors((current) =>
      field in current ? { ...current, [field]: undefined } : current,
    );
  }

  return (
    <form
      className="pb-4"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <FormSection title="Identity">
        <div className="space-y-5">
          <form.Field name="displayName">
            {(field) => {
              const error =
                serverFieldErrors.displayName ??
                (field.state.meta.isTouched
                  ? firstErrorMessage(field.state.meta.errors)
                  : undefined);

              return (
                <Field
                  id={field.name}
                  label="Display name"
                  hint="The name shown publicly as the host of your events (e.g. your name or organization)."
                  error={error}
                >
                  <input
                    id={field.name}
                    name={field.name}
                    className={fieldControlClass}
                    value={field.state.value}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={fieldDescribedBy({
                      id: field.name,
                      hasHint: true,
                      hasError: Boolean(error),
                    })}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError("displayName");
                      field.handleChange(event.target.value);
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>

          {/* Read-only on purpose: the username is the public URL and MVP-1
              keeps no redirect history, so renaming would break shared links. */}
          <Field
            id="username"
            label="Username"
            hint="Your public address. This cannot be changed."
          >
            <input
              id="username"
              name="username"
              readOnly
              disabled
              value={profile.username}
              aria-describedby="username-hint"
              className={`${fieldControlClass} cursor-not-allowed opacity-60`}
            />
          </Field>

          <form.Field name="publisherType">
            {(field) => (
              <Field
                id={field.name}
                label="Publisher type"
                hint="Shown above your name on your public page."
              >
                <select
                  id={field.name}
                  name={field.name}
                  className={fieldControlClass}
                  value={field.state.value}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("publisherType");
                    field.handleChange(event.target.value as PublisherType);
                  }}
                >
                  {publisherTypeSchema.options.map((type) => (
                    <option key={type} value={type}>
                      {publisherTypeLabel(type)}
                    </option>
                  ))}
                </select>
              </Field>
            )}
          </form.Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <form.Field name="city">
              {(field) => {
                const error =
                  serverFieldErrors.city ??
                  (field.state.meta.isTouched
                    ? firstErrorMessage(field.state.meta.errors)
                    : undefined);

                return (
                  <Field id={field.name} label="City" error={error}>
                    <input
                      id={field.name}
                      name={field.name}
                      className={fieldControlClass}
                      placeholder="Tbilisi"
                      value={field.state.value}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={fieldDescribedBy({
                        id: field.name,
                        hasError: Boolean(error),
                      })}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearServerError("city");
                        field.handleChange(event.target.value);
                      }}
                    />
                  </Field>
                );
              }}
            </form.Field>

            <form.Field name="countryCode">
              {(field) => {
                const error =
                  serverFieldErrors.countryCode ??
                  (field.state.meta.isTouched
                    ? firstErrorMessage(field.state.meta.errors)
                    : undefined);

                return (
                  <Field
                    id={field.name}
                    label="Country"
                    hint="Two-letter code, e.g. GE."
                    error={error}
                  >
                    <input
                      id={field.name}
                      name={field.name}
                      maxLength={2}
                      autoCapitalize="characters"
                      className={fieldControlClass}
                      placeholder="GE"
                      value={field.state.value}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={fieldDescribedBy({
                        id: field.name,
                        hasHint: true,
                        hasError: Boolean(error),
                      })}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearServerError("countryCode");
                        field.handleChange(event.target.value);
                      }}
                    />
                  </Field>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="bio">
            {(field) => {
              const error =
                serverFieldErrors.bio ??
                (field.state.meta.isTouched
                  ? firstErrorMessage(field.state.meta.errors)
                  : undefined);

              return (
                <Field
                  id={field.name}
                  label="About"
                  hint="Tell visitors who you are. Up to 500 characters."
                  error={error}
                >
                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={5}
                    maxLength={500}
                    className={fieldControlClass}
                    value={field.state.value}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={fieldDescribedBy({
                      id: field.name,
                      hasHint: true,
                      hasError: Boolean(error),
                    })}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError("bio");
                      field.handleChange(event.target.value);
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>
        </div>
      </FormSection>

      <FormSection title="Media">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-[10rem_1fr]">
          <ProfileMediaField
            kind="avatar"
            label="Avatar"
            description="Square. Saved as soon as you choose it."
            currentUrl={profile.avatar_url}
            className="aspect-square px-3 py-6"
          />
          <ProfileMediaField
            kind="cover"
            label="Cover image"
            description="Wide banner across the top of your public page. Saved as soon as you choose it."
            currentUrl={profile.cover_url}
            className="aspect-[3/1] min-h-40"
          />
        </div>
      </FormSection>

      <FormSection title="Social links">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <form.Field name="websiteUrl">
            {(field) => {
              const error =
                serverFieldErrors.websiteUrl ??
                (field.state.meta.isTouched
                  ? firstErrorMessage(field.state.meta.errors)
                  : undefined);

              return (
                <Field id={field.name} label="Website" error={error}>
                  <input
                    id={field.name}
                    name={field.name}
                    type="url"
                    inputMode="url"
                    placeholder="https://..."
                    className={fieldControlClass}
                    value={field.state.value}
                    aria-invalid={error ? true : undefined}
                    aria-describedby={fieldDescribedBy({
                      id: field.name,
                      hasError: Boolean(error),
                    })}
                    onBlur={field.handleBlur}
                    onChange={(event) => {
                      clearServerError("websiteUrl");
                      field.handleChange(event.target.value);
                    }}
                  />
                </Field>
              );
            }}
          </form.Field>

          {SOCIAL_LINK_KEYS.map((key) => (
            <form.Field key={key} name={`socialLinks.${key}`}>
              {(field) => {
                const error = field.state.meta.isTouched
                  ? firstErrorMessage(field.state.meta.errors)
                  : undefined;

                return (
                  <Field
                    id={`social_${key}`}
                    label={SOCIAL_LABELS[key].label}
                    error={error}
                  >
                    <input
                      id={`social_${key}`}
                      name={field.name}
                      type="url"
                      inputMode="url"
                      placeholder={SOCIAL_LABELS[key].placeholder}
                      className={fieldControlClass}
                      value={field.state.value}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={fieldDescribedBy({
                        id: `social_${key}`,
                        hasError: Boolean(error),
                      })}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        clearServerError("socialLinks");
                        field.handleChange(event.target.value);
                      }}
                    />
                  </Field>
                );
              }}
            </form.Field>
          ))}
        </div>
      </FormSection>

      {formError && (
        <div className="mb-5">
          <FormAlert message={formError} />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 border-t border-border pt-6">
        {/* Advisory, not an error — announced politely rather than as an alert. */}
        <p aria-live="polite" className="font-mono text-xs text-primary">
          {saved ? "Profile saved." : ""}
        </p>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? "Saving…" : "Save profile"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

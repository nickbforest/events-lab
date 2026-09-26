"use client";

import { useState } from "react";

import { ImageUploader } from "@/components/forms/image-uploader";
import { updateProfileMediaAction } from "@/features/profiles/actions";
import {
  PROFILE_MEDIA_MIME_TYPES,
  type ProfileMediaKind,
  profileMediaSchema,
} from "@/features/profiles/contracts";
import { firstErrorMessage } from "@/lib/forms";

export interface ProfileMediaFieldProps {
  kind: ProfileMediaKind;
  label: string;
  description: string;
  currentUrl: string | null;
  className?: string;
}

/**
 * Uploads on selection rather than on "Save profile": an image is its own
 * write, so a failed upload never blocks or discards unsaved text edits.
 */
export function ProfileMediaField({
  kind,
  label,
  description,
  currentUrl,
  className,
}: ProfileMediaFieldProps) {
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [saved, setSaved] = useState(false);

  async function upload(file: File) {
    setError(undefined);
    setSaved(false);

    const parsed = profileMediaSchema.safeParse({ kind, file });
    if (!parsed.success) {
      setError(firstErrorMessage(parsed.error.issues));
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setBusy(true);

    const formData = new FormData();
    formData.set("kind", kind);
    formData.set("file", file);

    try {
      const result = await updateProfileMediaAction(formData);
      if (result.status === "error") {
        setError(
          result.fieldErrors?.file ??
            result.message ??
            "The image could not be uploaded.",
        );
      } else {
        setSaved(true);
      }
    } catch {
      setError("The image could not be uploaded. Please try again.");
    } finally {
      // The revalidated page has delivered the stored URL by now, so the
      // local preview can give way to it.
      setBusy(false);
      setLocalPreview(null);
      URL.revokeObjectURL(preview);
    }
  }

  return (
    <div>
      <ImageUploader
        id={`${kind}_upload`}
        label={label}
        hint="PNG, JPG or WebP up to 5MB"
        accept={PROFILE_MEDIA_MIME_TYPES.join(",")}
        description={description}
        className={className}
        previewUrl={localPreview ?? currentUrl}
        busy={busy}
        error={error}
        onSelect={upload}
      />
      <p
        aria-live="polite"
        className="mt-1.5 font-mono text-xs text-primary empty:mt-0"
      >
        {saved ? `${label} updated.` : ""}
      </p>
    </div>
  );
}

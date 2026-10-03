"use client";

import { useState } from "react";

import { ImageUploader } from "@/components/forms/image-uploader";
import {
  removeProfileMediaAction,
  updateProfileMediaAction,
} from "@/features/profiles/actions";
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
  const [pending, setPending] = useState<"upload" | "remove" | null>(null);
  const [error, setError] = useState<string | undefined>();
  const [notice, setNotice] = useState("");

  async function upload(file: File) {
    setError(undefined);
    setNotice("");

    const parsed = profileMediaSchema.safeParse({ kind, file });
    if (!parsed.success) {
      setError(firstErrorMessage(parsed.error.issues));
      return;
    }

    const preview = URL.createObjectURL(file);
    setLocalPreview(preview);
    setPending("upload");

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
        setNotice(`${label} updated.`);
      }
    } catch {
      setError("The image could not be uploaded. Please try again.");
    } finally {
      // The revalidated page has delivered the stored URL by now, so the
      // local preview can give way to it.
      setPending(null);
      setLocalPreview(null);
      URL.revokeObjectURL(preview);
    }
  }

  async function remove() {
    setError(undefined);
    setNotice("");
    setPending("remove");

    try {
      const result = await removeProfileMediaAction(kind);
      if (result.status === "error") {
        setError(result.message ?? "The image could not be removed.");
      } else {
        setNotice(`${label} removed.`);
      }
    } catch {
      setError("The image could not be removed. Please try again.");
    } finally {
      setPending(null);
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
        busy={pending !== null}
        busyLabel={pending === "remove" ? "Removing…" : "Uploading…"}
        error={error}
        onSelect={upload}
        onRemove={() => void remove()}
      />
      <p aria-live="polite" className="mt-1.5 text-xs text-primary empty:mt-0">
        {notice}
      </p>
    </div>
  );
}

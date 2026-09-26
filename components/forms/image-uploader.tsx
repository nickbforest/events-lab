"use client";

import { LoaderCircle, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/format";

export interface ImageUploaderProps {
  id: string;
  label: string;
  /** Format and size limit, stated inside the frame. */
  hint?: string;
  /** What the image is used for, stated below the frame. */
  description?: string;
  accept?: string;
  /** Constrains the frame — a square target should not stretch the form. */
  className?: string;
  /** The image currently stored, or a local preview of one being uploaded. */
  previewUrl?: string | null;
  onSelect?: (file: File) => void;
  busy?: boolean;
  /** What the frame says while `busy`. */
  busyLabel?: string;
  error?: string;
  /** Offered under the frame while an image is set; omit to hide it. */
  onRemove?: () => void;
}

/**
 * Cover/avatar upload target.
 *
 * The dashed frame is a `<label>` wrapping a real file input rather than a
 * styled div, so it is keyboard-reachable and announced as a file control.
 * With a `previewUrl` the frame shows the current image and the same control
 * replaces it.
 *
 * While `busy`, a spinner and an indeterminate bar run along the bottom edge.
 * The uploads go through Server Actions, which report no byte progress, so the
 * bar shows that work is happening rather than inventing a percentage.
 */
export function ImageUploader({
  id,
  label,
  hint = "PNG, JPG up to 5MB",
  description,
  accept = "image/png,image/jpeg",
  className,
  previewUrl,
  onSelect,
  busy = false,
  busyLabel = "Uploading…",
  error,
  onRemove,
}: ImageUploaderProps) {
  const message = error ?? description;

  return (
    <div>
      <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <label
        htmlFor={id}
        aria-busy={busy || undefined}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-md border border-dashed border-border px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-white/[0.02] focus-within:border-primary",
          busy && "cursor-wait",
          className,
        )}
      >
        {previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt=""
              fill
              sizes="(min-width: 768px) 48rem, 100vw"
              // Local object URLs cannot go through the image optimizer.
              unoptimized={previewUrl.startsWith("blob:")}
              className={cn("object-cover", busy && "opacity-50")}
            />
            <span aria-hidden className="absolute inset-0 bg-black/40" />
          </>
        ) : null}
        {busy ? (
          <LoaderCircle
            className="relative size-5 animate-spin text-primary"
            aria-hidden
          />
        ) : (
          <Upload
            className="relative size-5 text-muted-foreground"
            aria-hidden
          />
        )}
        <span
          className={cn(
            "relative font-mono text-xs uppercase tracking-widest",
            busy ? "text-primary" : "text-muted-foreground",
          )}
        >
          {busy
            ? busyLabel
            : previewUrl
              ? "Click to replace"
              : "Click to upload"}
        </span>
        <span className="relative font-mono text-xs text-muted-foreground">
          {hint}
        </span>
        {busy ? (
          <span
            role="progressbar"
            aria-label={busyLabel}
            className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/10"
          >
            <span className="animate-upload-progress block h-full w-2/5 bg-primary" />
          </span>
        ) : null}
        <input
          id={id}
          type="file"
          accept={accept}
          disabled={busy}
          aria-invalid={error ? true : undefined}
          aria-describedby={message ? `${id}-message` : undefined}
          className="sr-only"
          onChange={(event) => {
            const file = event.target.files?.[0];
            // Reset so choosing the same file again still fires a change.
            event.target.value = "";
            if (file) {
              onSelect?.(file);
            }
          }}
        />
      </label>
      {onRemove && previewUrl && !busy ? (
        <button
          type="button"
          onClick={onRemove}
          className="mt-1.5 font-mono text-xs uppercase tracking-widest text-muted-foreground transition-colors hover:text-destructive"
        >
          Remove
        </button>
      ) : null}
      {message ? (
        <p
          id={`${id}-message`}
          className={cn(
            "mt-1.5 font-mono text-xs leading-relaxed",
            error ? "text-destructive" : "text-muted-foreground",
          )}
        >
          {message}
        </p>
      ) : null}
    </div>
  );
}

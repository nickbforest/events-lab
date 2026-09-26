"use client";

import { LoaderCircle, Pencil, Trash2, Upload } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/format";

export interface ImageUploaderProps {
  id: string;
  label: string;
  /** Format and size limit, stated inside the empty frame. */
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
  /** Adds a remove button over a set image; omit to offer replace only. */
  onRemove?: () => void;
}

/** A dark chip over the image, so the icon reads on light and dark photos. */
const imageActionClass =
  "flex size-9 items-center justify-center rounded-md bg-black/60 text-white backdrop-blur-sm transition-colors hover:bg-black/80";

/**
 * Cover/avatar upload target.
 *
 * Empty, the dashed frame is a `<label>` wrapping a real file input rather
 * than a styled div, so it is keyboard-reachable and announced as a file
 * control. With an image, the frame shows the image alone, and two icon
 * buttons in its corner offer the only two things left to do with it:
 * replace it (the same file input, now wrapped by the pencil) or remove it.
 *
 * While `busy`, a spinner and an indeterminate bar run over the frame. The
 * uploads go through Server Actions, which report no byte progress, so the
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

  const fileInput = (
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
  );

  const progress = busy ? (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
      <LoaderCircle className="size-5 animate-spin text-primary" aria-hidden />
      <span className="font-mono text-xs uppercase tracking-widest text-primary">
        {busyLabel}
      </span>
      <span
        role="progressbar"
        aria-label={busyLabel}
        className="absolute inset-x-0 bottom-0 h-1 overflow-hidden bg-white/10"
      >
        <span className="animate-upload-progress block h-full w-2/5 bg-primary" />
      </span>
    </div>
  ) : null;

  return (
    <div>
      <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>

      {previewUrl ? (
        <div
          aria-busy={busy || undefined}
          className={cn(
            "relative overflow-hidden rounded-md border border-border bg-secondary",
            className,
          )}
        >
          <Image
            src={previewUrl}
            alt=""
            fill
            sizes="(min-width: 768px) 48rem, 100vw"
            // Local object URLs cannot go through the image optimizer.
            unoptimized={previewUrl.startsWith("blob:")}
            className={cn("object-cover", busy && "opacity-50")}
          />
          {progress}
          {/* The input stays mounted while busy so it keeps its disabled
              state; only the buttons around it are hidden. */}
          <div
            className={cn(
              "absolute top-2 right-2 flex gap-2",
              busy && "sr-only",
            )}
          >
            <label
              htmlFor={id}
              title={`Replace ${label.toLowerCase()}`}
              className={cn(
                imageActionClass,
                "cursor-pointer focus-within:ring-2 focus-within:ring-ring",
              )}
            >
              <Pencil className="size-4" aria-hidden />
              <span className="sr-only">Replace {label.toLowerCase()}</span>
              {fileInput}
            </label>
            {onRemove && !busy ? (
              <button
                type="button"
                onClick={onRemove}
                title={`Remove ${label.toLowerCase()}`}
                className={cn(imageActionClass, "hover:text-destructive")}
              >
                <Trash2 className="size-4" aria-hidden />
                <span className="sr-only">Remove {label.toLowerCase()}</span>
              </button>
            ) : null}
          </div>
        </div>
      ) : (
        <label
          htmlFor={id}
          aria-busy={busy || undefined}
          className={cn(
            "relative flex cursor-pointer flex-col items-center justify-center gap-3 overflow-hidden rounded-md border border-dashed border-border px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-white/[0.02] focus-within:border-primary",
            busy && "cursor-wait",
            className,
          )}
        >
          <Upload className="size-5 text-muted-foreground" aria-hidden />
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Click to upload
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            {hint}
          </span>
          {progress}
          {fileInput}
        </label>
      )}

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

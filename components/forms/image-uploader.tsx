"use client";

import { Upload } from "lucide-react";
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
  error?: string;
}

/**
 * Cover/avatar upload target.
 *
 * The dashed frame is a `<label>` wrapping a real file input rather than a
 * styled div, so it is keyboard-reachable and announced as a file control.
 * With a `previewUrl` the frame shows the current image and the same control
 * replaces it.
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
  error,
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
        <Upload className="relative size-5 text-muted-foreground" aria-hidden />
        <span className="relative font-mono text-xs uppercase tracking-widest text-muted-foreground">
          {busy
            ? "Uploading…"
            : previewUrl
              ? "Click to replace"
              : "Click to upload"}
        </span>
        <span className="relative font-mono text-xs text-muted-foreground">
          {hint}
        </span>
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

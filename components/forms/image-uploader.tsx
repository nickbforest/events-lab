import { Upload } from "lucide-react";

/**
 * Cover/avatar upload target.
 *
 * The dashed frame is a `<label>` wrapping a real file input rather than a
 * styled div, so it is keyboard-reachable and announced as a file control.
 * Storage is Supabase Storage once the write path exists; nothing is uploaded
 * from here yet.
 */
export function ImageUploader({
  id,
  label,
  hint = "PNG, JPG up to 5MB",
  accept = "image/png,image/jpeg",
}: {
  id: string;
  label: string;
  hint?: string;
  accept?: string;
}) {
  return (
    <div>
      <span className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-md border border-dashed border-border px-6 py-12 text-center transition-colors hover:border-primary/50 hover:bg-white/[0.02] focus-within:border-primary"
      >
        <Upload className="size-5 text-muted-foreground" aria-hidden />
        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
          Click to upload
        </span>
        <span className="font-mono text-xs text-muted-foreground">{hint}</span>
        <input id={id} type="file" accept={accept} className="sr-only" />
      </label>
    </div>
  );
}

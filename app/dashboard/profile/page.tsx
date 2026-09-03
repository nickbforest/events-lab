import Link from "next/link";
import { ExternalLink, Info } from "lucide-react";
import { getCurrentProfile } from "@/features/profiles/queries";
import { publisherTypeLabel } from "@/lib/format";

const inputClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

export default async function DashboardProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-2xl">
        <div className="mb-8">
          <div className="mb-2 font-mono text-xs uppercase tracking-widest text-primary">
            Settings
          </div>
          <h1 className="font-display text-3xl font-extrabold uppercase tracking-tighter md:text-4xl">
            Public profile
          </h1>
        </div>

        <div
          role="note"
          className="mb-10 flex items-start gap-3 rounded-lg border border-border bg-card/40 p-4 text-sm text-muted-foreground"
        >
          <Info className="mt-0.5 size-4 shrink-0 text-primary" aria-hidden />
          <span>Layout preview — editing is not wired up yet.</span>
        </div>

        <div className="mb-8 flex items-center justify-between rounded-lg border border-border bg-card/30 p-5">
          <div>
            <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Your public page
            </div>
            <div className="font-mono text-sm">events-lab/{profile.username}</div>
          </div>
          <Link
            href={`/u/${profile.username}`}
            className="flex items-center gap-2 font-mono text-xs uppercase text-primary hover:underline"
          >
            <ExternalLink className="size-3" aria-hidden />
            View
          </Link>
        </div>

        <form className="space-y-5">
          <div>
            <label
              htmlFor="display_name"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Display name
            </label>
            <input
              id="display_name"
              className={inputClass}
              defaultValue={profile.display_name}
            />
          </div>

          <div>
            <label
              htmlFor="username"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Username
            </label>
            <input id="username" className={inputClass} defaultValue={profile.username} />
            <p className="mt-1.5 text-xs text-muted-foreground">
              This is your public URL. Changing it breaks existing links.
            </p>
          </div>

          <div>
            <label
              htmlFor="publisher_type"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Publisher type
            </label>
            <input
              id="publisher_type"
              className={inputClass}
              defaultValue={publisherTypeLabel(profile.publisher_type)}
            />
          </div>

          <div>
            <label
              htmlFor="bio"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Bio
            </label>
            <textarea
              id="bio"
              rows={4}
              className={inputClass}
              defaultValue={profile.bio ?? ""}
            />
          </div>

          <button
            type="button"
            className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Save changes
          </button>
        </form>
      </div>
    </div>
  );
}

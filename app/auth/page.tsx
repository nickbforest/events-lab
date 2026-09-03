import Link from "next/link";
import { Info } from "lucide-react";

const inputClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

export default function AuthPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <Link
          href="/"
          className="mb-10 block text-center font-display text-2xl font-extrabold uppercase tracking-tighter"
        >
          events<span className="text-primary">-</span>lab
        </Link>

        <div className="rounded-lg border border-border bg-card/40 p-8">
          <h1 className="mb-1 font-display text-2xl font-extrabold uppercase tracking-tight">
            Create your page
          </h1>
          <p className="mb-8 text-sm text-muted-foreground">
            Free to publish. Your events get a shareable public URL.
          </p>

          <form className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                Email
              </label>
              <input id="email" type="email" className={inputClass} placeholder="you@example.com" />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                Password
              </label>
              <input id="password" type="password" className={inputClass} placeholder="••••••••" />
            </div>

            <button
              type="button"
              className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
            >
              Create account
            </button>
          </form>

          <div className="my-6 flex items-center gap-4">
            <span className="h-px flex-1 bg-border" />
            <span className="font-mono text-xs uppercase text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            className="w-full rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
          >
            Continue with Google
          </button>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <button type="button" className="text-primary hover:underline">
              Log in
            </button>
          </p>
        </div>

        <div
          role="note"
          className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-card/30 p-4 text-xs text-muted-foreground"
        >
          <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
          <span>
            Layout preview — authentication is not connected. Head to the{" "}
            <Link href="/dashboard" className="text-primary hover:underline">
              dashboard
            </Link>{" "}
            to see the signed-in screens.
          </span>
        </div>
      </div>
    </main>
  );
}

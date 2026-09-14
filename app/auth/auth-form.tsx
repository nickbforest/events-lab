"use client";

import { Info } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { login, register } from "@/lib/local-auth";

type AuthMode = "login" | "signup";

const inputClass =
  "w-full rounded-md border border-border bg-card px-4 py-2.5 text-sm focus:border-primary focus:outline-none";

const COPY: Record<
  AuthMode,
  { heading: string; subheading: string; submitLabel: string }
> = {
  signup: {
    heading: "Create your page",
    subheading: "Free to publish. Your events get a shareable public URL.",
    submitLabel: "Create account",
  },
  login: {
    heading: "Log in",
    subheading: "Welcome back. Log in to manage your events.",
    submitLabel: "Log in",
  },
};

export function AuthForm() {
  const router = useRouter();
  // The mode lives in the URL so entry points can deep-link straight to the
  // form they promise: header "Log in" -> ?mode=login, "Get started" ->
  // ?mode=signup. Deriving it (rather than seeding state once) means the
  // client-side navigation between those two links actually switches the form.
  const searchParams = useSearchParams();
  const mode: AuthMode =
    searchParams.get("mode") === "login" ? "login" : "signup";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  // The error is tagged with the mode that produced it, so a failed login
  // message is not still on screen after switching to the signup form.
  const [errorFor, setErrorFor] = useState<{
    mode: AuthMode;
    message: string;
  } | null>(null);
  const error = errorFor?.mode === mode ? errorFor.message : null;
  const { heading, subheading, submitLabel } = COPY[mode];

  function handleSubmit() {
    setErrorFor(null);

    const result =
      mode === "login"
        ? login({ email, password })
        : register({ name, email, password });

    if (!result.ok) {
      setErrorFor({ mode, message: result.error });
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="w-full max-w-sm">
      <Link
        href="/"
        className="mb-10 block text-center font-display text-2xl font-extrabold uppercase tracking-tighter"
      >
        events<span className="text-primary">-</span>lab
      </Link>

      <div className="rounded-lg border border-border bg-card/40 p-8">
        <h1 className="mb-1 font-display text-2xl font-extrabold uppercase tracking-tight">
          {heading}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{subheading}</p>

        <form
          className="space-y-5"
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
        >
          {mode === "signup" && (
            <div>
              <label
                htmlFor="name"
                className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
              >
                Name
              </label>
              <input
                id="name"
                type="text"
                className={inputClass}
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              className={inputClass}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              className={inputClass}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            {submitLabel}
          </button>
        </form>

        <div className="my-6 flex items-center gap-4">
          <span className="h-px flex-1 bg-border" />
          <span className="font-mono text-xs uppercase text-muted-foreground">
            or
          </span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <button
          type="button"
          className="w-full rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5"
        >
          Continue with Google
        </button>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {mode === "signup" ? (
            <>
              Already have an account?{" "}
              <Link
                href="/auth?mode=login"
                replace
                className="text-primary hover:underline"
              >
                Log in
              </Link>
            </>
          ) : (
            <>
              Don&rsquo;t have an account?{" "}
              <Link
                href="/auth?mode=signup"
                replace
                className="text-primary hover:underline"
              >
                Create account
              </Link>
            </>
          )}
        </p>
      </div>

      <div
        role="note"
        className="mt-6 flex items-start gap-3 rounded-lg border border-border bg-card/30 p-4 text-xs text-muted-foreground"
      >
        <Info className="mt-0.5 size-3.5 shrink-0 text-primary" aria-hidden />
        <span>
          Temporary local authentication — accounts are stored in this browser
          only, not on a server. Google sign-in is a layout preview and is not
          connected.
        </span>
      </div>
    </div>
  );
}

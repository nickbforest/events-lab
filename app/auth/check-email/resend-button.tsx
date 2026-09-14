"use client";

import { useState } from "react";

import { resendConfirmationAction } from "@/features/auth/actions";

export function ResendButton({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">(
    "idle",
  );
  const [message, setMessage] = useState<string | null>(null);

  async function resend() {
    setState("sending");
    setMessage(null);

    const result = await resendConfirmationAction({ email });

    if (result.status === "success") {
      setState("sent");
      return;
    }

    setState("error");
    setMessage(result.message ?? "Could not resend the link.");
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={state === "sending" || state === "sent"}
        onClick={() => void resend()}
        className="w-full rounded-md border border-border px-6 py-3 text-sm font-medium transition-colors hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "sending" ? "Sending…" : "Resend the link"}
      </button>

      <p aria-live="polite" className="font-mono text-xs text-muted-foreground">
        {state === "sent" ? "Sent. Check your inbox again." : ""}
      </p>

      {message && (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}

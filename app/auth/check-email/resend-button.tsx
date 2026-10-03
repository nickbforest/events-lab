"use client";

import { useState } from "react";

import { buttonClass } from "@/components/ui/button";
import { resendConfirmationAction } from "@/features/auth/actions";

export interface ResendButtonProps {
  email: string;
}

export function ResendButton({ email }: ResendButtonProps) {
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
        className={buttonClass({ variant: "secondary", className: "w-full" })}
      >
        {state === "sending" ? "Sending…" : "Resend the link"}
      </button>

      <p aria-live="polite" className="text-xs text-muted-foreground">
        {state === "sent" ? "Sent. Check your inbox again." : ""}
      </p>

      {message ? (
        <p role="alert" className="text-sm text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}

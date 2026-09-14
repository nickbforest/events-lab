"use client";

import { useForm } from "@tanstack/react-form";
import Link from "next/link";
import { useState } from "react";

import {
  AuthCard,
  authSubmitClass,
  FormAlert,
} from "@/components/auth/auth-card";
import {
  Field,
  fieldControlClass,
  fieldDescribedBy,
} from "@/components/forms/field";
import { requestPasswordResetAction } from "@/features/auth/actions";
import { passwordResetRequestSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";

export function ForgotPasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: passwordResetRequestSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      const result = await requestPasswordResetAction(value);

      if (result.status === "success") {
        setSent(true);
        return;
      }

      setFormError(result.message ?? "Could not send the reset link.");
    },
  });

  if (sent) {
    return (
      <AuthCard
        heading="Check your email"
        subheading="If that address has an account, a password reset link is on its way."
        footer={
          <Link
            href="/auth?mode=login"
            className="text-primary hover:underline"
          >
            Back to log in
          </Link>
        }
      >
        <p className="font-mono text-xs leading-relaxed text-muted-foreground">
          The link expires after a short while. If it does not arrive, check
          your spam folder before requesting another.
        </p>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      heading="Reset password"
      subheading="Enter your email and we will send you a link to set a new password."
      footer={
        <Link href="/auth?mode=login" className="text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="email">
          {(field) => {
            const error = field.state.meta.isTouched
              ? firstErrorMessage(field.state.meta.errors)
              : undefined;

            return (
              <Field id={field.name} label="Email" error={error}>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
                  className={fieldControlClass}
                  placeholder="you@example.com"
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasError: Boolean(error),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              </Field>
            );
          }}
        </form.Field>

        {formError && <FormAlert message={formError} />}

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className={authSubmitClass}
            >
              {isSubmitting ? "Sending…" : "Send reset link"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

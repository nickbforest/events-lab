"use client";

import { useForm } from "@tanstack/react-form";
import { useState } from "react";

import { FormAlert } from "@/components/auth/auth-card";
import {
  Field,
  fieldControlClass,
  fieldDescribedBy,
  formSubmitClass,
} from "@/components/forms/field";
import { changeEmailAction } from "@/features/auth/actions";
import { changeEmailSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";

export function EmailForm({
  currentEmail,
  pendingEmail,
}: {
  currentEmail: string;
  pendingEmail: string | null;
}) {
  const [formError, setFormError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | undefined>();
  const [sentTo, setSentTo] = useState<string | null>(null);

  const form = useForm({
    defaultValues: { email: "" },
    validators: { onChange: changeEmailSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setServerError(undefined);
      setSentTo(null);

      const result = await changeEmailAction(value);

      if (result.status === "error") {
        setFormError(result.message ?? null);
        setServerError(result.fieldErrors?.email);
        return;
      }

      setSentTo(value.email.trim().toLowerCase());
      form.reset();
    },
  });

  const awaiting = sentTo ?? pendingEmail;

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <Field
        id="current_email"
        label="Current email"
        hint="Where sign-in and account emails go."
      >
        <input
          id="current_email"
          readOnly
          disabled
          value={currentEmail}
          aria-describedby="current_email-hint"
          className={`${fieldControlClass} cursor-not-allowed opacity-60`}
        />
      </Field>

      <form.Field name="email">
        {(field) => {
          const error =
            serverError ??
            (field.state.meta.isTouched
              ? firstErrorMessage(field.state.meta.errors)
              : undefined);

          return (
            <Field
              id="new_email"
              label="New email"
              hint="Nothing changes until you confirm from the email we send."
              error={error}
            >
              <input
                id="new_email"
                name={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={fieldControlClass}
                value={field.state.value}
                aria-invalid={error ? true : undefined}
                aria-describedby={fieldDescribedBy({
                  id: "new_email",
                  hasHint: true,
                  hasError: Boolean(error),
                })}
                onBlur={field.handleBlur}
                onChange={(event) => {
                  setServerError(undefined);
                  field.handleChange(event.target.value);
                }}
              />
            </Field>
          );
        }}
      </form.Field>

      {formError && <FormAlert message={formError} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Not "email changed": it has not changed until the link is used. */}
        <p
          aria-live="polite"
          className="max-w-md font-mono text-xs leading-relaxed text-primary"
        >
          {awaiting
            ? `Confirmation pending for ${awaiting}. Open the link we sent there. If a link also arrives at your current address, confirm that one too.`
            : ""}
        </p>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className={formSubmitClass}
            >
              {isSubmitting ? "Sending…" : "Change email"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

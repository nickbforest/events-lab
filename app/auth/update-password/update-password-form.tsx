"use client";

import { useForm } from "@tanstack/react-form";
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
import { updatePasswordAction } from "@/features/auth/actions";
import { updatePasswordSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";

export function UpdatePasswordForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [serverFieldError, setServerFieldError] = useState<
    string | undefined
  >();

  const form = useForm({
    defaultValues: { password: "" },
    validators: { onChange: updatePasswordSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setServerFieldError(undefined);

      const result = await updatePasswordAction(value);

      if (result?.status === "error") {
        setFormError(result.message ?? null);
        setServerFieldError(result.fieldErrors?.password);
      }
    },
  });

  return (
    <AuthCard
      heading="Set a new password"
      subheading="Choose a password you have not used on events-lab before."
    >
      <form
        className="space-y-5"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <form.Field name="password">
          {(field) => {
            const error =
              serverFieldError ??
              (field.state.meta.isTouched
                ? firstErrorMessage(field.state.meta.errors)
                : undefined);

            return (
              <Field
                id={field.name}
                label="New password"
                hint="At least 8 characters."
                error={error}
              >
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="new-password"
                  className={fieldControlClass}
                  placeholder="••••••••"
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(error),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    setServerFieldError(undefined);
                    field.handleChange(event.target.value);
                  }}
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
              {isSubmitting ? "Saving…" : "Save password"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

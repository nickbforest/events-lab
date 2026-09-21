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
import { changePasswordAction } from "@/features/auth/actions";
import { changePasswordSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";

type PasswordField = "currentPassword" | "newPassword" | "confirmPassword";

const FIELDS: {
  name: PasswordField;
  label: string;
  autoComplete: string;
  hint?: string;
}[] = [
  {
    name: "currentPassword",
    label: "Current password",
    autoComplete: "current-password",
  },
  {
    name: "newPassword",
    label: "New password",
    autoComplete: "new-password",
    hint: "At least 8 characters.",
  },
  {
    name: "confirmPassword",
    label: "Confirm new password",
    autoComplete: "new-password",
  },
];

export function PasswordForm({ email }: { email: string }) {
  const [formError, setFormError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<PasswordField, string>>
  >({});

  const form = useForm({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validators: { onChange: changePasswordSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setServerFieldErrors({});

      // On success the action signs out and redirects to log in.
      const result = await changePasswordAction(value);

      if (result?.status === "error") {
        setFormError(result.message ?? null);
        setServerFieldErrors(result.fieldErrors ?? {});
      }
    },
  });

  return (
    <form
      className="space-y-5"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {/* Lets password managers file the new password under the right account. */}
      <input
        type="email"
        name="username"
        autoComplete="username"
        value={email}
        readOnly
        hidden
      />

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        {FIELDS.map(({ name, label, autoComplete, hint }) => (
          <form.Field key={name} name={name}>
            {(field) => {
              const error =
                serverFieldErrors[name] ??
                (field.state.meta.isTouched
                  ? firstErrorMessage(field.state.meta.errors)
                  : undefined);

              return (
                <div
                  className={
                    name === "currentPassword" ? "sm:col-span-2" : undefined
                  }
                >
                  <Field id={name} label={label} hint={hint} error={error}>
                    <input
                      id={name}
                      name={name}
                      type="password"
                      autoComplete={autoComplete}
                      placeholder="••••••••"
                      className={fieldControlClass}
                      value={field.state.value}
                      aria-invalid={error ? true : undefined}
                      aria-describedby={fieldDescribedBy({
                        id: name,
                        hasHint: Boolean(hint),
                        hasError: Boolean(error),
                      })}
                      onBlur={field.handleBlur}
                      onChange={(event) => {
                        setServerFieldErrors((current) =>
                          name in current
                            ? { ...current, [name]: undefined }
                            : current,
                        );
                        field.handleChange(event.target.value);
                      }}
                    />
                  </Field>
                </div>
              );
            }}
          </form.Field>
        ))}
      </div>

      {formError && <FormAlert message={formError} />}

      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="font-mono text-xs text-muted-foreground">
          You will be signed out everywhere and asked to log in again.
        </p>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <button
              type="submit"
              disabled={isSubmitting}
              className={formSubmitClass}
            >
              {isSubmitting ? "Changing…" : "Change password"}
            </button>
          )}
        </form.Subscribe>
      </div>
    </form>
  );
}

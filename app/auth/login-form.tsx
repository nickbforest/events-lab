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
import { signInAction } from "@/features/auth/actions";
import { signInSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";

type SignInField = "email" | "password";

export function LoginForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<SignInField, string>>
  >({});

  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onChange: signInSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setServerFieldErrors({});

      const result = await signInAction(value);

      if (result?.status === "error") {
        setFormError(result.message ?? null);
        setServerFieldErrors(result.fieldErrors ?? {});
      }
    },
  });

  function clearServerError(field: SignInField) {
    setServerFieldErrors((current) =>
      field in current ? { ...current, [field]: undefined } : current,
    );
  }

  return (
    <AuthCard
      heading="Log in"
      subheading="Welcome back. Log in to manage your events."
      footer={
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
            const error =
              serverFieldErrors.email ??
              (field.state.meta.isTouched
                ? firstErrorMessage(field.state.meta.errors)
                : undefined);

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
                  onChange={(event) => {
                    clearServerError("email");
                    field.handleChange(event.target.value);
                  }}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const error =
              serverFieldErrors.password ??
              (field.state.meta.isTouched
                ? firstErrorMessage(field.state.meta.errors)
                : undefined);

            return (
              <Field id={field.name} label="Password" error={error}>
                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  autoComplete="current-password"
                  className={fieldControlClass}
                  placeholder="••••••••"
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasError: Boolean(error),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("password");
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
              {isSubmitting ? "Logging in…" : "Log in"}
            </button>
          )}
        </form.Subscribe>

        <p className="text-center">
          <Link
            href="/auth/forgot-password"
            className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            Forgot your password?
          </Link>
        </p>
      </form>
    </AuthCard>
  );
}

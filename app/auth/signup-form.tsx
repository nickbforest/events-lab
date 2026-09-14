"use client";

import { useForm, useStore } from "@tanstack/react-form";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

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
import { signUpAction } from "@/features/auth/actions";
import { signUpSchema, usernameSchema } from "@/features/auth/contracts";
import { firstErrorMessage } from "@/lib/forms";
import { useDebouncedValue } from "@/lib/hooks/use-debounced-value";
import { apiClient } from "@/lib/http/client";
import { queryKeys } from "@/lib/query/keys";

type SignUpField = "displayName" | "username" | "email" | "password";

const availabilityResponseSchema = z.object({ available: z.boolean() });

function useUsernameAvailability(rawUsername: string) {
  const debounced = useDebouncedValue(rawUsername.trim(), 400);
  const parsed = usernameSchema.safeParse(debounced);
  const username = parsed.success ? parsed.data : "";

  return useQuery({
    queryKey: queryKeys.profiles.usernameAvailability(username),
    enabled: username.length > 0,
    queryFn: async () => {
      const { data } = await apiClient.get("/auth/username-available", {
        params: { username },
      });
      return availabilityResponseSchema.parse(data);
    },
  });
}

export function SignupForm() {
  const [formError, setFormError] = useState<string | null>(null);
  const [serverFieldErrors, setServerFieldErrors] = useState<
    Partial<Record<SignUpField, string>>
  >({});

  const form = useForm({
    defaultValues: {
      displayName: "",
      username: "",
      email: "",
      password: "",
    },
    validators: { onChange: signUpSchema },
    onSubmit: async ({ value }) => {
      setFormError(null);
      setServerFieldErrors({});

      // On success the action redirects, so control never returns here.
      const result = await signUpAction(value);

      if (result?.status === "error") {
        setFormError(result.message ?? null);
        setServerFieldErrors(result.fieldErrors ?? {});
      }
    },
  });

  const usernameValue = useStore(form.store, (state) => state.values.username);
  const availability = useUsernameAvailability(usernameValue);

  function clearServerError(field: SignUpField) {
    setServerFieldErrors((current) =>
      field in current ? { ...current, [field]: undefined } : current,
    );
  }

  return (
    <AuthCard
      heading="Create your page"
      subheading="Free to publish. Your events get a shareable public URL."
      footer={
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
        <form.Field name="displayName">
          {(field) => {
            const error =
              serverFieldErrors.displayName ??
              (field.state.meta.isTouched
                ? firstErrorMessage(field.state.meta.errors)
                : undefined);

            return (
              <Field id={field.name} label="Name" error={error}>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="name"
                  className={fieldControlClass}
                  placeholder="Your name"
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasError: Boolean(error),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("displayName");
                    field.handleChange(event.target.value);
                  }}
                />
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="username">
          {(field) => {
            const validationError =
              serverFieldErrors.username ??
              (field.state.meta.isTouched
                ? firstErrorMessage(field.state.meta.errors)
                : undefined);

            const takenError =
              !validationError && availability.data?.available === false
                ? "That username is already taken."
                : undefined;

            const error = validationError ?? takenError;
            const isAvailable = !error && availability.data?.available === true;

            return (
              <Field
                id={field.name}
                label="Username"
                hint="This becomes your public address: events-lab/your-name"
                error={error}
              >
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  className={fieldControlClass}
                  placeholder="your-name"
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={fieldDescribedBy({
                    id: field.name,
                    hasHint: true,
                    hasError: Boolean(error),
                  })}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    clearServerError("username");
                    field.handleChange(event.target.value);
                  }}
                />
                {/* Availability is advisory until submit, so it is announced
                    politely rather than as an error. */}
                <p
                  aria-live="polite"
                  className="mt-1.5 font-mono text-xs text-primary empty:mt-0"
                >
                  {isAvailable ? "Available" : ""}
                </p>
              </Field>
            );
          }}
        </form.Field>

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
              <Field
                id={field.name}
                label="Password"
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
              {isSubmitting ? "Creating account…" : "Create account"}
            </button>
          )}
        </form.Subscribe>
      </form>
    </AuthCard>
  );
}

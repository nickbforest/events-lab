import type { ReactNode } from "react";

import { WordmarkLink } from "@/components/layout/wordmark-link";
import { routes } from "@/lib/routes";

export const authSubmitClass =
  "w-full rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60";

export interface AuthCardProps {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** The shell every auth screen sits in: wordmark, bordered card, title block. */
export function AuthCard({
  heading,
  subheading,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-sm">
      <WordmarkLink
        href={routes.home()}
        className="mb-10 block text-center text-2xl"
      />

      <div className="rounded-lg border border-border bg-card/40 p-8">
        <h1 className="mb-1 font-display text-2xl font-extrabold uppercase tracking-tight">
          {heading}
        </h1>
        <p className="mb-8 text-sm text-muted-foreground">{subheading}</p>

        {children}

        {footer ? (
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {footer}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export interface FormAlertProps {
  message: string;
}

/** Form-level failure — the kind that belongs to the submission, not a field. */
export function FormAlert({ message }: FormAlertProps) {
  return (
    <p role="alert" className="text-sm text-destructive">
      {message}
    </p>
  );
}

import type { ReactNode } from "react";

import { WordmarkLink } from "@/components/layout/wordmark-link";
import { buttonClass } from "@/components/ui/button";
import { routes } from "@/lib/routes";

export const authSubmitClass = buttonClass({ className: "w-full" });

export interface AuthCardProps {
  heading: string;
  subheading: string;
  children: ReactNode;
  footer?: ReactNode;
}

/** The shell every auth screen sits in: wordmark, raised card, title block. */
export function AuthCard({
  heading,
  subheading,
  children,
  footer,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-sm animate-reveal">
      <WordmarkLink
        href={routes.home()}
        className="mb-8 flex justify-center text-3xl"
      />

      <div className="surface rounded-2xl relative overflow-hidden p-7 sm:p-8">
        <div
          aria-hidden
          className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
        />
        <h1 className="mb-1.5 font-display text-2xl font-semibold tracking-tight">
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
    <p
      role="alert"
      className="rounded-xl border border-destructive/30 bg-destructive/10 px-3.5 py-2.5 text-sm text-destructive"
    >
      {message}
    </p>
  );
}

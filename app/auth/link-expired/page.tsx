import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { routes } from "@/lib/routes";

export const metadata: Metadata = { title: "Link expired" };

export default function LinkExpiredPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <AuthCard
        heading="Link expired"
        subheading="That link has already been used or is no longer valid."
        footer={
          <Link
            href={routes.auth.signIn()}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to log in
          </Link>
        }
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Auth links are single-use and short-lived. Request a new one and open
          it from the same device where possible.
        </p>
      </AuthCard>
    </main>
  );
}

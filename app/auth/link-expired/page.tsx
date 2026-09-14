import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";

export const metadata: Metadata = { title: "Link expired" };

export default function LinkExpiredPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <AuthCard
        heading="Link expired"
        subheading="That link has already been used or is no longer valid."
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
          Auth links are single-use and short-lived. Request a new one and open
          it from the same device where possible.
        </p>
      </AuthCard>
    </main>
  );
}

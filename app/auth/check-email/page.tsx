import type { Metadata } from "next";
import Link from "next/link";

import { AuthCard } from "@/components/auth/auth-card";
import { emailSchema } from "@/features/auth/contracts";

import { ResendButton } from "./resend-button";

export const metadata: Metadata = { title: "Confirm your email" };

export default async function CheckEmailPage({
  searchParams,
}: PageProps<"/auth/check-email">) {
  const { email } = await searchParams;
  const parsed = emailSchema.safeParse(email);

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <AuthCard
        heading="Confirm your email"
        subheading={
          parsed.success
            ? `We sent a confirmation link to ${parsed.data}.`
            : "We sent you a confirmation link."
        }
        footer={
          <Link
            href="/auth?mode=login"
            className="text-primary hover:underline"
          >
            Back to log in
          </Link>
        }
      >
        <div className="space-y-6">
          <p className="font-mono text-xs leading-relaxed text-muted-foreground">
            Open the link to finish setting up your page. It expires after a
            short while, and the inbox may file it as spam.
          </p>

          {parsed.success && <ResendButton email={parsed.data} />}
        </div>
      </AuthCard>
    </main>
  );
}

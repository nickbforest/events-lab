import type { Metadata } from "next";

import { verifySession } from "@/features/auth/queries";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: "Set a new password" };

/**
 * Reaching this page means the recovery link already established a session.
 * Verifying it here keeps the form from being a way to change the password of
 * whoever happens to be signed in from a stale tab.
 */
export default async function UpdatePasswordPage() {
  await verifySession();

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <UpdatePasswordForm />
    </main>
  );
}

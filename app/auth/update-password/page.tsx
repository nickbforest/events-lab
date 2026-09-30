import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { verifySession } from "@/features/auth/queries";
import { readRecoveryMarker } from "@/features/auth/recovery-marker";
import { routes } from "@/lib/routes";

import { UpdatePasswordForm } from "./update-password-form";

export const metadata: Metadata = { title: "Set a new password" };

/**
 * Only for a session that came from a password-reset link. An ordinary
 * signed-in session is sent to Settings, which asks for the current password
 * first. This redirect is for the person's benefit; `updatePasswordAction`
 * enforces the same rule through the auth service.
 */
export default async function UpdatePasswordPage() {
  const user = await verifySession();

  if ((await readRecoveryMarker()) !== user.id) {
    redirect(routes.dashboard.settings());
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      <UpdatePasswordForm />
    </main>
  );
}

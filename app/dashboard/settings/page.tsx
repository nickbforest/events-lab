import { FormSection } from "@/components/forms/form-section";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { verifySession } from "@/features/auth/queries";
import { ApplicationError } from "@/lib/errors";

import { EmailForm } from "./email-form";
import { PasswordForm } from "./password-form";

export default async function DashboardSettingsPage() {
  const user = await verifySession();

  if (!user.email) {
    // Every account is created with email and password; one without an email
    // is broken and should not be shown a settings form it cannot use.
    throw new ApplicationError("NOT_FOUND", "Signed-in account has no email.");
  }

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          kicker="Account"
          title="Settings"
          description="Sign-in details. Only you can see these."
        />

        <FormSection title="Email">
          <EmailForm
            currentEmail={user.email}
            pendingEmail={user.pendingEmail}
          />
        </FormSection>

        <FormSection title="Password">
          <PasswordForm email={user.email} />
        </FormSection>
      </div>
    </div>
  );
}

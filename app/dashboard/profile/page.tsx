import { ExternalLink } from "lucide-react";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { buttonClass } from "@/components/ui/button";
import { getCurrentProfile } from "@/features/profiles/queries";
import { routes } from "@/lib/routes";
import { ProfileForm } from "./profile-form";

export default async function DashboardProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          kicker="Public page"
          title="Profile"
          description={routes.publisher(profile.username)}
          actions={
            <a
              href={routes.publisherPreview(profile.username)}
              target="_blank"
              rel="noopener noreferrer"
              className={buttonClass({
                variant: "secondary",
                size: "sm",
                className: "w-full sm:w-auto",
              })}
            >
              <ExternalLink className="size-3.5" aria-hidden />
              View page
              <span className="sr-only">, opens in a new tab</span>
            </a>
          }
        />

        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}

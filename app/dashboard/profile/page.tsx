import { ExternalLink } from "lucide-react";
import Link from "next/link";

import { DashboardHeader } from "@/components/layout/dashboard-header";
import { getCurrentProfile } from "@/features/profiles/queries";

import { ProfileForm } from "./profile-form";

export default async function DashboardProfilePage() {
  const profile = await getCurrentProfile();

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-3xl">
        <DashboardHeader
          kicker="Public page"
          title="Profile"
          description={`events-lab/${profile.username}`}
          actions={
            <Link
              href={`/u/${profile.username}`}
              className="flex items-center gap-2 rounded-md border border-border px-5 py-2.5 font-mono text-xs uppercase tracking-widest transition-colors hover:bg-white/5"
            >
              <ExternalLink className="size-3.5" aria-hidden />
              View page
            </Link>
          }
        />

        <ProfileForm profile={profile} />
      </div>
    </div>
  );
}

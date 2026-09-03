import { DashboardShell } from "@/components/layout/dashboard-shell";
import { getCurrentProfile } from "@/features/profiles/queries";

export default async function DashboardLayout({
  children,
}: LayoutProps<"/dashboard">) {
  const profile = await getCurrentProfile();

  return <DashboardShell username={profile.username}>{children}</DashboardShell>;
}

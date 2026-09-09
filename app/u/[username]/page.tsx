import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarPlus, Globe, MapPin } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EventCard } from "@/components/events/event-card";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getPastEventsByUsername,
  getUpcomingEventsByUsername,
} from "@/features/events/queries";
import {
  getProfileByUsername,
  listProfileUsernames,
} from "@/features/profiles/queries";
import { publisherTypeLabel } from "@/lib/format";

export async function generateStaticParams() {
  const usernames = await listProfileUsernames();
  return usernames.map((username) => ({ username }));
}

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) return { title: "Publisher not found" };

  return {
    title: profile.display_name,
    description:
      profile.bio ?? `Upcoming events from ${profile.display_name} on events-lab.`,
    openGraph: {
      title: profile.display_name,
      description: profile.bio ?? undefined,
      type: "profile",
    },
  };
}

export default async function PublisherPage({
  params,
}: PageProps<"/u/[username]">) {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) notFound();

  const [upcoming, past] = await Promise.all([
    getUpcomingEventsByUsername(username),
    getPastEventsByUsername(username),
  ]);

  const location = [profile.city, profile.country_code]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-start">
            <div
              aria-hidden
              className="grid size-20 shrink-0 place-items-center rounded-lg bg-secondary font-display text-3xl font-extrabold"
            >
              {profile.display_name[0]?.toUpperCase()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">
                {publisherTypeLabel(profile.publisher_type)}
              </div>
              <h1 className="mb-2 font-display text-4xl font-extrabold uppercase tracking-tighter md:text-5xl">
                {profile.display_name}
              </h1>
              <p className="mb-4 font-mono text-sm text-muted-foreground">
                @{profile.username}
              </p>

              {profile.bio && (
                <p className="mb-5 max-w-2xl leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-5 font-mono text-xs uppercase text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="size-3.5" aria-hidden />
                    {location}
                  </span>
                )}
                {profile.website_url && (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Globe className="size-3.5" aria-hidden />
                    Website ↗
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Upcoming — {upcoming.length}
            </h2>

            {upcoming.length > 0 ? (
              <div className="space-y-4">
                {upcoming.map((event) => (
                  <EventCard key={event.id} event={event} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<CalendarPlus className="size-8" aria-hidden />}
                title="No upcoming events"
                description={`${profile.display_name} has nothing scheduled right now. Check back soon, or browse what else is happening.`}
                action={{ href: "/discover", label: "Browse all events" }}
              />
            )}

            {past.length > 0 && (
              <>
                <h2 className="mb-6 mt-16 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Past — {past.length}
                </h2>
                <div className="space-y-4 opacity-60">
                  {past.map((event) => (
                    <EventCard key={event.id} event={event} />
                  ))}
                </div>
              </>
            )}

            <div className="mt-16 rounded-lg border border-border bg-card/30 p-8 text-center">
              <p className="mb-4 text-sm text-muted-foreground">
                Publishing your own events?
              </p>
              <Link
                href="/auth?mode=signup"
                className="font-display text-lg font-extrabold uppercase tracking-tight text-primary hover:underline"
              >
                Claim your events-lab page →
              </Link>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

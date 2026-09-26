import { CalendarPlus, Globe, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { EventCard } from "@/components/events/event-card";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import {
  getPastEventsByUsername,
  getUpcomingEventsByUsername,
} from "@/features/events/queries";
import { previewFlagSchema } from "@/features/profiles/contracts";
import { getProfileByUsername } from "@/features/profiles/queries";
import { publisherTypeLabel } from "@/lib/format";
import { PREVIEW_PARAM, routes } from "@/lib/routes";

// No generateStaticParams: profiles are created continuously by signup, so
// eagerly enumerating every username at build time would mean a new account
// has no public page until the next deploy, and every build (CI included)
// would require live database connectivity just to compile. Pages render
// dynamically per request instead.

export async function generateMetadata({
  params,
}: PageProps<"/publishers/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return { title: "Publisher not found" };
  }

  return {
    title: profile.display_name,
    description:
      profile.bio ??
      `Upcoming events from ${profile.display_name} on events-lab.`,
    openGraph: {
      title: profile.display_name,
      description: profile.bio ?? undefined,
      type: "profile",
      images: profile.cover_url ?? profile.avatar_url ?? undefined,
    },
  };
}

export default async function PublisherPage({
  params,
  searchParams,
}: PageProps<"/publishers/[username]">) {
  const [{ username }, query] = await Promise.all([params, searchParams]);

  // A publisher previewing their own page wants to see the page, not the
  // signed-out marketing header above it.
  const isPreview = previewFlagSchema.parse(query[PREVIEW_PARAM]);

  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const [upcoming, past] = await Promise.all([
    getUpcomingEventsByUsername(username),
    getPastEventsByUsername(username),
  ]);

  const location = [profile.city, profile.country_code]
    .filter(Boolean)
    .join(", ");

  return (
    <>
      {isPreview ? null : <SiteHeader />}

      <main className="flex-1">
        {profile.cover_url ? (
          <div className="relative aspect-[3/1] max-h-80 w-full border-b border-border bg-secondary">
            <Image
              src={profile.cover_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        ) : null}

        <section className="border-b border-border px-6 py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              sizes="80px"
              className="size-20 text-3xl font-extrabold"
            />

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

              {profile.bio ? (
                <p className="mb-5 max-w-2xl leading-relaxed text-muted-foreground">
                  {profile.bio}
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-5 font-mono text-xs uppercase text-muted-foreground">
                {location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="size-3.5" aria-hidden />
                    {location}
                  </span>
                )}
                {profile.website_url ? (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 transition-colors hover:text-primary"
                  >
                    <Globe className="size-3.5" aria-hidden />
                    Website ↗
                  </a>
                ) : null}
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
                action={{ href: routes.discover(), label: "Browse all events" }}
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
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}

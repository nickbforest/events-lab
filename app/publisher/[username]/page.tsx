import { CalendarPlus, Globe, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { TrackView } from "@/components/analytics/track-view";
import { EventCard } from "@/components/events/event-card";
import { PublicShell } from "@/components/layout/public-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Eyebrow } from "@/components/ui/eyebrow";
import {
  getPastEventsByUsername,
  getUpcomingEventsByUsername,
} from "@/features/events/queries";
import { previewFlagSchema } from "@/features/profiles/contracts";
import { getProfileByUsername } from "@/features/profiles/queries";
import { countryName } from "@/lib/countries";
import { publisherTypeLabel } from "@/lib/format";
import { PREVIEW_PARAM } from "@/lib/routes";

// No generateStaticParams: profiles are created continuously by signup, so
// eagerly enumerating every username at build time would mean a new account
// has no public page until the next deploy, and every build (CI included)
// would require live database connectivity just to compile. Pages render
// dynamically per request instead.

export async function generateMetadata({
  params,
}: PageProps<"/publisher/[username]">): Promise<Metadata> {
  const { username } = await params;
  const profile = await getProfileByUsername(username);

  if (!profile) {
    return { title: "Publisher not found" };
  }

  return {
    title: profile.display_name,
    description:
      profile.bio ??
      `Upcoming events from ${profile.display_name} on Eventail.`,
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
}: PageProps<"/publisher/[username]">) {
  const [{ username }, query] = await Promise.all([params, searchParams]);

  const isPreview = previewFlagSchema.parse(query[PREVIEW_PARAM]);

  const profile = await getProfileByUsername(username);

  if (!profile) {
    notFound();
  }

  const [upcoming, past] = await Promise.all([
    getUpcomingEventsByUsername(username),
    getPastEventsByUsername(username),
  ]);

  const location = [profile.city, countryName(profile.country_code)]
    .filter(Boolean)
    .join(", ");

  return (
    <PublicShell>
      {/* A publisher previewing their own page wants the page, not the
          signed-out header — and is not a visitor to count. */}
      {isPreview ? null : <SiteHeader />}
      {isPreview ? null : <TrackView username={profile.username} />}

      <main className="flex-1">
        {profile.cover_url ? (
          <div className="relative aspect-[3/1] max-h-80 w-full bg-secondary">
            <Image
              src={profile.cover_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-transparent to-background"
            />
          </div>
        ) : null}

        <section className="border-b border-border px-6 py-14 md:py-16">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 sm:flex-row sm:items-start">
            <Avatar
              src={profile.avatar_url}
              name={profile.display_name}
              sizes="80px"
              className="size-20 rounded-2xl text-3xl shadow-lift"
            />

            <div className="min-w-0 flex-1">
              <Eyebrow className="mb-4">
                {publisherTypeLabel(profile.publisher_type)}
              </Eyebrow>
              <h1 className="mb-1.5 font-display text-4xl font-semibold tracking-tight md:text-5xl">
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

              <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                {location ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5">
                    <MapPin className="size-3.5" aria-hidden />
                    {location}
                  </span>
                ) : null}
                {profile.website_url ? (
                  <a
                    href={profile.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-full border border-border bg-white/[0.03] px-3 py-1.5 transition-colors hover:border-primary/40 hover:text-primary"
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
            <h2 className="mb-6 font-display text-xl font-semibold tracking-tight">
              Upcoming events
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
                description={`${profile.display_name} has nothing scheduled right now. Check back soon.`}
              />
            )}

            {past.length > 0 && (
              <>
                <h2 className="mt-16 mb-6 font-display text-xl font-semibold tracking-tight text-muted-foreground">
                  Past events
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
    </PublicShell>
  );
}

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AlertTriangle, Calendar, Clock, MapPin, Ticket, Video } from "lucide-react";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { EventCard } from "@/components/events/event-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import {
  getPublishedEventBySlug,
  getRelatedEvents,
} from "@/features/events/queries";
import {
  eventTypeLabel,
  formatEventDate,
  formatEventTimeRange,
  isoDateTime,
  priceLabel,
} from "@/lib/format";
import type { EventWithRelations } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/u/[username]/[slug]">): Promise<Metadata> {
  const { username, slug } = await params;
  const event = await getPublishedEventBySlug(username, slug);

  if (!event) return { title: "Event not found" };

  return {
    title: event.title,
    description: event.short_description ?? undefined,
    openGraph: {
      title: event.title,
      description: event.short_description ?? undefined,
      type: "article",
      images: event.cover_image_url ? [event.cover_image_url] : undefined,
    },
  };
}

/** schema.org Event markup — Architecture.md §31 requires structured data. */
function eventJsonLd(event: EventWithRelations) {
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.short_description ?? undefined,
    startDate: isoDateTime(event.start_at),
    endDate: event.end_at ? isoDateTime(event.end_at) : undefined,
    eventStatus:
      event.status === "cancelled"
        ? "https://schema.org/EventCancelled"
        : event.status === "postponed"
          ? "https://schema.org/EventPostponed"
          : "https://schema.org/EventScheduled",
    eventAttendanceMode:
      event.event_type === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : event.event_type === "hybrid"
          ? "https://schema.org/MixedEventAttendanceMode"
          : "https://schema.org/OfflineEventAttendanceMode",
    image: event.cover_image_url ? [event.cover_image_url] : undefined,
    location: event.venue_name
      ? {
          "@type": "Place",
          name: event.venue_name,
          address: {
            "@type": "PostalAddress",
            streetAddress: event.address ?? undefined,
            addressLocality: event.city ?? undefined,
            addressCountry: event.country_code ?? undefined,
          },
        }
      : { "@type": "VirtualLocation", url: event.online_url ?? undefined },
    organizer: {
      "@type": "Organization",
      name: event.owner.display_name,
    },
  };
}

function InfoRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-1 text-primary">{icon}</span>
      <div className="min-w-0">
        <div className="font-mono text-xs uppercase text-muted-foreground">
          {label}
        </div>
        <div className="text-sm font-medium">{children}</div>
      </div>
    </div>
  );
}

export default async function EventPage({
  params,
}: PageProps<"/u/[username]/[slug]">) {
  const { username, slug } = await params;
  const event = await getPublishedEventBySlug(username, slug);

  if (!event) notFound();

  const related = await getRelatedEvents(event);
  const date = formatEventDate(event.start_at, event.timezone);
  const isCancelled = event.status === "cancelled";

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
      />
      <SiteHeader />

      <main className="flex-1">
        {event.cover_image_url && (
          <div className="relative h-[280px] w-full overflow-hidden border-b border-border bg-card md:h-[420px]">
            <Image
              src={event.cover_image_url}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}

        {isCancelled && (
          <div
            role="alert"
            className="border-b border-destructive/30 bg-destructive/10 px-6 py-4"
          >
            <div className="mx-auto flex max-w-4xl items-center gap-3 text-sm">
              <AlertTriangle className="size-4 shrink-0 text-destructive" aria-hidden />
              <span>
                <strong className="font-semibold">This event is cancelled.</strong>{" "}
                It is kept online so people holding the link know not to travel.
              </span>
            </div>
          </div>
        )}

        <article className="mx-auto grid max-w-4xl grid-cols-1 gap-12 px-6 py-12 md:grid-cols-3">
          <div className="space-y-8 md:col-span-2">
            <div>
              <div className="mb-3 flex flex-wrap items-center gap-3">
                <span className="font-mono text-xs uppercase tracking-widest text-primary">
                  {event.category.label}
                </span>
                {event.status !== "published" && (
                  <EventStatusBadge status={event.status} />
                )}
              </div>

              <h1 className="mb-4 font-display text-3xl font-extrabold uppercase tracking-tighter md:text-5xl">
                {event.title}
              </h1>

              {event.short_description && (
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {event.short_description}
                </p>
              )}
            </div>

            {event.description && (
              <div>
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  About
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            )}

            {event.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-border px-3 py-1 font-mono text-xs uppercase text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="border-t border-border pt-8">
              <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Organised by
              </h2>
              <Link
                href={`/u/${event.owner.username}`}
                className="group flex items-center gap-3"
              >
                <span
                  aria-hidden
                  className="grid size-10 shrink-0 place-items-center rounded-lg bg-secondary font-display font-bold"
                >
                  {event.owner.display_name[0]?.toUpperCase()}
                </span>
                <span>
                  <span className="block font-medium transition-colors group-hover:text-primary">
                    {event.owner.display_name}
                  </span>
                  <span className="block font-mono text-xs text-muted-foreground">
                    @{event.owner.username}
                  </span>
                </span>
              </Link>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="space-y-4 rounded-lg border border-border bg-card/40 p-6">
              <InfoRow icon={<Calendar className="size-4" aria-hidden />} label="Date">
                <time dateTime={isoDateTime(event.start_at)}>{date.full}</time>
              </InfoRow>

              <InfoRow icon={<Clock className="size-4" aria-hidden />} label="Time">
                {formatEventTimeRange(event.start_at, event.end_at, event.timezone)}
                <span className="ml-1 font-mono text-xs text-muted-foreground">
                  {event.timezone}
                </span>
              </InfoRow>

              {event.venue_name ? (
                <InfoRow icon={<MapPin className="size-4" aria-hidden />} label="Location">
                  {event.venue_name}
                  {event.address && (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {event.address}
                    </span>
                  )}
                  <span className="block text-xs font-normal text-muted-foreground">
                    {[event.city, event.country_code].filter(Boolean).join(", ")}
                  </span>
                </InfoRow>
              ) : (
                <InfoRow icon={<Video className="size-4" aria-hidden />} label="Location">
                  {eventTypeLabel(event.event_type)}
                </InfoRow>
              )}

              <InfoRow icon={<Ticket className="size-4" aria-hidden />} label="Price">
                {priceLabel(event.is_free, event.price_info)}
              </InfoRow>
            </div>

            {!isCancelled && event.ticket_url && (
              <a
                href={event.ticket_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-primary px-6 py-4 text-center font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Get tickets ↗
              </a>
            )}

            {!isCancelled && !event.ticket_url && event.online_url && (
              <a
                href={event.online_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-primary px-6 py-4 text-center font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Join online ↗
              </a>
            )}
          </aside>
        </article>

        {related.length > 0 && (
          <section className="border-t border-border px-6 py-12">
            <div className="mx-auto max-w-5xl">
              <h2 className="mb-6 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                You might also like
              </h2>
              <div className="space-y-4">
                {related.map((item) => (
                  <EventCard key={item.id} event={item} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <SiteFooter />
    </>
  );
}

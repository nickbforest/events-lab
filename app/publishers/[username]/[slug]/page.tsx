import {
  AlertTriangle,
  ArrowUpRight,
  Calendar,
  Clock,
  MapPin,
  Ticket,
  Video,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { TicketLink } from "@/components/analytics/ticket-link";
import { TrackView } from "@/components/analytics/track-view";
import { EventCard } from "@/components/events/event-card";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { Avatar } from "@/components/ui/avatar";
import {
  getPublishedEventBySlug,
  getRelatedEvents,
} from "@/features/events/queries";
import { countryName } from "@/lib/countries";
import {
  DEFAULT_TICKET_LABEL,
  eventTypeLabel,
  formatEventDate,
  formatEventTimeRange,
  isoDateTime,
  priceLabel,
} from "@/lib/format";
import { mapSearchUrl } from "@/lib/maps";
import { routes } from "@/lib/routes";
import type { EventWithRelations } from "@/lib/types";

export async function generateMetadata({
  params,
}: PageProps<"/publishers/[username]/[slug]">): Promise<Metadata> {
  const { username, slug } = await params;
  const event = await getPublishedEventBySlug(username, slug);

  if (!event) {
    return { title: "Event not found" };
  }

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

/**
 * Where the event happens, for schema.org. In person is a `Place` (named by
 * the venue, or the city when there is no venue), online a `VirtualLocation`,
 * hybrid both — search engines read the array as "either".
 */
function jsonLdLocation(event: EventWithRelations) {
  const place = {
    "@type": "Place",
    name: event.venue_name ?? event.city ?? undefined,
    hasMap: event.map_url ?? undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: event.address ?? undefined,
      addressLocality: event.city ?? undefined,
      addressCountry: event.country_code ?? undefined,
    },
  };
  const virtual = {
    "@type": "VirtualLocation",
    url: event.online_url ?? undefined,
  };

  switch (event.event_type) {
    case "in_person":
      return place;
    case "online":
      return virtual;
    case "hybrid":
      return [place, virtual];
  }
}

/** schema.org Event markup — search engines show it as a rich result. */
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
    location: jsonLdLocation(event),
    organizer: {
      "@type": "Organization",
      name: event.owner.display_name,
    },
  };
}

export interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function InfoRow({ icon, label, children }: InfoRowProps) {
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
}: PageProps<"/publishers/[username]/[slug]">) {
  const { username, slug } = await params;
  const event = await getPublishedEventBySlug(username, slug);

  if (!event) {
    notFound();
  }

  const related = await getRelatedEvents(event);
  const date = formatEventDate(event.start_at, event.timezone);
  const isCancelled = event.status === "cancelled";
  const country = countryName(event.country_code);
  const cityLine = [event.city, country].filter(Boolean).join(", ");
  const mapUrl = mapSearchUrl({
    mapUrl: event.map_url,
    venueName: event.venue_name,
    address: event.address,
    city: event.city,
    country,
    latitude: event.latitude,
    longitude: event.longitude,
  });
  // Publishing an in-person event needs only a city, so a venue name is not
  // what decides whether there is a place to show.
  const hasPlace =
    event.event_type !== "online" &&
    Boolean(event.venue_name || event.address || cityLine);
  const structuredData = JSON.stringify(eventJsonLd(event)).replace(
    /</g,
    "\\u003c",
  );

  return (
    <>
      <script type="application/ld+json">{structuredData}</script>
      <TrackView username={event.owner.username} eventId={event.id} />
      <SiteHeader />

      <main className="flex-1">
        {/* No cover banner: a poster cropped to a full-width strip loses
            most of itself. The image still travels as the link preview
            (Open Graph) and in the structured data. */}
        {isCancelled && (
          <div
            role="alert"
            className="border-b border-destructive/30 bg-destructive/10 px-6 py-4"
          >
            <div className="mx-auto flex max-w-4xl items-center gap-3 text-sm">
              <AlertTriangle
                className="size-4 shrink-0 text-destructive"
                aria-hidden
              />
              <span>
                <strong className="font-semibold">
                  This event is cancelled.
                </strong>{" "}
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

              {event.short_description ? (
                <p className="text-lg leading-relaxed text-muted-foreground">
                  {event.short_description}
                </p>
              ) : null}
            </div>

            {event.description ? (
              <div>
                <h2 className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  About
                </h2>
                <p className="whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>
            ) : null}

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
                href={routes.publisher(event.owner.username)}
                className="group flex items-center gap-3"
              >
                <Avatar
                  src={event.owner.avatar_url}
                  name={event.owner.display_name}
                  sizes="40px"
                  className="size-10 font-bold"
                />
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
              <InfoRow
                icon={<Calendar className="size-4" aria-hidden />}
                label="Date"
              >
                <time dateTime={isoDateTime(event.start_at)}>{date.full}</time>
              </InfoRow>

              <InfoRow
                icon={<Clock className="size-4" aria-hidden />}
                label="Time"
              >
                {formatEventTimeRange(
                  event.start_at,
                  event.end_at,
                  event.timezone,
                )}
                <span className="ml-1 font-mono text-xs text-muted-foreground">
                  {event.timezone}
                </span>
              </InfoRow>

              {hasPlace ? (
                <InfoRow
                  icon={<MapPin className="size-4" aria-hidden />}
                  label="Location"
                >
                  {event.venue_name ? (
                    <span className="block">{event.venue_name}</span>
                  ) : null}
                  {event.address ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {event.address}
                    </span>
                  ) : null}
                  {cityLine ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      {cityLine}
                    </span>
                  ) : null}
                  {event.event_type === "hybrid" ? (
                    <span className="block text-xs font-normal text-muted-foreground">
                      Also online
                    </span>
                  ) : null}
                  {mapUrl ? (
                    <a
                      href={mapUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 font-mono text-xs uppercase text-primary transition-opacity hover:opacity-80"
                    >
                      View on map
                      <ArrowUpRight className="size-3" aria-hidden />
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ) : null}
                </InfoRow>
              ) : (
                <InfoRow
                  icon={<Video className="size-4" aria-hidden />}
                  label="Location"
                >
                  {eventTypeLabel(event.event_type)}
                </InfoRow>
              )}

              <InfoRow
                icon={<Ticket className="size-4" aria-hidden />}
                label="Price"
              >
                {priceLabel(event.is_free, event.price_info)}
              </InfoRow>
            </div>

            {!isCancelled && event.ticket_url ? (
              <TicketLink
                href={event.ticket_url}
                username={event.owner.username}
                eventId={event.id}
                className="block w-full rounded-md bg-primary px-6 py-4 text-center font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                {event.ticket_cta_label ?? DEFAULT_TICKET_LABEL} ↗
              </TicketLink>
            ) : null}

            {!isCancelled && !event.ticket_url && event.online_url ? (
              <a
                href={event.online_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full rounded-md bg-primary px-6 py-4 text-center font-medium text-primary-foreground transition-all hover:brightness-110"
              >
                Join online ↗
              </a>
            ) : null}
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

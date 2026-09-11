import { MousePointerClick, Users } from "lucide-react";
import Link from "next/link";
import { Panel, PanelEmpty } from "@/components/dashboard/panel";
import { RangeTabs } from "@/components/dashboard/range-tabs";
import { StatsCard, StatsCardRow } from "@/components/dashboard/stats-card";
import { TrendChart } from "@/components/dashboard/trend-chart";
import { EventStatusBadge } from "@/components/events/event-status-badge";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import {
  getAnalyticsOverview,
  parseAnalyticsRange,
} from "@/features/analytics/queries";
import { getDashboardSummary } from "@/features/events/queries";
import { getCurrentProfile } from "@/features/profiles/queries";
import { formatEventDate, isoDateTime } from "@/lib/format";

export default async function DashboardOverviewPage({
  searchParams,
}: PageProps<"/dashboard">) {
  const range = parseAnalyticsRange(await searchParams);
  const profile = await getCurrentProfile();

  const [analytics, { upcoming }] = await Promise.all([
    getAnalyticsOverview(profile.id, range),
    getDashboardSummary(profile.id),
  ]);

  return (
    <div className="px-6 py-10 md:px-10">
      <div className="mx-auto max-w-5xl">
        <DashboardHeader
          kicker="System_status: Active"
          title="Overview"
          description={profile.display_name}
          actions={<RangeTabs active={range} />}
        />

        <div className="mb-6">
          <StatsCardRow>
            <StatsCard
              label="Site visits"
              value={analytics.siteVisits}
              icon={<Users className="size-4" />}
            />
            <StatsCard
              label="Ticket clicks"
              value={analytics.ticketClicks}
              icon={<MousePointerClick className="size-4" />}
              accent
            />
          </StatsCardRow>
        </div>

        <div className="mb-6">
          <Panel
            title={analytics.rangeLabel}
            subtitle="Visits vs ticket clicks"
          >
            <TrendChart
              series={analytics.series}
              caption={`Daily site visits and ticket clicks, ${analytics.rangeLabel.toLowerCase()}`}
            />
          </Panel>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Panel
            title="Upcoming events"
            action={{ href: "/dashboard/events", label: "All" }}
          >
            {upcoming.length > 0 ? (
              <ul className="divide-y divide-border">
                {upcoming.slice(0, 4).map((event) => {
                  const date = formatEventDate(event.start_at, event.timezone);
                  return (
                    <li
                      key={event.id}
                      className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-display font-extrabold uppercase tracking-tight">
                          {event.title}
                        </div>
                        <time
                          dateTime={isoDateTime(event.start_at)}
                          className="font-mono text-xs text-muted-foreground"
                        >
                          {date.month} {date.day} / {date.time}
                        </time>
                      </div>
                      <EventStatusBadge status={event.status} />
                    </li>
                  );
                })}
              </ul>
            ) : (
              <PanelEmpty>No upcoming events.</PanelEmpty>
            )}
          </Panel>

          <Panel title="Most viewed">
            {analytics.mostViewed.length > 0 ? (
              <ul className="divide-y divide-border">
                {analytics.mostViewed.map(({ event, views }) => (
                  <li
                    key={event.id}
                    className="flex items-center justify-between gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <Link
                      href={`/u/${event.owner.username}/${event.slug}`}
                      className="min-w-0 truncate font-display font-extrabold uppercase tracking-tight transition-colors hover:text-primary"
                    >
                      {event.title}
                    </Link>
                    <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
                      {views} views
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <PanelEmpty>Stats appear once visitors arrive.</PanelEmpty>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

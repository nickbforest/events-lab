import { describe, expect, it, vi } from "vitest";

import { analyticsHitSchema } from "@/features/analytics/contracts";
import type { AnalyticsRepository } from "@/features/analytics/dal/analytics-repository";
import type { Profile } from "@/lib/types";

import {
  createAnalyticsService,
  type PublisherLookupPort,
} from "./analytics-service";

const NOW = new Date("2026-09-30T15:00:00Z");
const clock = () => NOW;

const OWNER_ID = "11111111-1111-4111-8111-111111111111";
const VISITOR_ID = "33333333-3333-4333-8333-333333333333";
const EVENT_ID = "44444444-4444-4444-8444-444444444444";

const owner: Profile = {
  id: OWNER_ID,
  username: "blue-bar",
  display_name: "Blue Bar",
  publisher_type: "venue",
  bio: null,
  avatar_url: null,
  cover_url: null,
  website_url: null,
  city: null,
  country_code: null,
  social_links: {},
};

function fakeRepository(
  overrides: Partial<AnalyticsRepository> = {},
): AnalyticsRepository {
  return {
    recordHit: vi.fn(async () => true),
    dailyCounts: vi.fn(async () => []),
    topEvents: vi.fn(async () => []),
    ...overrides,
  };
}

const publishers: PublisherLookupPort = {
  getProfileByUsername: vi.fn(async (username: string) =>
    username === owner.username ? owner : null,
  ),
};

const pageView = analyticsHitSchema.parse({
  metric: "page_view",
  username: owner.username,
});

describe("recordHit", () => {
  it("records an anonymous visitor's view", async () => {
    const repository = fakeRepository();
    const service = createAnalyticsService(repository, publishers, clock);

    await expect(service.recordHit(null, pageView)).resolves.toBe("recorded");
    expect(repository.recordHit).toHaveBeenCalledWith(
      "page_view",
      owner.username,
      null,
    );
  });

  it("records a signed-in visitor who is not the owner", async () => {
    const repository = fakeRepository();
    const service = createAnalyticsService(repository, publishers, clock);

    await expect(service.recordHit(VISITOR_ID, pageView)).resolves.toBe(
      "recorded",
    );
  });

  it("does not count the publisher looking at their own page", async () => {
    const repository = fakeRepository();
    const service = createAnalyticsService(repository, publishers, clock);

    await expect(service.recordHit(OWNER_ID, pageView)).resolves.toBe(
      "own_visit",
    );
    expect(repository.recordHit).not.toHaveBeenCalled();
  });

  it("ignores a hit for a publisher that does not exist", async () => {
    const repository = fakeRepository();
    const service = createAnalyticsService(repository, publishers, clock);

    await expect(
      service.recordHit(
        null,
        analyticsHitSchema.parse({ metric: "page_view", username: "nobody" }),
      ),
    ).resolves.toBe("not_public");
    expect(repository.recordHit).not.toHaveBeenCalled();
  });

  it("reports a page the database would not attribute as not public", async () => {
    const repository = fakeRepository({ recordHit: vi.fn(async () => false) });
    const service = createAnalyticsService(repository, publishers, clock);

    await expect(
      service.recordHit(
        null,
        analyticsHitSchema.parse({
          metric: "ticket_click",
          username: owner.username,
          eventId: EVENT_ID,
        }),
      ),
    ).resolves.toBe("not_public");
  });
});

describe("getOverview", () => {
  it("asks for the last 7 UTC days, today included", async () => {
    const repository = fakeRepository();
    const service = createAnalyticsService(repository, publishers, clock);

    const overview = await service.getOverview(OWNER_ID, "7d");

    expect(repository.dailyCounts).toHaveBeenCalledWith({
      ownerId: OWNER_ID,
      from: "2026-09-24T00:00:00.000Z",
      to: "2026-10-01T00:00:00.000Z",
    });
    expect(overview.series).toHaveLength(7);
    expect(overview.series[0].date).toBe("2026-09-24");
    expect(overview.series.at(-1)?.date).toBe("2026-09-30");
  });

  it("totals and buckets views and clicks by day", async () => {
    const repository = fakeRepository({
      dailyCounts: vi.fn(async () => [
        { day: "2026-09-29", metric: "page_view" as const, hits: 4 },
        { day: "2026-09-30", metric: "page_view" as const, hits: 2 },
        { day: "2026-09-30", metric: "ticket_click" as const, hits: 1 },
      ]),
    });
    const service = createAnalyticsService(repository, publishers, clock);

    const overview = await service.getOverview(OWNER_ID, "7d");

    expect(overview.siteVisits).toBe(6);
    expect(overview.ticketClicks).toBe(1);
    expect(overview.series.at(-1)).toEqual({
      date: "2026-09-30",
      visits: 2,
      clicks: 1,
    });
  });

  it("starts all time at the first recorded day", async () => {
    const repository = fakeRepository({
      dailyCounts: vi.fn(async () => [
        { day: "2026-09-20", metric: "page_view" as const, hits: 1 },
      ]),
    });
    const service = createAnalyticsService(repository, publishers, clock);

    const overview = await service.getOverview(OWNER_ID, "all");

    expect(repository.dailyCounts).toHaveBeenCalledWith(
      expect.objectContaining({ from: null }),
    );
    expect(overview.series[0].date).toBe("2026-09-20");
    expect(overview.series).toHaveLength(11);
  });

  it("shows 30 empty days for all time before any visit", async () => {
    const service = createAnalyticsService(fakeRepository(), publishers, clock);

    const overview = await service.getOverview(OWNER_ID, "all");

    expect(overview.series).toHaveLength(30);
    expect(overview.siteVisits).toBe(0);
  });

  it("passes the most viewed events through from the database", async () => {
    const top = [
      {
        eventId: EVENT_ID,
        title: "Jazz Night",
        slug: "jazz-night",
        status: "published" as const,
        views: 9,
      },
    ];
    const repository = fakeRepository({ topEvents: vi.fn(async () => top) });
    const service = createAnalyticsService(repository, publishers, clock);

    const overview = await service.getOverview(OWNER_ID, "30d");

    expect(repository.topEvents).toHaveBeenCalledWith(
      expect.objectContaining({ ownerId: OWNER_ID }),
      5,
    );
    expect(overview.mostViewed).toEqual(top);
  });
});

describe("analyticsHitSchema", () => {
  it("requires an event for a ticket click", () => {
    expect(
      analyticsHitSchema.safeParse({
        metric: "ticket_click",
        username: owner.username,
      }).success,
    ).toBe(false);
  });

  it("rejects a malformed username or event id", () => {
    expect(
      analyticsHitSchema.safeParse({ metric: "page_view", username: "A B" })
        .success,
    ).toBe(false);
    expect(
      analyticsHitSchema.safeParse({
        metric: "page_view",
        username: owner.username,
        eventId: "not-a-uuid",
      }).success,
    ).toBe(false);
  });
});

import { describe, expect, it } from "vitest";

import { InMemoryEventsRepository } from "@/features/events/dal/in-memory-events-repository";
import type { Category, EventRecord, Profile } from "@/lib/types";

import { createEventsService } from "./events-service";

const profile: Profile = {
  id: "profile-1",
  username: "organizer",
  display_name: "Organizer",
  publisher_type: "event_organizer",
  bio: null,
  avatar_url: null,
  cover_url: null,
  website_url: null,
  city: null,
  country_code: null,
  social_links: {},
};

const category: Category = {
  id: "category-1",
  slug: "concert",
  label: "Concert",
};

function event(
  id: string,
  status: EventRecord["status"],
  startAt: string,
): EventRecord {
  return {
    id,
    owner_id: profile.id,
    slug: id,
    title: id,
    short_description: null,
    description: null,
    category_id: category.id,
    event_type: "in_person",
    status,
    start_at: startAt,
    end_at: null,
    timezone: "Asia/Tbilisi",
    venue_name: null,
    address: null,
    city: null,
    country_code: null,
    latitude: null,
    longitude: null,
    online_url: null,
    is_free: true,
    price_info: null,
    ticket_url: null,
    external_url: null,
    cover_image_url: null,
    published_at: status === "published" ? startAt : null,
    tags: [],
  };
}

describe("events service", () => {
  const events = [
    event("past", "published", "2026-09-09T10:00:00Z"),
    event("draft", "draft", "2026-09-13T10:00:00Z"),
    event("upcoming", "published", "2026-09-12T10:00:00Z"),
  ];
  const service = createEventsService(
    new InMemoryEventsRepository(events, [profile], [category]),
    () => new Date("2026-09-11T10:00:00Z"),
  );

  it("keeps drafts private on public profile pages", async () => {
    const upcoming = await service.getUpcomingEventsByUsername(
      profile.username,
    );
    expect(upcoming.map((item) => item.id)).toEqual(["upcoming"]);
  });

  it("builds the owner dashboard summary from a deterministic clock", async () => {
    const summary = await service.getDashboardSummary(profile.id);
    expect(summary.publishedCount).toBe(2);
    expect(summary.draftCount).toBe(1);
    expect(summary.upcoming.map((item) => item.id)).toEqual(["upcoming"]);
  });
});

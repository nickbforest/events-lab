import { describe, expect, it, vi } from "vitest";

import type { EventDraftInput } from "@/features/events/contracts";
import type {
  EventsRepository,
  EventWriteRow,
} from "@/features/events/dal/events-repository";
import { ApplicationError } from "@/lib/errors";
import type {
  Category,
  EventRecord,
  EventStatus,
  EventWithRelations,
  Profile,
} from "@/lib/types";

import {
  canTransition,
  createEventsService,
  hasFinished,
  publishBlockers,
  toEventSlug,
} from "./events-service";

const NOW = new Date("2026-09-11T10:00:00Z");
const OWN_MEDIA = "https://cdn.test/event-media";
const clock = () => NOW;

const profile: Profile = {
  id: "11111111-1111-4111-8111-111111111111",
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
  id: "22222222-2222-4222-8222-222222222222",
  slug: "concert",
  label: "Concert",
};

function draft(overrides: Partial<EventDraftInput> = {}): EventDraftInput {
  return {
    title: "Jazz Night",
    slug: null,
    shortDescription: null,
    description: null,
    categoryId: category.id,
    eventType: "in_person",
    startAt: "2026-10-01T19:00:00Z",
    endAt: null,
    timezone: "Asia/Tbilisi",
    venueName: null,
    address: null,
    city: "Tbilisi",
    countryCode: "GE",
    latitude: null,
    longitude: null,
    onlineUrl: null,
    isFree: true,
    priceInfo: null,
    ticketUrl: null,
    ticketCtaLabel: null,
    externalUrl: null,
    coverImageUrl: null,
    tags: [],
    ...overrides,
  };
}

function record(
  id: string,
  status: EventStatus,
  overrides: Partial<EventRecord> = {},
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
    start_at: "2026-10-01T19:00:00Z",
    end_at: null,
    timezone: "Asia/Tbilisi",
    venue_name: null,
    address: null,
    city: "Tbilisi",
    country_code: "GE",
    latitude: null,
    longitude: null,
    online_url: null,
    is_free: true,
    price_info: null,
    ticket_url: null,
    ticket_cta_label: null,
    external_url: null,
    cover_image_url: null,
    published_at: status === "draft" ? null : "2026-09-01T10:00:00Z",
    tags: [],
    ...overrides,
  };
}

const withRelations = (event: EventRecord): EventWithRelations => ({
  ...event,
  owner: profile,
  category,
});

/**
 * A stub rather than a second in-memory implementation: the repository now
 * filters in SQL, so re-implementing that filtering in TypeScript would test
 * the fake instead of the service.
 */
function fakeRepository(
  overrides: Partial<EventsRepository> = {},
): EventsRepository {
  return {
    listCategories: vi.fn(async () => [category]),
    resolveTags: vi.fn(async () => []),
    findVisibleBySlug: vi.fn(async () => null),
    listVisibleByUsername: vi.fn(async () => []),
    listRelated: vi.fn(async () => []),
    listByOwner: vi.fn(async () => []),
    findByIdForOwner: vi.fn(async () => null),
    countByOwnerStatus: vi.fn(async () => ({
      draft: 0,
      published: 0,
      cancelled: 0,
      postponed: 0,
      archived: 0,
    })),
    slugExists: vi.fn(async () => false),
    insertEvent: vi.fn(
      async (
        _ownerId: string,
        row: EventWriteRow,
        status: EventStatus,
        publishedAt: string | null,
      ) =>
        record("new", status, {
          ...row,
          published_at: publishedAt,
        }),
    ),
    updateEvent: vi.fn(async (id: string) => record(id, "published")),
    deleteEvent: vi.fn(async () => undefined),
    setEventTags: vi.fn(async () => undefined),
    uploadCoverImage: vi.fn(async () => "https://cdn.test/cover.png"),
    removeCoverImage: vi.fn(async () => undefined),
    isOwnedCoverUrl: vi.fn((ownerId: string, url: string) =>
      url.startsWith(`${OWN_MEDIA}/${ownerId}/`),
    ),
    ...overrides,
  };
}

describe("toEventSlug", () => {
  it("turns a title into a slug the database will accept", () => {
    expect(toEventSlug("  Jazz Night! @ The Blue Bar  ")).toBe(
      "jazz-night-the-blue-bar",
    );
  });

  it("falls back when a title leaves nothing usable", () => {
    expect(toEventSlug("!!!")).toBe("event");
    expect(toEventSlug("ღამე")).toBe("event");
  });
});

describe("hasFinished", () => {
  it("prefers the end date and falls back to the start", () => {
    expect(hasFinished(record("a", "published"), NOW)).toBe(false);
    expect(
      hasFinished(
        record("b", "published", { start_at: "2026-09-01T10:00:00Z" }),
        NOW,
      ),
    ).toBe(true);
    // Started but still running: the end date is what decides.
    expect(
      hasFinished(
        record("c", "published", {
          start_at: "2026-09-11T09:00:00Z",
          end_at: "2026-09-11T23:00:00Z",
        }),
        NOW,
      ),
    ).toBe(false);
  });
});

describe("publishBlockers", () => {
  it("passes a complete in-person event", () => {
    expect(publishBlockers(draft())).toEqual({});
  });

  it("requires a join link for an online event", () => {
    expect(publishBlockers(draft({ eventType: "online" }))).toHaveProperty(
      "onlineUrl",
    );
  });

  it("requires a city for an in-person event", () => {
    expect(publishBlockers(draft({ city: null }))).toHaveProperty("city");
  });

  it("requires price details for a paid event", () => {
    expect(publishBlockers(draft({ isFree: false }))).toHaveProperty(
      "priceInfo",
    );
    expect(
      publishBlockers(draft({ isFree: false, ticketUrl: "https://t.test" })),
    ).toEqual({});
  });
});

describe("createEvent", () => {
  it("derives a slug from the title and saves a draft unpublished", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await service.createEvent(profile.id, draft(), false);

    expect(repository.insertEvent).toHaveBeenCalledWith(
      profile.id,
      expect.objectContaining({ slug: "jazz-night" }),
      "draft",
      null,
    );
  });

  it("suffixes a slug this publisher already uses", async () => {
    const repository = fakeRepository({
      slugExists: vi.fn(async (_owner: string, slug: string) =>
        ["jazz-night", "jazz-night-2"].includes(slug),
      ),
    });
    const service = createEventsService(repository, clock);

    await service.createEvent(profile.id, draft(), false);

    expect(repository.insertEvent).toHaveBeenCalledWith(
      profile.id,
      expect.objectContaining({ slug: "jazz-night-3" }),
      "draft",
      null,
    );
  });

  it("stamps published_at when publishing", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await service.createEvent(profile.id, draft(), true);

    expect(repository.insertEvent).toHaveBeenCalledWith(
      profile.id,
      expect.anything(),
      "published",
      NOW.toISOString(),
    );
  });

  it("refuses to publish an event that is not ready", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await expect(
      service.createEvent(profile.id, draft({ city: null }), true),
    ).rejects.toBeInstanceOf(ApplicationError);
    expect(repository.insertEvent).not.toHaveBeenCalled();
  });

  it("saves an unready event as a draft", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await expect(
      service.createEvent(profile.id, draft({ city: null }), false),
    ).resolves.toBeDefined();
  });

  it("removes the event when its tags fail to save", async () => {
    const repository = fakeRepository({
      resolveTags: vi.fn(async () => ["tag-1"]),
      setEventTags: vi.fn(async () => {
        throw new Error("tags exploded");
      }),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.createEvent(profile.id, draft(), false),
    ).rejects.toThrow("tags exploded");
    expect(repository.deleteEvent).toHaveBeenCalledWith("new", profile.id);
  });

  it("drops price details when the event is free", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await service.createEvent(
      profile.id,
      draft({ isFree: true, priceInfo: "20 GEL" }),
      false,
    );

    expect(repository.insertEvent).toHaveBeenCalledWith(
      profile.id,
      expect.objectContaining({ price_info: null }),
      "draft",
      null,
    );
  });
});

describe("updateEvent", () => {
  it("keeps the slug of an event that is already public", async () => {
    const existing = withRelations(record("evt", "published"));
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.updateEvent("evt", profile.id, draft({ title: "Renamed" }));

    expect(repository.updateEvent).toHaveBeenCalledWith(
      "evt",
      profile.id,
      expect.objectContaining({ slug: "evt", title: "Renamed" }),
    );
  });

  it("re-derives the slug while the event is still a draft", async () => {
    const existing = withRelations(record("evt", "draft"));
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.updateEvent("evt", profile.id, draft({ title: "Renamed" }));

    expect(repository.updateEvent).toHaveBeenCalledWith(
      "evt",
      profile.id,
      expect.objectContaining({ slug: "renamed" }),
    );
  });

  it("refuses an edit that would make a public event unpublishable", async () => {
    const existing = withRelations(record("evt", "published"));
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.updateEvent("evt", profile.id, draft({ city: null })),
    ).rejects.toBeInstanceOf(ApplicationError);
  });

  it("removes a replaced cover only after the row points elsewhere", async () => {
    const existing = withRelations(
      record("evt", "draft", { cover_image_url: "https://cdn.test/old.png" }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.updateEvent(
      "evt",
      profile.id,
      draft({ coverImageUrl: `${OWN_MEDIA}/${profile.id}/new.png` }),
    );

    expect(repository.removeCoverImage).toHaveBeenCalledWith(
      "https://cdn.test/old.png",
    );
  });

  it("hides an event the session does not own behind a not-found", async () => {
    const service = createEventsService(fakeRepository(), clock);

    await expect(
      service.updateEvent("someone-elses", profile.id, draft()),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});

describe("transitionEvent", () => {
  it("stamps published_at the first time an event goes public", async () => {
    const existing = withRelations(
      record("evt", "draft", { published_at: null }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.transitionEvent("evt", profile.id, "published");

    expect(repository.updateEvent).toHaveBeenCalledWith("evt", profile.id, {
      status: "published",
      published_at: NOW.toISOString(),
    });
  });

  it("keeps the original published_at when un-postponing", async () => {
    const existing = withRelations(
      record("evt", "postponed", { published_at: "2026-08-01T00:00:00Z" }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.transitionEvent("evt", profile.id, "published");

    expect(repository.updateEvent).toHaveBeenCalledWith("evt", profile.id, {
      status: "published",
      published_at: "2026-08-01T00:00:00Z",
    });
  });

  it("refuses to send a public event back to draft", async () => {
    const existing = withRelations(record("evt", "published"));
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.transitionEvent("evt", profile.id, "draft"),
    ).rejects.toBeInstanceOf(ApplicationError);
  });

  it("refuses to publish a draft that is not ready", async () => {
    const existing = withRelations(
      record("evt", "draft", { published_at: null, city: null }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.transitionEvent("evt", profile.id, "published"),
    ).rejects.toBeInstanceOf(ApplicationError);
  });
});

describe("getDashboardSummary", () => {
  it("counts by status and lists only unfinished published events", async () => {
    const repository = fakeRepository({
      listByOwner: vi.fn(async () => [
        withRelations(
          record("past", "published", {
            start_at: "2026-09-01T10:00:00Z",
          }),
        ),
        withRelations(record("upcoming", "published")),
        withRelations(record("hidden", "draft")),
      ]),
      countByOwnerStatus: vi.fn(async () => ({
        draft: 1,
        published: 2,
        cancelled: 0,
        postponed: 0,
        archived: 0,
      })),
    });
    const service = createEventsService(repository, clock);

    const summary = await service.getDashboardSummary(profile.id);

    expect(summary.publishedCount).toBe(2);
    expect(summary.draftCount).toBe(1);
    expect(summary.upcoming.map((item) => item.id)).toEqual(["upcoming"]);
  });
});

describe("ticket button", () => {
  it("blocks publishing a labelled button with no link", () => {
    expect(
      publishBlockers(draft({ ticketCtaLabel: "Get Tickets" })),
    ).toHaveProperty("ticketUrl");
  });

  it("allows a labelled button that has a link", () => {
    expect(
      publishBlockers(
        draft({
          ticketCtaLabel: "Get Tickets",
          ticketUrl: "https://tickets.test/x",
        }),
      ),
    ).toEqual({});
  });

  it("allows a link with no label, which falls back to the default", () => {
    expect(
      publishBlockers(draft({ ticketUrl: "https://tickets.test/x" })),
    ).toEqual({});
  });
});

describe("lifecycle rules", () => {
  it("allows exactly the moves the editor offers", () => {
    expect(canTransition("draft", "published")).toBe(true);
    expect(canTransition("published", "archived")).toBe(true);
    expect(canTransition("postponed", "published")).toBe(true);
    expect(canTransition("archived", "published")).toBe(true);

    expect(canTransition("draft", "cancelled")).toBe(false);
    expect(canTransition("draft", "postponed")).toBe(false);
    expect(canTransition("cancelled", "published")).toBe(false);
    expect(canTransition("published", "draft")).toBe(false);
  });

  it("refuses a move the table does not allow, before touching the row", async () => {
    const existing = withRelations(
      record("evt", "draft", { published_at: null }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.transitionEvent("evt", profile.id, "cancelled"),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect(repository.updateEvent).not.toHaveBeenCalled();
  });

  it("checks readiness when an unpublished event is published again", async () => {
    // Unpublished, then edited while nobody could see it: no city any more.
    const existing = withRelations(record("evt", "archived", { city: null }));
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.transitionEvent("evt", profile.id, "published"),
    ).rejects.toMatchObject({
      code: "VALIDATION_FAILED",
      message: "An in-person event needs at least a city.",
    });
    expect(repository.updateEvent).not.toHaveBeenCalled();
  });

  it("keeps the slug of an unpublished event that was once public", async () => {
    const existing = withRelations(
      record("evt", "archived", { slug: "jazz-night" }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.updateEvent(
      "evt",
      profile.id,
      draft({ title: "Something else", slug: "something-else" }),
    );

    expect(repository.updateEvent).toHaveBeenCalledWith(
      "evt",
      profile.id,
      expect.objectContaining({ slug: "jazz-night" }),
    );
  });
});

describe("cover image ownership", () => {
  it("accepts an image the owner uploaded", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await service.createEvent(
      profile.id,
      draft({ coverImageUrl: `${OWN_MEDIA}/${profile.id}/poster.png` }),
      false,
    );

    expect(repository.insertEvent).toHaveBeenCalled();
  });

  it("refuses a URL outside the owner's own media folder", async () => {
    const repository = fakeRepository();
    const service = createEventsService(repository, clock);

    await expect(
      service.createEvent(
        profile.id,
        draft({ coverImageUrl: `${OWN_MEDIA}/someone-else/poster.png` }),
        false,
      ),
    ).rejects.toMatchObject({ code: "VALIDATION_FAILED" });
    expect(repository.insertEvent).not.toHaveBeenCalled();
  });

  it("keeps an already-saved cover even if it predates the check", async () => {
    const legacy = "https://legacy.test/poster.png";
    const existing = withRelations(
      record("evt", "draft", { published_at: null, cover_image_url: legacy }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
    });
    const service = createEventsService(repository, clock);

    await service.updateEvent(
      "evt",
      profile.id,
      draft({ coverImageUrl: legacy }),
    );

    expect(repository.updateEvent).toHaveBeenCalled();
  });
});

describe("cleanup failures", () => {
  it("still deletes the event when its cover cannot be removed", async () => {
    const existing = withRelations(
      record("evt", "published", {
        cover_image_url: `${OWN_MEDIA}/${profile.id}/poster.png`,
      }),
    );
    const repository = fakeRepository({
      findByIdForOwner: vi.fn(async () => existing),
      removeCoverImage: vi.fn(async () => {
        throw new Error("storage down");
      }),
    });
    const service = createEventsService(repository, clock);

    await expect(
      service.deleteEvent("evt", profile.id),
    ).resolves.toBeUndefined();
    expect(repository.deleteEvent).toHaveBeenCalledWith("evt", profile.id);
  });
});

import type { DiscoverFilters } from "@/features/discovery/contracts";
import type { DiscoveryRepository } from "@/features/discovery/dal/discovery-repository";
import { DataAccessError } from "@/lib/errors";
import type { Category, EventRecord, EventWithRelations } from "@/lib/types";

type Clock = () => Date;

export interface DiscoveryService {
  discoverEvents(filters: DiscoverFilters): Promise<EventWithRelations[]>;
  listCategories(): Promise<readonly Category[]>;
}

function rangeEnd(range: DiscoverFilters["range"], now: Date): number | null {
  const end = new Date(now);
  switch (range) {
    case "today":
      end.setHours(23, 59, 59, 999);
      return end.getTime();
    case "week":
      end.setDate(end.getDate() + 7);
      return end.getTime();
    case "month":
      end.setMonth(end.getMonth() + 1);
      return end.getTime();
    case "upcoming":
      return null;
  }
}

export function createDiscoveryService(
  repository: DiscoveryRepository,
  clock: Clock = () => new Date(),
): DiscoveryService {
  return {
    listCategories: () => repository.listCategories(),

    async discoverEvents(filters) {
      const [events, profiles, categories] = await Promise.all([
        repository.listEvents(),
        repository.listProfiles(),
        repository.listCategories(),
      ]);
      const now = clock();
      const until = rangeEnd(filters.range, now);
      const needle = filters.q?.toLowerCase();
      const categoryId = filters.category
        ? categories.find((category) => category.slug === filters.category)?.id
        : undefined;

      const matchesSearch = (event: EventRecord) => {
        if (!needle) return true;
        const owner = profiles.find((profile) => profile.id === event.owner_id);
        return [
          event.title,
          event.short_description,
          event.venue_name,
          event.city,
          owner?.display_name,
          ...event.tags,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(needle);
      };

      return events
        .filter((event) => {
          if (event.status !== "published" && event.status !== "postponed") {
            return false;
          }
          const startsAt = Date.parse(event.start_at);
          if (startsAt < now.getTime()) return false;
          if (until !== null && startsAt > until) return false;
          if (!matchesSearch(event)) return false;
          return !categoryId || event.category_id === categoryId;
        })
        .sort((a, b) => Date.parse(a.start_at) - Date.parse(b.start_at))
        .map((event) => {
          const owner = profiles.find(
            (profile) => profile.id === event.owner_id,
          );
          const category = categories.find(
            (candidate) => candidate.id === event.category_id,
          );
          if (!owner || !category) {
            throw new DataAccessError(
              `Event ${event.id} references a missing relation.`,
            );
          }
          return { ...event, owner, category };
        });
    },
  };
}

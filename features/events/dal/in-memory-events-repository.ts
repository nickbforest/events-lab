import { CATEGORIES, EVENTS, PROFILES } from "@/lib/mock-data";
import type { Category, EventRecord, Profile } from "@/lib/types";

import type { EventsRepository } from "./events-repository";

export class InMemoryEventsRepository implements EventsRepository {
  constructor(
    private readonly events: readonly EventRecord[] = EVENTS,
    private readonly profiles: readonly Profile[] = PROFILES,
    private readonly categories: readonly Category[] = CATEGORIES,
  ) {}

  async listCategories(): Promise<readonly Category[]> {
    return this.categories;
  }

  async listEvents(): Promise<readonly EventRecord[]> {
    return this.events;
  }

  async listProfiles(): Promise<readonly Profile[]> {
    return this.profiles;
  }
}

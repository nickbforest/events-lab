import type { Category, EventRecord, Profile } from "@/lib/types";

export interface EventsRepository {
  listCategories(): Promise<readonly Category[]>;
  listEvents(): Promise<readonly EventRecord[]>;
  listProfiles(): Promise<readonly Profile[]>;
}

import type { Category, EventRecord, Profile } from "@/lib/types";

export interface DiscoveryRepository {
  listCategories(): Promise<readonly Category[]>;
  listEvents(): Promise<readonly EventRecord[]>;
  listProfiles(): Promise<readonly Profile[]>;
}

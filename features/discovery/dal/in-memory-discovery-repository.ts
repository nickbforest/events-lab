import type { DiscoveryRepository } from "@/features/discovery/dal/discovery-repository";
import { CATEGORIES, EVENTS, PROFILES } from "@/lib/mock-data";

export class InMemoryDiscoveryRepository implements DiscoveryRepository {
  async listCategories() {
    return CATEGORIES;
  }

  async listEvents() {
    return EVENTS;
  }

  async listProfiles() {
    return PROFILES;
  }
}

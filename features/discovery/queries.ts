import "server-only";

import { createDiscoveryService } from "@/features/discovery/bll/discovery-service";
import { discoverFiltersSchema } from "@/features/discovery/contracts";
import { InMemoryDiscoveryRepository } from "@/features/discovery/dal/in-memory-discovery-repository";

export type { DiscoverFilters } from "@/features/discovery/contracts";
export { parseDiscoverFilters } from "@/features/discovery/contracts";

const discoveryService = createDiscoveryService(
  new InMemoryDiscoveryRepository(),
);

export async function discoverEvents(filters: unknown) {
  return discoveryService.discoverEvents(discoverFiltersSchema.parse(filters));
}

export async function listDiscoveryCategories() {
  return discoveryService.listCategories();
}

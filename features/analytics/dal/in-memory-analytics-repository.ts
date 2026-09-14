import type { AnalyticsRepository } from "@/features/analytics/dal/analytics-repository";
import { ANALYTICS, CATEGORIES, EVENTS, PROFILES } from "@/lib/mock-data";

export class InMemoryAnalyticsRepository implements AnalyticsRepository {
  async listAnalytics() {
    return ANALYTICS;
  }

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

import type {
  AnalyticsRecord,
  Category,
  EventRecord,
  Profile,
} from "@/lib/types";

export interface AnalyticsRepository {
  listAnalytics(): Promise<readonly AnalyticsRecord[]>;
  listCategories(): Promise<readonly Category[]>;
  listEvents(): Promise<readonly EventRecord[]>;
  listProfiles(): Promise<readonly Profile[]>;
}

import type { AnalyticsHitPayload } from "@/features/analytics/contracts";
import { apiClient } from "@/lib/http/client";
import { mapHttpError } from "@/lib/http/errors";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("analytics.transport");

const SESSION_PREFIX = "el:hit:";

/**
 * True the first time a key is seen in this browser session, false after.
 *
 * "One per session per page" is what makes a visit a visit rather than a
 * refresh count. `sessionStorage` can be unavailable (private windows,
 * blocked storage); then every hit counts, which over-counts slightly rather
 * than dropping real visits.
 */
function firstInSession(key: string): boolean {
  try {
    const storageKey = `${SESSION_PREFIX}${key}`;
    if (window.sessionStorage.getItem(storageKey) !== null) {
      return false;
    }
    window.sessionStorage.setItem(storageKey, "1");
    return true;
  } catch {
    return true;
  }
}

/**
 * Reports one hit, at most once per session for the same page and metric.
 *
 * Fire and forget: analytics must never slow a page or show a visitor an
 * error, so a failure is logged and otherwise ignored.
 */
export async function reportHit(hit: AnalyticsHitPayload): Promise<void> {
  const key = `${hit.metric}:${hit.username}:${hit.eventId ?? "page"}`;
  if (!firstInSession(key)) {
    return;
  }

  try {
    await apiClient.post(routes.api.analytics(), hit);
  } catch (error) {
    log.warn("Analytics hit was not delivered.", {
      metric: hit.metric,
      status: mapHttpError(error).status,
    });
  }
}

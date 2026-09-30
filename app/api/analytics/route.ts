import { type NextRequest, NextResponse } from "next/server";

import { compiledAnalyticsHitSchema } from "@/features/analytics/contracts";
import { getAnalyticsService } from "@/features/analytics/service";
import { getCurrentUser } from "@/features/auth/queries";
import { createLogger } from "@/lib/logging";

const log = createLogger("analytics.route");

const NO_STORE = { "Cache-Control": "no-store" } as const;

/**
 * Receives a page view or a ticket click from a public page.
 *
 * Public on purpose — visitors are anonymous. Nothing in the body is trusted:
 * it is parsed here, the service drops the owner's own visits, and the
 * database function checks the page is real and public before writing.
 *
 * Answers 204 for every handled outcome, including "not counted": a visitor's
 * browser has no use for the difference, and telling it apart would only
 * help someone probing which pages exist.
 */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    // Not JSON at all: the same answer as JSON of the wrong shape.
    return NextResponse.json({}, { status: 400, headers: NO_STORE });
  }

  const parsed = compiledAnalyticsHitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({}, { status: 400, headers: NO_STORE });
  }

  try {
    const viewer = await getCurrentUser();
    const service = await getAnalyticsService();
    await service.recordHit(viewer?.id ?? null, parsed.data);
  } catch (error) {
    log.error("Could not record an analytics hit.", error, {
      metric: parsed.data.metric,
      eventId: parsed.data.eventId,
    });
    return NextResponse.json({}, { status: 500, headers: NO_STORE });
  }

  return new NextResponse(null, { status: 204, headers: NO_STORE });
}

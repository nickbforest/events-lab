import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createEventsService,
  type EventsService,
} from "@/features/events/bll/events-service";
import { createSupabaseEventsRepository } from "@/features/events/dal/supabase-events-repository";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/** Lets a caller that already holds a request client avoid building a second. */
export function createEventsServiceFor(
  client: SupabaseClient<Database>,
): EventsService {
  return createEventsService(createSupabaseEventsRepository(client));
}

export async function getEventsService(): Promise<EventsService> {
  return createEventsServiceFor(await createClient());
}

/**
 * For reads that must work without a request context — static generation and
 * public pages. The select policies let the anon client see exactly what a
 * visitor would, so a draft stays invisible here too.
 */
export function getPublicEventsService(): EventsService {
  return createEventsServiceFor(createPublicClient());
}

import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createProfilesService,
  type ProfilesService,
} from "@/features/profiles/bll/profiles-service";
import { createSupabaseProfilesRepository } from "@/features/profiles/dal/supabase-profiles-repository";
import type { Database } from "@/lib/supabase/database.types";
import { createPublicClient } from "@/lib/supabase/public";
import { createClient } from "@/lib/supabase/server";

/** Lets a caller that already holds a request client avoid building a second. */
export function createProfilesServiceFor(
  client: SupabaseClient<Database>,
): ProfilesService {
  return createProfilesService(createSupabaseProfilesRepository(client));
}

export async function getProfilesService(): Promise<ProfilesService> {
  return createProfilesServiceFor(await createClient());
}

/**
 * For reads that must work without a request context — static generation and
 * public pages. Profiles are world-readable, so the anon client sees the same
 * rows a visitor would.
 */
export function getPublicProfilesService(): ProfilesService {
  return createProfilesServiceFor(createPublicClient());
}

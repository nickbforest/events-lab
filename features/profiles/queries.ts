import { CURRENT_USER, PROFILES } from "@/lib/mock-data";
import type { Profile } from "@/lib/types";

export async function getProfileByUsername(
  username: string,
): Promise<Profile | null> {
  return PROFILES.find((p) => p.username === username) ?? null;
}

export async function listProfileUsernames(): Promise<string[]> {
  return PROFILES.map((p) => p.username);
}

/**
 * The publisher the dashboard is currently acting as.
 *
 * Stands in for `requireUser()` reading the Supabase session. Until auth
 * exists the dashboard is pinned to a single placeholder publisher.
 */
export async function getCurrentProfile(): Promise<Profile> {
  return CURRENT_USER;
}

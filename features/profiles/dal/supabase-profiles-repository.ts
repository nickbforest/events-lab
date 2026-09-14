import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";

import type { ProfilesRepository } from "@/features/profiles/dal/profiles-repository";
import { DataAccessError } from "@/lib/errors";
import type { Database, Tables } from "@/lib/supabase/database.types";
import type { Profile } from "@/lib/types";

/**
 * `social_links` is jsonb, so the database type is `Json`. Parsing rather than
 * asserting keeps a hand-edited row from becoming a runtime crash in the UI.
 */
const socialLinksSchema = z
  .record(z.string(), z.string())
  .catch({} as Record<string, string>);

function toProfile(row: Tables<"profiles">): Profile {
  return {
    id: row.id,
    username: row.username,
    display_name: row.display_name,
    publisher_type: row.publisher_type,
    bio: row.bio,
    avatar_url: row.avatar_url,
    cover_url: row.cover_url,
    website_url: row.website_url,
    city: row.city,
    country_code: row.country_code,
    social_links: socialLinksSchema.parse(row.social_links),
  };
}

export function createSupabaseProfilesRepository(
  client: SupabaseClient<Database>,
): ProfilesRepository {
  return {
    async findById(id) {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to load profile by id.", error);
      }

      return data ? toProfile(data) : null;
    },

    async findByUsername(username) {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to load profile by username.", error);
      }

      return data ? toProfile(data) : null;
    },

    async isUsernameTaken(username) {
      const { count, error } = await client
        .from("profiles")
        .select("id", { count: "exact", head: true })
        .eq("username", username);

      if (error) {
        throw new DataAccessError("Failed to check username.", error);
      }

      return (count ?? 0) > 0;
    },

    async listProfiles() {
      const { data, error } = await client
        .from("profiles")
        .select("*")
        .order("username");

      if (error) {
        throw new DataAccessError("Failed to list profiles.", error);
      }

      return data.map(toProfile);
    },
  };
}

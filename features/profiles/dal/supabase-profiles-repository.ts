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

const MEDIA_BUCKET = "profile-media";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

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

    async update(id, patch) {
      // The `Users update their own profile` policy is the real boundary here:
      // a mismatched id matches no row rather than writing someone else's.
      const { data, error } = await client
        .from("profiles")
        .update(patch)
        .eq("id", id)
        .select("*")
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to update profile.", error);
      }

      if (!data) {
        throw new DataAccessError(
          "Profile update matched no row; the session may no longer own it.",
        );
      }

      return toProfile(data);
    },

    async uploadMedia(ownerId, kind, file) {
      // A fresh name per upload, never an overwrite: the public URL is cached
      // by browsers and the CDN, so reusing a path would keep serving the old
      // image after a replace.
      const extension = EXTENSION_BY_MIME[file.type] ?? "img";
      const path = `${ownerId}/${kind}-${crypto.randomUUID()}.${extension}`;

      const { error } = await client.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        throw new DataAccessError("Failed to upload profile media.", error);
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      return { path, publicUrl: data.publicUrl };
    },

    async setMediaUrl(ownerId, kind, url) {
      const { data, error } = await client
        .from("profiles")
        .update(kind === "avatar" ? { avatar_url: url } : { cover_url: url })
        .eq("id", ownerId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to save profile media.", error);
      }

      if (!data) {
        throw new DataAccessError(
          "Profile media update matched no row; the session may no longer own it.",
        );
      }

      return toProfile(data);
    },

    async removeMediaExcept(ownerId, kind, keepPath) {
      const bucket = client.storage.from(MEDIA_BUCKET);
      const { data: objects, error: listError } = await bucket.list(ownerId, {
        search: `${kind}-`,
      });

      if (listError) {
        throw new DataAccessError("Failed to list profile media.", listError);
      }

      const stale = objects
        .map((object) => `${ownerId}/${object.name}`)
        .filter(
          (path) => path !== keepPath && path.startsWith(`${ownerId}/${kind}-`),
        );

      if (stale.length === 0) {
        return;
      }

      const { error: removeError } = await bucket.remove(stale);
      if (removeError) {
        throw new DataAccessError(
          "Failed to remove replaced profile media.",
          removeError,
        );
      }
    },
  };
}

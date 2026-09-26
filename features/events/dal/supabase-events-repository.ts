import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  EventsRepository,
  EventVisibleListOptions,
  EventWriteRow,
  RelatedEventOptions,
} from "@/features/events/dal/events-repository";
import { DataAccessError } from "@/lib/errors";
import type { Database, Tables } from "@/lib/supabase/database.types";
import type {
  Category,
  EventRecord,
  EventStatus,
  EventWithRelations,
  Profile,
} from "@/lib/types";

const MEDIA_BUCKET = "event-media";

const EXTENSION_BY_MIME: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

/**
 * Cancelled and postponed events stay public on purpose — someone holding a
 * ticket needs to see that it was called off, not a 404. This mirrors the
 * `Visible events are publicly readable` policy; RLS is the real boundary and
 * this only keeps the owner's own drafts out of public lists.
 */
const PUBLIC_STATUSES = ["published", "cancelled", "postponed"] as const;

/**
 * One select for every read, so a row always arrives with the relations the
 * domain type promises. The embedded `tags` come back as nested objects and
 * are flattened to labels, which is all any surface renders today.
 */
const EVENT_SELECT = `
  *,
  owner:profiles!events_owner_id_fkey (*),
  category:categories!events_category_id_fkey (*),
  event_tags ( tags (*) )
` as const;

type EventRow = Tables<"events"> & {
  owner: Tables<"profiles">;
  category: Tables<"categories">;
  event_tags: { tags: Tables<"tags"> | null }[];
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
    social_links:
      row.social_links && typeof row.social_links === "object"
        ? (row.social_links as Record<string, string>)
        : {},
  };
}

function toCategory(row: Tables<"categories">): Category {
  return { id: row.id, slug: row.slug, label: row.label };
}

function toEventRecord(row: Tables<"events">, tags: string[]): EventRecord {
  return {
    id: row.id,
    owner_id: row.owner_id,
    slug: row.slug,
    title: row.title,
    short_description: row.short_description,
    description: row.description,
    category_id: row.category_id,
    event_type: row.event_type,
    status: row.status,
    start_at: row.start_at,
    end_at: row.end_at,
    timezone: row.timezone,
    venue_name: row.venue_name,
    address: row.address,
    city: row.city,
    country_code: row.country_code,
    latitude: row.latitude,
    longitude: row.longitude,
    online_url: row.online_url,
    is_free: row.is_free,
    price_info: row.price_info,
    ticket_url: row.ticket_url,
    ticket_cta_label: row.ticket_cta_label,
    external_url: row.external_url,
    cover_image_url: row.cover_image_url,
    published_at: row.published_at,
    tags,
  };
}

function tagLabels(row: EventRow): string[] {
  return row.event_tags
    .map((link) => link.tags?.label)
    .filter((label): label is string => Boolean(label))
    .sort((a, b) => a.localeCompare(b));
}

function toEventWithRelations(row: EventRow): EventWithRelations {
  return {
    ...toEventRecord(row, tagLabels(row)),
    owner: toProfile(row.owner),
    category: toCategory(row.category),
  };
}

/** The storage path inside the bucket, or null for a URL we did not write. */
function toStoragePath(publicUrl: string): string | null {
  const marker = `/${MEDIA_BUCKET}/`;
  const index = publicUrl.indexOf(marker);
  return index === -1 ? null : publicUrl.slice(index + marker.length);
}

export function createSupabaseEventsRepository(
  client: SupabaseClient<Database>,
): EventsRepository {
  async function findOwnerId(username: string): Promise<string | null> {
    const { data, error } = await client
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      throw new DataAccessError("Failed to resolve publisher.", error);
    }

    return data?.id ?? null;
  }

  return {
    async listCategories() {
      const { data, error } = await client
        .from("categories")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) {
        throw new DataAccessError("Failed to load categories.", error);
      }

      return data.map(toCategory);
    },

    async resolveTags(tags) {
      if (tags.length === 0) {
        return [];
      }

      // Upsert by slug so "Live Music" and "live-music" converge on one row.
      // `ignoreDuplicates` keeps the label a tag was first created with.
      const { data, error } = await client
        .from("tags")
        .upsert(
          tags.map((tag) => ({ slug: tag.slug, label: tag.label })),
          { onConflict: "slug", ignoreDuplicates: true },
        )
        .select("id, slug");

      if (error) {
        throw new DataAccessError("Failed to save tags.", error);
      }

      // Upsert returns only the rows it wrote, so existing tags are absent.
      const resolved = new Map(data.map((row) => [row.slug, row.id]));
      const missing = tags
        .map((tag) => tag.slug)
        .filter((slug) => !resolved.has(slug));

      if (missing.length > 0) {
        const { data: existing, error: lookupError } = await client
          .from("tags")
          .select("id, slug")
          .in("slug", missing);

        if (lookupError) {
          throw new DataAccessError("Failed to load tags.", lookupError);
        }

        for (const row of existing) {
          resolved.set(row.slug, row.id);
        }
      }

      return [...resolved.values()];
    },

    async findVisibleBySlug(username, slug) {
      const ownerId = await findOwnerId(username);
      if (!ownerId) {
        return null;
      }

      const { data, error } = await client
        .from("events")
        .select(EVENT_SELECT)
        .eq("owner_id", ownerId)
        .eq("slug", slug)
        .in("status", PUBLIC_STATUSES)
        .not("published_at", "is", null)
        .maybeSingle<EventRow>();

      if (error) {
        throw new DataAccessError("Failed to load event.", error);
      }

      return data ? toEventWithRelations(data) : null;
    },

    async listVisibleByUsername(
      username: string,
      options: EventVisibleListOptions,
    ) {
      const ownerId = await findOwnerId(username);
      if (!ownerId) {
        return [];
      }

      let query = client
        .from("events")
        .select(EVENT_SELECT)
        .eq("owner_id", ownerId)
        .in("status", PUBLIC_STATUSES)
        .not("published_at", "is", null);

      if (options.from) {
        query = query.gte("start_at", options.from);
      }
      if (options.until) {
        query = query.lt("start_at", options.until);
      }

      query = query.order("start_at", { ascending: options.order === "asc" });
      if (options.limit) {
        query = query.limit(options.limit);
      }

      const { data, error } = await query.returns<EventRow[]>();

      if (error) {
        throw new DataAccessError("Failed to load publisher events.", error);
      }

      return data.map(toEventWithRelations);
    },

    async listRelated(options: RelatedEventOptions) {
      const { data, error } = await client
        .from("events")
        .select(EVENT_SELECT)
        .in("status", PUBLIC_STATUSES)
        .not("published_at", "is", null)
        .neq("id", options.excludeId)
        .gte("start_at", options.from)
        .or(
          `category_id.eq.${options.categoryId},owner_id.eq.${options.ownerId}`,
        )
        .order("start_at", { ascending: true })
        .limit(options.limit)
        .returns<EventRow[]>();

      if (error) {
        throw new DataAccessError("Failed to load related events.", error);
      }

      return data.map(toEventWithRelations);
    },

    async listByOwner(ownerId) {
      const { data, error } = await client
        .from("events")
        .select(EVENT_SELECT)
        .eq("owner_id", ownerId)
        .order("start_at", { ascending: true })
        .returns<EventRow[]>();

      if (error) {
        throw new DataAccessError("Failed to load your events.", error);
      }

      return data.map(toEventWithRelations);
    },

    async findByIdForOwner(id, ownerId) {
      const { data, error } = await client
        .from("events")
        .select(EVENT_SELECT)
        .eq("id", id)
        .eq("owner_id", ownerId)
        .maybeSingle<EventRow>();

      if (error) {
        throw new DataAccessError("Failed to load event.", error);
      }

      return data ? toEventWithRelations(data) : null;
    },

    async countByOwnerStatus(ownerId) {
      const { data, error } = await client
        .from("events")
        .select("status")
        .eq("owner_id", ownerId);

      if (error) {
        throw new DataAccessError("Failed to count your events.", error);
      }

      const counts: Record<EventStatus, number> = {
        draft: 0,
        published: 0,
        cancelled: 0,
        postponed: 0,
        archived: 0,
      };

      for (const row of data) {
        counts[row.status] += 1;
      }
      return counts;
    },

    async slugExists(ownerId, slug, exceptEventId) {
      let query = client
        .from("events")
        .select("id", { count: "exact", head: true })
        .eq("owner_id", ownerId)
        .eq("slug", slug);

      if (exceptEventId) {
        query = query.neq("id", exceptEventId);
      }

      const { count, error } = await query;

      if (error) {
        throw new DataAccessError("Failed to check the event link.", error);
      }

      return (count ?? 0) > 0;
    },

    async insertEvent(
      ownerId: string,
      row: EventWriteRow,
      status: EventStatus,
      publishedAt: string | null,
    ) {
      // `owner_id` comes from the verified session, and the insert policy
      // rejects any other value, so a forged payload matches no row.
      const { data, error } = await client
        .from("events")
        .insert({
          ...row,
          owner_id: ownerId,
          status,
          published_at: publishedAt,
        })
        .select("*")
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to create the event.", error);
      }

      if (!data) {
        throw new DataAccessError("Event insert returned no row.");
      }

      return toEventRecord(data, []);
    },

    async updateEvent(id, ownerId, patch) {
      const { data, error } = await client
        .from("events")
        .update(patch)
        .eq("id", id)
        .eq("owner_id", ownerId)
        .select("*")
        .maybeSingle();

      if (error) {
        throw new DataAccessError("Failed to save the event.", error);
      }

      if (!data) {
        throw new DataAccessError(
          "Event update matched no row; the session may no longer own it.",
        );
      }

      return toEventRecord(data, []);
    },

    async deleteEvent(id, ownerId) {
      const { error } = await client
        .from("events")
        .delete()
        .eq("id", id)
        .eq("owner_id", ownerId);

      if (error) {
        throw new DataAccessError("Failed to delete the event.", error);
      }
    },

    async setEventTags(eventId, tagIds) {
      // Replace rather than diff: the set is at most ten rows, and a delete
      // plus an insert cannot leave a tag the publisher removed.
      const { error: clearError } = await client
        .from("event_tags")
        .delete()
        .eq("event_id", eventId);

      if (clearError) {
        throw new DataAccessError("Failed to clear event tags.", clearError);
      }

      if (tagIds.length === 0) {
        return;
      }

      const { error } = await client
        .from("event_tags")
        .insert(tagIds.map((tagId) => ({ event_id: eventId, tag_id: tagId })));

      if (error) {
        throw new DataAccessError("Failed to save event tags.", error);
      }
    },

    async uploadCoverImage(ownerId, file) {
      // A fresh name per upload, never an overwrite: the public URL is cached
      // by browsers and the CDN, so reusing a path would keep serving the old
      // image after a replace.
      const extension = EXTENSION_BY_MIME[file.type] ?? "img";
      const path = `${ownerId}/${crypto.randomUUID()}.${extension}`;

      const { error } = await client.storage
        .from(MEDIA_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: "31536000",
          upsert: false,
        });

      if (error) {
        throw new DataAccessError("Failed to upload the cover image.", error);
      }

      const { data } = client.storage.from(MEDIA_BUCKET).getPublicUrl(path);
      return data.publicUrl;
    },

    async removeCoverImage(url) {
      const path = toStoragePath(url);
      if (!path) {
        return;
      }

      const { error } = await client.storage.from(MEDIA_BUCKET).remove([path]);

      if (error) {
        throw new DataAccessError(
          "Failed to remove the replaced cover image.",
          error,
        );
      }
    },
  };
}

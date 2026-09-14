import { z } from "zod";

export const eventRouteParamsSchema = z.object({
  username: z.string().trim().min(1).max(64),
  slug: z.string().trim().min(1).max(160),
});

export const ownerIdSchema = z.string().trim().min(1).max(128);

export const relatedEventLimitSchema = z.number().int().positive().max(12);

export const usernameSchema = z.string().trim().min(1).max(64);

import { z } from "zod";

export const profileUsernameSchema = z.string().trim().min(1).max(64);

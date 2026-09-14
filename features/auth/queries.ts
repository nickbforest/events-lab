import "server-only";

import { redirect } from "next/navigation";
import { cache } from "react";

import type { AuthUser } from "@/features/auth/dal/auth-repository";
import { getAuthService } from "@/features/auth/service";

/**
 * Memoised for the render pass so a page, its layout, and any nested component
 * that needs the actor all share one call to the auth server.
 */
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  const service = await getAuthService();
  return service.getAuthenticatedUser();
});

/**
 * The authorization boundary for protected surfaces.
 *
 * This runs next to the data rather than in a layout on purpose: layouts do not
 * re-render on client-side navigation and do not stop nested segments from
 * rendering, so a check there would not actually gate anything.
 */
export const verifySession = cache(async (): Promise<AuthUser> => {
  const user = await getCurrentUser();
  if (!user) redirect("/auth?mode=login");
  return user;
});

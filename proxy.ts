import { type NextRequest, NextResponse } from "next/server";

import { createProxyClient, withAuthCookies } from "@/lib/supabase/proxy";

const PROTECTED_PREFIX = "/dashboard";
const AUTH_ENTRY_PATHS = new Set(["/auth", "/auth/check-email"]);

/**
 * Refreshes the Supabase session and performs an optimistic redirect.
 *
 * This is not the authorization boundary — it runs on prefetches and only
 * reflects cookie state. `verifySession()` next to the data is what actually
 * protects a route; this exists so unauthenticated users are bounced before
 * rendering rather than after.
 */
export async function proxy(request: NextRequest) {
  const { supabase, getResponse } = createProxyClient(request);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const response = getResponse();
  const { pathname } = request.nextUrl;

  if (!user && pathname.startsWith(PROTECTED_PREFIX)) {
    const target = request.nextUrl.clone();
    target.pathname = "/auth";
    target.search = "mode=login";
    return withAuthCookies(response, NextResponse.redirect(target));
  }

  if (user && AUTH_ENTRY_PATHS.has(pathname)) {
    const target = request.nextUrl.clone();
    target.pathname = "/dashboard";
    target.search = "";
    return withAuthCookies(response, NextResponse.redirect(target));
  }

  return response;
}

export const config = {
  // Auth cookies must refresh on ordinary navigations, but static assets and
  // the auth callback route handle themselves.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico)$).*)",
  ],
};

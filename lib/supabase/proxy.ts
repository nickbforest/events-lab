import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

import { getClientEnv } from "@/lib/env/client";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Request-scoped Supabase client for the proxy.
 *
 * Server Components cannot write cookies, so a token refreshed during
 * rendering would be thrown away. The proxy is the one place per request that
 * can persist rotated auth cookies, which is why session refresh lives here.
 */
export function createProxyClient(request: NextRequest) {
  let response = NextResponse.next({ request });

  const env = getClientEnv();
  const supabase = createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }

          response = NextResponse.next({ request });

          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  return {
    supabase,
    /** Read after awaiting Supabase so refreshed cookies are included. */
    getResponse: () => response,
  };
}

/** Carries refreshed auth cookies onto a redirect that replaces the response. */
export function withAuthCookies(
  source: NextResponse,
  target: NextResponse,
): NextResponse {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
  return target;
}

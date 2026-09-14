import "server-only";

import { createServerClient } from "@supabase/ssr";

import { getServerEnv } from "@/lib/env/server";
import type { Database } from "@/lib/supabase/database.types";

/**
 * Anonymous, cookie-free Supabase client for genuinely public reads.
 *
 * `cookies()` is unavailable during static generation, so anything running in
 * `generateStaticParams` or a statically rendered public page cannot use the
 * request-scoped client. This is strictly less privileged than that client —
 * it carries no session, so RLS sees it as `anon` and only rows with a public
 * select policy are visible.
 */
export function createPublicClient() {
  const env = getServerEnv();

  return createServerClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll: () => [],
        setAll: () => {},
      },
    },
  );
}

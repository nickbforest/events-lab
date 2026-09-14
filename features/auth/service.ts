import "server-only";

import {
  type AuthService,
  createAuthService,
} from "@/features/auth/bll/auth-service";
import { createSupabaseAuthRepository } from "@/features/auth/dal/supabase-auth-repository";
import { createProfilesServiceFor } from "@/features/profiles/service";
import { getClientEnv } from "@/lib/env/client";
import { createClient } from "@/lib/supabase/server";

export function authConfirmUrl(): string {
  return new URL(
    "/auth/confirm",
    getClientEnv().NEXT_PUBLIC_SITE_URL,
  ).toString();
}

export async function getAuthService(): Promise<AuthService> {
  const client = await createClient();

  return createAuthService({
    authRepository: createSupabaseAuthRepository(client),
    usernames: createProfilesServiceFor(client),
    urls: { confirmUrl: authConfirmUrl() },
  });
}

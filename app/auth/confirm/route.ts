import { type NextRequest, NextResponse } from "next/server";

import { emailConfirmationSchema } from "@/features/auth/contracts";
import { getAuthService } from "@/features/auth/service";

/**
 * Landing point for every emailed auth link. Supabase appends `token_hash` and
 * `type`; exchanging them here sets the session cookies on the redirect.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;

  const parsed = emailConfirmationSchema.safeParse({
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
  });

  if (!parsed.success) {
    return NextResponse.redirect(new URL("/auth/link-expired", request.url));
  }

  const service = await getAuthService();
  const outcome = await service.confirmEmail(
    parsed.data.tokenHash,
    parsed.data.type,
  );

  if (!outcome.ok) {
    return NextResponse.redirect(new URL("/auth/link-expired", request.url));
  }

  return NextResponse.redirect(
    new URL(
      outcome.type === "recovery" ? "/auth/update-password" : "/dashboard",
      request.url,
    ),
  );
}

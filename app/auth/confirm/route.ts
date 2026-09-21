import { type NextRequest, NextResponse } from "next/server";

import {
  authCodeSchema,
  emailConfirmationSchema,
} from "@/features/auth/contracts";
import { getAuthService } from "@/features/auth/service";

/**
 * Landing point for every emailed auth link; exchanging the link here sets the
 * session cookies on the redirect.
 *
 * Two link shapes arrive. Supabase's default templates append a PKCE `code`,
 * and the hosted project cannot edit its templates without custom SMTP. Custom
 * templates can instead send `token_hash` + `type`, which also works when the
 * link is opened on another device. Both are accepted so the templates can
 * change later without touching this route.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const expired = NextResponse.redirect(
    new URL("/auth/link-expired", request.url),
  );
  const service = await getAuthService();

  const codeLink = authCodeSchema.safeParse({ code: searchParams.get("code") });
  if (codeLink.success) {
    const outcome = await service.exchangeAuthCode(codeLink.data.code);
    if (!outcome.ok) return expired;

    return NextResponse.redirect(
      new URL(
        outcome.isRecovery ? "/auth/update-password" : "/dashboard",
        request.url,
      ),
    );
  }

  const tokenLink = emailConfirmationSchema.safeParse({
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
  });
  if (!tokenLink.success) return expired;

  const outcome = await service.confirmEmail(
    tokenLink.data.tokenHash,
    tokenLink.data.type,
  );
  if (!outcome.ok) return expired;

  const destination = {
    recovery: "/auth/update-password",
    email_change: "/dashboard/settings",
    signup: "/dashboard",
  }[outcome.type];

  return NextResponse.redirect(new URL(destination, request.url));
}

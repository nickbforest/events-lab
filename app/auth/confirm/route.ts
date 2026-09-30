import { type NextRequest, NextResponse } from "next/server";

import {
  authCodeSchema,
  emailConfirmationSchema,
} from "@/features/auth/contracts";
import {
  RECOVERY_COOKIE,
  recoveryCookieOptions,
} from "@/features/auth/recovery-marker";
import { getAuthService } from "@/features/auth/service";
import { createLogger } from "@/lib/logging";
import { routes } from "@/lib/routes";

const log = createLogger("auth.confirm");

/**
 * Landing point for every emailed auth link; exchanging the link here sets the
 * session cookies on the redirect.
 *
 * Two link shapes arrive. Supabase's default templates append a PKCE `code`,
 * and the hosted project cannot edit its templates without custom SMTP. Custom
 * templates can instead send `token_hash` + `type`, which also works when the
 * link is opened on another device. Both are accepted so the templates can
 * change later without touching this route.
 *
 * A password-reset link also leaves the recovery marker, the only thing that
 * lets `/auth/update-password` set a password without the current one.
 */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const to = (path: string) =>
    NextResponse.redirect(new URL(path, request.url));
  const service = await getAuthService();

  const codeLink = authCodeSchema.safeParse({ code: searchParams.get("code") });
  if (codeLink.success) {
    const outcome = await service.exchangeAuthCode(codeLink.data.code);
    if (!outcome.ok) {
      log.info("Email link was expired or reused.", { shape: "code" });
      return to(routes.auth.linkExpired());
    }

    return outcome.isRecovery
      ? toRecovery(to(routes.auth.updatePassword()), outcome.userId)
      : to(routes.dashboard.root());
  }

  const tokenLink = emailConfirmationSchema.safeParse({
    tokenHash: searchParams.get("token_hash"),
    type: searchParams.get("type"),
  });
  if (!tokenLink.success) {
    return to(routes.auth.linkExpired());
  }

  const outcome = await service.confirmEmail(
    tokenLink.data.tokenHash,
    tokenLink.data.type,
  );
  if (!outcome.ok) {
    log.info("Email link was expired or reused.", {
      shape: "token_hash",
      type: tokenLink.data.type,
    });
    return to(routes.auth.linkExpired());
  }

  switch (outcome.type) {
    case "recovery":
      return toRecovery(to(routes.auth.updatePassword()), outcome.userId);
    case "email_change":
      return to(routes.dashboard.settings());
    case "signup":
      return to(routes.dashboard.root());
  }
}

function toRecovery(response: NextResponse, userId: string): NextResponse {
  response.cookies.set(RECOVERY_COOKIE, userId, recoveryCookieOptions);
  return response;
}

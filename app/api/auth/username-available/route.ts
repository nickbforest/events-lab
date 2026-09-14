import { type NextRequest, NextResponse } from "next/server";

import { usernameAvailabilitySchema } from "@/features/auth/contracts";
import { isUsernameAvailable } from "@/features/profiles/queries";

/**
 * Public on purpose: usernames are public URLs, so availability reveals
 * nothing that visiting /u/:username would not. The unique constraint, not
 * this endpoint, is what actually prevents collisions.
 */
export async function GET(request: NextRequest) {
  const parsed = usernameAvailabilitySchema.safeParse({
    username: request.nextUrl.searchParams.get("username"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { available: false },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const available = await isUsernameAvailable(parsed.data.username);

  return NextResponse.json(
    { available },
    { headers: { "Cache-Control": "no-store" } },
  );
}

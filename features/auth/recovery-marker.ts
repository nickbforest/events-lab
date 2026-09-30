import "server-only";

import { cookies } from "next/headers";

/**
 * Proof that the current session came from a password-reset link.
 *
 * A reset link signs the person in; so does an ordinary login. Without a
 * marker, `/auth/update-password` could not tell them apart, and anyone at a
 * signed-in browser could set a new password without knowing the current
 * one. `/auth/confirm` sets this cookie only when it exchanges a recovery
 * link, holding the id of the account the link was for; the reset page and
 * action require it to match the signed-in user (see `updatePassword` in the
 * auth service).
 *
 * httpOnly, so page scripts cannot set or read it, and short-lived: long
 * enough to choose a password, short enough that a forgotten tab expires.
 */
export const RECOVERY_COOKIE = "el-recovery";

const RECOVERY_WINDOW_SECONDS = 15 * 60;

export const recoveryCookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/auth",
  maxAge: RECOVERY_WINDOW_SECONDS,
} as const;

/** The account id the marker was issued for, or null. */
export async function readRecoveryMarker(): Promise<string | null> {
  const store = await cookies();
  return store.get(RECOVERY_COOKIE)?.value ?? null;
}

/** Spent once the new password is set, so the link cannot be replayed. */
export async function clearRecoveryMarker(): Promise<void> {
  const store = await cookies();
  store.delete({ name: RECOVERY_COOKIE, path: recoveryCookieOptions.path });
}

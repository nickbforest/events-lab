/**
 * Temporary local-only authentication for development.
 *
 * There is no backend yet — see context/Architecture.md §24, which
 * specifies Supabase Auth as the real implementation. This module is the
 * single seam between the UI and "auth": every read/write goes through the
 * functions below, so replacing localStorage with real Supabase Auth later
 * means rewriting this file only, not the pages that call it.
 *
 * Passwords are stored in plaintext in localStorage. That is only
 * acceptable because this is disposable local-dev scaffolding, never
 * production data.
 */

export interface LocalAuthUser {
  name: string;
  email: string;
  password: string;
}

const USERS_KEY = "events-lab:auth:users";
const SESSION_KEY = "events-lab:auth:session";

function readUsers(): LocalAuthUser[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as LocalAuthUser[]) : [];
  } catch {
    return [];
  }
}

function writeUsers(users: LocalAuthUser[]) {
  window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export type RegisterResult = { ok: true } | { ok: false; error: string };

/**
 * Registers a new local user and immediately marks them as the logged-in
 * session, mirroring what a real sign-up call would do once it succeeds.
 */
export function register({
  name,
  email,
  password,
}: LocalAuthUser): RegisterResult {
  const trimmedName = name.trim();
  const normalizedEmail = email.trim().toLowerCase();

  if (!trimmedName || !normalizedEmail || !password) {
    return { ok: false, error: "Name, email, and password are all required." };
  }

  const users = readUsers();
  if (users.some((u) => u.email === normalizedEmail)) {
    return { ok: false, error: "An account with this email already exists." };
  }

  users.push({ name: trimmedName, email: normalizedEmail, password });
  writeUsers(users);
  window.localStorage.setItem(SESSION_KEY, normalizedEmail);

  return { ok: true };
}

export type LoginResult = { ok: true } | { ok: false; error: string };

/**
 * Checks the entered credentials against previously registered local users
 * and, on a match, marks that user as the logged-in session.
 */
export function login({
  email,
  password,
}: Pick<LocalAuthUser, "email" | "password">): LoginResult {
  const normalizedEmail = email.trim().toLowerCase();
  const users = readUsers();
  const match = users.find(
    (u) => u.email === normalizedEmail && u.password === password,
  );

  if (!match) {
    return { ok: false, error: "Invalid email or password" };
  }

  window.localStorage.setItem(SESSION_KEY, match.email);
  return { ok: true };
}

/** Clears the session only — registered accounts are left untouched. */
export function logout() {
  window.localStorage.removeItem(SESSION_KEY);
}

export type CurrentUser = Pick<LocalAuthUser, "name" | "email">;

/**
 * The signed-in local user, if any. Password is deliberately omitted —
 * nothing past login needs it, and this is the shape `supabase.auth.getUser()`
 * will eventually fill.
 */
export function getCurrentUser(): CurrentUser | null {
  if (typeof window === "undefined") return null;

  const email = window.localStorage.getItem(SESSION_KEY);
  if (!email) return null;

  const user = readUsers().find((u) => u.email === email);
  return user ? { name: user.name, email: user.email } : null;
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}

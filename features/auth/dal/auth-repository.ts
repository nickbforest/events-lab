/** The authenticated actor, reduced to what the application actually needs. */
export interface AuthUser {
  id: string;
  email: string | null;
  /** Drives the verification prompt; gates publishing from Phase 5 onward. */
  emailVerified: boolean;
}

export interface SignUpCommand {
  email: string;
  password: string;
  /** Read by the `handle_new_user` trigger to create the profile row. */
  username: string;
  displayName: string;
  emailRedirectTo: string;
}

export interface SignUpResult {
  user: AuthUser;
  /**
   * False when the project requires email confirmation, in which case no
   * session exists yet and the caller must send the user to check their inbox.
   */
  hasSession: boolean;
}

/**
 * Why a dedicated error type: the BLL decides what a user is told, but only
 * this layer can recognise a provider failure. Translating here keeps Supabase
 * specifics out of the business logic.
 */
export type AuthFailureReason =
  | "INVALID_CREDENTIALS"
  | "EMAIL_NOT_CONFIRMED"
  | "EMAIL_TAKEN"
  | "WEAK_PASSWORD"
  | "RATE_LIMITED"
  | "PROFILE_CREATION_FAILED"
  | "INVALID_TOKEN"
  | "UNKNOWN";

export class AuthProviderError extends Error {
  readonly reason: AuthFailureReason;

  constructor(reason: AuthFailureReason, message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "AuthProviderError";
    this.reason = reason;
  }
}

/**
 * Declared here rather than imported from the provider so the contract does
 * not leak Supabase's own union into the business layer.
 */
export type EmailConfirmationType = "signup" | "recovery" | "email_change";

export interface AuthRepository {
  signUp(command: SignUpCommand): Promise<SignUpResult>;
  /** Exchanges an emailed token for a session. */
  verifyEmailToken(
    tokenHash: string,
    type: EmailConfirmationType,
  ): Promise<void>;
  signInWithPassword(email: string, password: string): Promise<AuthUser>;
  signOut(): Promise<void>;
  /** Validates the session against the auth server; null when signed out. */
  getAuthenticatedUser(): Promise<AuthUser | null>;
  sendPasswordResetEmail(email: string, redirectTo: string): Promise<void>;
  resendConfirmationEmail(email: string, redirectTo: string): Promise<void>;
  updatePassword(password: string): Promise<void>;
}

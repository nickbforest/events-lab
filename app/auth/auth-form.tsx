"use client";

import { useSearchParams } from "next/navigation";

import { authModeSchema } from "@/features/auth/contracts";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

/**
 * The mode lives in the URL so entry points can deep-link straight to the form
 * they promise: header "Log in" -> ?mode=login, "Get started" -> ?mode=signup.
 * Deriving it rather than seeding state once means client-side navigation
 * between those links actually switches the form.
 */
export function AuthForm() {
  // Parsed, not compared: the value comes from the URL, and the schema is
  // the one place that decides what a missing or unknown mode falls back to.
  const mode = authModeSchema.parse(useSearchParams().get("mode"));

  return mode === "login" ? <LoginForm /> : <SignupForm />;
}

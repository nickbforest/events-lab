"use client";

import { useSearchParams } from "next/navigation";

import { LoginForm } from "./login-form";
import { SignupForm } from "./signup-form";

/**
 * The mode lives in the URL so entry points can deep-link straight to the form
 * they promise: header "Log in" -> ?mode=login, "Get started" -> ?mode=signup.
 * Deriving it rather than seeding state once means client-side navigation
 * between those links actually switches the form.
 */
export function AuthForm() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") === "login" ? "login" : "signup";

  return mode === "login" ? <LoginForm /> : <SignupForm />;
}

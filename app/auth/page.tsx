import { Suspense } from "react";

import { AuthForm } from "./auth-form";

export default function AuthPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-16">
      {/* AuthForm reads ?mode from the URL, so it needs a boundary here for the
          static shell of this route to prerender. */}
      <Suspense fallback={<div className="h-[560px] w-full max-w-sm" />}>
        <AuthForm />
      </Suspense>
    </main>
  );
}

import type { ReactNode } from "react";
import { AmbientBackground } from "@/components/ui/ambient-background";

export interface PublicShellProps {
  children: ReactNode;
}

/**
 * Wraps a public page — header, content and footer — so the soft violet wash
 * starts behind the floating header rather than below it.
 */
export function PublicShell({ children }: PublicShellProps) {
  return (
    <div className="relative isolate flex flex-1 flex-col">
      <AmbientBackground variant="soft" />
      {children}
    </div>
  );
}

"use client";

import { QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useState } from "react";

import { createQueryClient } from "@/lib/query/client";

export interface QueryProviderProps {
  children: ReactNode;
}

/**
 * Created in state rather than at module scope so each browser session gets one
 * client and server rendering never shares a cache between requests.
 */
export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState, type ReactNode } from "react";

const QUERY_CONFIG = {
  defaultStaleTime: 60_000, // 1 minute
  defaultGcTime: 300_000, // 5 minutes
  defaultRetry: 1,
} as const;

interface IQueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: IQueryProviderProps) => {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: QUERY_CONFIG.defaultStaleTime,
            gcTime: QUERY_CONFIG.defaultGcTime,
            refetchOnWindowFocus: false,
            refetchOnMount: false,
            refetchOnReconnect: false,
            retry: QUERY_CONFIG.defaultRetry,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  );
};

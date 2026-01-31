"use client";

import { type ReactNode } from "react";
import { QueryProvider } from "./QueryProvider";
import { ThemeProvider } from "./ThemeProvider";
import { Toaster } from "sonner";

interface IProvidersProps {
  children: ReactNode;
}

/**
 * Root providers wrapper - combines all app providers
 * Order matters: outer providers wrap inner providers
 * 
 * Provider hierarchy:
 * 1. QueryProvider - React Query for data fetching
 * 2. ThemeProvider - Theme context (light/dark mode)
 */
export const Providers = ({ children }: IProvidersProps) => {
  return (
    <QueryProvider>
      <ThemeProvider>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-background border border-border shadow-lg",
              title: "text-foreground font-semibold",
              description: "text-muted-foreground",
              actionButton: "bg-primary text-primary-foreground",
              cancelButton: "bg-muted text-muted-foreground",
            },
          }}
        />
      </ThemeProvider>
    </QueryProvider>
  );
};

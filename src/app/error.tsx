"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

interface IErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

const Error = ({ error, reset }: IErrorProps) => {
  useEffect(() => {
    // Log error to console in development
    console.error("Application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-6 px-4">
      <div className="flex flex-col items-center gap-2 text-center">
        <h2 className="text-h1 text-foreground">Something went wrong</h2>
        <p className="text-regular text-muted-foreground max-w-md">
          An unexpected error occurred. Please try again or contact support if
          the problem persists.
        </p>
        {process.env.NODE_ENV === "development" && (
          <pre className="mt-4 max-w-lg overflow-auto rounded-lg bg-muted p-4 text-sm">
            {error.message}
          </pre>
        )}
      </div>
      <div className="flex gap-3">
        <Button onClick={reset} variant="default">
          Try again
        </Button>
        <Button onClick={() => (window.location.href = "/")} variant="outline">
          Go home
        </Button>
      </div>
    </div>
  );
};

export default Error;

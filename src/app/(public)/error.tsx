"use client";

import { useEffect } from "react";
import { ErrorState, Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function PublicError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Public route error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 bg-cream">
      <div className="w-full max-w-md space-y-4">
        <ErrorState
          title="Page error"
          message="Something went wrong while loading this page. Please try again."
          onRetry={reset}
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go home
          </Button>
        </div>
      </div>
    </div>
  );
}

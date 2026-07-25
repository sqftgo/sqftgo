"use client";

import { useEffect } from "react";
import { ErrorState, Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DealerError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Dealer route error:", error);
  }, [error]);

  return (
    <div className="p-8 min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <ErrorState
        title="Dealer console error"
        message="We could not load this dealer page. Retry or go back to your dashboard."
        onRetry={reset}
      />
      <Button
        variant="outline"
        onClick={() => (window.location.href = "/dealer/dashboard")}
      >
        Dealer dashboard
      </Button>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { ErrorState, Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("ErrorBoundary caught error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden bg-cream">
      <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="relative z-10 w-full max-w-md space-y-4">
        <ErrorState
          title="Something Went Wrong"
          message="A connection issue occurred while fetching property records or RERA listings. Please try reloading the page."
          onRetry={reset}
        />
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => (window.location.href = "/")}>
            Go to Homepage
          </Button>
        </div>
      </div>
    </div>
  );
}

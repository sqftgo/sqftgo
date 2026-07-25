"use client";

import { useEffect } from "react";
import { ErrorState, Button } from "@/components/ui";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("Admin route error:", error);
  }, [error]);

  return (
    <div className="p-8 min-h-[50vh] flex flex-col items-center justify-center gap-4">
      <ErrorState
        title="Admin console error"
        message="Something went wrong loading this admin page. Try again or return to the dashboard."
        onRetry={reset}
      />
      <Button variant="outline" onClick={() => (window.location.href = "/admin")}>
        Back to admin home
      </Button>
    </div>
  );
}

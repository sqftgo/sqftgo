"use client";

import React from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn’t load this content. Please try again.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "w-full flex flex-col items-center justify-center text-center py-14 px-6 rounded-3xl bg-white border border-rose-100 shadow-sm max-w-xl mx-auto",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center mb-4">
        <AlertTriangle className="w-7 h-7" />
      </div>
      <h3 className="font-serif font-black text-xl text-indigo mb-2">{title}</h3>
      <p className="text-sm font-semibold text-charcoal/60 max-w-sm leading-relaxed mb-5">
        {message}
      </p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry} className="gap-2">
          <RefreshCw className="w-3.5 h-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

export default ErrorState;

"use client";

import React from "react";
import { cn } from "@/lib/cn";

export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin",
        className
      )}
      aria-hidden
    />
  );
}

export function GlobalLoading({
  label = "Loading…",
  fullPage = false,
}: {
  label?: string;
  fullPage?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 text-charcoal/50",
        fullPage ? "min-h-screen" : "min-h-[40vh]"
      )}
      role="status"
      aria-live="polite"
    >
      <LoadingSpinner />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

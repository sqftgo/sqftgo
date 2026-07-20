"use client";

import React from "react";
import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-sand/60", className)}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-charcoal/50"
      role="status"
      aria-live="polite"
    >
      <span className="w-8 h-8 border-2 border-terracotta border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

export function PropertyCardSkeleton() {
  return (
    <div className="rounded-2xl border border-sand bg-white overflow-hidden shadow-sm">
      <Skeleton className="aspect-video w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-6 w-1/3" />
      </div>
    </div>
  );
}

export default Skeleton;

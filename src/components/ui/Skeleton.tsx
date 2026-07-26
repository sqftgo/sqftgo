"use client";

import React from "react";
import { cn } from "@/lib/cn";
import { GlobalLoading } from "./Loading";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn("animate-pulse rounded-xl bg-sand/60", className)}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return <GlobalLoading label={label} />;
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

export function PropertyGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <PropertyCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default Skeleton;

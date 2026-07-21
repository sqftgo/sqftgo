"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type ProgressTone = "indigo" | "terracotta" | "success" | "warning" | "purple";

const fillTone: Record<ProgressTone, string> = {
  indigo: "bg-indigo",
  terracotta: "bg-terracotta",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  purple: "bg-purple-600",
};

export interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: ProgressTone;
  size?: "sm" | "md";
  className?: string;
  trackClassName?: string;
  /** Accessible label for screen readers. */
  label?: string;
}

export function ProgressBar({
  value,
  max = 100,
  tone = "terracotta",
  size = "md",
  className,
  trackClassName,
  label,
}: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, max === 0 ? 0 : (value / max) * 100));

  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label}
      className={cn(
        "w-full bg-sand/40 border border-indigo/5 rounded-full overflow-hidden",
        size === "sm" ? "h-1.5" : "h-2",
        trackClassName,
        className
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-300 ease-out", fillTone[tone])}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export default ProgressBar;

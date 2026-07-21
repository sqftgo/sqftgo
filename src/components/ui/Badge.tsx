"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "primary";

const toneClasses: Record<BadgeTone, string> = {
  success: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
  warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  danger: "bg-rose-500/10 text-rose-500 border-rose-500/20",
  info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  neutral: "bg-sand/40 text-charcoal/50 border-indigo/10",
  primary: "bg-indigo/5 text-indigo border-indigo/15",
};

const PROPERTY_STATUS_TONE: Record<string, BadgeTone> = {
  active: "success",
  pending: "warning",
  "pending review": "warning",
  "pending approval": "warning",
  completed: "neutral",
  sold: "info",
  rented: "primary",
  draft: "neutral",
  inactive: "danger",
  suspended: "danger",
  rejected: "danger",
  confirmed: "success",
};

export function toneFromStatus(status: string): BadgeTone {
  return PROPERTY_STATUS_TONE[status.toLowerCase().trim()] ?? "neutral";
}

export interface BadgeProps {
  children: React.ReactNode;
  tone?: BadgeTone;
  /** Maps common property/user statuses to tones when `tone` is omitted. */
  status?: string;
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  tone,
  status,
  size = "md",
  className,
}: BadgeProps) {
  const resolved = tone ?? (status ? toneFromStatus(status) : "neutral");

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-black uppercase border rounded-lg leading-none",
        size === "sm"
          ? "text-[8px] tracking-wider px-2 py-0.5"
          : "text-[9px] tracking-wider px-2 py-1",
        toneClasses[resolved],
        className
      )}
    >
      {children}
    </span>
  );
}

/** @deprecated Prefer `Badge` — alias kept for StatusBadge naming in call sites. */
export const StatusBadge = Badge;

export default Badge;

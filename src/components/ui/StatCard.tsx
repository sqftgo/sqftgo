"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  hint?: string;
  tone?: "default" | "terracotta" | "indigo" | "success" | "warning";
  className?: string;
}

const toneMap = {
  default: "bg-white border-indigo/10 text-indigo",
  terracotta: "bg-terracotta/5 border-terracotta/15 text-terracotta",
  indigo: "bg-indigo/5 border-indigo/15 text-indigo",
  success: "bg-emerald-50 border-emerald-100 text-emerald-700",
  warning: "bg-amber-50 border-amber-100 text-amber-700",
};

export function StatCard({
  label,
  value,
  icon,
  hint,
  tone = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md",
        toneMap[tone],
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-charcoal/45 mb-2">
            {label}
          </p>
          <p className="font-serif font-black text-2xl text-charcoal truncate">{value}</p>
          {hint && (
            <p className="text-[11px] font-semibold text-charcoal/45 mt-1.5">{hint}</p>
          )}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-white/80 border border-indigo/5 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export function KpiGrid({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 xl:grid-cols-4 gap-4", className)}>{children}</div>
  );
}

export default StatCard;

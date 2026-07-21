"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface SettingsRowProps {
  label: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  accent?: "indigo" | "terracotta";
  className?: string;
}

export function SettingsRow({
  label,
  description,
  icon,
  children,
  accent = "indigo",
  className,
}: SettingsRowProps) {
  const iconBox =
    accent === "terracotta"
      ? "bg-terracotta/5 text-terracotta"
      : "bg-indigo/5 text-indigo";

  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b border-indigo/5 last:border-b-0",
        className
      )}
    >
      <div className="flex items-start gap-3 min-w-0">
        {icon && (
          <div
            className={cn(
              "w-8 h-8 rounded-xl flex items-center justify-center shrink-0",
              iconBox
            )}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="text-xs font-bold text-charcoal">{label}</h3>
          {description && (
            <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5 leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>
      <div className="shrink-0 sm:pl-4">{children}</div>
    </div>
  );
}

export default SettingsRow;

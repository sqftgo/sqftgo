"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface PanelProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  actions?: React.ReactNode;
  padding?: "sm" | "md" | "lg" | "none";
  rounded?: "2xl" | "3xl";
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

export function Panel({
  children,
  title,
  description,
  actions,
  padding = "lg",
  rounded = "3xl",
  className,
  headerClassName,
  bodyClassName,
}: PanelProps) {
  const hasHeader = Boolean(title || description || actions);

  return (
    <div
      className={cn(
        "bg-white border border-indigo/10 shadow-sm",
        rounded === "3xl" ? "rounded-3xl" : "rounded-2xl",
        !hasHeader && paddingMap[padding],
        className
      )}
    >
      {hasHeader && (
        <div
          className={cn(
            "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-6 py-4 border-b border-indigo/5",
            headerClassName
          )}
        >
          <div className="min-w-0">
            {title && (
              <h2 className="text-sm font-black text-charcoal uppercase tracking-wider">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-[11px] font-semibold text-charcoal/45 mt-0.5">
                {description}
              </p>
            )}
          </div>
          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      )}
      <div className={cn(hasHeader && paddingMap[padding], bodyClassName)}>{children}</div>
    </div>
  );
}

export default Panel;

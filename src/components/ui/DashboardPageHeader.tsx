"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface DashboardPageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function DashboardPageHeader({
  title,
  description,
  actions,
  className,
}: DashboardPageHeaderProps) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-white border border-indigo/10 px-6 py-5 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4",
        className
      )}
    >
      <div className="min-w-0">
        <h1 className="font-serif font-black text-2xl text-indigo text-balance">{title}</h1>
        {description && (
          <p className="text-sm font-semibold text-charcoal/55 mt-1 max-w-2xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export default DashboardPageHeader;

"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type AdminCardAccent = "indigo" | "terracotta" | "gold" | "emerald" | "rose";

export interface AdminCardProps {
  children: React.ReactNode;
  /** Sand strip for actions / meta — visually separates from body */
  footer?: React.ReactNode;
  /** Optional top media band (image, cover) */
  media?: React.ReactNode;
  accent?: AdminCardAccent;
  interactive?: boolean;
  className?: string;
  bodyClassName?: string;
  footerClassName?: string;
}

const accentBar: Record<AdminCardAccent, string> = {
  indigo: "bg-indigo",
  terracotta: "bg-terracotta",
  gold: "bg-gold",
  emerald: "bg-emerald-500",
  rose: "bg-rose-500",
};

export function AdminCard({
  children,
  footer,
  media,
  accent = "indigo",
  interactive = true,
  className,
  bodyClassName,
  footerClassName,
}: AdminCardProps) {
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[1.35rem] bg-white",
        "shadow-[0_1px_2px_oklch(0_0_0/0.04),0_12px_28px_oklch(0.28_0.04_260/0.08)]",
        "transition-[transform,box-shadow] duration-300 ease-out",
        interactive &&
          "hover:-translate-y-1 hover:shadow-[0_1px_2px_oklch(0_0_0/0.04),0_22px_44px_oklch(0.28_0.04_260/0.14)]",
        className
      )}
    >
      {/* Left accent rail */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-y-0 left-0 w-[3px] opacity-90",
          accentBar[accent]
        )}
      />

      {media ? (
        <div className="relative shrink-0 overflow-hidden border-b border-indigo/5">
          {media}
          <div className="pointer-events-none absolute inset-0 shadow-[inset_0_0_0_1px_oklch(0_0_0/0.08)]" />
        </div>
      ) : null}

      <div className={cn("flex flex-1 flex-col gap-3 px-5 py-4 pl-6", bodyClassName)}>
        {children}
      </div>

      {footer ? (
        <div
          className={cn(
            "mt-auto flex flex-wrap items-center justify-between gap-3 border-t border-indigo/5 bg-sand/40 px-5 py-3 pl-6",
            footerClassName
          )}
        >
          {footer}
        </div>
      ) : null}
    </article>
  );
}

export default AdminCard;

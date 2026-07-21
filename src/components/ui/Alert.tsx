"use client";

import React from "react";
import { AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type AlertVariant = "success" | "warning" | "danger" | "info";

const variantStyles: Record<
  AlertVariant,
  { box: string; icon: string; title: string; body: string; Icon: typeof CheckCircle2 }
> = {
  success: {
    box: "bg-emerald-50 border-emerald-200",
    icon: "text-emerald-500",
    title: "text-emerald-800",
    body: "text-emerald-600",
    Icon: CheckCircle2,
  },
  warning: {
    box: "bg-amber-50 border-amber-200",
    icon: "text-amber-600",
    title: "text-amber-900",
    body: "text-amber-700",
    Icon: AlertTriangle,
  },
  danger: {
    box: "bg-rose-50 border-rose-200",
    icon: "text-rose-500",
    title: "text-rose-800",
    body: "text-rose-600",
    Icon: AlertTriangle,
  },
  info: {
    box: "bg-indigo/5 border-indigo/15",
    icon: "text-indigo",
    title: "text-indigo",
    body: "text-charcoal/60",
    Icon: Info,
  },
};

export interface AlertProps {
  variant?: AlertVariant;
  title: string;
  description?: string;
  onDismiss?: () => void;
  className?: string;
  children?: React.ReactNode;
}

export function Alert({
  variant = "success",
  title,
  description,
  onDismiss,
  className,
  children,
}: AlertProps) {
  const styles = variantStyles[variant];
  const Icon = styles.Icon;

  return (
    <div
      role="status"
      className={cn(
        "border rounded-2xl p-4 flex items-start gap-3",
        styles.box,
        className
      )}
    >
      <Icon className={cn("w-5 h-5 shrink-0 mt-0.5", styles.icon)} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className={cn("text-xs font-bold", styles.title)}>{title}</p>
        {description && (
          <p className={cn("text-[10px] font-semibold mt-0.5", styles.body)}>
            {description}
          </p>
        )}
        {children}
      </div>
      {onDismiss && (
        <button
          type="button"
          onClick={onDismiss}
          className={cn(
            "shrink-0 p-1 rounded-lg hover:bg-black/5 transition-colors cursor-pointer",
            styles.body
          )}
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

export default Alert;

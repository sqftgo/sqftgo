"use client";

import React from "react";
import { cn } from "@/lib/cn";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  size?: "sm" | "md";
  accent?: "indigo" | "terracotta";
  disabled?: boolean;
  id?: string;
  "aria-label"?: string;
  className?: string;
}

export function Switch({
  checked,
  onCheckedChange,
  size = "md",
  accent = "indigo",
  disabled = false,
  id,
  "aria-label": ariaLabel,
  className,
}: SwitchProps) {
  const onColor = accent === "terracotta" ? "bg-terracotta" : "bg-indigo";
  const focusRing =
    accent === "terracotta" ? "focus:ring-terracotta/25" : "focus:ring-indigo/25";

  return (
    <button
      type="button"
      role="switch"
      id={id}
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => !disabled && onCheckedChange(!checked)}
      className={cn(
        "relative rounded-full transition-colors duration-200 shrink-0 cursor-pointer focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed",
        size === "sm" ? "w-8 h-[18px]" : "w-11 h-6",
        checked ? onColor : "bg-sand",
        focusRing,
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute bg-white rounded-full shadow-sm transition-transform duration-200",
          size === "sm"
            ? cn("top-[2px] left-[2px] w-3.5 h-3.5", checked && "translate-x-3.5")
            : cn("top-0.5 left-0.5 w-5 h-5", checked && "translate-x-5")
        )}
      />
    </button>
  );
}

export default Switch;

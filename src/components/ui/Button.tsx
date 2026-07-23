"use client";

import React from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-terracotta hover:bg-terracotta-hover text-white shadow-md shadow-terracotta/15 disabled:bg-terracotta/50",
  secondary:
    "bg-indigo hover:bg-indigo-hover text-white shadow-md shadow-indigo/15 disabled:bg-indigo/50",
  outline:
    "border border-indigo/15 bg-white text-charcoal hover:bg-indigo/5 disabled:opacity-50",
  ghost: "text-charcoal/70 hover:bg-indigo/5 hover:text-indigo disabled:opacity-50",
  danger: "bg-rose-600 hover:bg-rose-500 text-white disabled:bg-rose-300",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-2 text-[10px]",
  md: "px-5 py-2.5 text-xs",
  lg: "px-6 py-3.5 text-xs",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  fullWidth = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      suppressHydrationWarning
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-[0.98] disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        className
      )}
      {...props}
    >
      {loading && (
        <span
          className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden
        />
      )}
      {children}
    </button>
  );
}

export default Button;

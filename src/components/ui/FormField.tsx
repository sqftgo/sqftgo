"use client";

import React, { useId } from "react";
import { cn } from "@/lib/cn";

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  className,
  children,
}: FormFieldProps) {
  const autoId = useId();
  const id = htmlFor ?? autoId;
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  const child = React.isValidElement(children)
    ? React.cloneElement(children as React.ReactElement<Record<string, unknown>>, {
        id,
        "aria-invalid": Boolean(error) || undefined,
        "aria-describedby": [hintId, errorId].filter(Boolean).join(" ") || undefined,
      })
    : children;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-xs font-bold text-indigo uppercase tracking-wide">
        {label}
        {required && <span className="text-terracotta ml-0.5">*</span>}
      </label>
      {child}
      {hint && !error && (
        <p id={hintId} className="text-[11px] font-medium text-charcoal/50">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} role="alert" className="text-[11px] font-semibold text-rose-600">
          {error}
        </p>
      )}
    </div>
  );
}

const inputBase =
  "w-full bg-sand/30 border border-indigo/10 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-charcoal placeholder:text-charcoal/35 focus:outline-none focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10 transition-colors disabled:opacity-60";

export interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export const TextInput = React.forwardRef<HTMLInputElement, TextInputProps>(
  ({ className, error, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(inputBase, error && "border-rose-400 focus:border-rose-400 focus:ring-rose-100", className)}
      {...props}
    />
  )
);
TextInput.displayName = "TextInput";

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ className, error, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        inputBase,
        "min-h-[100px] resize-y",
        error && "border-rose-400 focus:border-rose-400 focus:ring-rose-100",
        className
      )}
      {...props}
    />
  )
);
TextArea.displayName = "TextArea";

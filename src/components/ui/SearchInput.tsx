"use client";

import React from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/cn";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value?: string;
  onChange?: (value: string) => void;
  accent?: "indigo" | "terracotta";
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Search…",
  accent = "indigo",
  className,
  containerClassName,
  disabled,
  id,
  name,
  ...props
}: SearchInputProps) {
  const focusRing =
    accent === "terracotta"
      ? "focus:border-terracotta/50 focus:ring-2 focus:ring-terracotta/10"
      : "focus:border-indigo/35 focus:ring-2 focus:ring-indigo/10";

  return (
    <div className={cn("relative flex-1 min-w-[200px]", containerClassName)}>
      <Search
        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal/30 pointer-events-none"
        aria-hidden
      />
      <input
        type="search"
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange?.(e.target.value)}
        className={cn(
          "w-full bg-sand/35 border border-indigo/5 text-charcoal placeholder:text-charcoal/40 text-xs font-semibold px-4 py-2.5 pl-10 rounded-xl focus:outline-none transition-colors disabled:opacity-60",
          focusRing,
          className
        )}
        {...props}
      />
    </div>
  );
}

export default SearchInput;

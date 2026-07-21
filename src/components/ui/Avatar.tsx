"use client";

import React from "react";
import { cn } from "@/lib/cn";

export type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";
export type AvatarTone = "indigo" | "terracotta";
export type AvatarShape = "circle" | "rounded" | "square";

const sizeClasses: Record<AvatarSize, string> = {
  xs: "w-7 h-7 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-9 h-9 text-xs",
  lg: "w-11 h-11 text-sm",
  xl: "w-20 h-20 text-3xl font-serif",
};

const shapeClasses: Record<AvatarShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-2xl",
  square: "rounded-lg",
};

const toneClasses: Record<AvatarTone, string> = {
  indigo: "bg-indigo/10 text-indigo border-indigo/15",
  terracotta: "bg-terracotta/5 text-terracotta border-terracotta/15",
};

export interface AvatarProps {
  name?: string;
  src?: string | null;
  size?: AvatarSize;
  tone?: AvatarTone;
  shape?: AvatarShape;
  className?: string;
  alt?: string;
}

function initialsFrom(name?: string): string {
  if (!name?.trim()) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function Avatar({
  name,
  src,
  size = "md",
  tone = "indigo",
  shape = "circle",
  className,
  alt,
}: AvatarProps) {
  const initials = initialsFrom(name);

  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? name ?? "Avatar"}
        className={cn(
          "object-cover border shrink-0",
          sizeClasses[size],
          shapeClasses[shape],
          className
        )}
      />
    );
  }

  return (
    <div
      title={name}
      className={cn(
        "flex items-center justify-center font-black border shrink-0",
        sizeClasses[size],
        shapeClasses[shape],
        toneClasses[tone],
        className
      )}
    >
      {initials}
    </div>
  );
}

export default Avatar;

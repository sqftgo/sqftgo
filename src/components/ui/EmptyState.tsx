"use client";

import React from "react";
import { HelpCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
  children,
}) => {
  return (
    <div
      role="status"
      className="w-full flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl bg-cream/80 border border-sand shadow-sm max-w-xl mx-auto relative overflow-hidden"
    >
      {/* Decorative Blur Elements */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-terracotta/5 rounded-full blur-[40px] pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-white border border-sand shadow-sm text-terracotta flex items-center justify-center mb-5 relative z-10">
        {icon || <HelpCircle className="w-8 h-8" />}
      </div>

      {/* Title */}
      <h3 className="font-serif font-black text-2xl text-indigo mb-2 relative z-10">{title}</h3>

      {/* Description */}
      <p className="text-sm font-semibold text-charcoal/60 max-w-sm leading-relaxed mb-6 relative z-10">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-6 py-2.5 bg-terracotta hover:bg-terracotta/90 text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md transition-all duration-200 relative z-10"
        >
          {actionLabel}
        </button>
      )}
      {children && <div className="relative z-10">{children}</div>}
    </div>
  );
};
export default EmptyState;

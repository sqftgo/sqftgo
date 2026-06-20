"use client";

import React from "react";
import { Info, HelpCircle } from "lucide-react";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center text-center py-16 px-6 rounded-3xl glassmorphism border border-slate-100 dark:border-slate-800 shadow-sm max-w-xl mx-auto">
      {/* Icon */}
      <div className="w-16 h-16 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 dark:text-blue-400 flex items-center justify-center mb-5 shadow-inner">
        {icon || <HelpCircle className="w-8 h-8" />}
      </div>

      {/* Title */}
      <h3 className="font-extrabold text-lg text-slate-950 dark:text-white mb-2">{title}</h3>

      {/* Description */}
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed mb-6">
        {description}
      </p>

      {/* Action Button */}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl shadow-md transition-all duration-200"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
export default EmptyState;

"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";

export interface DropdownMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  href?: string;
  target?: string;
  variant?: "default" | "danger" | "success" | "primary";
  disabled?: boolean;
  dividerBefore?: boolean;
  badge?: string | number;
}

interface DropdownMenuProps {
  trigger: React.ReactNode;
  items: DropdownMenuItem[];
  align?: "left" | "right";
  placement?: "bottom" | "top";
  className?: string;
  menuClassName?: string;
  accent?: "indigo" | "terracotta";
  closeOnSelect?: boolean;
}

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  placement = "bottom",
  className = "",
  menuClassName = "",
  accent = "indigo",
  closeOnSelect = true,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  const handleItemSelect = (
    item: DropdownMenuItem,
    e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>
  ) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    if (item.onClick) {
      item.onClick(e as React.MouseEvent<HTMLButtonElement>);
    }
    if (closeOnSelect) {
      setIsOpen(false);
    }
  };

  // Determine active highlight classes based on accent
  const highlightClasses = {
    indigo: "hover:bg-indigo/5 hover:text-indigo focus:bg-indigo/5 focus:text-indigo",
    terracotta: "hover:bg-terracotta/5 hover:text-terracotta focus:bg-terracotta/5 focus:text-terracotta",
  };

  const activeAccent = highlightClasses[accent] || highlightClasses.indigo;

  return (
    <div className={cn("relative inline-block text-left", className)} ref={containerRef}>
      {/* Trigger Button wrapping child */}
      <div 
        onClick={toggleMenu} 
        className="cursor-pointer inline-flex items-center justify-center focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: placement === "bottom" ? -10 : 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: placement === "bottom" ? -10 : 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className={cn(
              "absolute z-[100] min-w-48 bg-white border border-indigo/10 rounded-2xl p-1.5 shadow-xl flex flex-col",
              placement === "bottom" ? "top-[calc(100%+8px)]" : "bottom-[calc(100%+8px)]",
              align === "right" ? "right-0" : "left-0",
              menuClassName
            )}
            role="menu"
            aria-orientation="vertical"
          >
            {items.map((item) => {
              const Icon = item.icon;
              const isDanger = item.variant === "danger";
              const isSuccess = item.variant === "success";
              const isPrimary = item.variant === "primary";

              const itemContent = (
                <>
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    {Icon && (
                      <Icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-colors",
                          item.disabled ? "text-charcoal/20" : 
                          isDanger ? "text-rose-500" :
                          isSuccess ? "text-emerald-500" :
                          isPrimary ? (accent === "indigo" ? "text-indigo" : "text-terracotta") :
                          "text-charcoal/40 group-hover:text-charcoal"
                        )}
                      />
                    )}
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={cn(
                        "text-[9px] font-black px-2 py-0.5 rounded-full leading-none ml-2 shrink-0 border",
                        isDanger ? "bg-rose-50 border-rose-100 text-rose-600" :
                        isSuccess ? "bg-emerald-50 border-emerald-100 text-emerald-600" :
                        accent === "indigo" 
                          ? "bg-indigo/5 border-indigo/10 text-indigo" 
                          : "bg-terracotta/5 border-terracotta/10 text-terracotta"
                      )}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              );

              const btnClass = cn(
                "w-full text-left px-3 py-2 text-xs font-semibold rounded-xl flex items-center justify-between transition-all group focus:outline-none",
                item.disabled ? "text-charcoal/30 cursor-not-allowed opacity-50" :
                isDanger ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700" :
                isSuccess ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700" :
                isPrimary 
                  ? (accent === "indigo" ? "text-indigo bg-indigo/5 hover:bg-indigo/10" : "text-terracotta bg-terracotta/5 hover:bg-terracotta/10")
                  : cn("text-charcoal/80", activeAccent)
              );

              return (
                <React.Fragment key={item.id}>
                  {item.dividerBefore && <div className="h-px bg-indigo/5 my-1 mx-1" />}
                  {item.href && !item.disabled ? (
                    <Link
                      href={item.href}
                      target={item.target}
                      onClick={(e) => handleItemSelect(item, e)}
                      className={btnClass}
                      role="menuitem"
                    >
                      {itemContent}
                    </Link>
                  ) : (
                    <button
                      type="button"
                      disabled={item.disabled}
                      onClick={(e) => handleItemSelect(item, e)}
                      className={btnClass}
                      role="menuitem"
                    >
                      {itemContent}
                    </button>
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default DropdownMenu;

"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
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
  placement?: "bottom" | "top" | "auto";
  className?: string;
  menuClassName?: string;
  accent?: "indigo" | "terracotta";
  closeOnSelect?: boolean;
}

type MenuCoords = {
  top: number;
  left: number;
  placement: "bottom" | "top";
};

export function DropdownMenu({
  trigger,
  items,
  align = "right",
  placement = "auto",
  className = "",
  menuClassName = "",
  accent = "indigo",
  closeOnSelect = true,
}: DropdownMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<MenuCoords | null>(null);
  const [mounted, setMounted] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const updatePosition = () => {
    const triggerEl = triggerRef.current;
    if (!triggerEl) return;

    const rect = triggerEl.getBoundingClientRect();
    const menuEl = menuRef.current;
    const menuWidth = menuEl?.offsetWidth ?? 192;
    const menuHeight = menuEl?.offsetHeight ?? 220;
    const gap = 8;
    const padding = 8;

    let nextPlacement: "bottom" | "top" =
      placement === "auto" ? "bottom" : placement;

    if (placement === "auto") {
      const spaceBelow = window.innerHeight - rect.bottom - gap;
      const spaceAbove = rect.top - gap;
      nextPlacement =
        spaceBelow < menuHeight && spaceAbove > spaceBelow ? "top" : "bottom";
    }

    let top =
      nextPlacement === "bottom" ? rect.bottom + gap : rect.top - gap - menuHeight;
    let left = align === "right" ? rect.right - menuWidth : rect.left;

    left = Math.min(Math.max(padding, left), window.innerWidth - menuWidth - padding);
    top = Math.min(Math.max(padding, top), window.innerHeight - menuHeight - padding);

    setCoords({ top, left, placement: nextPlacement });
  };

  useLayoutEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const onReposition = () => updatePosition();
    window.addEventListener("resize", onReposition);
    window.addEventListener("scroll", onReposition, true);
    return () => {
      window.removeEventListener("resize", onReposition);
      window.removeEventListener("scroll", onReposition, true);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reposition when open/items change
  }, [isOpen, items.length, align, placement]);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      const target = event.target as Node;
      if (triggerRef.current?.contains(target)) return;
      if (menuRef.current?.contains(target)) return;
      setIsOpen(false);
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((open) => {
      const next = !open;
      if (next && triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const approxWidth = 192;
        setCoords({
          top: rect.bottom + 8,
          left:
            align === "right"
              ? Math.max(8, rect.right - approxWidth)
              : rect.left,
          placement: "bottom",
        });
      }
      if (!next) setCoords(null);
      return next;
    });
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

  const highlightClasses = {
    indigo: "hover:bg-indigo/5 hover:text-indigo focus:bg-indigo/5 focus:text-indigo",
    terracotta:
      "hover:bg-terracotta/5 hover:text-terracotta focus:bg-terracotta/5 focus:text-terracotta",
  };
  const activeAccent = highlightClasses[accent] || highlightClasses.indigo;

  const menu = (
    <AnimatePresence>
      {isOpen && coords && (
        <motion.div
          ref={menuRef}
          initial={{
            opacity: 0,
            y: coords.placement === "bottom" ? -8 : 8,
            scale: 0.96,
          }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{
            opacity: 0,
            y: coords.placement === "bottom" ? -8 : 8,
            scale: 0.96,
          }}
          transition={{ duration: 0.15, ease: "easeOut" }}
          style={{ position: "fixed", top: coords.top, left: coords.left }}
          className={cn(
            "z-[9999] min-w-48 bg-white border border-indigo/10 rounded-2xl p-1.5 shadow-xl flex flex-col",
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
                        item.disabled
                          ? "text-charcoal/20"
                          : isDanger
                            ? "text-rose-500"
                            : isSuccess
                              ? "text-emerald-500"
                              : isPrimary
                                ? accent === "indigo"
                                  ? "text-indigo"
                                  : "text-terracotta"
                                : "text-charcoal/40 group-hover:text-charcoal"
                      )}
                    />
                  )}
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={cn(
                      "text-[9px] font-black px-2 py-0.5 rounded-full leading-none ml-2 shrink-0 border",
                      isDanger
                        ? "bg-rose-50 border-rose-100 text-rose-600"
                        : isSuccess
                          ? "bg-emerald-50 border-emerald-100 text-emerald-600"
                          : accent === "indigo"
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
              item.disabled
                ? "text-charcoal/30 cursor-not-allowed opacity-50"
                : isDanger
                  ? "text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                  : isSuccess
                    ? "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    : isPrimary
                      ? accent === "indigo"
                        ? "text-indigo bg-indigo/5 hover:bg-indigo/10"
                        : "text-terracotta bg-terracotta/5 hover:bg-terracotta/10"
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
  );

  return (
    <div className={cn("relative inline-block text-left", className)}>
      <div
        ref={triggerRef}
        onClick={toggleMenu}
        className="cursor-pointer inline-flex items-center justify-center focus:outline-none"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {trigger}
      </div>
      {mounted ? createPortal(menu, document.body) : null}
    </div>
  );
}

export default DropdownMenu;

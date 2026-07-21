"use client";

import React, { useEffect } from "react";
import { X, AlertTriangle } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "./Button";
import { cn } from "@/lib/cn";

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  /** Visual tone for the header icon strip when provided via ConfirmDialog. */
  tone?: "default" | "warning" | "danger";
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  tone = "default",
}: DialogProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const toneBorder =
    tone === "danger"
      ? "border-rose-500/25"
      : tone === "warning"
        ? "border-amber-500/25"
        : "border-indigo/10";

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.button
            type="button"
            aria-label="Close dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-charcoal/40 backdrop-blur-[2px] cursor-pointer border-0"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? "dialog-title" : undefined}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className={cn(
              "relative w-full max-w-md bg-white border rounded-3xl p-6 shadow-2xl",
              toneBorder,
              className
            )}
          >
            {(title || description) && (
              <div className="flex items-start gap-3 mb-4">
                {tone !== "default" && (
                  <div
                    className={cn(
                      "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0",
                      tone === "danger"
                        ? "bg-rose-100 text-rose-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    <AlertTriangle className="w-5 h-5" aria-hidden />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  {title && (
                    <h2
                      id="dialog-title"
                      className="font-serif font-black text-lg text-charcoal text-balance"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p className="text-xs font-semibold text-charcoal/55 mt-1 leading-relaxed">
                      {description}
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1.5 rounded-xl text-charcoal/40 hover:bg-indigo/5 hover:text-charcoal transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            {children}
            {footer && <div className="mt-5 flex items-center justify-end gap-2">{footer}</div>}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "warning" | "danger";
  loading?: boolean;
  children?: React.ReactNode;
}

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  tone = "warning",
  loading = false,
  children,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      tone={tone}
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === "danger" ? "danger" : "primary"}
            size="sm"
            loading={loading}
            onClick={onConfirm}
            className={
              tone === "warning"
                ? "bg-amber-600 hover:bg-amber-700 shadow-amber-600/15"
                : undefined
            }
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Dialog>
  );
}

export default Dialog;

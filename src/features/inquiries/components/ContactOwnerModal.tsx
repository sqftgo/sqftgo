"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Property } from "@/types";
import { InquiryForm } from "./InquiryForm";

interface ContactOwnerModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export function ContactOwnerModal({
  property,
  open,
  onClose,
}: ContactOwnerModalProps) {
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    };
  }, []);

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

  const handleInquirySuccess = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    // Brief success moment, then slow fade-out
    closeTimer.current = setTimeout(() => {
      onClose();
    }, 1100);
  };

  return (
    <AnimatePresence>
      {open && property ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6">
          <motion.button
            type="button"
            aria-label="Close contact dialog"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="absolute inset-0 bg-charcoal/50 backdrop-blur-[3px] cursor-pointer border-0"
            onClick={onClose}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Contact owner for ${property.title}`}
            initial={{ opacity: 0, scale: 0.72, y: 28, filter: "blur(8px)" }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              filter: "blur(0px)",
              transition: {
                type: "spring",
                stiffness: 280,
                damping: 22,
                mass: 0.85,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.88,
              y: 16,
              filter: "blur(6px)",
              transition: { duration: 0.55, ease: [0.4, 0, 0.2, 1] },
            }}
            className="relative z-10 w-full max-w-md max-h-[90vh] overflow-y-auto no-scrollbar rounded-3xl shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute top-3 right-3 z-20 p-2 rounded-full bg-white/90 border border-sand text-charcoal/70 hover:text-terracotta hover:bg-cream shadow-sm transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="px-5 pt-5 pb-2 border-b border-sand/50 bg-cream rounded-t-3xl">
              <p className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">
                Contact Owner
              </p>
              <h2 className="font-serif font-black text-indigo text-lg mt-0.5 line-clamp-1 pr-10">
                {property.title}
              </h2>
              <p className="text-xs font-semibold text-charcoal/55 mt-0.5">
                {property.locality}, {property.city}
              </p>
            </div>

            <InquiryForm property={property} onSuccess={handleInquirySuccess} />
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default ContactOwnerModal;

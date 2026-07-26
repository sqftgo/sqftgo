"use client";

import React, { useState } from "react";
import type { Property } from "@/types";
import { InquiryForm } from "@/features/inquiries";
import { VisitBookingForm } from "@/features/visits";
import { formatIndianCurrency } from "@/lib/format";
import { Phone, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyDetailSidebarProps {
  property: Property;
}

/** Desktop sticky inquiry/visit forms (grid column). */
export function PropertyDetailSidebar({ property }: PropertyDetailSidebarProps) {
  return (
    <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28 space-y-5">
      <InquiryForm property={property} />
      <VisitBookingForm property={property} />
    </div>
  );
}

/** Mobile contact bar + slide-up drawer (outside the detail grid). */
export function PropertyDetailMobileContact({ property }: PropertyDetailSidebarProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  return (
    <>
      {/* Persistent Bottom Contact Bar (Mobile/Tablet Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sand/75 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-5 py-4 flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest leading-none">Estimated Price</span>
          <span className="text-lg font-serif font-black text-terracotta mt-1 leading-none">
            {formatIndianCurrency(property.price, property.purpose)}
          </span>
        </div>
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md flex items-center gap-2 active:scale-97 transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>Contact Owner</span>
        </button>
      </div>

      {/* Mobile/Tablet Slide-Up Inquiry Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm lg:hidden animate-fade-in"
            />
            {/* Slide-Up container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-cream border-t border-sand rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:hidden no-scrollbar"
            >
              {/* Grab bar */}
              <div className="w-12 h-1 bg-charcoal/10 rounded-full mx-auto my-3" />
              
              {/* Header */}
              <div className="px-6 pb-2.5 flex items-center justify-between border-b border-sand/40">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Property Inquiry</span>
                  <span className="font-serif font-black text-indigo text-base truncate max-w-[200px] mt-0.5">
                    {property.title}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Embedded Inquiry Form */}
              <div className="p-1 space-y-4">
                <InquiryForm property={property} />
                <VisitBookingForm property={property} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

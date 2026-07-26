"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

/** Preserves original shortlist toast state/handlers (toast trigger was unused in JSX). */
export function HomeShortlistToast() {
  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  const handleShortlist = () => {
    setShortlistedCount((prev) => prev + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  void handleShortlist;

  return (
    <>
      {/* Shortlist Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className="fixed top-20 right-6 md:top-auto md:bottom-6 md:right-6 z-50 bg-indigo text-white px-5 py-3 rounded-2xl shadow-2xl border border-sand/20 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
              ★
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold font-sans">Added to Shortlist!</span>
              <span className="text-[10px] text-white/60 font-semibold">{shortlistedCount} properties saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

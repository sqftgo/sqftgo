"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { motion } from "framer-motion";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    console.error("ErrorBoundary caught error:", error);
  }, [error]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden bg-cream">
      {/* Decorative Blur Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-red-500/5 rounded-full blur-[80px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo/5 rounded-full blur-[80px] pointer-events-none animate-sway-slow" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glassmorphism p-8 md:p-10 rounded-3xl border border-red-500/10 shadow-2xl relative z-10 flex flex-col items-center"
      >
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-600 flex items-center justify-center mb-6 shadow-inner">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-serif font-black text-indigo mb-3">Something Went Wrong</h2>
        
        <p className="text-sm font-semibold text-charcoal/60 leading-relaxed mb-8">
          A connection issue occurred while fetching property records or RERA listings. Please try reloading the page.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <button
            onClick={() => reset()}
            className="w-full py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          
          <button
            onClick={() => window.location.href = "/"}
            className="w-full py-3 border border-sand bg-white text-charcoal hover:bg-sand/30 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer"
          >
            Go to Homepage
          </button>
        </div>
      </motion.div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20 relative overflow-hidden bg-cream">
      {/* Decorative Blur Elements */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none animate-float-slow" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo/5 rounded-full blur-[80px] pointer-events-none animate-sway-slow" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full glassmorphism p-8 md:p-10 rounded-3xl border border-sand shadow-2xl relative z-10 flex flex-col items-center"
      >
        {/* Heritage Arch Shape for Icon */}
        <div className="w-20 h-24 heritage-arch-double bg-white flex items-center justify-center text-terracotta mb-6 shadow-md">
          <Compass className="w-10 h-10 animate-spin-slow text-terracotta" />
        </div>

        <h1 className="text-6xl font-sans font-black text-indigo tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-serif font-black text-indigo mb-4">Route Lost in the Desert</h2>
        
        <p className="text-sm font-semibold text-charcoal/60 leading-relaxed mb-8">
          The heritage gate or dynamic search page you are looking for has been relocated or is under RERA vetting review.
        </p>

        <div className="flex flex-col gap-3 w-full">
          <Link
            href="/"
            className="w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-md hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
          >
            <span>Return to Homepage</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          
          <Link
            href="/listings"
            className="w-full py-3 border border-sand bg-white text-charcoal hover:bg-sand/30 font-bold text-sm rounded-xl transition-all duration-200 cursor-pointer"
          >
            Browse Verified Properties
          </Link>
        </div>
      </motion.div>
    </div>
  );
}

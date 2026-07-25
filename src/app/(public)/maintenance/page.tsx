"use client";

import React from "react";
import Link from "next/link";

export default function MaintenancePage() {
  return (
    <main className="min-h-screen bg-cream flex items-center justify-center px-6">
      <div className="max-w-lg w-full text-center space-y-4">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terracotta">
          SqftGo
        </p>
        <h1 className="text-3xl font-serif font-black text-charcoal">
          Marketplace under maintenance
        </h1>
        <p className="text-sm font-semibold text-charcoal/55 leading-relaxed">
          We are performing scheduled work. Public browsing is temporarily
          unavailable. Admins can still sign in to the console.
        </p>
        <Link
          href="/login"
          className="inline-flex px-5 py-3 rounded-xl bg-indigo text-white text-xs font-bold uppercase tracking-wider"
        >
          Admin / account login
        </Link>
      </div>
    </main>
  );
}

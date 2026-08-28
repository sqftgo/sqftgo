"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { useApp } from "@/context/AppContext";

/** Floating Post Property CTA for logged-in normal users (replaces Plan Your Dream). */
export default function PostPropertyButton() {
  const pathname = usePathname();
  const { isLoggedIn, userRole, sessionReady } = useApp();

  const isDashboardRoute =
    pathname.startsWith("/dealer/") || pathname.startsWith("/admin");
  const isPostProperty = pathname.startsWith("/post-property");
  const show =
    sessionReady &&
    isLoggedIn &&
    userRole === "user" &&
    !isDashboardRoute &&
    !isPostProperty;

  if (!show) return null;

  return (
    <Link
      href="/post-property"
      className="fixed bottom-24 right-6 z-40 md:bottom-8 md:right-8 flex items-center gap-2 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white px-4 py-3 shadow-xl border border-white/10 transition-transform hover:-translate-y-0.5"
      aria-label="Post your property"
    >
      <Plus className="w-4 h-4" />
      <span className="text-xs font-black uppercase tracking-wider hidden sm:inline">
        Post Property
      </span>
    </Link>
  );
}

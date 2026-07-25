"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCompareArrows, X } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui";

/** Sticky compare tray when 2+ properties are selected (hidden on /compare itself). */
export function CompareBar() {
  const pathname = usePathname();
  const { compareList, setCompareList, properties } = useApp();

  if (pathname.startsWith("/compare") || pathname.startsWith("/admin") || pathname.startsWith("/dealer")) {
    return null;
  }
  if (compareList.length < 2) return null;

  const previews = compareList
    .map((id) => properties.find((p) => p.id === id))
    .filter(Boolean)
    .slice(0, 4);

  return (
    <div className="fixed bottom-4 inset-x-4 z-40 mx-auto max-w-3xl">
      <div className="flex items-center gap-3 rounded-2xl border border-indigo/15 bg-white/95 px-4 py-3 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <GitCompareArrows className="w-4 h-4 text-indigo shrink-0" />
          <p className="text-xs font-bold text-charcoal truncate">
            {compareList.length} selected to compare
            <span className="text-charcoal/45 font-semibold"> · max 4</span>
          </p>
          <div className="hidden sm:flex -space-x-2 ml-1">
            {previews.map((p) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={p!.id}
                src={p!.images?.[0] || "/indian_heritage_hero_bg.png"}
                alt=""
                className="w-8 h-8 rounded-lg border-2 border-white object-cover"
              />
            ))}
          </div>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="shrink-0 px-2"
          aria-label="Clear compare list"
          onClick={() => setCompareList([])}
        >
          <X className="w-4 h-4" />
        </Button>
        <Link href="/compare">
          <Button type="button" variant="secondary" size="sm" className="shrink-0">
            Compare
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default CompareBar;

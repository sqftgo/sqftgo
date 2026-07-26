"use client";

import React, { useRef, useState } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyCard } from "@/features/properties/components/PropertyCard";
import { Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { scrollContainer } from "../lib/scrollContainer";

export function HomeTopPicks() {
  const { properties } = useApp();
  const [topPicksTab, setTopPicksTab] = useState<"buy" | "rent" | "plots">("buy");
  const topPicksScrollRef = useRef<HTMLDivElement>(null);

  const filteredTopPicks = properties.filter((p) => {
    if (topPicksTab === "buy") {
      return p.purpose === "buy" && p.featured;
    } else if (topPicksTab === "rent") {
      return p.purpose === "rent" && p.featured;
    } else {
      return p.type === "Industrial Plot" || p.type === "Agricultural Land";
    }
  });

  const displayTopPicks = filteredTopPicks.length > 0 ? filteredTopPicks : properties.slice(0, 6);

  return (
    <>
      {/* 2. SQFTGO'S TOP PICKS SECTION (Housing's Top Picks Style) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-terracotta font-black text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Handpicked Real Estate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
              SQFTGO&apos;s Top Picks
            </h2>
          </div>

          {/* Quick Filter Tabs & Navigation */}
          <div className="flex items-center flex-wrap gap-4">
            
            {/* Filter Tabs */}
            <div className="flex bg-sand/35 border border-sand/50 p-1 rounded-xl">
              {([
                { key: "buy", label: "For Sale" },
                { key: "rent", label: "For Rent" },
                { key: "plots", label: "Land/Plots" }
              ] as const).map((pickTab) => (
                <button suppressHydrationWarning
                  key={pickTab.key}
                  type="button"
                  onClick={() => setTopPicksTab(pickTab.key)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    topPicksTab === pickTab.key
                      ? "bg-white text-indigo shadow-sm border border-sand/30"
                      : "text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  {pickTab.label}
                </button>
              ))}
            </div>

            {/* Slider Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(topPicksScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(topPicksScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

        {/* Top Picks Horizontal Carousel */}
        <div
          ref={topPicksScrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
        >
          {displayTopPicks.map((property) => (
            <div key={property.id} className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

      </section>
    </>
  );
}

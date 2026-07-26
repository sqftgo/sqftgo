"use client";

import React, { useRef } from "react";
import { useApp } from "@/context/AppContext";
import { PropertyCard } from "@/features/properties/components/PropertyCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { scrollContainer } from "../lib/scrollContainer";

export function HomeNewlyAdded() {
  const { properties } = useApp();
  const newlyAddedScrollRef = useRef<HTMLDivElement>(null);

  const newlyAddedProperties = [...properties]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6);

  return (
    <>
      {/* 8. NEWLY-ADDED PROPERTIES SECTION */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2 text-left">
            <span className="text-terracotta font-black text-xs uppercase tracking-wider">
              Fresh Listings In The Region
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
              Newly-Added Properties
            </h2>
          </div>

          {/* Slider Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <button suppressHydrationWarning
              type="button"
              onClick={() => scrollContainer(newlyAddedScrollRef, "left")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button suppressHydrationWarning
              type="button"
              onClick={() => scrollContainer(newlyAddedScrollRef, "right")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Newly Added Properties Carousel */}
        <div
          ref={newlyAddedScrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
        >
          {newlyAddedProperties.map((property) => (
            <div key={property.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start">
              <PropertyCard property={property} />
            </div>
          ))}
        </div>

      </section>
    </>
  );
}

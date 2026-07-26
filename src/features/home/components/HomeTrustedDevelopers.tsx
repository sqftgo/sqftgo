"use client";

import React, { useRef } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import {
  Building2,
  MapPin,
  ArrowRight,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { scrollContainer } from "../lib/scrollContainer";

export function HomeTrustedDevelopers() {
  const { directoryProfiles } = useApp();
  const developersScrollRef = useRef<HTMLDivElement>(null);
  const builders = directoryProfiles.filter((p) => p.category === "Builder & Developer");

  return (
    <>
      {/* 5. PROJECTS BY TRUSTED DEVELOPERS (Housing's Builders Showcases) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Verified Builders Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Projects by Trusted Developers
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(developersScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(developersScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Developers Carousel */}
          <div
            ref={developersScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {builders.map((profile) => (
              <div 
                key={profile.id} 
                className="w-[290px] sm:w-[340px] flex-shrink-0 snap-start bg-white border border-sand hover:border-indigo/25 p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(12,27,51,0.08)] hover:-translate-y-1.5 transition-all duration-250 ease-out flex flex-col justify-between group"
              >
                
                <div className="flex flex-col gap-4 text-left">
                  {/* Builder Header Logo/Avatar */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo group-hover:scale-105 group-hover:bg-indigo/10 transition-all duration-300 shrink-0">
                      <Building2 className="w-7 h-7 stroke-[1.75]" />
                    </div>
                    <div className="flex flex-col min-w-0 gap-1">
                      <h4 className="text-[18px] font-bold text-charcoal leading-tight truncate group-hover:text-indigo transition-colors duration-200" title={profile.firmName}>
                        {profile.firmName}
                      </h4>
                      <div>
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[9px] font-bold uppercase tracking-wider border border-emerald-100/50">
                          <Check className="w-2.5 h-2.5 text-emerald-600 stroke-[3]" />
                          <span>Verified Developer</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Subtle Divider */}
                  <div className="h-px bg-sand/35 w-full" />

                  {/* Description */}
                  <p className="text-[14px] font-medium text-charcoal/70 leading-relaxed line-clamp-2">
                    {profile.description}
                  </p>

                  {/* Evenly aligned information grid with subtle borders */}
                  <div className="grid grid-cols-2 gap-x-6 gap-y-4 py-4 border-y border-sand/40 my-1">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[11px] font-medium text-charcoal/45 uppercase tracking-wider">Owner</span>
                      <span className="text-[15px] font-semibold text-charcoal truncate" title={profile.ownerName}>
                        {profile.ownerName}
                      </span>
                    </div>
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-[11px] font-medium text-charcoal/45 uppercase tracking-wider">Category</span>
                      <span className="text-[15px] font-semibold text-terracotta truncate">
                        {profile.category.split("&")[0].trim()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-4 mt-5">
                  {/* Location with outline map pin icon and muted text */}
                  <div className="flex items-center gap-2 text-xs text-charcoal/50 font-bold px-0.5">
                    <MapPin className="w-4 h-4 text-terracotta/75 shrink-0 stroke-[1.75]" />
                    <span className="truncate text-charcoal/60 font-medium text-[13px]">{profile.address}</span>
                  </div>

                  {/* Full width premium CTA button */}
                  <Link
                    href={`/dealers/${profile.id}`}
                    className="w-full h-12 bg-indigo hover:bg-indigo-hover text-white rounded-[14px] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg shadow-indigo/15 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <span>Explore Projects</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1 stroke-[2]" />
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

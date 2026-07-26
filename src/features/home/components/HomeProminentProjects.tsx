"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { MOCK_PROJECTS } from "../data/constants";
import { scrollContainer } from "../lib/scrollContainer";

export function HomeProminentProjects() {
  const router = useRouter();
  const prominentProjectsScrollRef = useRef<HTMLDivElement>(null);
  const mockProjects = MOCK_PROJECTS;

  return (
    <>
      {/* 3. PROMINENT PROJECTS TO EXPLORE (Housing's Prominent Projects Style) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Elite Residential Communities
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Prominent Projects to Explore
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(prominentProjectsScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(prominentProjectsScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Projects Horizontal Carousel */}
          <div
            ref={prominentProjectsScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {mockProjects.map((project) => (
              <div key={project.id} className="w-[300px] sm:w-[380px] flex-shrink-0 snap-start bg-white border border-sand rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                
                {/* Project Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand/35">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-sand text-[9px] text-indigo font-black uppercase tracking-wider">
                    {project.location.split(",")[1]?.trim() || project.location}
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5 flex flex-col text-left justify-between flex-grow">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo/60 uppercase tracking-widest">
                      Developer: {project.developer}
                    </span>
                    <h3 className="font-serif font-black text-lg text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors duration-200">
                      {project.name}
                    </h3>
                    <p className="text-xs text-charcoal/60 font-semibold">{project.bhk}</p>
                    <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-bold uppercase mt-1">
                      <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-sand pt-4 mt-5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider">Starting Price</span>
                      <span className="text-base font-serif font-black text-indigo">{project.price.split("-")[0]}</span>
                    </div>
                    
                    <button suppressHydrationWarning
                      type="button"
                      onClick={() => router.push(`/listings?city=${project.location.split(",")[1]?.trim() || "Udaipur"}`)}
                      className="px-4 py-2 bg-indigo hover:bg-indigo-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Explore Project
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

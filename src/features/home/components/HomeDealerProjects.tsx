"use client";

import React, { useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { MapPin, ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useProjectsQuery } from "@/hooks";
import { formatIndianCurrency } from "@/lib/format";
import type { Project } from "@/types";
import { scrollContainer } from "../lib/scrollContainer";

function formatProjectPrice(p: Project): string {
  if (p.priceFrom == null && p.priceTo == null) return "Price on request";
  if (p.priceFrom != null && p.priceTo != null) {
    if (p.priceFrom === p.priceTo) return formatIndianCurrency(p.priceFrom, "buy");
    return `${formatIndianCurrency(p.priceFrom, "buy")} – ${formatIndianCurrency(p.priceTo, "buy")}`;
  }
  if (p.priceFrom != null) return `From ${formatIndianCurrency(p.priceFrom, "buy")}`;
  return `Up to ${formatIndianCurrency(p.priceTo!, "buy")}`;
}

export function HomeDealerProjects() {
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);
  const query = useProjectsQuery({ limit: 12, offset: 0 });

  const projects = useMemo(() => {
    const items = (query.data?.items ?? []).filter((p) => p.status === "Active");
    const featured = items.filter((p) => p.featured);
    const pool = featured.length > 0 ? featured : items;
    return pool.slice(0, 8);
  }, [query.data?.items]);

  if (query.isPending && !query.data) {
    return (
      <section className="relative py-16 bg-cream w-full px-6 border-b border-sand/40">
        <div className="max-w-7xl mx-auto">
          <div className="h-8 w-56 bg-sand/40 rounded-xl animate-pulse mb-6" />
          <div className="flex gap-6 overflow-hidden">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="w-[300px] sm:w-[380px] flex-shrink-0 h-72 bg-sand/30 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (projects.length === 0) return null;

  return (
    <section className="relative py-20 bg-cream w-full px-6 border-b border-sand/40">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2 text-left">
            <span className="text-terracotta font-black text-xs uppercase tracking-wider">
              Dealer Developments
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
              Projects from our partners
            </h2>
            <p className="text-charcoal/50 text-xs font-semibold max-w-xl">
              Active townships and inventory portfolios marketed by verified dealers.
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2">
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => scrollContainer(scrollRef, "left")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => scrollContainer(scrollRef, "right")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
        >
          {projects.map((project) => {
            const image = project.images?.[0];
            const typeLabel =
              project.propertyTypes.length > 0
                ? project.propertyTypes.slice(0, 2).join(" · ")
                : project.lifecycle;
            const configLabel =
              project.configurations.length > 0
                ? project.configurations.slice(0, 3).join(", ")
                : null;

            return (
              <div
                key={project.id}
                className="w-[300px] sm:w-[380px] flex-shrink-0 snap-start bg-white border border-sand rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden"
              >
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand/35">
                  {image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={image}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-indigo/25">
                      <Building2 className="w-12 h-12" />
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-sand text-[9px] text-indigo font-black uppercase tracking-wider">
                    {project.city}
                  </div>
                  <div className="absolute top-3 right-3 bg-indigo/90 text-white px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                    {project.lifecycle}
                  </div>
                </div>

                <div className="p-5 flex flex-col text-left justify-between flex-grow">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo/60 uppercase tracking-widest">
                      {project.ownershipRole} · {typeLabel}
                    </span>
                    <h3 className="font-serif font-black text-lg text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors duration-200">
                      {project.title}
                    </h3>
                    {configLabel ? (
                      <p className="text-xs text-charcoal/60 font-semibold line-clamp-1">
                        {configLabel}
                      </p>
                    ) : null}
                    <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-bold uppercase mt-1">
                      <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                      <span className="truncate">
                        {[project.locality, project.city].filter(Boolean).join(", ")}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-sand pt-4 mt-5">
                    <div className="flex flex-col min-w-0 pr-2">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider">
                        Price range
                      </span>
                      <span className="text-sm sm:text-base font-serif font-black text-indigo truncate">
                        {formatProjectPrice(project)}
                      </span>
                    </div>

                    <button
                      suppressHydrationWarning
                      type="button"
                      onClick={() => router.push(`/projects/${project.id}`)}
                      className="shrink-0 px-4 py-2 bg-indigo hover:bg-indigo-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      View Project
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

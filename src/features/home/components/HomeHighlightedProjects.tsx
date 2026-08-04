"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ArrowRight } from "lucide-react";
import { formatIndianCurrency } from "@/lib/format";

export function HomeHighlightedProjects() {
  const router = useRouter();
  const { properties } = useApp();

  const highlights = useMemo(() => {
    const active = properties.filter((p) => p.status === "Active");
    const featured = active.filter((p) => p.featured);
    const pool = featured.length >= 2 ? featured : active;
    return pool.slice(0, 2);
  }, [properties]);

  if (highlights.length === 0) return null;

  return (
    <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
      <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2.5">
        <span className="text-terracotta font-black text-xs uppercase tracking-wider">
          Premium Highlight Collections
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
          Top Highlighted Projects
        </h2>
        <p className="text-charcoal/60 text-xs sm:text-sm">
          Live listings from the SqftGo catalog — open any card for full details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {highlights.map((property, index) => {
          const image = property.images?.[0];
          const priceLabel = formatIndianCurrency(property.price, property.purpose);

          return (
            <div
              key={property.id}
              className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-sand transition-all duration-300"
            >
              {image ? (
                <img
                  src={image}
                  alt={property.title}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="absolute inset-0 bg-sand/40" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-charcoal/10" />
              <div className="absolute inset-0 p-8 flex flex-col justify-end text-left items-start">
                <span className="text-gold text-[9px] font-black uppercase tracking-widest mb-1.5">
                  {index === 0 ? "Featured listing" : "Highlighted listing"}
                </span>
                <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-2 line-clamp-2">
                  {property.title}
                </h3>
                <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-md mb-2">
                  {[property.locality, property.city].filter(Boolean).join(", ")}
                  {(property.bhk ?? 0) > 0
                    ? ` · ${property.bhk} BHK ${property.type}`
                    : ` · ${property.type}`}
                </p>
                <p className="text-white/90 text-sm font-serif font-black mb-5">{priceLabel}</p>
                <button
                  suppressHydrationWarning
                  type="button"
                  onClick={() => router.push(`/property/${property.id}`)}
                  className={`px-5 py-2.5 text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1 ${
                    index === 0
                      ? "bg-terracotta hover:bg-terracotta-hover"
                      : "bg-indigo hover:bg-indigo-hover"
                  }`}
                >
                  <span>View Property</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

"use client";

import React, { useRef } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { isAgentOrConsultantCategory } from "@/features/dealers";
import {
  MapPin,
  Phone,
  Award,
  Check,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { scrollContainer } from "../lib/scrollContainer";

export function HomeRecommendedSellers() {
  const router = useRouter();
  const { directoryProfiles } = useApp();
  const sellersScrollRef = useRef<HTMLDivElement>(null);
  const sellers = directoryProfiles.filter((p) => isAgentOrConsultantCategory(p.category));

  if (sellers.length === 0) return null;

  return (
    <>
      {/* 7. RECOMMENDED SELLERS SECTION (Housing's Certified Agents) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Certified Professional Partners
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Recommended Sellers
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(sellersScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button suppressHydrationWarning
                type="button"
                onClick={() => scrollContainer(sellersScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recommended Sellers Carousel */}
          <div
            ref={sellersScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 no-scrollbar snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {sellers.map((profile) => (
              <div 
                key={profile.id} 
                onClick={() => router.push(`/dealers/${profile.id}`)}
                className="w-[300px] sm:w-[350px] flex-shrink-0 snap-start bg-white border border-sand hover:border-terracotta/30 p-6 rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(12,27,51,0.08)] hover:-translate-y-1.5 transition-all duration-250 ease-out flex flex-col justify-between group cursor-pointer"
              >
                
                <div className="flex flex-col gap-4 text-left">
                  
                  {/* Seller Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-14 h-14 rounded-2xl bg-terracotta/5 border border-terracotta/10 flex items-center justify-center text-terracotta font-serif font-black text-lg shrink-0 group-hover:scale-105 transition-all duration-300">
                      {profile.ownerName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)}
                    </div>
                    
                    <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 border border-amber-100/50 px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider">
                      <Award className="w-3 h-3 text-amber-600 stroke-[2]" />
                      <span>Recommended</span>
                    </span>
                  </div>

                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-[20px] font-bold text-charcoal leading-tight truncate group-hover:text-indigo transition-colors duration-200" title={profile.firmName}>
                      {profile.firmName}
                    </h3>
                    <span className="text-[13px] font-medium text-charcoal/50 uppercase tracking-wider">{profile.ownerName}</span>
                  </div>

                  {/* Subtle Divider */}
                  <div className="h-px bg-sand/35 w-full" />

                  {/* Description */}
                  <p className="text-[14px] font-normal text-charcoal/70 leading-relaxed line-clamp-2">
                    {profile.description}
                  </p>

                  {/* Trust Badge */}
                  <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-100/50 px-3 py-1 rounded-full text-[11px] font-medium w-fit">
                    <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                    <span>Verified Broker</span>
                  </div>

                </div>

                <div className="flex flex-col gap-4 mt-5 pt-4 border-t border-sand/40">
                  
                  {/* Address & Contacts */}
                  <div className="flex flex-col gap-2 px-0.5">
                    <div className="flex items-center gap-2.5 text-[14px] font-medium text-charcoal/65">
                      <MapPin className="w-4.5 h-4.5 text-terracotta/75 shrink-0 stroke-[1.75]" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-[14px] font-medium text-charcoal/65">
                      <Phone className="w-4.5 h-4.5 text-indigo/70 shrink-0 stroke-[1.75]" />
                      <span>{profile.mobile}</span>
                    </div>
                  </div>



                  {/* Primary Full Width CTA */}
                  <button suppressHydrationWarning
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/dealers/${profile.id}`);
                    }}
                    className="w-full h-12 bg-indigo hover:bg-indigo-hover text-white rounded-[14px] font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-md hover:shadow-lg shadow-indigo/15 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer border-none"
                  >
                    <Phone className="w-4 h-4 stroke-[2]" />
                    <span>Contact Broker</span>
                  </button>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>
    </>
  );
}

"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { CustomSelect } from "@/components/ui";
import {
  Compass,
  MapPin,
  ArrowRight,
  Home as HomeIcon,
} from "lucide-react";
import {
  PROPERTY_TYPES,
  BUDGET_OPTIONS_BUY,
  BUDGET_OPTIONS_RENT,
} from "../data/constants";
import { useActiveCities } from "@/hooks/useActiveCities";

export function HomeHero() {
  const router = useRouter();
  const { setSelectedCity } = useApp();
  const { cities, cityOptionsWithoutAll, locationsReady } = useActiveCities();

  const [heroTab, setHeroTab] = useState<"buy" | "rent" | "plots" | "commercial">("buy");
  const [searchCity, setSearchCity] = useState("");
  const [searchLocality, setSearchLocality] = useState("");
  const [searchType, setSearchType] = useState("any");
  const [searchBudget, setSearchBudget] = useState("any");

  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (!searchCity || !cities.some((c) => c.toLowerCase() === searchCity.toLowerCase())) {
      setSearchCity(cities[0] ?? "");
    }
  }, [locationsReady, cities, searchCity]);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchCity) return;
    setSelectedCity(searchCity);
    const params = new URLSearchParams();
    params.set("city", searchCity);

    if (heroTab === "rent") {
      params.set("purpose", "rent");
    } else {
      params.set("purpose", "buy");
    }

    if (heroTab === "plots") {
      params.set("type", "Industrial Plot");
    } else if (heroTab === "commercial") {
      params.set("type", "Commercial Space");
    } else if (searchType !== "any") {
      params.set("type", searchType);
    }

    if (searchLocality) params.set("locality", searchLocality);
    if (searchBudget !== "any") params.set("budget", searchBudget);

    router.push(`/listings?${params.toString()}`);
  };

  return (
    <>
      {/* 1. HERO SECTION WITH INTEGRATED SEARCH BANNER */}
      <section className="relative pt-2 pb-12 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto w-full relative rounded-[36px] bg-[#0c1b33] min-h-[480px] md:min-h-[520px] flex items-center justify-center p-6 sm:p-8 shadow-xl border border-white/5">
          {/* Background Image Wrapper with Rounded Clip */}
          <div className="absolute inset-0 overflow-hidden rounded-[36px] select-none pointer-events-none">
            <img
              src="/indian_heritage_hero_bg.png"
              alt="Luxury Rajasthan Heritage Lake Palace Background"
              className="w-full h-full object-cover object-center"
            />
            {/* Dark overlay for readability */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#09152b]/65 via-[#09152b]/55 to-[#09152b]/75" />
          </div>

          <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-5 py-4">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight leading-tight text-white max-w-3xl text-center">
                <span className="text-terracotta">believe</span> in finding it
              </h1>

              <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-1 text-center">
                {"with India's largest choice of luxury & heritage homes"}
              </p>
            </div>

            {/* Floating Search Card — Matching Reference Layout */}
            <div className="w-full max-w-3xl relative z-20">
              <form onSubmit={handleHeroSearch} className="bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 transition-all duration-300">

                {/* Tab Row */}
                <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-6 sm:px-8 pt-5 pb-3">
                  {([
                    { key: "buy", label: "BUY" },
                    { key: "rent", label: "RENT" },
                    { key: "plots", label: "PLOTS" },
                    { key: "commercial", label: "COMMERCIAL" }
                  ] as const).map((tab) => (
                    <button suppressHydrationWarning
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setHeroTab(tab.key);
                        setSearchType("any");
                        setSearchBudget("any");
                      }}
                      className={`text-xs sm:text-sm font-bold uppercase tracking-wider px-4 py-2 rounded-full transition-all duration-200 cursor-pointer ${heroTab === tab.key
                        ? "bg-indigo text-white shadow-md shadow-indigo/15 scale-[1.02]"
                        : "text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5"
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-slate-100 mx-6 sm:mx-8" />
                {/* 4-Column Filter Row */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 px-6 sm:px-8 py-5">
                  
                  {/* SELECT CITY */}
                  <div className="flex flex-col justify-center pb-3 mb-3 border-b border-indigo/10 lg:border-b-0 lg:border-r lg:border-indigo/10 lg:pb-0 lg:mb-0 lg:pr-6">
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider mb-1.5">SELECT CITY</span>
                    <CustomSelect
                      options={cityOptionsWithoutAll}
                      value={searchCity}
                      onChange={setSearchCity}
                      placeholder={locationsReady ? "Select City" : "Loading cities…"}
                      searchable
                      buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer w-full text-left"
                      inlineChevron
                    />
                  </div>

                  {/* LOCALITY */}
                  <div className="flex flex-col justify-center pb-3 mb-3 border-b border-indigo/10 lg:border-b-0 lg:border-r lg:border-indigo/10 lg:pb-0 lg:mb-0 lg:px-6">
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider mb-1.5">LOCALITY</span>
                    <input suppressHydrationWarning
                      type="text"
                      placeholder="Search locality..."
                      value={searchLocality}
                      onChange={(e) => setSearchLocality(e.target.value)}
                      className="text-sm font-bold text-charcoal bg-transparent outline-none placeholder:text-charcoal/40 w-full py-0 border-none focus:ring-0 p-0"
                    />
                  </div>

                  {/* TYPE */}
                  <div className="flex flex-col justify-center pb-3 mb-3 border-b border-indigo/10 lg:border-b-0 lg:border-r lg:border-indigo/10 lg:pb-0 lg:mb-0 lg:px-6">
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider mb-1.5">TYPE</span>
                    <CustomSelect
                      options={PROPERTY_TYPES}
                      value={searchType}
                      onChange={setSearchType}
                      placeholder="All Types"
                      buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer w-full text-left"
                      inlineChevron
                    />
                  </div>

                  {/* BUDGET LIMIT */}
                  <div className="flex flex-col justify-center lg:pl-6">
                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider mb-1.5">BUDGET LIMIT</span>
                    <CustomSelect
                      options={heroTab === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY}
                      value={searchBudget}
                      onChange={setSearchBudget}
                      placeholder="Any Price"
                      buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer w-full text-left"
                      inlineChevron
                    />
                  </div>
                </div>

                {/* CTA Button */}
                <div className="px-6 sm:px-8 pb-6 pt-2">
                  <button suppressHydrationWarning
                    type="submit"
                    className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-sm uppercase tracking-wider py-4 rounded-xl shadow-md shadow-terracotta/25 hover:shadow-lg hover:shadow-terracotta/35 transition-all duration-250 cursor-pointer active:scale-[0.99] flex items-center justify-center gap-2.5 group/btn border-none"
                  >
                    <span>FIND PROPERTIES</span>
                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                  </button>
                </div>

              </form>
            </div>

            {/* Professional Trust Stats Counter */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-4 pt-6 border-t border-white/10 w-full max-w-3xl">
              {[
                { value: "1,200+", label: "Verified Listings" },
                { value: "100%", label: "RERA Certified" },
                { value: "₹4,200 Cr+", label: "Property Managed" },
                { value: "24/7", label: "Relocation Help" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[120px]">
                  <span className="text-lg sm:text-xl font-serif font-black text-white leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

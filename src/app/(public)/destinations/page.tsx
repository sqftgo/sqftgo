"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Compass } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { DESTINATIONS, TAGS, Destination } from "@/data/destinations";
import DestinationHero from "@/components/destinations/DestinationHero";
import DestinationsFilter from "@/components/destinations/DestinationsFilter";
import DestinationCard from "@/components/destinations/DestinationCard";
import DestinationDrawer from "@/components/destinations/DestinationDrawer";

export default function DestinationsPage() {
  const { properties, selectedCity } = useApp();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [limitToSelectedCityRegion, setLimitToSelectedCityRegion] = useState(true);

  // Identify the region of the selected city
  const selectedCityRegion = useMemo(() => {
    const found = DESTINATIONS.find(d => d.name.toLowerCase() === selectedCity.toLowerCase());
    if (found) return found.tag;
    
    const rajasthanFallback = ["pali", "alwar"];
    const gujaratFallback = ["gandhinagar", "kutch", "anand"];
    const nameLower = selectedCity.toLowerCase();
    
    if (rajasthanFallback.includes(nameLower)) return "Rajasthan";
    if (gujaratFallback.includes(nameLower)) return "Gujarat";
    return "All";
  }, [selectedCity]);

  // Compute property counts dynamically per city
  const cityPropertiesMap = useMemo(() => {
    const counts: { [key: string]: number } = {};
    properties.forEach((p) => {
      const city = p.city.toLowerCase();
      counts[city] = (counts[city] || 0) + 1;
    });
    return counts;
  }, [properties]);

  // Compute active listings in each tag
  const tagStats = useMemo(() => {
    const stats: { [key: string]: { cities: number; listings: number } } = {};
    TAGS.forEach(tag => {
      const cities = tag === "All" 
        ? DESTINATIONS 
        : DESTINATIONS.filter(d => d.tag === tag);
      
      const listings = cities.reduce((acc, c) => acc + (cityPropertiesMap[c.name.toLowerCase()] || 0), 0);
      stats[tag] = { cities: cities.length, listings };
    });
    return stats;
  }, [cityPropertiesMap]);

  // Filtered list of destinations based on tag, search query, and navbar selected city region
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const matchesRegion = !limitToSelectedCityRegion || selectedCityRegion === "All" || d.tag === selectedCityRegion;
      const matchesTag = activeFilter === "All" || d.tag === activeFilter;
      const matchesSearch = searchQuery.trim() === "" ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.vibe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesTag && matchesSearch;
    });
  }, [activeFilter, searchQuery, selectedCityRegion, limitToSelectedCityRegion]);

  // Get autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return DESTINATIONS.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vibe.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectSuggestion = (dest: Destination) => {
    setSelectedDestination(dest);
    setSearchQuery("");
    setShowSuggestions(false);
  };

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-cream/30">
      
      {/* 1. HERO SECTION (Editorial Search & Gradient) */}
      <DestinationHero
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        showSuggestions={showSuggestions}
        setShowSuggestions={setShowSuggestions}
        autocompleteSuggestions={autocompleteSuggestions}
        onSelectSuggestion={handleSelectSuggestion}
        totalDestinations={DESTINATIONS.length}
        totalProperties={properties.length}
        cityPropertiesMap={cityPropertiesMap}
      />

      {/* 2. DEDICATED PROPERTY STYLE COLLECTIONS SECTION */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto w-full z-20 -mt-12 text-left bg-white rounded-[32px] shadow-xl border border-indigo/5 p-6 md:p-10 mb-10">
        <div className="flex flex-col gap-1.5 mb-6 text-left">
          <span className="text-terracotta font-black text-xs uppercase tracking-wider">explore our collections</span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">Top Picks by Property Style</h2>
          <p className="text-xs text-charcoal/50 font-semibold mt-1">Explore our verified handpicked stays curated for your lifestyle</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[480px]">
          {/* Column 1: Apartments (Tall Card) */}
          <Link 
            href="/listings?type=Apartment"
            className="group relative flex flex-col rounded-[2.5rem] overflow-hidden bg-slate-900 border border-sand shadow-sm hover:shadow-2xl transition-all duration-500 h-[320px] md:h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=600&q=80" 
              alt="Apartments" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8 text-left">
              <h3 className="text-2xl font-serif font-black text-white leading-tight">Apartments</h3>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest mt-1">1,100+ Stays Available</p>
            </div>
          </Link>

          {/* Column 2: Stacked Cards (Houses & Cabins) */}
          <div className="flex flex-col gap-6 justify-between h-auto md:h-full min-h-[360px] md:min-h-0">
            {/* House Card */}
            <Link 
              href="/listings?type=Home"
              className="group relative flex-1 flex flex-col rounded-[2.5rem] overflow-hidden bg-slate-900 border border-sand shadow-sm hover:shadow-2xl transition-all duration-500 min-h-[170px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80" 
                alt="Houses" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col justify-end h-full p-6 text-left">
                <h3 className="text-xl font-serif font-black text-white leading-tight">Houses</h3>
                <p className="text-[9px] text-gold font-bold uppercase tracking-widest mt-0.5">950+ Stays Available</p>
              </div>
            </Link>

            {/* Plots & Lands Card */}
            <Link 
              href="/listings?type=Agricultural%20Land"
              className="group relative flex-1 flex flex-col rounded-[2.5rem] overflow-hidden bg-slate-900 border border-sand shadow-sm hover:shadow-2xl transition-all duration-500 min-h-[170px]"
            >
              <img 
                src="https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=600&q=80" 
                alt="Plots & Lands" 
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
              <div className="relative z-10 flex flex-col justify-end h-full p-6 text-left">
                <h3 className="text-xl font-serif font-black text-white leading-tight">Plots & Lands</h3>
                <p className="text-[9px] text-gold font-bold uppercase tracking-widest mt-0.5">450+ Plots Available</p>
              </div>
            </Link>
          </div>

          {/* Column 3: Villas & Hotels (Tall Card) */}
          <Link 
            href="/listings?type=Villa"
            className="group relative flex flex-col rounded-[2.5rem] overflow-hidden bg-slate-900 border border-sand shadow-sm hover:shadow-2xl transition-all duration-500 h-[320px] md:h-full"
          >
            <img 
              src="https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=600&q=80" 
              alt="Villas & Hotels" 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-85 group-hover:opacity-90 transition-opacity duration-300" />
            <div className="relative z-10 flex flex-col justify-end h-full p-8 text-left">
              <h3 className="text-2xl font-serif font-black text-white leading-tight">Villas & Hotels</h3>
              <p className="text-[10px] text-gold font-bold uppercase tracking-widest mt-1">300+ Stays Available</p>
            </div>
          </Link>
        </div>
      </section>

      {/* 3. DEDICATED CITY REGIONS & FILTER GRID */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto w-full z-20 text-left bg-white rounded-[32px] shadow-xl border border-indigo/5 p-6 md:p-10 mb-16">
        
        {/* Centered Symmetric Region Filters */}
        <DestinationsFilter
          tags={TAGS}
          activeFilter={activeFilter}
          setActiveFilter={(val) => {
            setActiveFilter(val);
            if (val !== "All") {
              setLimitToSelectedCityRegion(false);
            }
          }}
          tagStats={tagStats}
        />

        {limitToSelectedCityRegion && selectedCityRegion !== "All" && (
          <div className="mb-8 p-4 rounded-2xl bg-indigo/5 border border-indigo/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm font-semibold text-indigo animate-fade-in">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-terracotta animate-spin" style={{ animationDuration: '4s' }} />
              <span>
                Showing cities in <strong className="text-terracotta">{selectedCityRegion}</strong> (relevant to your selected city <strong className="text-terracotta">{selectedCity}</strong>)
              </span>
            </div>
            <button
              onClick={() => setLimitToSelectedCityRegion(false)}
              className="px-4 py-1.5 rounded-xl bg-white border border-sand hover:bg-sand/30 text-xs font-bold text-charcoal transition-all shadow-sm cursor-pointer shrink-0"
              suppressHydrationWarning
            >
              Show all regions
            </button>
          </div>
        )}

        {/* Dynamic Cards Grid with Uniform Heights */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center mt-12">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.name}
                dest={dest}
                propertyCount={cityPropertiesMap[dest.name.toLowerCase()] || 0}
                onSelect={setSelectedDestination}
                className="h-[460px]"
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white border border-sand rounded-3xl p-8">
              <Compass className="w-12 h-12 text-charcoal/30 mx-auto mb-4 animate-bounce" />
              <h3 className="font-serif font-black text-xl text-indigo mb-1">No matching destinations</h3>
              <p className="text-xs font-semibold text-charcoal/50">
                Try adjusting filters or searching for another keyword.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* 4. IMMERSIVE DETAIL DRAWER PANEL */}
      <DestinationDrawer
        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}
        cityPropertiesMap={cityPropertiesMap}
      />

    </div>
  );
}

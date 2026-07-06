"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Compass, ShieldCheck, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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

      {/* 2. FILTER & GRID SECTION */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto w-full z-20 -mt-12 text-left">
        
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
            >
              Show all regions
            </button>
          </div>
        )}

        {/* Dynamic Cards Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center">
          <AnimatePresence mode="popLayout">
            {filteredDestinations.length > 0 ? (
              filteredDestinations.map((dest) => (
                <DestinationCard
                  key={dest.name}
                  dest={dest}
                  propertyCount={cityPropertiesMap[dest.name.toLowerCase()] || 0}
                  onSelect={setSelectedDestination}
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
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. VIP CONCIERGE RELOCATION CTA */}
      <section className="relative z-20 py-16 px-4 max-w-5xl mx-auto w-full">
        <div className="relative rounded-[2.5rem] overflow-hidden bg-gradient-to-br from-indigo to-charcoal text-white p-8 md:p-14 border border-indigo/20 shadow-2xl flex flex-col items-center text-center gap-6">
          <div className="absolute top-0 right-0 w-80 h-80 bg-gold/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-terracotta/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/5 rounded-[2rem] pointer-events-none" />
          
          <div className="flex flex-col items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-1 shadow-inner">
              <ShieldCheck className="w-7 h-7 text-gold" />
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight">
              Fell in love with a city? <br />
              Let Our Concierge Handle Your Move.
            </h2>
            <p className="text-white/70 text-xs md:text-sm leading-relaxed font-semibold max-w-xl">
              Relocating from another state or city can be overwhelming. Let us know your specifications, and our local city leads will secure premium properties, negotiate contract terms, and seamlessly support your move-in.
            </p>
          </div>

          <div className="relative z-10 mt-2">
            <Link
              href="/get-assistance"
              className="group flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-gold hover:bg-gold-hover text-charcoal font-black text-xs uppercase tracking-widest shadow-xl shadow-gold/20 hover:-translate-y-0.5 transition-all duration-300"
            >
              <span>Request VIP Assistance</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
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

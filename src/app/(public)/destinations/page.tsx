"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Compass, Sparkles, HeartHandshake } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { DESTINATIONS, TAGS, type Destination } from "@/features/destinations";
import DestinationHero from "@/features/destinations/components/DestinationHero";
import DestinationsFilter from "@/features/destinations/components/DestinationsFilter";
import DestinationCard from "@/features/destinations/components/DestinationCard";

export default function DestinationsPage() {
  const router = useRouter();
  const { properties, selectedCity } = useApp();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [limitToSelectedCityRegion, setLimitToSelectedCityRegion] = useState(true);
  const [onlyWeddingDestinations, setOnlyWeddingDestinations] = useState(false);

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

  // Total wedding venues and unique properties across all destinations
  const totalWeddingHighlights = useMemo(() => {
    return DESTINATIONS.reduce((acc, d) => {
      const v = d.weddingVenues?.length || 0;
      const p = d.uniqueWeddingProperties?.length || 0;
      return acc + v + p;
    }, 0);
  }, []);

  // Filtered list of destinations based on tag, search query, navbar selected city region, and wedding filter
  const filteredDestinations = useMemo(() => {
    return DESTINATIONS.filter(d => {
      const matchesRegion = !limitToSelectedCityRegion || selectedCityRegion === "All" || d.tag === selectedCityRegion;
      const matchesTag = activeFilter === "All" || d.tag === activeFilter;
      const matchesWedding = !onlyWeddingDestinations || (d.weddingVenues?.length > 0 || d.uniqueWeddingProperties?.length > 0);
      const matchesSearch = searchQuery.trim() === "" ||
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.vibe.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.title.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesRegion && matchesTag && matchesWedding && matchesSearch;
    });
  }, [activeFilter, searchQuery, selectedCityRegion, limitToSelectedCityRegion, onlyWeddingDestinations]);

  // Get autocomplete suggestions
  const autocompleteSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return DESTINATIONS.filter(d => 
      d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      d.vibe.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 5);
  }, [searchQuery]);

  const handleSelectSuggestion = (dest: Destination) => {
    router.push(`/destinations/${dest.name.toLowerCase()}`);
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

      {/* 2. DEDICATED CITY REGIONS & FILTER GRID */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto w-full z-20 -mt-12 text-left bg-white rounded-[32px] shadow-xl border border-indigo/5 p-6 md:p-10 mb-16">
        
        {/* Wedding Highlights Callout Banner */}
        <div className="mb-8 p-4 md:p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-100/40 to-terracotta/10 border border-amber-300/50 flex flex-col md:flex-row items-center justify-between gap-4 text-xs md:text-sm text-indigo">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <strong className="block text-indigo font-serif font-black text-base leading-tight">
                Destination Weddings & Heritage Venues
              </strong>
              <span className="text-charcoal/70 font-medium">
                Showing <strong className="text-amber-800 font-bold">{totalWeddingHighlights}+ curated wedding places & luxury palatial estates</strong> across India.
              </span>
            </div>
          </div>

          <button
            onClick={() => setOnlyWeddingDestinations(!onlyWeddingDestinations)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm cursor-pointer shrink-0 flex items-center gap-1.5 border ${
              onlyWeddingDestinations
                ? "bg-amber-600 border-amber-600 text-white shadow-amber-600/20 shadow-lg"
                : "bg-white border-amber-300 hover:bg-amber-50 text-amber-900"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>{onlyWeddingDestinations ? "Showing Wedding Hotspots" : "Filter Wedding Hotspots"}</span>
          </button>
        </div>

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

        {/* Dynamic Cards Grid - Links Directly to City Page Layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center mt-12">
          {filteredDestinations.length > 0 ? (
            filteredDestinations.map((dest) => (
              <DestinationCard
                key={dest.name}
                dest={dest}
                propertyCount={cityPropertiesMap[dest.name.toLowerCase()] || 0}
                className="h-[400px]"
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

    </div>
  );
}

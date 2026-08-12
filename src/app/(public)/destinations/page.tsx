"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Compass, LayoutGrid, List, ArrowUpDown, HeartHandshake } from "lucide-react";
import { useApp } from "@/context/AppContext";

import { DESTINATIONS, TAGS, type Destination } from "@/features/destinations";
import DestinationHero from "@/features/destinations/components/DestinationHero";
import DestinationsFilter from "@/features/destinations/components/DestinationsFilter";
import DestinationCard from "@/features/destinations/components/DestinationCard";
import DestinationDrawer from "@/features/destinations/components/DestinationDrawer";

export default function DestinationsPage() {
  const router = useRouter();
  const { properties, selectedCity } = useApp();
  const [activeFilter, setActiveFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [limitToSelectedCityRegion, setLimitToSelectedCityRegion] = useState(true);
  const [onlyWeddingDestinations, setOnlyWeddingDestinations] = useState(false); // Fix 5

  // Card Layout & Sorting States
  const [viewMode, setViewMode] = useState<"grid" | "compact">("grid");
  const [sortBy, setSortBy] = useState<"recommended" | "properties" | "score" | "name" | "wedding">("recommended");
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);

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

  // Fix 4: Compute real average growth score from DESTINATIONS data
  const avgGrowthScore = useMemo(() => {
    const scores = DESTINATIONS
      .map(d => parseFloat(d.investmentIndex?.split("/")[0] || "0"))
      .filter(s => s > 0);
    if (scores.length === 0) return "N/A";
    const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
    return `${avg.toFixed(1)}/10`;
  }, []);

  // Fix 4: Total wedding hotspots (venues + unique properties)
  const totalWeddingHotspots = useMemo(() => {
    return DESTINATIONS.reduce((acc, d) => {
      return acc + (d.weddingVenues?.length || 0) + (d.uniqueWeddingProperties?.length || 0);
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

  // Sorted list of destinations
  const sortedDestinations = useMemo(() => {
    const list = [...filteredDestinations];
    if (sortBy === "properties") {
      list.sort((a, b) => (cityPropertiesMap[b.name.toLowerCase()] || 0) - (cityPropertiesMap[a.name.toLowerCase()] || 0));
    } else if (sortBy === "score") {
      list.sort((a, b) => (parseFloat(b.investmentIndex || "0") - parseFloat(a.investmentIndex || "0")));
    } else if (sortBy === "name") {
      list.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === "wedding") {
      list.sort((a, b) => ((b.weddingVenues?.length || 0) + (b.uniqueWeddingProperties?.length || 0)) - ((a.weddingVenues?.length || 0) + (a.uniqueWeddingProperties?.length || 0)));
    }
    return list;
  }, [filteredDestinations, sortBy, cityPropertiesMap]);

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

      {/* 1. HERO SECTION — Fix 4: pass computed stats */}
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
        avgGrowthScore={avgGrowthScore}
        totalWeddingHotspots={totalWeddingHotspots}
      />

      {/* 2. DEDICATED CITY REGIONS & FILTER GRID */}
      <section className="relative py-12 px-4 md:px-8 max-w-7xl mx-auto w-full z-20 -mt-12 text-left bg-white rounded-2xl shadow-xl border border-indigo/5 p-6 md:p-10 mb-16">

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
          <div className="mb-8 p-4 rounded-sm bg-indigo/5 border border-indigo/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm font-semibold text-indigo animate-fade-in">
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

        {/* Card Controls Toolbar: Counter, Sort Dropdown, Wedding Toggle & Layout Mode Toggle */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 px-2 border-b border-sand/60 mb-8">
          <div className="flex items-center gap-2 text-xs md:text-sm font-bold text-indigo">
            <span className="bg-indigo/10 text-indigo px-3 py-1 rounded-md text-xs font-black">
              {sortedDestinations.length} {sortedDestinations.length === 1 ? "Destination" : "Destinations"}
            </span>
            <span className="text-charcoal/60 font-normal">
              available in this view
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end flex-wrap">

            {/* Fix 5: Wedding Only Toggle Button */}
            <button
              onClick={() => setOnlyWeddingDestinations((v) => !v)}
              suppressHydrationWarning
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black border transition-all cursor-pointer ${
                onlyWeddingDestinations
                  ? "bg-amber-500 border-amber-600 text-white shadow-md shadow-amber-500/30"
                  : "bg-white border-sand text-charcoal/70 hover:border-amber-400 hover:text-amber-700"
              }`}
              title="Show only wedding hotspot destinations"
            >
              <HeartHandshake className="w-3.5 h-3.5" />
              <span>Wedding Only</span>
              {onlyWeddingDestinations && (
                <span className="w-1.5 h-1.5 rounded-full bg-white inline-block ml-0.5" />
              )}
            </button>

            {/* Sort Select */}
            <div className="flex items-center gap-2 bg-sand/30 border border-sand px-3 py-1.5 rounded-xl text-xs font-bold text-indigo">
              <ArrowUpDown className="w-3.5 h-3.5 text-indigo/60" />
              <span className="text-charcoal/60 font-semibold hidden md:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="bg-transparent text-xs font-black text-indigo focus:outline-none cursor-pointer"
              >
                <option value="recommended">Recommended</option>
                <option value="properties">Most Properties</option>
                <option value="score">Highest Growth Score</option>
                <option value="wedding">Wedding Hotspots</option>
                <option value="name">Alphabetical (A-Z)</option>
              </select>
            </div>

            {/* View Mode Toggle Buttons */}
            <div className="flex items-center bg-sand/40 border border-sand p-1 rounded-xl gap-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "grid"
                  ? "bg-white text-indigo shadow-xs font-bold"
                  : "text-charcoal/50 hover:text-indigo"
                  }`}
                title="Grid View"
                aria-label="Grid View Mode"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode("compact")}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${viewMode === "compact"
                  ? "bg-white text-indigo shadow-xs font-bold"
                  : "text-charcoal/50 hover:text-indigo"
                  }`}
                title="Compact List View"
                aria-label="Compact List View Mode"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Dynamic Cards Layout (Grid or Compact) */}
        <div
          className={
            viewMode === "grid"
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-center"
              : "flex flex-col gap-6"
          }
        >
          {sortedDestinations.length > 0 ? (
            sortedDestinations.map((dest) => (
              <DestinationCard
                key={dest.name}
                dest={dest}
                propertyCount={cityPropertiesMap[dest.name.toLowerCase()] || 0}
                onSelect={(selected) => setSelectedDestination(selected)}
                viewMode={viewMode}
              />
            ))
          ) : (
            <div className="col-span-full py-16 text-center bg-white border border-sand rounded-3xl p-8">
              <Compass className="w-12 h-12 text-charcoal/30 mx-auto mb-4 animate-bounce" />
              <h3 className="font-serif font-black text-xl text-indigo mb-1">No matching destinations</h3>
              <p className="text-xs font-semibold text-charcoal/50">
                {onlyWeddingDestinations
                  ? "No wedding hotspot destinations match your current filters."
                  : "Try adjusting filters or searching for another keyword."}
              </p>
              {onlyWeddingDestinations && (
                <button
                  onClick={() => setOnlyWeddingDestinations(false)}
                  className="mt-4 px-4 py-2 rounded-xl bg-amber-100 border border-amber-300 text-amber-800 text-xs font-black hover:bg-amber-200 transition-colors cursor-pointer"
                >
                  Remove Wedding Filter
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Destination Quick Detail Drawer */}
      <DestinationDrawer
        selectedDestination={selectedDestination}
        setSelectedDestination={setSelectedDestination}
        cityPropertiesMap={cityPropertiesMap}
      />

    </div>
  );
}

import React from "react";
import Image from "next/image";
import { Search, X, Building } from "lucide-react";
import { Destination } from "../data/destinations";

interface DestinationHeroProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  showSuggestions: boolean;
  setShowSuggestions: (show: boolean) => void;
  autocompleteSuggestions: Destination[];
  onSelectSuggestion: (dest: Destination) => void;
  totalDestinations: number;
  totalProperties: number;
  cityPropertiesMap: { [key: string]: number };
  // Fix 4: real computed stats instead of hardcoded values
  avgGrowthScore: string;
  totalWeddingHotspots: number;
}

export default function DestinationHero({
  searchQuery,
  setSearchQuery,
  showSuggestions,
  setShowSuggestions,
  autocompleteSuggestions,
  onSelectSuggestion,
  totalDestinations,
  totalProperties,
  cityPropertiesMap,
  avgGrowthScore,
  totalWeddingHotspots,
}: DestinationHeroProps) {
  const popularSearches = ["Udaipur", "Jaipur", "Shimla", "Ahmedabad"];

  return (
    <section className="relative pt-2 pb-20 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
      {/* Luxury Background Hero Container */}
      <div className="max-w-7xl mx-auto w-full relative rounded-[40px] bg-indigo overflow-hidden min-h-[500px] md:min-h-[560px] flex flex-col justify-between p-8 md:p-12 shadow-2xl border border-white/5 group">
        
        {/* Fix 3: next/image with slow hover parallax zoom effect */}
        <div className="absolute inset-0 overflow-hidden rounded-[40px] select-none pointer-events-none z-0">
          <Image
            src="/DestinationHero.png"
            alt="Royal Rajasthan Palace"
            fill
            className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[8000ms] ease-out"
            sizes="100vw"
            priority
          />
          {/* Dark gradient overlay for text contrast and premium feel */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo/50 via-indigo/40 to-indigo/80" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-indigo/90 to-transparent" />
        </div>

        {/* Content */}
        <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-6 mt-8 md:mt-12">
          <div className="flex flex-col items-center gap-3">
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-tight text-white max-w-3xl text-center">
              Explore Royal Destinations
            </h1>
            <p className="text-white/85 text-xs sm:text-sm md:text-base font-semibold max-w-2xl leading-relaxed text-center">
              Across <span className="text-amber-200 font-extrabold">{totalDestinations} premium cities</span> with <span className="text-gold font-extrabold">{totalProperties} verified active listings</span>
            </p>
          </div>

          {/* Interactive Search Autocomplete Floating Card */}
          <div className="relative w-full max-w-xl z-30 px-4 mt-2">
            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(28,37,48,0.12)] border border-sand/40 p-3">
              <div className="relative flex items-center bg-sand/15 rounded-[1.5rem] overflow-hidden px-4 py-0.5">
                <Search className="w-5 h-5 text-indigo flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  placeholder="Search by city or vibe (e.g. Udaipur, Fort)..."
                  className="w-full bg-transparent text-charcoal font-bold text-sm outline-none px-3.5 py-3.5 placeholder-charcoal/40"
                  suppressHydrationWarning
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setShowSuggestions(false);
                    }}
                    className="p-1.5 rounded-full hover:bg-sand text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Popular Searches Quick Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[10px] font-bold text-white/60">
              <span className="uppercase tracking-wider text-[8.5px] text-white/40">Popular:</span>
              {popularSearches.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchQuery(city);
                    setShowSuggestions(true);
                  }}
                  className="px-3 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 cursor-pointer hover:border-white/25 text-[10px] font-bold"
                  suppressHydrationWarning
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Suggestions Overlay Dropdown */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)} />
                <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-indigo/10 overflow-hidden text-left z-50 p-2 max-h-72 overflow-y-auto">
                  <div className="px-3 py-2 text-[9px] font-black text-charcoal/40 uppercase tracking-wider border-b border-sand/30">
                    Destination matches
                  </div>
                  <div className="flex flex-col gap-0.5 mt-1">
                    {autocompleteSuggestions.map((dest) => {
                      const count = cityPropertiesMap[dest.name.toLowerCase()] || 0;
                      return (
                        <button
                          key={dest.name}
                          type="button"
                          onClick={() => onSelectSuggestion(dest)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-sand/40 text-xs font-bold text-charcoal transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-3">
                            {/* Fix 3: next/image in autocomplete dropdown */}
                            <div className="relative w-8 h-8 rounded-lg overflow-hidden flex-shrink-0 border border-sand">
                              <Image
                                src={dest.image}
                                alt={dest.name}
                                fill
                                className="object-cover"
                                sizes="32px"
                              />
                            </div>
                            <div className="flex flex-col text-left">
                              <span className="text-charcoal font-bold text-sm leading-tight">{dest.name}</span>
                              <span className="text-[10px] text-charcoal/40 font-semibold">{dest.vibe}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-indigo font-bold flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-gold animate-pulse" />
                              {count} {count === 1 ? "listing" : "listings"}
                            </span>
                            <span className="text-[10px] text-indigo font-bold">{dest.tag} &rarr;</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Fix 4: Stats Dashboard — computed real values instead of hardcoded */}
        <div className="relative z-10 w-full flex flex-wrap items-center justify-center gap-x-12 gap-y-4 pt-6 border-t border-white/10 max-w-4xl mx-auto mb-4">
          {[
            { value: `${totalDestinations}`, label: "Heritage Cities" },
            { value: `${totalProperties}`, label: "Verified Listings" },
            { value: avgGrowthScore, label: "Avg Growth Score" },
            { value: `${totalWeddingHotspots}`, label: "Wedding Hotspots" },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center gap-0.5 min-w-[120px] text-center">
              <span className="text-xl sm:text-2xl font-serif font-black text-white leading-none">
                {stat.value}
              </span>
              <span className="text-[9px] font-bold text-white/50 uppercase tracking-widest leading-none mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

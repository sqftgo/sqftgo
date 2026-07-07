import React from "react";
import { Compass, Search, X, MapPin, Building } from "lucide-react";
import { Destination } from "@/data/destinations";

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
}: DestinationHeroProps) {
  const popularSearches = ["Udaipur", "Jaipur", "Shimla", "Ahmedabad"];

  return (
    <section className="relative pt-2 pb-12 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
      {/* Remove overflow-hidden from main container to ensure suggestions are never clipped by the header */}
      <div className="max-w-7xl mx-auto w-full relative rounded-[36px] bg-[#0c1b33] min-h-[500px] md:min-h-[540px] flex items-center justify-center p-6 sm:p-8 shadow-xl border border-white/5">

        {/* Background Image Wrapper with Rounded Clip */}
        <div className="absolute inset-0 overflow-hidden rounded-[36px] select-none pointer-events-none z-0">
          <img
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop"
            alt="Royal Rajasthan Palace"
            className="w-full h-full object-cover object-center opacity-45 mix-blend-overlay scale-100 transition-transform duration-[2000ms] hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#09152b]/70 via-[#09152b]/60 to-[#09152b]/80" />
        </div>

        {/* Content */}
        <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-5 py-4">
          <div className="flex flex-col items-center gap-2">

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight leading-tight text-white max-w-3xl text-center">
              <span className="text-terracotta">explore</span> royal destinations
            </h1>

            <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-1 text-center">
              across <strong className="text-white font-bold">{totalDestinations} premium cities</strong> with <strong className="text-gold font-bold">{totalProperties} verified active listings</strong>
            </p>
          </div>

          {/* Interactive Search Autocomplete */}
          <div className="relative w-full max-w-lg z-30 px-4 mt-1">
            <div className="relative flex items-center bg-white rounded-2xl shadow-2xl border-t-[4px] border-t-[#0c1b33] overflow-hidden px-4 py-1.5">
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
                className="w-full bg-transparent text-charcoal font-semibold text-sm outline-none px-3.5 py-3 placeholder-charcoal/40"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setShowSuggestions(false);
                  }}
                  className="p-1 rounded-full hover:bg-sand text-charcoal/50 hover:text-charcoal transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Popular Searches Quick Tags */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-4 text-[11px] font-bold text-white/60">
              <span>Popular:</span>
              {popularSearches.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => {
                    setSearchQuery(city);
                    setShowSuggestions(true);
                  }}
                  className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all border border-white/5 cursor-pointer hover:border-white/25"
                >
                  {city}
                </button>
              ))}
            </div>

            {/* Suggestions Overlay Dropdown (Vanilla CSS transition hover elements) */}
            {showSuggestions && autocompleteSuggestions.length > 0 && (
              <>
                <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setShowSuggestions(false)} />
                <div className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left z-50 p-2 max-h-72 overflow-y-auto">
                  <div className="px-3 py-1.5 text-[9px] font-black text-charcoal/40 uppercase tracking-wider border-b border-sand/30">
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
                            <img
                              src={dest.image}
                              alt={dest.name}
                              className="w-8 h-8 rounded-lg object-cover flex-shrink-0 border border-sand"
                            />
                            <div className="flex flex-col text-left">
                              <span className="text-charcoal font-bold text-sm leading-tight">{dest.name}</span>
                              <span className="text-[10px] text-charcoal/40 font-semibold">{dest.vibe}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-indigo font-bold flex items-center gap-1">
                              <Building className="w-3.5 h-3.5 text-gold" />
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

          {/* Stats Dashboard Grid (Lightweight, Vanilla design) */}
          <div className="grid grid-cols-3 gap-6 max-w-md w-full mt-6 text-white relative z-10 border-t border-white/10 pt-6">
            <div className="flex flex-col items-center">
              <span className="text-2xl font-serif font-black text-gold leading-none">{totalDestinations}</span>
              <span className="text-[9px] font-black uppercase text-white/50 tracking-wider mt-1.5">Heritage Cities</span>
            </div>
            <div className="flex flex-col items-center border-x border-white/10 px-4">
              <span className="text-2xl font-serif font-black text-gold leading-none">{totalProperties}</span>
              <span className="text-[9px] font-black uppercase text-white/50 tracking-wider mt-1.5">Verified Listings</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl font-serif font-black text-gold leading-none">9.4/10</span>
              <span className="text-[9px] font-black uppercase text-white/50 tracking-wider mt-1.5">Growth Score</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import React from "react";
import { Compass, Search, X, MapPin, Building } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
      <div className="max-w-7xl mx-auto w-full relative overflow-hidden rounded-[36px] bg-[#0c1b33] min-h-[480px] md:min-h-[520px] flex items-center justify-center p-6 sm:p-8 shadow-xl border border-white/5">
        {/* Background Image */}
        <img 
          src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop" 
          alt="Royal Rajasthan Palace" 
          className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none opacity-45 mix-blend-overlay scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#09152b]/70 via-[#09152b]/60 to-[#09152b]/80" />
        
        {/* Content */}
        <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-6 py-4">
          <div className="flex flex-col items-center gap-2">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-2 shadow-2xl"
            >
              <Compass className="w-3.5 h-3.5 text-gold animate-spin-slow" />
              <span>Discover Heritage India</span>
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight leading-tight text-white max-w-3xl text-center"
            >
              <span className="text-terracotta">explore</span> royal destinations
            </motion.h1>

            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-1 text-center"
            >
              across <strong className="text-white font-bold">{totalDestinations} premium cities</strong> with <strong className="text-gold font-bold">{totalProperties} verified active listings</strong>
            </motion.p>
          </div>

          {/* Interactive Search Autocomplete */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="relative w-full max-w-lg z-50 px-4 mt-2"
          >
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

            {/* Suggestions Overlay Dropdown */}
            <AnimatePresence>
              {showSuggestions && autocompleteSuggestions.length > 0 && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowSuggestions(false)} />
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute left-4 right-4 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden text-left z-50 p-2"
                  >
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
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-sand/40 text-xs font-bold text-charcoal transition-colors cursor-pointer"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-terracotta" />
                              <span>
                                {dest.name}{" "}
                                <span className="text-[10px] text-charcoal/40 font-semibold">
                                  &bull; {dest.vibe}
                                </span>
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-indigo font-bold flex items-center gap-1">
                                <Building className="w-3 h-3 text-gold" />
                                {count} {count === 1 ? "listing" : "listings"}
                              </span>
                              <span className="text-[10px] text-indigo font-bold">{dest.tag} &rarr;</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}



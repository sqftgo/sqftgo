import React, { useState } from "react";
import Link from "next/link";
import { X, Star, TrendingUp, MapPin, BookOpen, Phone, ExternalLink, ArrowRight, Compass } from "lucide-react";
import { Destination } from "@/data/destinations";

interface DestinationDrawerProps {
  selectedDestination: Destination | null;
  setSelectedDestination: (dest: Destination | null) => void;
  cityPropertiesMap: { [key: string]: number };
}

export default function DestinationDrawer({
  selectedDestination,
  setSelectedDestination,
  cityPropertiesMap,
}: DestinationDrawerProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "zones">("overview");

  if (!selectedDestination) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Self-contained lightweight Vanilla CSS Keyframe animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { transform: translate3d(100%, 0, 0); }
          to { transform: translate3d(0, 0, 0); }
        }
        .animate-fade-in-quick {
          animation: fadeIn 0.25s ease-out forwards;
        }
        .animate-slide-in-quick {
          animation: slideIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>

      {/* Dark glass backdrop overlay */}
      <div
        onClick={() => setSelectedDestination(null)}
        className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs animate-fade-in-quick"
      />

      {/* Drawer Container Panel */}
      <div
        className="relative z-50 w-full sm:w-[520px] bg-white text-charcoal shadow-2xl h-full overflow-y-auto flex flex-col no-scrollbar animate-slide-in-quick"
      >
        {/* Header Cover Image */}
        <div className="relative h-64 md:h-72 w-full bg-sand overflow-hidden flex-shrink-0 animate-fade-in-quick">
          <img 
            src={selectedDestination.image} 
            alt={selectedDestination.name} 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/30" />
          
          {/* Close absolute button */}
          <button
            onClick={() => setSelectedDestination(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors border border-white/10 cursor-pointer z-10"
            title="Close Details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6">
            <span className="text-[9px] font-black text-amber-200 bg-indigo/90 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo/20 shadow-md">
              {selectedDestination.tag}
            </span>
          </div>
        </div>

        {/* Dynamic Title Block */}
        <div className="px-6 md:px-8 pt-6 pb-2 text-left flex flex-col gap-1">
          <h2 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight leading-none">
            {selectedDestination.name}
          </h2>
          <p className="text-xs font-black uppercase text-terracotta tracking-wider flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{selectedDestination.title} &bull; {selectedDestination.vibe}</span>
          </p>
        </div>

        {/* Branded Tab Selectors */}
        <div className="flex border-b border-sand pb-px px-6 md:px-8 mt-4 text-left">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-center ${
              activeTab === "overview"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/50 hover:text-indigo font-semibold"
            }`}
          >
            🏛️ Overview & History
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("zones")}
            className={`flex-1 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 text-center ${
              activeTab === "zones"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/50 hover:text-indigo font-semibold"
            }`}
          >
            🗺️ Zones & Map
          </button>
        </div>

        {/* Body Content Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 text-left">
          {activeTab === "overview" ? (
            <>
              {/* Sourcing Real-Estate Metrics Panel */}
              <div className="bg-sand/30 border border-sand rounded-3xl p-5 flex flex-col gap-4">
                <h3 className="font-serif font-black text-indigo text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-terracotta" />
                  <span>Real Estate Sourcing Statistics</span>
                </h3>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="bg-white border border-sand/70 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                    <span className="text-[8px] font-bold text-charcoal/45 uppercase tracking-wider">Active properties</span>
                    <span className="text-sm font-serif font-black text-indigo">
                      {cityPropertiesMap[selectedDestination.name.toLowerCase()] || 0} Listed
                    </span>
                  </div>
                  <div className="bg-white border border-sand/70 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                    <span className="text-[8px] font-bold text-charcoal/45 uppercase tracking-wider">Investment score</span>
                    <span className="text-sm font-serif font-black text-emerald-600">
                      {selectedDestination.investmentIndex}
                    </span>
                  </div>
                  <div className="bg-white border border-sand/70 rounded-2xl p-3 flex flex-col gap-1 shadow-sm">
                    <span className="text-[8px] font-bold text-charcoal/45 uppercase tracking-wider">Price Index</span>
                    <span className="text-[10px] font-black text-terracotta truncate mt-1" title={selectedDestination.averagePrice}>
                      {selectedDestination.averagePrice}
                    </span>
                  </div>
                </div>
              </div>

              {/* Historic context */}
              <div className="flex flex-col gap-2">
                <h4 className="text-xs font-black text-indigo uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo" />
                  <span>Historical Background</span>
                </h4>
                <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
                  {selectedDestination.history}
                </p>
              </div>

              {/* Designated City Concierge Agent Lead */}
              <div className="bg-[#111827] border border-white/5 rounded-3xl p-5 flex items-center gap-4 text-white mt-auto relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/10 rounded-full blur-2xl pointer-events-none" />
                
                {/* Initials Avatar */}
                <div className="w-12 h-12 rounded-2xl bg-indigo text-white flex items-center justify-center font-extrabold text-base shadow-lg shadow-indigo/20 border border-white/10 flex-shrink-0">
                  {selectedDestination.agentName.charAt(0)}
                </div>
                
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-[#ffd899] uppercase tracking-widest">Designated Concierge Lead</span>
                  <span className="text-sm font-serif font-black text-white truncate">{selectedDestination.agentName}</span>
                  <span className="text-[10px] text-white/50 font-semibold">{selectedDestination.agentPhone}</span>
                </div>

                <a 
                  href={`tel:${selectedDestination.agentPhone}`}
                  className="p-2.5 rounded-xl bg-white/10 hover:bg-white text-white hover:text-charcoal transition-all border border-white/10 hover:scale-105"
                  title="Call Lead Agent"
                >
                  <Phone className="w-4 h-4" />
                </a>
              </div>
            </>
          ) : (
            <>
              {/* Best Residential Zones */}
              <div className="flex flex-col gap-3">
                <h4 className="text-xs font-black text-indigo uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-terracotta" />
                  <span>Premium Residential Zones</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {selectedDestination.topLocalities.map((loc) => (
                    <span 
                      key={loc}
                      className="bg-white border border-sand text-charcoal/85 text-xs font-bold px-3.5 py-2 rounded-xl hover:border-indigo/40 hover:text-indigo transition-all shadow-sm"
                    >
                      {loc}
                    </span>
                  ))}
                </div>
              </div>

              {/* Dynamic Google Maps Search Embed */}
              <div className="flex flex-col gap-3 mt-2">
                <h4 className="text-xs font-black text-indigo uppercase tracking-wider flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-indigo" />
                  <span>Interactive Regional Map</span>
                </h4>
                <div className="w-full h-56 rounded-3xl overflow-hidden border border-sand bg-sand/15 shadow-inner">
                  <iframe
                    title={`${selectedDestination.name} Regional Location Map`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(selectedDestination.name + ", " + selectedDestination.tag + ", India")}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
                  />
                </div>
              </div>
            </>
          )}

          {/* Drawer Footer Actions */}
          <div className="mt-auto border-t border-sand pt-6 flex flex-col">
            <Link
              href={`/listings?city=${selectedDestination.name}`}
              onClick={() => setSelectedDestination(null)}
              className="flex items-center justify-center gap-2 p-3.5 bg-indigo hover:bg-indigo-hover text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-md transition-colors text-center cursor-pointer w-full"
            >
              <span>View Listings</span>
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

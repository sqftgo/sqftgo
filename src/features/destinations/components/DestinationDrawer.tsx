"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, Star, TrendingUp, MapPin, BookOpen, ExternalLink, Compass, Sparkles, HeartHandshake, ShieldCheck, ArrowRight } from "lucide-react";
import { Destination, WeddingVenue, WeddingProperty } from "../data/destinations";
import { destinationListingsHref, destinationSlug } from "../logic";
import WeddingInquiryModal from "./WeddingInquiryModal";
import WeddingVenueCard from "./WeddingVenueCard";
import WeddingEstateCard from "./WeddingEstateCard";

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
  const [activeTab, setActiveTab] = useState<"wedding-venues" | "wedding-properties" | "overview" | "zones">("wedding-venues");
  const [inquiryTarget, setInquiryTarget] = useState<{
    item: WeddingVenue | WeddingProperty;
    type: "venue" | "property";
  } | null>(null);

  if (!selectedDestination) return null;

  const venues = selectedDestination.weddingVenues || [];
  const uniqueProperties = selectedDestination.uniqueWeddingProperties || [];

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Dark glass backdrop overlay */}
      <div
        onClick={() => setSelectedDestination(null)}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs animate-fade-in-quick"
      />

      {/* Drawer Container Panel */}
      <div
        className="relative z-50 w-full sm:w-[580px] bg-white text-charcoal shadow-2xl h-full overflow-y-auto flex flex-col no-scrollbar animate-slide-in-quick"
      >
        {/* Header Cover Image */}
        <div className="relative h-64 md:h-72 w-full bg-sand overflow-hidden flex-shrink-0 animate-fade-in-quick">
          <Image
            src={selectedDestination.image}
            alt={selectedDestination.name}
            fill
            className="object-cover"
            sizes="580px"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-black/40" />
          
          {/* Close absolute button */}
          <button
            onClick={() => setSelectedDestination(null)}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors border border-white/10 cursor-pointer z-10"
            title="Close Details"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
            <span className="text-[9px] font-black text-amber-200 bg-indigo/90 px-3 py-1 rounded-lg uppercase tracking-widest border border-indigo/20 shadow-md">
              {selectedDestination.tag}
            </span>
            <span className="text-[10px] font-black text-white bg-amber-600/90 px-3 py-1 rounded-lg uppercase tracking-widest border border-amber-400/30 shadow-md flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span>Wedding Destination</span>
            </span>
          </div>
        </div>

        {/* Dynamic Title Block */}
        <div className="px-6 md:px-8 pt-5 pb-2 text-left flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <h2 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight leading-none">
              {selectedDestination.name}
            </h2>
            <span className="text-xs font-black text-amber-700 bg-amber-100 border border-amber-300 px-3 py-1 rounded-full uppercase tracking-wider">
              {selectedDestination.vibe}
            </span>
          </div>
          <p className="text-xs font-black uppercase text-terracotta tracking-wider flex items-center gap-1.5 mt-1">
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>{selectedDestination.title} &bull; Growth Score {selectedDestination.investmentIndex}</span>
          </p>
        </div>

        {/* 4 Branded Tab Selectors */}
        <div className="flex border-b border-sand pb-px px-6 md:px-8 mt-3 text-left overflow-x-auto no-scrollbar gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("wedding-venues")}
            className={`px-3 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "wedding-venues"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/60 hover:text-indigo font-semibold"
            }`}
          >
            <span>💒 Wedding Places</span>
            <span className="bg-terracotta/10 text-terracotta px-1.5 py-0.5 rounded-md text-[10px]">
              {venues.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wedding-properties")}
            className={`px-3 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "wedding-properties"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/60 hover:text-indigo font-semibold"
            }`}
          >
            <span>💎 Unique Estates</span>
            <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md text-[10px]">
              {uniqueProperties.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`px-3 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "overview"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/60 hover:text-indigo font-semibold"
            }`}
          >
            <span>🏛️ History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("zones")}
            className={`px-3 pb-3 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === "zones"
                ? "border-terracotta text-terracotta font-extrabold"
                : "border-transparent text-charcoal/60 hover:text-indigo font-semibold"
            }`}
          >
            <span>🗺️ Map</span>
          </button>
        </div>

        {/* Body Content Details */}
        <div className="p-6 md:p-8 flex-1 flex flex-col gap-6 text-left">
          
          {/* TAB 1: WEDDING PLACES (VENUES) */}
          {activeTab === "wedding-venues" && (
            <div className="flex flex-col gap-5">
              <div className="bg-amber-500/10 border border-amber-300/40 rounded-2xl p-4 text-xs text-amber-900 font-semibold flex items-start gap-2.5">
                <HeartHandshake className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-amber-950 font-black text-xs uppercase tracking-wider">
                    Curated Wedding Places in {selectedDestination.name}
                  </strong>
                  Explore top palaces, fort resorts, and lakeside venues for hosting luxury destination weddings.
                </div>
              </div>

              {venues.length > 0 ? (
                venues.map((venue) => (
                  <WeddingVenueCard
                    key={venue.id}
                    venue={venue}
                    onInquire={(item) => setInquiryTarget({ item, type: "venue" })}
                  />
                ))
              ) : (
                <p className="text-xs text-charcoal/50 text-center py-8">No specific wedding venues listed for this destination.</p>
              )}
            </div>
          )}

          {/* TAB 2: UNIQUE WEDDING PROPERTIES */}
          {activeTab === "wedding-properties" && (
            <div className="flex flex-col gap-5">
              <div className="bg-indigo/5 border border-indigo/15 rounded-2xl p-4 text-xs text-indigo-950 font-semibold flex items-start gap-2.5">
                <ShieldCheck className="w-5 h-5 text-indigo shrink-0 mt-0.5" />
                <div>
                  <strong className="block text-indigo font-black text-xs uppercase tracking-wider">
                    Unique Wedding Properties in {selectedDestination.name}
                  </strong>
                  Palatial estates, heritage havelis, and fort villas shown as market typologies — not live SqftGo listings.
                </div>
              </div>

              {uniqueProperties.length > 0 ? (
                uniqueProperties.map((prop) => (
                  <WeddingEstateCard
                    key={prop.id}
                    property={prop}
                    onInquire={(item) => setInquiryTarget({ item, type: "property" })}
                  />
                ))
              ) : (
                <p className="text-xs text-charcoal/50 text-center py-8">No specific wedding properties listed for this destination.</p>
              )}
            </div>
          )}

          {/* TAB 3: OVERVIEW & HISTORY */}
          {activeTab === "overview" && (
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

              <div className="bg-charcoal border border-white/5 rounded-3xl p-5 flex items-center gap-4 text-white mt-auto relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/10 rounded-full blur-2xl pointer-events-none" />
                <div className="flex-1 flex flex-col min-w-0">
                  <span className="text-[8px] font-black text-gold uppercase tracking-widest">Wedding enquiry</span>
                  <span className="text-sm font-serif font-black text-white truncate">Ask SqftGo about {selectedDestination.name}</span>
                  <span className="text-[10px] text-white/50 font-semibold">Use the venue cards to send a verified enquiry — we do not publish personal agent numbers here.</span>
                </div>
              </div>
            </>
          )}

          {/* TAB 4: ZONES & MAP */}
          {activeTab === "zones" && (
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
                <div className="w-full h-64 rounded-3xl overflow-hidden border border-sand bg-sand/15 shadow-inner">
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
          <div className="mt-auto border-t border-sand pt-6 flex flex-col gap-3">
            <Link
              href={`/destinations/${destinationSlug(selectedDestination.name)}`}
              onClick={() => setSelectedDestination(null)}
              className="flex items-center justify-center gap-2 p-3.5 bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-xs tracking-wider uppercase rounded-2xl shadow-md transition-colors text-center cursor-pointer w-full"
            >
              <span>Explore Dedicated {selectedDestination.name} Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href={destinationListingsHref(selectedDestination.name)}
              onClick={() => setSelectedDestination(null)}
              className="flex items-center justify-center gap-2 p-3 bg-sand/30 hover:bg-sand/60 text-charcoal font-extrabold text-xs tracking-wider uppercase rounded-2xl border border-sand transition-colors text-center cursor-pointer w-full"
            >
              <span>View All Properties in {selectedDestination.name}</span>
              <ExternalLink className="w-4 h-4 text-charcoal/60" />
            </Link>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {inquiryTarget && (
        <WeddingInquiryModal
          item={inquiryTarget.item}
          itemType={inquiryTarget.type}
          destinationName={selectedDestination.name}
          onClose={() => setInquiryTarget(null)}
        />
      )}
    </div>
  );
}

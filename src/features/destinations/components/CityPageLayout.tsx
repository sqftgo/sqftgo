"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  MapPin, Star, TrendingUp, IndianRupee, Sparkles, 
  HeartHandshake, ChevronRight, Phone, Compass, BookOpen, 
  Users, CheckCircle2, ShieldCheck, ArrowRight, Home
} from "lucide-react";
import { Destination, WeddingVenue, WeddingProperty, DESTINATIONS } from "../data/destinations";
import WeddingInquiryModal from "./WeddingInquiryModal";

interface CityPageLayoutProps {
  destination: Destination;
}

export default function CityPageLayout({ destination }: CityPageLayoutProps) {
  const [activeTab, setActiveTab] = useState<"venues" | "estates" | "zones" | "history">("venues");
  const [inquiryTarget, setInquiryTarget] = useState<{
    item: WeddingVenue | WeddingProperty;
    type: "venue" | "property";
  } | null>(null);

  const venues = destination.weddingVenues || [];
  const uniqueProperties = destination.uniqueWeddingProperties || [];
  
  // Other destinations in the same region or fallback
  const relatedDestinations = DESTINATIONS
    .filter(d => d.name.toLowerCase() !== destination.name.toLowerCase())
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-cream/30 flex flex-col text-charcoal relative">
      
      {/* 1. HERO HEADER SECTION */}
      <div className="relative min-h-[460px] md:min-h-[520px] w-full bg-[#0F172A] text-white overflow-hidden flex flex-col justify-between p-6 md:p-12">
        {/* Cover Photo with Sunset grading */}
        <div className="absolute inset-0 z-0">
          <img 
            src={destination.image} 
            alt={destination.name} 
            className="w-full h-full object-cover sepia-[15%] brightness-[80%] saturate-[120%]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/70 to-black/60" />
        </div>

        {/* Breadcrumb Navigation */}
        <div className="relative z-10 max-w-7xl mx-auto w-full flex items-center gap-2 text-xs font-bold text-white/70">
          <Link href="/" className="hover:text-amber-300 transition-colors flex items-center gap-1">
            <Home className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          <Link href="/destinations" className="hover:text-amber-300 transition-colors">
            Destinations
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          <span className="text-amber-300">{destination.tag}</span>
          <ChevronRight className="w-3.5 h-3.5 text-white/40" />
          <span className="text-white font-extrabold">{destination.name} Wedding Places</span>
        </div>

        {/* Main City Title Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full py-8 text-left flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-black/50 backdrop-blur-md border border-white/20 text-amber-200 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{destination.tag}</span>
            </span>
            <span className="bg-amber-500/20 backdrop-blur-md border border-amber-400/40 text-amber-300 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{destination.vibe} Wedding Hotspot</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-lg">
            {destination.name} Wedding Showcase
          </h1>

          <p className="text-sm sm:text-base text-amber-200/90 font-serif font-bold tracking-wide flex items-center gap-2 max-w-3xl">
            <Star className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
            <span>{destination.title} &bull; Explore best wedding places, palace mandaps & available celebration villas in {destination.name}</span>
          </p>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 max-w-4xl">
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-white/50 tracking-wider">Growth Score</span>
                <span className="text-sm md:text-base font-serif font-black text-white">{destination.investmentIndex}</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
              <IndianRupee className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex flex-col min-w-0">
                <span className="text-[8px] font-black uppercase text-white/50 tracking-wider">Avg Venue Price</span>
                <span className="text-xs font-serif font-black text-amber-200 truncate" title={destination.averagePrice}>
                  {destination.averagePrice}
                </span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
              <HeartHandshake className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-white/50 tracking-wider">Best Wedding Places</span>
                <span className="text-sm md:text-base font-serif font-black text-white">{venues.length} Venues</span>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-3.5 flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-amber-400 shrink-0" />
              <div className="flex flex-col">
                <span className="text-[8px] font-black uppercase text-white/50 tracking-wider">Available Estates</span>
                <span className="text-sm md:text-base font-serif font-black text-white">{uniqueProperties.length} Villas</span>
              </div>
            </div>
          </div>
        </div>

        {/* Empty spacing element */}
        <div className="h-2" />
      </div>

      {/* 2. STICKY SUB-HEADER TAB NAVIGATION */}
      <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-sand shadow-sm py-3 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setActiveTab("venues")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === "venues"
                  ? "bg-terracotta border-terracotta text-white shadow-md"
                  : "bg-white border-sand hover:bg-sand/30 text-charcoal/70"
              }`}
            >
              <span>💒 Best Wedding Places</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === "venues" ? "bg-white/20 text-white" : "bg-sand text-charcoal"}`}>
                {venues.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("estates")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === "estates"
                  ? "bg-terracotta border-terracotta text-white shadow-md"
                  : "bg-white border-sand hover:bg-sand/30 text-charcoal/70"
              }`}
            >
              <span>💎 Available Celebration Villas</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] ${activeTab === "estates" ? "bg-white/20 text-white" : "bg-sand text-charcoal"}`}>
                {uniqueProperties.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("zones")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === "zones"
                  ? "bg-terracotta border-terracotta text-white shadow-md"
                  : "bg-white border-sand hover:bg-sand/30 text-charcoal/70"
              }`}
            >
              <span>📍 Locality Zones & Map</span>
            </button>

            <button
              onClick={() => setActiveTab("history")}
              className={`px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer flex items-center gap-2 border ${
                activeTab === "history"
                  ? "bg-terracotta border-terracotta text-white shadow-md"
                  : "bg-white border-sand hover:bg-sand/30 text-charcoal/70"
              }`}
            >
              <span>🏛️ History & Concierge</span>
            </button>
          </div>

          <a
            href={`tel:${destination.agentPhone}`}
            className="hidden lg:flex items-center gap-2 px-4 py-2 bg-indigo text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-indigo-hover transition-colors shrink-0 shadow-md"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300" />
            <span>Concierge: {destination.agentName}</span>
          </a>
        </div>
      </div>

      {/* 3. MAIN PAGE CONTENT BODY */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-10 flex flex-col gap-12 text-left">
        
        {/* SECTION 1: BEST WEDDING PLACES */}
        <section id="venues" className="flex flex-col gap-6 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand pb-4">
            <div>
              <span className="text-[10px] font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-md border border-amber-300">
                Palace & Heritage Celebrations
              </span>
              <h2 className="text-3xl font-serif font-black text-indigo mt-2">
                Best Wedding Places in {destination.name}
              </h2>
            </div>
            <p className="text-xs text-charcoal/70 font-semibold max-w-md">
              Discover iconic heritage palaces, lakeside fort mandaps, and luxury wedding venues in {destination.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.length > 0 ? (
              venues.map((venue) => (
                <div 
                  key={venue.id}
                  className="bg-white border border-sand hover:border-amber-400/60 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group"
                >
                  <div className="relative h-56 w-full bg-sand/30 overflow-hidden">
                    <img 
                      src={venue.image} 
                      alt={venue.name} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-amber-200 px-3 py-1 rounded-full border border-white/20">
                      {venue.type}
                    </span>
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-terracotta text-white px-3.5 py-1 rounded-full shadow-md">
                      {venue.pricePerEvent}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <h3 className="text-xl font-serif font-black drop-shadow-md">{venue.name}</h3>
                      <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">{venue.vibe}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                    <p className="text-xs text-charcoal/80 font-medium leading-relaxed">
                      {venue.description}
                    </p>

                    <div className="flex items-center gap-2 text-xs font-bold text-indigo bg-sand/30 p-2.5 rounded-xl border border-sand">
                      <Users className="w-4 h-4 text-terracotta shrink-0" />
                      <span>Guest Capacity: <strong className="text-charcoal">{venue.capacity}</strong></span>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5">
                      {venue.highlights.map((h, i) => (
                        <span 
                          key={i}
                          className="bg-sand/30 text-charcoal/80 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-sand flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setInquiryTarget({ item: venue, type: "venue" })}
                      className="mt-2 w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Inquire & Book Venue</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white border border-sand rounded-3xl p-8">
                <p className="text-xs text-charcoal/50 font-bold">No specific wedding venues listed for {destination.name}.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: AVAILABLE CELEBRATION VILLAS & ESTATES */}
        <section id="estates" className="flex flex-col gap-6 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand pb-4">
            <div>
              <span className="text-[10px] font-black text-indigo uppercase tracking-widest bg-indigo/10 px-3 py-1 rounded-md border border-indigo/20">
                Palatial Real Estate & Fort Villas
              </span>
              <h2 className="text-3xl font-serif font-black text-indigo mt-2">
                Available Wedding Villas & Estates in {destination.name}
              </h2>
            </div>
            <p className="text-xs text-charcoal/70 font-semibold max-w-md">
              Palatial estates and heritage haveli villas available for purchase or lease, specifically outfitted for hosting private destination weddings.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {uniqueProperties.length > 0 ? (
              uniqueProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="bg-white border border-sand hover:border-indigo/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row group"
                >
                  <div className="relative h-64 md:h-auto md:w-5/12 bg-sand/30 overflow-hidden shrink-0">
                    <img 
                      src={prop.image} 
                      alt={prop.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                    
                    <span className="absolute top-3 left-3 text-[9px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-amber-200 px-3 py-1 rounded-full border border-white/20">
                      {prop.propertyType}
                    </span>
                    <span className="absolute top-3 right-3 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-3.5 py-1 rounded-full shadow-md">
                      {prop.price}
                    </span>

                    <div className="absolute bottom-3 left-4 right-4 text-white">
                      <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">{prop.location}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 gap-4">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-serif font-black text-indigo">{prop.title}</h3>
                      <p className="text-xs text-charcoal/80 font-medium leading-relaxed">
                        {prop.description}
                      </p>

                      <div className="bg-sand/30 border border-sand rounded-xl p-3 text-xs font-bold text-indigo mt-1">
                        <span>📐 Specs: {prop.specs}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {prop.features.map((f, i) => (
                          <span 
                            key={i}
                            className="bg-sand/20 text-charcoal/80 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-sand flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3 h-3 text-indigo" />
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setInquiryTarget({ item: prop, type: "property" })}
                        className="w-full py-3.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-200" />
                        <span>Inquire / Schedule Private Tour</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-12 text-center bg-white border border-sand rounded-3xl p-8">
                <p className="text-xs text-charcoal/50 font-bold">No specific wedding villas listed for {destination.name}.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: ZONES & INTERACTIVE MAP */}
        <section id="zones" className="flex flex-col gap-6 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-sand pb-4">
            <div>
              <span className="text-[10px] font-black text-terracotta uppercase tracking-widest bg-terracotta/10 px-3 py-1 rounded-md border border-terracotta/20">
                Regional Infrastructure
              </span>
              <h2 className="text-3xl font-serif font-black text-indigo mt-2">
                Locality Zones & Interactive Map
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-sand rounded-3xl p-6 flex flex-col gap-4 shadow-md">
              <h3 className="text-base font-serif font-black text-indigo flex items-center gap-2">
                <MapPin className="w-5 h-5 text-terracotta" />
                <span>Prime Localities</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {destination.topLocalities.map((loc) => (
                  <span 
                    key={loc}
                    className="bg-sand/30 border border-sand text-charcoal font-bold text-xs px-3.5 py-2 rounded-xl hover:border-indigo/40 hover:text-indigo transition-all shadow-xs"
                  >
                    📍 {loc}
                  </span>
                ))}
              </div>

              <div className="mt-4 p-4 rounded-2xl bg-indigo/5 border border-indigo/15 text-xs text-charcoal/80 font-semibold leading-relaxed">
                <strong className="block text-indigo font-black mb-1">Infrastructure Note:</strong>
                High-demand wedding & heritage zones situated near major lakes, fort corridors, and expressway connections in {destination.name}.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-sand rounded-3xl overflow-hidden shadow-md h-80 lg:h-auto">
              <iframe
                title={`${destination.name} Map`}
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: '320px' }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(destination.name + ", " + destination.tag + ", India")}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
              />
            </div>
          </div>
        </section>

        {/* SECTION 4: HISTORY & CONCIERGE LEAD */}
        <section id="history" className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="lg:col-span-2 bg-white border border-sand rounded-3xl p-8 flex flex-col gap-4 shadow-md">
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo" />
              <span className="text-[10px] font-black uppercase text-indigo tracking-widest">Heritage Context</span>
            </div>

            <h2 className="text-3xl font-serif font-black text-indigo">
              Historical Background of {destination.name}
            </h2>

            <p className="text-sm text-charcoal/80 leading-relaxed font-semibold">
              {destination.history}
            </p>
          </div>

          {/* Concierge Card */}
          <div className="bg-[#0F172A] border border-white/10 text-white rounded-3xl p-8 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex flex-col gap-4 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30 w-fit">
                Designated City Concierge
              </span>

              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-charcoal flex items-center justify-center font-serif font-black text-xl shadow-lg border border-amber-300">
                  {destination.agentName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-xl font-serif font-black text-white">{destination.agentName}</h3>
                  <span className="text-xs text-white/60 font-semibold">{destination.agentPhone}</span>
                </div>
              </div>

              <p className="text-xs text-white/70 font-medium leading-relaxed mt-2">
                Specialized in luxury palatial acquisitions, off-market celebration villas, and royal wedding venue bookings across {destination.name}.
              </p>
            </div>

            <a
              href={`tel:${destination.agentPhone}`}
              className="mt-6 flex items-center justify-center gap-2 py-4 bg-amber-400 hover:bg-amber-300 text-[#0F172A] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all"
            >
              <Phone className="w-4 h-4" />
              <span>Call Concierge Agent</span>
            </a>
          </div>
        </section>

        {/* RELATED DESTINATIONS */}
        <section className="flex flex-col gap-6 pt-10 border-t border-sand">
          <div className="flex items-center justify-between">
            <h3 className="text-2xl font-serif font-black text-indigo">Explore Other Wedding Destinations</h3>
            <Link href="/destinations" className="text-xs font-black uppercase text-terracotta hover:underline flex items-center gap-1">
              <span>View All Destinations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {relatedDestinations.map(d => (
              <Link 
                key={d.name}
                href={`/destinations/${d.name.toLowerCase()}`}
                className="group bg-white border border-sand rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all p-4 flex items-center gap-4"
              >
                <img 
                  src={d.image} 
                  alt={d.name} 
                  className="w-16 h-16 rounded-xl object-cover group-hover:scale-105 transition-transform" 
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-serif font-black text-indigo group-hover:text-terracotta transition-colors truncate">
                    {d.name}
                  </span>
                  <span className="text-[10px] text-charcoal/60 font-semibold">{d.tag} &bull; {d.vibe}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>

      </main>

      {/* Inquiry Modal */}
      {inquiryTarget && (
        <WeddingInquiryModal
          item={inquiryTarget.item}
          itemType={inquiryTarget.type}
          destinationName={destination.name}
          onClose={() => setInquiryTarget(null)}
        />
      )}
    </div>
  );
}

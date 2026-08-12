"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
  MapPin, Star, Sparkles, 
  Phone, Compass, BookOpen, 
  Users, CheckCircle2, ShieldCheck, ArrowRight, ArrowLeft
} from "lucide-react";
import { Destination, WeddingVenue, WeddingProperty, DESTINATIONS } from "../data/destinations";
import WeddingInquiryModal from "./WeddingInquiryModal";

interface CityPageLayoutProps {
  destination: Destination;
}

export default function CityPageLayout({ destination }: CityPageLayoutProps) {
  const [inquiryTarget, setInquiryTarget] = useState<{
    item: WeddingVenue | WeddingProperty;
    type: "venue" | "property";
  } | null>(null);

  const venues = destination.weddingVenues || [];
  const uniqueProperties = destination.uniqueWeddingProperties || [];

  // Related destinations — same region first, fallback to any
  const sameRegion = DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase() !== destination.name.toLowerCase() &&
      d.tag === destination.tag
  );
  const fallback = DESTINATIONS.filter(
    (d) =>
      d.name.toLowerCase() !== destination.name.toLowerCase() &&
      d.tag !== destination.tag
  );
  const relatedDestinations = [...sameRegion, ...fallback].slice(0, 3);

  // Scroll to section instead of state-driven show/hide
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen bg-cream/30 flex flex-col text-charcoal relative">
      
      {/* 1. HERO HEADER SECTION */}
      <div className="relative min-h-[360px] md:min-h-[420px] w-full bg-[#0F172A] text-white overflow-hidden flex flex-col justify-between p-8 md:p-14">
        {/* cover image */}
        <div className="absolute inset-0 z-0 select-none pointer-events-none">
          <Image
            src={destination.image}
            alt={destination.name}
            fill
            className="object-cover sepia-[12%] brightness-[75%] saturate-[125%] scale-100 transition-transform duration-[6000ms] hover:scale-105"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/40 via-[#0F172A]/70 to-[#0F172A]" />
          <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#0F172A] to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto w-full">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2.5 text-[10px] font-black uppercase tracking-widest text-white/80 hover:text-amber-300 group transition-all"
          >
            <span className="flex items-center justify-center w-8 h-8 rounded-full bg-white/10 group-hover:bg-white/20 transition-all border border-white/5">
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            </span>
            <span>BACK TO ALL DESTINATIONS</span>
          </Link>
        </div>

        {/* Main City Title Content */}
        <div className="relative z-10 max-w-7xl mx-auto w-full py-8 text-left flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="bg-black/55 backdrop-blur-md border border-white/15 text-amber-200 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-amber-400" />
              <span>{destination.tag}</span>
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-serif font-black text-white leading-none tracking-tight drop-shadow-2xl">
            {destination.name}
          </h1>

          <p className="text-sm sm:text-lg text-amber-200/90 font-serif font-bold tracking-wide flex items-center gap-2.5 max-w-3xl drop-shadow-md">
            <Star className="w-4 h-4 fill-amber-300 text-amber-300 shrink-0" />
            <span>{destination.title} &bull; Showcase of royal wedding venues &amp; heritage estates.</span>
          </p>
        </div>

        <div className="h-2" />
      </div>

      {/* 2. STICKY SUB-HEADER TAB NAVIGATION — Elegant Floating Glass Capsule */}
      <div className="sticky top-0 z-30 py-4 px-4 md:px-8 bg-transparent pointer-events-none">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 bg-white/90 backdrop-blur-xl rounded-full shadow-[0_12px_40px_rgba(28,37,48,0.12)] border border-sand/65 p-2 pointer-events-auto flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar shrink-0 w-full sm:w-auto px-2">
            {[
              { id: "venues", label: "💒 Wedding Venues", count: venues.length },
              { id: "estates", label: "💎 Celebration Villas", count: uniqueProperties.length },
              { id: "zones", label: "📍 Locality Map" },
              { id: "history", label: "🏛️ History & Concierge" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollTo(tab.id)}
                className="px-4 py-2 rounded-full text-[10px] md:text-[11px] font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 text-charcoal/75 hover:text-indigo hover:bg-sand/40 shrink-0"
              >
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className="text-[9px] px-1.5 py-0.5 rounded-full font-black bg-sand text-charcoal/60">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <a
            href={`tel:${destination.agentPhone}`}
            className="hidden sm:flex items-center gap-2.5 px-6 py-3 bg-indigo text-white rounded-full text-xs font-black uppercase tracking-widest hover:bg-indigo-hover transition-all duration-300 shadow-md hover:shadow-indigo/25 mr-1 hover:-translate-y-0.5 active:translate-y-0 shrink-0"
          >
            <Phone className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span>Call Concierge</span>
          </a>
        </div>
      </div>

      {/* 3. MAIN PAGE CONTENT BODY */}
      <main className="max-w-7xl mx-auto w-full px-4 md:px-8 py-8 flex flex-col gap-16 text-left">
        
        {/* SECTION 1: BEST WEDDING PLACES */}
        <section id="venues" className="flex flex-col gap-8 scroll-mt-24">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand/80 pb-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-amber-700 uppercase tracking-widest bg-amber-100 px-3 py-1 rounded-md border border-amber-300 w-fit">
                Palace &amp; Heritage Celebrations
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo mt-1">
                Best Wedding Places in {destination.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/60 font-semibold max-w-md leading-relaxed">
              Discover iconic heritage palaces, lakeside fort mandaps, and luxury wedding venues in {destination.name}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {venues.length > 0 ? (
              venues.map((venue) => (
                <div 
                  key={venue.id}
                  className="bg-white border border-sand hover:border-amber-400/40 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col group hover:-translate-y-1.5"
                >
                  <div className="relative h-60 w-full bg-sand/20 overflow-hidden">
                    <Image
                      src={venue.image}
                      alt={venue.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                    
                    <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-amber-200 px-3 py-1 rounded-full border border-white/15">
                      {venue.type}
                    </span>
                    <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider bg-terracotta text-white px-3.5 py-1 rounded-full shadow-lg">
                      {venue.pricePerEvent}
                    </span>

                    <div className="absolute bottom-4 left-5 right-5 text-white">
                      <h3 className="text-2xl font-serif font-black drop-shadow-md tracking-tight leading-tight">{venue.name}</h3>
                      <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider mt-1">{venue.vibe}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col gap-4 flex-1 justify-between">
                    <p className="text-xs text-charcoal/75 font-semibold leading-relaxed">
                      {venue.description}
                    </p>

                    <div className="flex items-center gap-2.5 text-xs font-extrabold text-indigo bg-sand/30 p-3 rounded-2xl border border-sand/40">
                      <Users className="w-4.5 h-4.5 text-terracotta shrink-0" />
                      <span>Guest Capacity: <strong className="text-charcoal">{venue.capacity}</strong></span>
                    </div>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-1.5">
                      {venue.highlights.map((h, i) => (
                        <span 
                          key={i}
                          className="bg-sand/20 text-charcoal/80 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-sand/40 flex items-center gap-1"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{h}</span>
                        </span>
                      ))}
                    </div>

                    <button
                      onClick={() => setInquiryTarget({ item: venue, type: "venue" })}
                      className="mt-2 w-full py-4 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Inquire &amp; Book Venue</span>
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-sand rounded-3xl p-8">
                <p className="text-xs text-charcoal/50 font-bold">No specific wedding venues listed for {destination.name}.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 2: AVAILABLE CELEBRATION VILLAS & ESTATES */}
        <section id="estates" className="flex flex-col gap-8 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand/80 pb-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-indigo uppercase tracking-widest bg-indigo/10 px-3 py-1 rounded-md border border-indigo/20 w-fit">
                Palatial Real Estate &amp; Fort Villas
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo mt-1">
                Available Wedding Villas &amp; Estates in {destination.name}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-charcoal/60 font-semibold max-w-md leading-relaxed">
              Palatial estates and heritage haveli villas available for purchase or lease, specifically outfitted for hosting private destination weddings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {uniqueProperties.length > 0 ? (
              uniqueProperties.map((prop) => (
                <div 
                  key={prop.id}
                  className="bg-white border border-sand hover:border-indigo/35 rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 flex flex-col md:flex-row group hover:-translate-y-1.5"
                >
                  <div className="relative h-64 md:h-auto md:w-5/12 bg-sand/20 overflow-hidden shrink-0">
                    <Image
                      src={prop.image}
                      alt={prop.title}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700"
                      sizes="(max-width: 768px) 100vw, 40vw"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest bg-black/60 backdrop-blur-md text-amber-200 px-3 py-1 rounded-full border border-white/15">
                      {prop.propertyType}
                    </span>
                    <span className="absolute top-4 right-4 text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white px-3.5 py-1 rounded-full shadow-lg">
                      {prop.price}
                    </span>

                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      <p className="text-[10px] text-amber-200 font-bold uppercase tracking-wider">{prop.location}</p>
                    </div>
                  </div>

                  <div className="p-6 flex flex-col justify-between flex-1 gap-5">
                    <div className="flex flex-col gap-2">
                      <h3 className="text-2xl font-serif font-black text-indigo leading-tight tracking-tight">{prop.title}</h3>
                      <p className="text-xs text-charcoal/70 font-semibold leading-relaxed">
                        {prop.description}
                      </p>

                      <div className="bg-sand/30 border border-sand/40 rounded-xl p-3 text-xs font-bold text-indigo mt-1.5">
                        <span>📐 Specifications: {prop.specs}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3">
                      <div className="flex flex-wrap gap-1.5">
                        {prop.features.map((f, i) => (
                          <span 
                            key={i}
                            className="bg-sand/20 text-charcoal/80 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-sand flex items-center gap-1"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-indigo" />
                            <span>{f}</span>
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => setInquiryTarget({ item: prop, type: "property" })}
                        className="w-full py-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-widest rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-200" />
                        <span>Schedule Private Tour</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-sand rounded-3xl p-8">
                <p className="text-xs text-charcoal/50 font-bold">No specific wedding villas listed for {destination.name}.</p>
              </div>
            )}
          </div>
        </section>

        {/* SECTION 3: ZONES & INTERACTIVE MAP */}
        <section id="zones" className="flex flex-col gap-8 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand pb-4">
            <div className="flex flex-col gap-1">
              <span className="text-[9px] font-black text-terracotta uppercase tracking-widest bg-terracotta/10 px-3 py-1 rounded-md border border-terracotta/20 w-fit">
                Regional Infrastructure
              </span>
              <h2 className="text-3xl font-serif font-black text-indigo mt-1">
                Locality Zones &amp; Interactive Map
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-sand rounded-3xl p-6 flex flex-col gap-4 shadow-lg hover:shadow-xl transition-all">
              <h3 className="text-base font-serif font-black text-indigo flex items-center gap-2">
                <MapPin className="w-5 h-5 text-terracotta" />
                <span>Prime Localities</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {destination.topLocalities.map((loc) => (
                  <span 
                    key={loc}
                    className="bg-sand/30 border border-sand/55 text-charcoal font-bold text-xs px-3.5 py-2.5 rounded-xl hover:border-indigo/40 hover:text-indigo transition-all shadow-xs"
                  >
                    📍 {loc}
                  </span>
                ))}
              </div>

              <div className="mt-4 p-4.5 rounded-2xl bg-indigo/5 border border-indigo/15 text-xs text-charcoal/80 font-semibold leading-relaxed">
                <strong className="block text-indigo font-black mb-1.5 text-xs uppercase tracking-wider">Infrastructure Note:</strong>
                High-demand wedding &amp; heritage zones situated near major lakes, fort corridors, and expressway connections in {destination.name}.
              </div>
            </div>

            <div className="lg:col-span-2 bg-white border border-sand rounded-3xl overflow-hidden shadow-lg h-80 lg:h-auto border-double-ruled p-1">
              <div className="w-full h-full rounded-2xl overflow-hidden">
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
          </div>
        </section>

        {/* SECTION 4: HISTORY & CONCIERGE LEAD */}
        <section id="history" className="grid grid-cols-1 lg:grid-cols-3 gap-8 scroll-mt-24 pt-6 border-t border-sand/60">
          
          {/* Heritage manuscript card design */}
          <div className="lg:col-span-2 bg-white border border-sand rounded-3xl p-8 flex flex-col gap-5 shadow-lg border-double-ruled relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sand/15 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-indigo" />
              <span className="text-[10px] font-black uppercase text-indigo tracking-widest">Heritage Context</span>
            </div>

            <h2 className="text-3xl font-serif font-black text-indigo">
              Historical Background of {destination.name}
            </h2>

            <p className="text-xs sm:text-sm text-charcoal/85 leading-relaxed font-semibold italic font-serif bg-sand/10 p-4 rounded-xl border border-sand/30">
              &quot;{destination.history}&quot;
            </p>
          </div>

          {/* Concierge Black Card style */}
          <div className="bg-[#0F172A] border border-amber-500/20 text-white rounded-3xl p-8 flex flex-col justify-between shadow-2xl relative overflow-hidden group hover:border-amber-400/40 transition-colors">
            <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-indigo/20 rounded-full blur-2xl pointer-events-none" />

            <div className="flex flex-col gap-5 relative z-10">
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-400/30 w-fit">
                Designated City Concierge
              </span>

              <div className="flex items-center gap-4 mt-1">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-charcoal flex items-center justify-center font-serif font-black text-2xl shadow-xl border border-amber-300 transition-transform group-hover:scale-105 duration-500">
                  {destination.agentName.charAt(0)}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-2xl font-serif font-black text-white leading-tight tracking-tight">{destination.agentName}</h3>
                  <span className="text-xs text-white/50 font-bold uppercase tracking-wider mt-1">{destination.agentPhone}</span>
                </div>
              </div>

              <p className="text-xs text-white/70 font-semibold leading-relaxed mt-2">
                Specialized in luxury palatial acquisitions, off-market celebration villas, and royal wedding venue bookings across {destination.name}.
              </p>
            </div>

            <a
              href={`tel:${destination.agentPhone}`}
              className="mt-8 flex items-center justify-center gap-2.5 py-4 bg-amber-400 hover:bg-amber-300 text-[#0F172A] font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Phone className="w-4 h-4" />
              <span>Call Concierge Agent</span>
            </a>
          </div>
        </section>

        {/* RELATED DESTINATIONS */}
        <section className="flex flex-col gap-6 pt-10 border-t border-sand">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-serif font-black text-indigo">Explore Other Wedding Destinations</h3>
              {sameRegion.length > 0 && (
                <p className="text-xs text-charcoal/50 font-semibold mt-1 flex items-center gap-1">
                  <Compass className="w-3.5 h-3.5 text-terracotta" />
                  More destinations in {destination.tag}
                </p>
              )}
            </div>
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
                className="group bg-white border border-sand rounded-3xl overflow-hidden shadow-md hover:shadow-xl hover:border-amber-400/35 transition-all p-4.5 flex items-center gap-4 hover:-translate-y-1"
              >
                <div className="relative w-18 h-18 rounded-2xl overflow-hidden shrink-0">
                  <Image
                    src={d.image}
                    alt={d.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                    sizes="72px"
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-lg font-serif font-black text-indigo group-hover:text-terracotta transition-colors truncate">
                    {d.name}
                  </span>
                  <span className="text-[10px] text-charcoal/60 font-semibold">{d.tag} &bull; {d.vibe}</span>
                  {d.tag === destination.tag && (
                    <span className="text-[9px] text-amber-700 font-black uppercase tracking-wider mt-1 w-fit bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">Same Region</span>
                  )}
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

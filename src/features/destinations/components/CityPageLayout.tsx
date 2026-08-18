"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin, Compass, ArrowRight
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PropertyCard } from "@/features/properties";
import { Destination, WeddingVenue, WeddingProperty, DESTINATIONS } from "../data/destinations";
import {
  destinationListingsHref,
  destinationSlug,
  listingsInDestination,
} from "../logic";
import WeddingInquiryModal from "./WeddingInquiryModal";
import WeddingVenueCard from "./WeddingVenueCard";
import WeddingEstateCard from "./WeddingEstateCard";

interface CityPageLayoutProps {
  destination: Destination;
}

export default function CityPageLayout({ destination }: CityPageLayoutProps) {
  const { properties } = useApp();
  const [inquiryTarget, setInquiryTarget] = useState<{
    item: WeddingVenue | WeddingProperty;
    type: "venue" | "property";
  } | null>(null);

  const venues = destination.weddingVenues || [];
  const uniqueProperties = destination.uniqueWeddingProperties || [];
  const liveListings = useMemo(
    () => listingsInDestination(properties, destination.name),
    [properties, destination.name]
  );
  const listingPreview = liveListings.slice(0, 6);
  const listingsHref = destinationListingsHref(destination.name);

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
      <section className="relative pt-2 pb-12 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
        {/* Luxury Background Hero Container */}
        <div className="max-w-7xl mx-auto w-full relative rounded-[40px] bg-indigo overflow-hidden min-h-[500px] md:min-h-[560px] flex flex-col justify-between p-8 md:p-12 shadow-2xl border border-white/5 group">

          {/* Cover image with zoom effect */}
          <div className="absolute inset-0 overflow-hidden rounded-[40px] select-none pointer-events-none z-0">
            <Image
              src={destination.image}
              alt={destination.name}
              fill
              className="object-cover object-center scale-100 group-hover:scale-105 transition-transform duration-[8000ms] ease-out brightness-[75%] saturate-[125%]"
              sizes="100vw"
              priority
            />
            {/* Dark gradient overlay for text contrast and premium feel */}
            <div className="absolute inset-0 bg-gradient-to-b from-indigo/50 via-indigo/45 to-indigo/85" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-indigo/90 to-transparent" />
          </div>

          {/* Main City Title Content */}
          <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-4 mt-4 md:mt-8">
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              <span className="bg-black/55 backdrop-blur-md border border-white/15 text-amber-200 text-[10px] font-black uppercase tracking-widest px-3.5 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                <span>{destination.tag}</span>
              </span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black text-white leading-none tracking-tight drop-shadow-2xl">
              {destination.name}
            </h1>

            <p className="text-white/85 text-xs sm:text-sm md:text-base font-semibold max-w-2xl leading-relaxed text-center drop-shadow-md">
              <span className="text-amber-200 font-extrabold">{destination.title}</span> &bull; Showcase of royal wedding venues &amp; heritage estates.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-4">
              <Link
                href={listingsHref}
                className="px-5 py-2.5 rounded-xl bg-white text-indigo text-[11px] font-black uppercase tracking-widest hover:bg-amber-50 transition-colors shadow-md"
              >
                {liveListings.length > 0
                  ? `Browse ${liveListings.length} listing${liveListings.length === 1 ? "" : "s"}`
                  : "Browse listings"}
              </Link>
              <button
                type="button"
                onClick={() => scrollTo("venues")}
                className="px-5 py-2.5 rounded-xl bg-black/40 border border-white/20 text-white text-[11px] font-black uppercase tracking-widest hover:bg-black/55 transition-colors cursor-pointer"
              >
                Wedding venues
              </button>
            </div>
          </div>
        </div>
      </section>

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.length > 0 ? (
              venues.map((venue) => (
                <WeddingVenueCard
                  key={venue.id}
                  venue={venue}
                  onInquire={(item) => setInquiryTarget({ item, type: "venue" })}
                />
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

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {uniqueProperties.length > 0 ? (
              uniqueProperties.map((prop) => (
                <WeddingEstateCard
                  key={prop.id}
                  property={prop}
                  onInquire={(item) => setInquiryTarget({ item, type: "property" })}
                />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-sand rounded-3xl p-8">
                <p className="text-xs text-charcoal/50 font-bold">No specific wedding villas listed for {destination.name}.</p>
              </div>
            )}
          </div>
        </section>

        {/* LIVE MARKETPLACE LISTINGS */}
        <section id="listings" className="flex flex-col gap-8 scroll-mt-24 pt-6 border-t border-sand/60">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-sand/80 pb-5">
            <div className="flex flex-col gap-1.5">
              <span className="text-[9px] font-black text-emerald-800 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-md border border-emerald-200 w-fit">
                Live Marketplace
              </span>
              <h2 className="text-3xl sm:text-4xl font-serif font-black text-indigo mt-1">
                Properties in {destination.name}
              </h2>
            </div>
            <Link
              href={listingsHref}
              className="text-xs font-black uppercase text-terracotta hover:underline flex items-center gap-1 shrink-0"
            >
              <span>View all listings</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {listingPreview.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {listingPreview.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center bg-white border border-sand rounded-3xl p-8">
              <p className="text-xs text-charcoal/50 font-bold">
                No active listings in {destination.name} yet.
              </p>
              <Link
                href="/listings"
                className="inline-flex items-center gap-1 mt-4 text-xs font-black uppercase text-terracotta hover:underline"
              >
                Browse all cities
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}
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
                <span>Prime Localities</span>
              </h3>

              <div className="flex flex-wrap gap-2">
                {destination.topLocalities.map((loc) => (
                  <span
                    key={loc}
                    className="bg-sand/30 flex items-center gap-1
                     border border-sand/55 text-charcoal font-bold text-xs px-3.5 py-2.5 rounded-xl hover:border-indigo/40 hover:text-indigo transition-all shadow-xs"
                  >
                    <MapPin className="w-5 h-5 text-terracotta" /> {loc}
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
                href={`/destinations/${destinationSlug(d.name)}`}
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

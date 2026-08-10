"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles, Building2, TrendingUp, Eye, Coins } from "lucide-react";
import { Destination } from "../data/destinations";

interface DestinationCardProps {
  dest: Destination;
  propertyCount?: number;
  onSelect?: (dest: Destination) => void;
  className?: string;
  viewMode?: "grid" | "compact";
}

export default function DestinationCard({
  dest,
  propertyCount = 0,
  onSelect,
  className = "",
  viewMode = "grid",
}: DestinationCardProps) {
  const venueCount = dest.weddingVenues?.length || 0;
  const uniquePropCount = dest.uniqueWeddingProperties?.length || 0;
  const targetUrl = `/destinations/${dest.name.toLowerCase()}`;

  const handleQuickView = (e: React.MouseEvent) => {
    if (onSelect) {
      e.preventDefault();
      e.stopPropagation();
      onSelect(dest);
    }
  };

  // Compact Horizontal List Layout
  if (viewMode === "compact") {
    return (
      <div
        className={`group relative flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-lg hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      >
        {/* Compact Image */}
        <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden bg-slate-900 flex-shrink-0">
          <img
            src={dest.image}
            alt={dest.name}
            className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-90 saturate-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent pointer-events-none" />
          
          {/* Top Tag Badge */}
          <div className="absolute top-3 left-3 z-10 bg-black/60 backdrop-blur-md border border-white/15 text-white text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full flex items-center gap-1 shadow-md">
            <MapPin className="w-3 h-3 text-amber-400" />
            <span>{dest.tag}</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-5 md:p-6 flex flex-col justify-between text-left z-10">
          <div>
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <div className="flex items-center gap-2.5">
                <h3 className="text-2xl font-serif font-black text-white tracking-tight">
                  {dest.name}
                </h3>
                <span className="text-[9px] font-black text-amber-300 bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-widest">
                  {dest.vibe}
                </span>
              </div>
              
              {dest.investmentIndex && (
                <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-500/30 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>Score {dest.investmentIndex}</span>
                </span>
              )}
            </div>

            <p className="text-[10px] text-amber-200/90 font-bold uppercase tracking-wider mb-2">
              {dest.title}
            </p>

            <p className="text-xs text-white/70 font-normal leading-relaxed line-clamp-2 mb-4">
              {dest.desc}
            </p>
          </div>

          <div>
            {/* Dynamic Stats Row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/90 text-[11px] font-bold">
                <Building2 className="w-3.5 h-3.5 text-amber-400" />
                <span>{propertyCount} Properties</span>
              </span>

              {(venueCount > 0 || uniquePropCount > 0) && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>{venueCount + uniquePropCount} Wedding Hotspots</span>
                </span>
              )}

              {dest.averagePrice && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-white/80 text-[11px] font-medium">
                  <Coins className="w-3.5 h-3.5 text-amber-300" />
                  <span>Avg {dest.averagePrice}</span>
                </span>
              )}
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href={targetUrl}
                className="flex-1 flex items-center justify-between h-11 px-4 rounded-xl bg-white hover:bg-amber-50 text-[#0F172A] font-extrabold text-xs tracking-wider uppercase transition-all shadow-md group-hover:shadow-amber-500/10"
              >
                <span>Explore Destination</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#0F172A]" />
              </Link>

              {onSelect && (
                <button
                  onClick={handleQuickView}
                  className="h-11 px-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Quick View Destination Details"
                >
                  <Eye className="w-4 h-4" />
                  <span className="hidden sm:inline">Quick Preview</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Standard Grid View Layout
  return (
    <div
      className={`group relative flex flex-col rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-xl hover:shadow-2xl hover:border-amber-400/40 transition-all duration-500 hover:-translate-y-2 cursor-pointer min-h-[460px] ${className}`}
      aria-label={`Explore ${dest.name} wedding places and available villas`}
    >
      {/* Cover Photo with Sunset luxury filter grading */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <img
          src={dest.image}
          alt={dest.name}
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[85%] saturate-[115%]"
        />

        {/* Multi-layered Vignette Dark Gradients */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-4/5 bg-gradient-to-t from-slate-950 via-slate-950/85 to-transparent pointer-events-none" />
      </div>

      {/* Top Badges Header */}
      <div className="relative z-10 p-4 flex items-center justify-between gap-2">
        {/* Left Badge: Region Tag */}
        <div className="bg-black/60 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-widest h-7 flex items-center gap-1.5 px-3 rounded-full shadow-md">
          <MapPin className="w-3.5 h-3.5 text-amber-400" />
          <span>{dest.tag}</span>
        </div>

        {/* Right Badges: Wedding & Rating */}
        <div className="flex items-center gap-2">
          {dest.investmentIndex && (
            <div className="bg-emerald-950/70 backdrop-blur-md border border-emerald-500/40 text-emerald-300 text-[9px] font-extrabold h-7 flex items-center gap-1 px-2.5 rounded-full shadow-md">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span>{dest.investmentIndex}</span>
            </div>
          )}

          {(venueCount > 0 || uniquePropCount > 0) && (
            <div className="bg-gradient-to-r from-amber-500/90 to-amber-700/90 backdrop-blur-md border border-amber-300/40 text-white text-[9px] font-black uppercase tracking-wider h-7 flex items-center gap-1 px-2.5 rounded-full shadow-md">
              <Sparkles className="w-3 h-3 text-amber-200" />
              <span className="hidden sm:inline">Wedding Hotspot</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex flex-col justify-end mt-auto p-6 text-left">
        <div className="flex flex-col gap-2">

          {/* City Name & Vibe Header */}
          <div className="flex items-center justify-between gap-3 w-full">
            <h3 className="text-3xl sm:text-4xl font-serif font-black text-white leading-none tracking-tight drop-shadow-lg group-hover:text-amber-100 transition-colors">
              {dest.name}
            </h3>
            <span className="text-[9px] font-black text-amber-300 bg-amber-400/15 px-2.5 py-1 rounded-md border border-amber-400/30 uppercase tracking-widest leading-none flex-shrink-0 backdrop-blur-xs">
              {dest.vibe}
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-[10px] text-amber-200/90 font-extrabold uppercase tracking-[0.15em]">
            {dest.title}
          </p>

          {/* 2-Line Description */}
          <p className="text-xs text-white/80 font-normal leading-relaxed my-1 line-clamp-2">
            {dest.desc}
          </p>

          {/* Dynamic Stats Chips Row */}
          <div className="flex flex-wrap items-center gap-1.5 my-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-white/90 text-[10px] font-bold">
              <Building2 className="w-3 h-3 text-amber-400" />
              <span>{propertyCount} Properties</span>
            </span>

            {(venueCount > 0 || uniquePropCount > 0) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-500/20 backdrop-blur-md border border-amber-400/30 text-amber-200 text-[10px] font-bold">
                <Sparkles className="w-3 h-3 text-amber-300" />
                <span>{venueCount + uniquePropCount} Venues</span>
              </span>
            )}

            {dest.averagePrice && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white/10 backdrop-blur-md border border-white/15 text-white/80 text-[10px] font-medium">
                <Coins className="w-3 h-3 text-amber-300" />
                <span className="truncate max-w-[140px]">{dest.averagePrice}</span>
              </span>
            )}
          </div>

          {/* Top Localities Pills (Preview) */}
          {dest.topLocalities && dest.topLocalities.length > 0 && (
            <div className="hidden sm:flex items-center gap-1 overflow-hidden opacity-90 my-0.5">
              <span className="text-[9px] text-amber-200/70 font-semibold uppercase tracking-wider flex-shrink-0">
                Top Areas:
              </span>
              <div className="flex items-center gap-1 truncate">
                {dest.topLocalities.slice(0, 3).map((loc) => (
                  <span
                    key={loc}
                    className="text-[9px] font-medium text-white/70 bg-white/5 border border-white/10 px-1.5 py-0.5 rounded"
                  >
                    {loc}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* CTAs Row */}
          <div className="mt-3 flex items-center gap-2 w-full">
            <Link
              href={targetUrl}
              className="flex-1 flex items-center justify-between h-12 px-4 rounded-xl bg-white hover:bg-amber-50 text-[#0F172A] font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:shadow-amber-900/20 cursor-pointer"
            >
              <span>Explore {dest.name}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#0F172A]" />
            </Link>

            {onSelect && (
              <button
                onClick={handleQuickView}
                className="h-12 px-3 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Quick View Destination Details"
                aria-label={`Quick View ${dest.name}`}
              >
                <Eye className="w-4 h-4 text-amber-200" />
              </button>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}


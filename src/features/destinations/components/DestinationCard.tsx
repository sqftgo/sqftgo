"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, MapPin, Sparkles } from "lucide-react";
import { Destination } from "../data/destinations";

interface DestinationCardProps {
  dest: Destination;
  propertyCount?: number;
  onSelect?: (dest: Destination) => void;
  className?: string;
}

export default function DestinationCard({ dest, className = "" }: DestinationCardProps) {
  const venueCount = dest.weddingVenues?.length || 0;
  const uniquePropCount = dest.uniqueWeddingProperties?.length || 0;
  const targetUrl = `/destinations/${dest.name.toLowerCase()}`;

  return (
    <Link
      href={targetUrl}
      className={`group relative flex flex-col rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-lg hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-2 cursor-pointer h-[400px] ${className}`}
      aria-label={`Explore ${dest.name} wedding places and available villas`}
    >
      {/* Cover Photo with Sunset luxury filter grading */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <img 
          src={dest.image} 
          alt={dest.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 sepia-[15%] brightness-[85%] saturate-[120%]"
        />
        
        {/* Cinematic top and bottom dark gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent pointer-events-none" />
      </div>
      
      {/* Top Left Badge - Region Tag */}
      <div className="absolute top-4 left-4 z-10 bg-black/50 backdrop-blur-md border border-white/15 text-white text-[9px] font-black uppercase tracking-widest h-7 flex items-center gap-1.5 px-3 rounded-full shadow-md">
        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>{dest.tag}</span>
      </div>

      {/* Top Right Badge - Wedding Hotspot indicator */}
      {(venueCount > 0 || uniquePropCount > 0) && (
        <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-amber-500/80 to-amber-700/80 backdrop-blur-md border border-amber-300/30 text-white text-[9px] font-black uppercase tracking-wider h-7 flex items-center gap-1.5 px-3 rounded-full shadow-md">
          <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          <span>Wedding Destination</span>
        </div>
      )}
      
      {/* Bottom Details Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-6 text-left">
        <div className="flex flex-col gap-1.5">

          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 w-full">
            <h3 className="text-3xl sm:text-4xl font-serif font-black text-white leading-none tracking-tight drop-shadow-md">
              {dest.name}
            </h3>
            <span className="text-[9px] font-black text-[#D4AF37] bg-[#D4AF37]/15 px-2.5 py-1 rounded-md border border-[#D4AF37]/30 uppercase tracking-widest leading-none flex-shrink-0">
              {dest.vibe}
            </span>
          </div>
          
          {/* Subtitle */}
          <p className="text-[10px] text-amber-200/90 font-extrabold uppercase tracking-[0.15em]">
            {dest.title}
          </p>
          
          {/* 2-Line Description */}
          <p className="text-xs text-white/80 font-medium leading-relaxed my-2 line-clamp-2">
            {dest.desc}
          </p>

          {/* Clean White CTA Button */}
          <div
            className="mt-2 flex items-center justify-between w-full h-13 px-5 rounded-2xl bg-white hover:bg-amber-50 text-[#0F172A] font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-xl group-hover:translate-x-0.5 cursor-pointer"
          >
            <span>Explore {dest.name} Wedding Places & Villas</span>
            <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#0F172A]" />
          </div>
        </div>
      </div>
    </Link>
  );
}

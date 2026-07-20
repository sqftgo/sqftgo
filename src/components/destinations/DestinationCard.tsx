"use client";

import React from "react";
import { Building, TrendingUp, ArrowRight, MapPin, IndianRupee } from "lucide-react";
import { Destination } from "@/data/destinations";

interface DestinationCardProps {
  dest: Destination;
  propertyCount: number;
  onSelect: (dest: Destination) => void;
  className?: string;
}

export default function DestinationCard({ dest, propertyCount, onSelect, className = "" }: DestinationCardProps) {
  const isHighGrowth = parseFloat(dest.investmentIndex) >= 9.0;

  return (
    <div
      role="button"
      tabIndex={0}
      className={`group relative flex flex-col rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-lg hover:shadow-2xl hover:border-white/20 transition-all duration-300 hover:-translate-y-2 cursor-pointer h-[460px] ${className}`}
      onClick={() => onSelect(dest)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(dest);
        }
      }}
      aria-label={`Explore ${dest.name}`}
    >
      {/* Cover Photo with Sunset luxury filter grading */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <img 
          src={dest.image} 
          alt={dest.name} 
          className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110 sepia-[15%] brightness-[85%] saturate-[120%]"
        />
        
        {/* Cinematic top and bottom dark gradient overlays */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-black/75 to-transparent pointer-events-none" />
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent pointer-events-none" />
      </div>
      
      {/* Top Left Badge - Glassmorphism Tag */}
      <div className="absolute top-5 left-5 z-10 bg-black/45 backdrop-blur-md border border-white/12 text-white text-[9px] font-black uppercase tracking-widest h-7 flex items-center gap-1.5 px-3.5 rounded-full shadow-md">
        <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
        <span>{dest.tag}</span>
      </div>

      {/* Top Right Badge - Glassmorphism Listings Count */}
      <div className="absolute top-5 right-5 z-10 bg-black/45 backdrop-blur-md border border-white/12 text-white text-[9px] font-black uppercase tracking-wider h-7 flex items-center gap-1.5 px-3.5 rounded-full shadow-md">
        <Building className={`w-3.5 h-3.5 text-[#D4AF37] ${propertyCount > 0 ? "animate-pulse" : ""}`} />
        <span>{propertyCount} {propertyCount === 1 ? "Listing" : "Listings"}</span>
      </div>
      
      {/* Bottom Details Content */}
      <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-6">
        <div className="flex flex-col gap-1">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-3 w-full">
            <h3 className="text-3xl sm:text-4xl font-serif font-black text-white leading-none tracking-tight drop-shadow-md">
              {dest.name}
            </h3>
            <span className="text-[9px] font-black text-[#D4AF37] bg-[#D4AF37]/10 px-2.5 py-1 rounded-md border border-[#D4AF37]/20 uppercase tracking-widest leading-none flex-shrink-0">
              {dest.vibe}
            </span>
          </div>
          
          {/* Subtitle */}
          <p className="text-[10px] text-white/55 font-bold uppercase tracking-[0.15em]">
            {dest.title}
          </p>
          
          {/* 2-Line Description */}
          <p className="text-xs text-white/80 font-semibold leading-relaxed mt-3 mb-4.5 line-clamp-2">
            {dest.desc}
          </p>

          {/* Floating Glass Stats Panel */}
          <div className="grid grid-cols-2 gap-4 mb-4.5 bg-white/12 backdrop-blur-md border border-white/10 rounded-2xl p-3 text-white">
            <div className="flex items-center gap-2.5 border-r border-white/10 pr-2">
              <TrendingUp className="w-5 h-5 text-[#D4AF37] shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-white/40 uppercase tracking-wider text-[8px] font-black leading-none">growth index</span>
                <span className="text-[11px] sm:text-xs font-serif font-black text-white truncate leading-none">
                  {dest.investmentIndex} Rating
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2.5 pl-1">
              <IndianRupee className="w-4.5 h-4.5 text-[#D4AF37] shrink-0" />
              <div className="flex flex-col gap-0.5 min-w-0">
                <span className="text-white/40 uppercase tracking-wider text-[8px] font-black leading-none">avg value</span>
                <span className="text-[11px] sm:text-xs font-serif font-black text-white truncate leading-none" title={dest.averagePrice}>
                  {dest.averagePrice}
                </span>
              </div>
            </div>
          </div>
          
          {/* Premium White CTA Button */}
          <button
            type="button"
            className="flex items-center justify-between w-full h-14 px-5 rounded-2xl bg-white hover:bg-white text-[#0F172A] font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group/btn"
            suppressHydrationWarning
          >
            <span>Explore Details</span>
            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1.5 transition-transform duration-300 text-[#0F172A]" />
          </button>
        </div>
      </div>
    </div>
  );
}

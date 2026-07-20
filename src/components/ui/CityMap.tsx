"use client";

import React from "react";
import { MapPin, Building } from "lucide-react";

interface CityMapProps {
  city: string;
  className?: string;
}

export default function CityMap({ city, className = "" }: CityMapProps) {
  return (
    <div className={`bg-white border border-sand rounded-[2rem] p-6 shadow-md flex flex-col gap-4 overflow-hidden h-[550px] ${className}`}>
      <div className="flex justify-between items-center pb-3 border-b border-sand/40">
        <div className="flex items-center gap-2">
          <MapPin className="w-5 h-5 text-indigo animate-pulse" />
          <h3 className="font-serif font-black text-indigo text-base">{city} Properties Map</h3>
        </div>
        <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
          RERA Checked
        </span>
      </div>

      <div className="flex-1 rounded-2xl overflow-hidden bg-slate-100 border border-sand relative">
        <iframe
          title={`Map of properties in ${city}`}
          width="100%"
          height="100%"
          style={{ border: 0, filter: "contrast(1.02) brightness(0.98)" }}
          loading="lazy"
          allowFullScreen
          referrerPolicy="no-referrer-when-downgrade"
          src={`https://maps.google.com/maps?q=${encodeURIComponent(city + ", Rajasthan, India")}&t=&z=12&ie=UTF8&iwloc=&output=embed`}
        />
        
        {/* Decorative Floating Overlay */}
        <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-sand/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-indigo/10 text-indigo flex items-center justify-center flex-shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-black text-indigo uppercase block">Active Listings Sourced</span>
            <span className="text-xs text-charcoal/80 font-bold truncate block">Showing RERA verified properties in {city}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

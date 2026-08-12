"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { Destination } from "../data/destinations";

interface DestinationCardProps {
  dest: Destination;
  propertyCount?: number;
  className?: string;
  viewMode?: "grid" | "compact";
}

export default function DestinationCard({
  dest,
  className = "",
  viewMode = "grid",
}: DestinationCardProps) {
  const targetUrl = `/destinations/${dest.name.toLowerCase()}`;

  // Compact Horizontal List Layout
  if (viewMode === "compact") {
    return (
      <div
        className={`group relative flex flex-col md:flex-row items-stretch rounded-3xl overflow-hidden bg-[#0F172A] border border-white/10 shadow-lg hover:shadow-2xl hover:border-amber-400/40 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${className}`}
      >
        {/* Fix 3: next/image */}
        <div className="relative md:w-2/5 h-48 md:h-auto overflow-hidden bg-slate-900 flex-shrink-0">
          <Image
            src={dest.image}
            alt={dest.name}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-90 saturate-110"
            sizes="(max-width: 768px) 100vw, 40vw"
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
              </div>
            </div>

            <p className="text-[10px] text-amber-200/90 font-bold uppercase tracking-wider mb-2">
              {dest.title}
            </p>

            <p className="text-xs text-white/70 font-normal leading-relaxed line-clamp-2 mb-4">
              {dest.desc}
            </p>
          </div>

          <div>
            {/* CTAs */}
            <div className="flex items-center gap-3">
              <Link
                href={targetUrl}
                className="flex-1 flex items-center justify-between h-11 px-4 rounded-xl bg-white hover:bg-amber-50 text-[#0F172A] font-extrabold text-xs tracking-wider uppercase transition-all shadow-md group-hover:shadow-amber-500/10"
              >
                <span>Explore Destination</span>
                <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform text-[#0F172A]" />
              </Link>
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
      {/* Fix 3: next/image — Cover Photo with Sunset luxury filter grading */}
      <div className="absolute inset-0 z-0 bg-[#0F172A] overflow-hidden">
        <Image
          src={dest.image}
          alt={dest.name}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105 brightness-[85%] saturate-[115%]"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
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

        {/* Right Badges: Wedding & Rating removed */}
      </div>

      {/* Bottom Content Area */}
      <div className="relative z-10 flex flex-col justify-end mt-auto p-6 text-left">
        <div className="flex flex-col gap-2">

          {/* City Name Header */}
          <div className="flex items-center justify-between gap-3 w-full">
            <h3 className="text-3xl sm:text-4xl font-serif font-black text-white leading-none tracking-tight drop-shadow-lg group-hover:text-amber-100 transition-colors">
              {dest.name}
            </h3>
          </div>

          {/* Subtitle */}
          <p className="text-[10px] text-amber-200/90 font-extrabold uppercase tracking-[0.15em]">
            {dest.title}
          </p>

          {/* 2-Line Description */}
          <p className="text-xs text-white/80 font-normal leading-relaxed my-1 line-clamp-2">
            {dest.desc}
          </p>          {/* Stats, badges, and top areas removed */}

          {/* CTAs Row */}
          <div className="mt-3 flex items-center gap-2 w-full">
            <Link
              href={targetUrl}
              className="flex-1 flex items-center justify-between h-12 px-4 rounded-xl bg-white hover:bg-amber-50 text-[#0F172A] font-black text-xs tracking-wider uppercase transition-all duration-300 shadow-md group-hover:shadow-xl group-hover:shadow-amber-900/20 cursor-pointer"
            >
              <span>Explore {dest.name}</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1.5 transition-transform duration-300 text-[#0F172A]" />
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

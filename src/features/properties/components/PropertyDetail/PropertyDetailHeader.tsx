"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Property } from "@/types";
import { formatIndianCurrency } from "@/lib/format";
import { MapPin, Share2, ArrowLeft, Heart } from "lucide-react";

interface PropertyDetailHeaderProps {
  property: Property;
  isSaved: boolean;
  onToggleFavorite: (id: string) => void;
  /** When "nav", render breadcrumbs only; when "price", render title/price block. */
  variant: "nav" | "price";
}

export function PropertyDetailHeader({
  property,
  isSaved,
  onToggleFavorite,
  variant,
}: PropertyDetailHeaderProps) {
  const router = useRouter();
  const [isCopied, setIsCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  const toggleFavorite = onToggleFavorite;
  const isRent = property.purpose === "rent" || property.purpose === "lease";
  const perSqftRate = Math.round(property.price / property.size);

  if (variant === "nav") {
    return (
      <>
      {/* Breadcrumbs and navigation */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <nav className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs font-bold text-charcoal/50 tracking-wide">
          <Link href="/" className="hover:text-terracotta transition-colors">HOME</Link>
          <span>/</span>
          <Link href="/listings" className="hover:text-terracotta transition-colors">PROPERTIES</Link>
          <span>/</span>
          <Link href={`/listings?city=${encodeURIComponent(property.city)}`} className="hover:text-terracotta transition-colors">{property.city.toUpperCase()}</Link>
          <span>/</span>
          <span className="text-indigo font-extrabold">{property.locality.toUpperCase()}</span>
        </nav>

        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-black text-charcoal/65 hover:text-indigo group transition-colors self-start md:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>BACK TO SEARCH</span>
        </button>
      </div>
      </>
    );
  }

  return (
    <>
      {/* Header Info & Price */}
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6 pb-6 border-b border-sand mb-8">
        <div className="flex flex-col gap-3.5 max-w-3xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-3.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
              property.purpose === "buy" || property.purpose === "sell" ? "bg-indigo" : "bg-terracotta"
            }`}>
              For {property.purpose === "buy" || property.purpose === "sell" ? "Sale" : "Rent"}
            </span>
            <span className="text-[10px] font-black text-indigo bg-indigo/5 border border-indigo/10 px-3.5 py-1 rounded-lg uppercase tracking-wider">
              {property.type}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-indigo leading-tight text-left">
            {property.title}
          </h1>
          <div className="flex items-center gap-1.5 text-charcoal/70 text-sm font-bold text-left">
            <MapPin className="w-4.5 h-4.5 text-terracotta shrink-0" />
            <span>{property.locality}, {property.city}, Rajasthan</span>
          </div>
        </div>

        {/* Price Box */}
        <div className="flex flex-col sm:flex-row lg:flex-col sm:items-center lg:items-end justify-between lg:justify-start gap-4 p-5 lg:p-0 rounded-2xl bg-cream border border-sand lg:border-none lg:bg-transparent min-w-[240px] shrink-0 text-left lg:text-right">
          <div className="flex flex-col">
            <span className="text-[9px] font-extrabold text-charcoal/40 uppercase tracking-widest">Asking Price</span>
            <span className="text-3xl font-serif font-black text-terracotta mt-0.5 leading-none">
              {formatIndianCurrency(property.price, property.purpose)}
            </span>
            {!isRent && (
              <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider mt-1.5 block">
                ₹{perSqftRate.toLocaleString("en-IN")} / sq.ft.
              </span>
            )}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-2.5 mt-4">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border font-bold text-sm transition-all cursor-pointer ${
                isSaved
                  ? "bg-rose-500/10 border-rose-500/20 text-rose-500 hover:bg-rose-500/15"
                  : "bg-white border-sand text-charcoal/80 hover:bg-sand/30"
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? "fill-rose-500 text-rose-500" : "text-charcoal/70"}`} />
              <span className="hidden sm:inline">{isSaved ? "Saved" : "Save"}</span>
            </button>

            
            <button
              onClick={handleShare}
              className="py-2.5 px-4 rounded-xl border border-sand bg-white text-charcoal font-bold text-xs flex items-center gap-2 hover:border-terracotta/30 hover:bg-cream/45 transition-colors active:scale-95 cursor-pointer"
            >
              <Share2 className="w-4 h-4 text-charcoal/70" />
              <span>{isCopied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>

          {/* Mobile Actions Row */}
          <div className="flex lg:hidden items-center gap-2 w-full sm:w-auto mt-1 sm:mt-0 shrink-0">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-2 p-3.5 rounded-2xl border transition-all ${
                  isSaved
                    ? "bg-rose-500/10 border-rose-500/20 text-rose-500"
                    : "bg-white border-sand text-charcoal/80 hover:bg-sand/30"
                }`}
            >
              <Heart className={`w-3.5 h-3.5 ${isSaved ? "fill-rose-500 text-rose-500" : ""}`} />
              <span>{isSaved ? "Saved" : "Save"}</span>
            </button>

            <button
              onClick={handleShare}
              className="flex-1 sm:flex-initial py-2.5 px-4 rounded-xl border border-sand bg-white text-charcoal font-bold text-xs flex items-center justify-center gap-2 hover:bg-sand/30 transition-colors cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{isCopied ? "Copied" : "Share"}</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

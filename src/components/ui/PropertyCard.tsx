"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, MapPin, ChevronLeft, ChevronRight, Phone, UserCheck, GitCompareArrows } from "lucide-react";
import { Property, useApp } from "@/context/AppContext";
import { formatIndianCurrency } from "@/lib/format";
import { motion } from "framer-motion";
import { Avatar } from "./Avatar";

export { formatIndianCurrency } from "@/lib/format";

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
  layout?: "grid" | "list";
}

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect, layout = "grid" }) => {
  const { favorites, toggleFavorite, compareList, toggleCompare } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const isFavorite = favorites.includes(property.id);
  const isCompared = compareList.includes(property.id);
  const imageSrc = property.images[currentImageIndex] || "/indian_heritage_hero_bg.png";

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const isListLayout = layout === "list";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={`group relative flex flex-col w-full rounded-2xl bg-white border border-sand hover:border-terracotta/30 shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden ${
        isListLayout ? "md:flex-row md:h-64" : ""
      }`}
    >
      <div
        className={`relative overflow-hidden bg-sand/30 ${
          isListLayout ? "w-full md:w-80 h-48 md:h-full flex-shrink-0" : "aspect-video w-full"
        }`}
      >
        <Image
          src={imageSrc}
          alt={property.title}
          fill
          sizes={isListLayout ? "(max-width: 768px) 100vw, 320px" : "(max-width: 768px) 100vw, 33vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-charcoal/20 pointer-events-none" />

        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span
            className={`px-3 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] text-white shadow-sm w-fit ${
              property.purpose === "buy" || property.purpose === "sell"
                ? "bg-indigo"
                : property.purpose === "rent"
                  ? "bg-terracotta"
                  : "bg-emerald-700"
            }`}
          >
            {property.purpose === "buy" || property.purpose === "sell"
              ? "For Sale"
              : property.purpose === "rent"
                ? "For Rent"
                : "For Lease"}
          </span>
          {property.featured && (
            <span className="px-3 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] text-white bg-charcoal shadow-sm w-fit">
              Featured
            </span>
          )}
        </div>

        <div className="absolute bottom-3 left-3 z-10">
          {property.reraApproved ? (
            <span className="flex items-center px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] text-emerald-800 bg-white/95 border border-emerald-200 shadow-sm backdrop-blur-sm">
              RERA Registered
            </span>
          ) : (
            <span className="flex items-center px-2.5 py-1 rounded text-[9px] font-bold uppercase tracking-[0.15em] text-charcoal/70 bg-white/95 border border-sand shadow-sm backdrop-blur-sm">
              Verification Pending
            </span>
          )}
        </div>

        {onSelect && (
          <button
            suppressHydrationWarning
            type="button"
            aria-label="Show on map"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(property);
            }}
            className="absolute top-3 right-[6.5rem] p-2 rounded-xl border border-sand bg-white text-charcoal hover:text-terracotta shadow-sm z-10 transition-all duration-200 cursor-pointer"
          >
            <MapPin className="w-4 h-4 text-terracotta" />
          </button>
        )}

        <button
          suppressHydrationWarning
          type="button"
          aria-label={isCompared ? "Remove from compare" : "Add to compare"}
          aria-pressed={isCompared}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleCompare(property.id);
          }}
          className={`absolute top-3 right-13 p-2 rounded-xl border shadow-sm z-10 transition-all duration-200 cursor-pointer ${
            isCompared
              ? "bg-indigo/10 border-indigo/30 text-indigo"
              : "bg-white border-sand text-charcoal hover:text-indigo"
          }`}
        >
          <GitCompareArrows className={`w-4 h-4 ${isCompared ? "stroke-[2.5]" : ""}`} />
        </button>

        <button
          suppressHydrationWarning
          type="button"
          aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          aria-pressed={isFavorite}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl border shadow-sm z-10 transition-all duration-200 cursor-pointer ${
            isFavorite
              ? "bg-rose-500/10 border-rose-500/30 text-rose-500"
              : "bg-white border-sand text-charcoal hover:text-rose-500"
          }`}
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-rose-500" : ""}`} />
          </motion.div>
        </button>

        {property.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              suppressHydrationWarning
              type="button"
              aria-label="Previous image"
              onClick={prevImage}
              className="p-1 rounded-lg bg-white/80 hover:bg-white border border-sand text-charcoal transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              suppressHydrationWarning
              type="button"
              aria-label="Next image"
              onClick={nextImage}
              className="p-1 rounded-lg bg-white/80 hover:bg-white border border-sand text-charcoal transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className={`flex flex-col md:flex-row flex-grow bg-white ${isListLayout ? "md:divide-x md:divide-sand" : ""}`}>
        <Link href={`/property/${property.id}`} className="flex flex-col flex-grow p-5 text-left justify-between min-w-0">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] font-bold text-indigo bg-indigo/5 border border-indigo/10 px-2.5 py-0.5 rounded-md tracking-wider uppercase w-fit">
              {property.type}
            </span>
            <h3 className="font-serif font-black text-lg text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors duration-200 mt-1">
              {property.title}
            </h3>
            <div className="flex items-center gap-1 text-charcoal/60 text-xs mb-1.5">
              <MapPin className="w-3.5 h-3.5 text-terracotta/80 flex-shrink-0" />
              <span className="font-semibold truncate">
                {property.locality}, {property.city}
              </span>
            </div>
            {isListLayout && (
              <p className="text-charcoal/60 text-xs line-clamp-2 leading-relaxed mb-3">{property.description}</p>
            )}
          </div>

          <div className="flex items-center gap-3.5 text-[10px] text-charcoal/50 font-bold uppercase tracking-widest pt-3 border-t border-sand">
            {property.bhk && (
              <>
                <span>{property.bhk} BHK</span>
                <span className="w-1.5 h-1.5 rounded-full bg-sand" />
              </>
            )}
            <span>{property.size} SQFT</span>
            <span className="w-1.5 h-1.5 rounded-full bg-sand" />
            <span className="truncate">{property.furnished}</span>
          </div>
        </Link>

        <div
          className={`p-5 flex flex-col justify-between items-stretch text-left md:w-56 bg-cream/10 ${
            isListLayout ? "flex-shrink-0 border-t md:border-t-0 border-sand" : "hidden"
          }`}
        >
          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">
              Guide Price
            </span>
            <span className="text-2xl font-serif font-black text-terracotta mt-1">
              {formatIndianCurrency(property.price, property.purpose)}
            </span>
          </div>

          <div className="flex items-center gap-2.5 py-3.5 border-y border-sand/50 my-2">
            <Avatar name={property.ownerName} size="sm" tone="indigo" />
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] font-black text-charcoal truncate">{property.ownerName}</span>
              <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-0.5 mt-0.5">
                <UserCheck className="w-2.5 h-2.5" />
                <span>Verified Owner</span>
              </span>
            </div>
          </div>

          <Link
            href={`/property/${property.id}`}
            className="w-full py-2 px-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-center font-bold text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Contact Owner</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default PropertyCard;

"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Heart, MapPin, BedDouble, Square, CheckCircle, ChevronLeft, ChevronRight } from "lucide-react";
import { Property, useApp } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";

interface PropertyCardProps {
  property: Property;
  onSelect?: (property: Property) => void;
}

// Helper to format prices into Indian Lakh/Crore conventions
export const formatIndianCurrency = (price: number, purpose: "buy" | "sell" | "rent" | "lease"): string => {
  if (purpose === "rent" || purpose === "lease") {
    return `₹${price.toLocaleString("en-IN")} / mo`;
  }
  
  if (price >= 10000000) {
    const cr = price / 10000000;
    return `₹${cr.toFixed(2).replace(/\.00$/, "")} Crore`;
  } else if (price >= 100000) {
    const lakh = price / 100000;
    return `₹${lakh.toFixed(2).replace(/\.00$/, "")} Lakh`;
  }
  return `₹${price.toLocaleString("en-IN")}`;
};

export const PropertyCard: React.FC<PropertyCardProps> = ({ property, onSelect }) => {
  const { favorites, toggleFavorite } = useApp();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [hovered, setHovered] = useState(false);

  const isFavorite = favorites.includes(property.id);

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative flex flex-col w-full rounded-2xl bg-white/95 border border-sand shadow-md hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden"
    >
      {/* Thumbnail Carousel Section */}
      <div className="relative aspect-video w-full overflow-hidden bg-sand/30">
        <img
          src={property.images[currentImageIndex]}
          alt={property.title}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Solid Overlay */}
        <div className="absolute inset-0 bg-charcoal/20 pointer-events-none" />

        {/* Purpose Badge & Featured Tag */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider text-white shadow-sm ${
            property.purpose === "buy" || property.purpose === "sell" 
              ? "bg-indigo" 
              : property.purpose === "rent"
              ? "bg-terracotta"
              : "bg-emerald-600"
          }`}>
            {property.purpose === "buy" || property.purpose === "sell" 
              ? "For Sale" 
              : property.purpose === "rent"
              ? "For Rent"
              : "For Lease"}
          </span>
          {property.featured && (
            <span className="px-3 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-white bg-gold shadow-sm">
              Featured
            </span>
          )}
        </div>

        {/* RERA Verification Badge */}
        <div className="absolute bottom-3 left-3 z-10">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider text-charcoal bg-white border border-sand shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span>RERA Approved</span>
          </span>
        </div>

        {/* Show on Map Button (if callback provided) */}
        {onSelect && (
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onSelect(property);
            }}
            className="absolute top-3 right-13 p-2 rounded-xl border border-sand bg-white text-charcoal hover:bg-white hover:text-terracotta shadow-sm z-10 transition-all duration-200"
            title="Center on Map"
          >
            <MapPin className="w-4 h-4 text-terracotta" />
          </button>
        )}

        {/* Favorite Heart Button */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleFavorite(property.id);
          }}
          className={`absolute top-3 right-3 p-2 rounded-xl border shadow-sm z-10 transition-all duration-200 ${
            isFavorite
              ? "bg-red-500/20 border-red-500/30 text-red-500"
              : "bg-white border-sand text-charcoal hover:bg-white hover:text-red-500"
          }`}
        >
          <motion.div whileTap={{ scale: 1.3 }}>
            <Heart className={`w-4 h-4 ${isFavorite ? "fill-red-500" : ""}`} />
          </motion.div>
        </button>

        {/* Arrow Controls (visible when hovered or on mobile) */}
        {property.images.length > 1 && (
          <div className="absolute inset-x-2 top-1/2 -translate-y-1/2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10">
            <button
              onClick={prevImage}
              className="p-1 rounded-lg bg-white/80 hover:bg-white border border-sand text-charcoal transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="p-1 rounded-lg bg-white/80 hover:bg-white border border-sand text-charcoal transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Carousel Slide Indicators */}
        {property.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10">
            {property.images.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  currentImageIndex === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Details Section */}
      <Link href={`/property/${property.id}`} className="flex flex-col flex-1 p-5 bg-white">
        {/* Pricing & Type Row */}
        <div className="flex items-baseline justify-between mb-2">
          <div className="flex flex-col">
            <span className="text-[9px] font-bold text-charcoal/50 uppercase tracking-widest leading-none mb-1">
              Guide Price
            </span>
            <span className="text-xl font-serif font-black text-terracotta leading-none">
              {formatIndianCurrency(property.price, property.purpose)}
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo bg-indigo/5 border border-indigo/10 px-2.5 py-1 rounded-md tracking-wider uppercase">
            {property.type}
          </span>
        </div>

        {/* Title with hover color change */}
        <h3 className="font-serif font-black text-base text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors duration-200 mt-2 mb-1">
          {property.title}
        </h3>

        {/* Locality & City */}
        <div className="flex items-center gap-1 text-charcoal/60 text-xs mb-5">
          <MapPin className="w-3.5 h-3.5 text-terracotta/80 flex-shrink-0" />
          <span className="font-semibold">{property.locality}, {property.city}</span>
        </div>

        {/* Editorial Layout Specs Row (Human Design style) */}
        <div className="flex items-center gap-2.5 text-[10px] text-charcoal/50 font-bold uppercase tracking-widest mt-auto pt-4 border-t border-sand">
          {property.bhk && (
            <>
              <span>{property.bhk} BHK</span>
              <span className="w-1 h-1 rounded-full bg-sand" />
            </>
          )}
          <span>{property.size} SQFT</span>
          <span className="w-1 h-1 rounded-full bg-sand" />
          <span className="truncate">{property.furnished.split("-")[0]}</span>
        </div>
      </Link>
    </motion.div>
  );
};
export default PropertyCard;

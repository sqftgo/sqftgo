"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatIndianCurrency } from "@/components/ui/PropertyCard";
import InquiryForm from "@/components/ui/InquiryForm";
import PropertyCard from "@/components/ui/PropertyCard";
import { 
  MapPin, 
  BedDouble, 
  Square, 
  CheckCircle, 
  Phone, 
  Mail, 
  Share2, 
  Bookmark, 
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  ShieldAlert
} from "lucide-react";
import { motion } from "framer-motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { properties, favorites, toggleFavorite } = useApp();
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);

  const property = properties.find((p) => p.id === resolvedParams.id && p.status === "Active");
  const isSaved = favorites.includes(resolvedParams.id);

  if (!property) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-xl text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/40 text-red-500 flex items-center justify-center mx-auto mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="font-extrabold text-2xl text-slate-950 dark:text-white mb-2">Property Not Found</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          The property listing you are trying to view does not exist or has been removed.
        </p>
        <Link
          href="/listings"
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md transition-colors"
        >
          Back to Listings
        </Link>
      </div>
    );
  }

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 3000);
  };

  // Find similar listings: in same city (excluding current property)
  const similarProperties = properties
    .filter((p) => p.city === property.city && p.id !== property.id && p.status === "Active")
    .slice(0, 3);

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-20 pt-6">
      
      {/* Back to listings */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-xs md:text-sm font-bold text-charcoal/65 hover:text-indigo mb-6 group transition-colors"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        <span>Back</span>
      </button>

      {/* Main Grid: Detail Info & Sidebar Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Image Gallery, Specs, Description, Similar */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Gallery Widget */}
          <div className="flex flex-col gap-3.5">
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-sand/20 border border-sand shadow-md">
              <img
                src={property.images?.length > 0 ? property.images[activeImageIdx] : "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.5764,73.6836"}
                alt={property.title}
                className="w-full h-full object-cover"
              />
              
              {/* Slider Controls */}
              {property.images.length > 1 && (
                <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="p-2 rounded-xl bg-white/80 hover:bg-white text-charcoal border border-sand transition-colors pointer-events-auto shadow-md"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setActiveImageIdx((prev) => (prev + 1) % property.images.length)}
                    className="p-2 rounded-xl bg-white/80 hover:bg-white text-charcoal border border-sand transition-colors pointer-events-auto shadow-md"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* Thumbnail Strip */}
            {property.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`flex-shrink-0 w-24 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIdx === idx ? "border-terracotta scale-95 shadow-sm" : "border-sand opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Header Title & Pricing */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-sand">
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider text-white shadow-sm ${
                  property.purpose === "buy" ? "bg-indigo" : "bg-terracotta"
                }`}>
                  For {property.purpose === "buy" ? "Sale" : "Rent"}
                </span>
                <span className="text-xs font-bold text-indigo bg-indigo/5 border border-indigo/10 px-3 py-1 rounded-lg">
                  {property.type}
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif font-black text-indigo leading-tight">
                {property.title}
              </h1>
              <div className="flex items-center gap-1 text-charcoal/70 text-sm font-semibold">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>{property.locality}, {property.city}</span>
              </div>
            </div>

            {/* Price tag */}
            <div className="flex flex-col sm:items-end gap-1 flex-shrink-0">
              <span className="text-2xl md:text-3xl font-serif font-black text-terracotta">
                {formatIndianCurrency(property.price, property.purpose)}
              </span>
              <span className="text-[10px] md:text-xs font-bold text-charcoal/50 uppercase tracking-widest">
                ₹{(property.price / property.size).toFixed(0)} / sq.ft.
              </span>
            </div>
          </div>

          {/* Specifications Grid */}
          <div className="grid grid-cols-3 gap-4 py-1">
            {property.bhk && (
              <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/75 border border-sand shadow-sm gap-1">
                <BedDouble className="w-6 h-6 text-indigo" />
                <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">Layout</span>
                <span className="text-sm font-bold text-charcoal">{property.bhk} BHK</span>
              </div>
            )}
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/75 border border-sand shadow-sm gap-1">
              <Square className="w-5.5 h-5.5 text-terracotta" />
              <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">Super Area</span>
              <span className="text-sm font-bold text-charcoal">{property.size} sq.ft.</span>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 rounded-2xl bg-white/75 border border-sand shadow-sm gap-1">
              <CheckCircle className="w-5.5 h-5.5 text-indigo" />
              <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-wider">Furnishing</span>
              <span className="text-sm font-bold text-charcoal truncate max-w-full">{property.furnished}</span>
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">About this Property</h3>
            <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line font-medium">
              {property.description}
            </p>
          </div>

          {/* Amenities */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">Amenities & Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {property.amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2.5 px-4 py-3 rounded-xl bg-white/75 border border-sand text-xs font-bold text-charcoal/90 shadow-sm"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta flex-shrink-0" />
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Google Maps Location Map */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">Property Location</h3>
            <div className="w-full h-64 rounded-2xl overflow-hidden border border-sand shadow-sm relative">
              <iframe
                title="Google Maps Location"
                width="100%"
                height="100%"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(`${property.locality}, ${property.city}, Rajasthan, India`)}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0 absolute inset-0"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>

          {/* Similar Listings */}
          {similarProperties.length > 0 && (
            <div className="flex flex-col gap-6 pt-6 border-t border-sand">
              <h3 className="font-serif font-black text-lg text-indigo">Similar Properties in {property.city}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {similarProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Bookmark Actions, Contact Agents */}
        <div className="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-28">
          
          {/* Action Row */}
          <div className="flex gap-3">
            <button
              onClick={() => toggleFavorite(property.id)}
              className={`flex-1 py-3 px-4 rounded-xl border font-bold text-sm flex items-center justify-center gap-2 transition-all ${
                isSaved
                  ? "bg-red-500/10 border-red-500/20 text-red-500"
                  : "bg-white border-sand hover:border-terracotta/20 text-charcoal"
              }`}
            >
              <Bookmark className={`w-4.5 h-4.5 ${isSaved ? "fill-red-500" : ""}`} />
              <span>{isSaved ? "Saved Listing" : "Save Listing"}</span>
            </button>
            
            <button
              onClick={handleShare}
              className="py-3 px-4 rounded-xl border border-sand bg-white text-charcoal font-bold text-sm flex items-center justify-center gap-2 hover:border-terracotta/20 transition-colors"
            >
              <Share2 className="w-4.5 h-4.5" />
              <span>{isCopied ? "Link Copied!" : "Share"}</span>
            </button>
          </div>

          {/* Owner Profile & Inquiry Form */}
          <InquiryForm property={property} />

        </div>

      </div>

    </div>
  );
}

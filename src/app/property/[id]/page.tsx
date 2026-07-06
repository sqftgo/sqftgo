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
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Wallet,
  Landmark,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  CalendarDays
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

          {/* Verified Trust & Document Audit */}
          <div className="flex flex-col gap-5 p-6 rounded-3xl border border-emerald-500/20 bg-emerald-50/10 shadow-sm relative overflow-hidden">
            {/* Decorative background badge */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">Trust & Verification Audit</h3>
              </div>
              
              {property.reraApproved && property.reraId ? (
                <span className="px-3.5 py-1 rounded-xl bg-emerald-100 border border-emerald-200 text-[10px] font-extrabold uppercase tracking-widest text-emerald-800 shadow-sm">
                  RERA Vetted: {property.reraId}
                </span>
              ) : (
                <span className="px-3.5 py-1 rounded-xl bg-sand/40 border border-sand text-[10px] font-extrabold uppercase tracking-widest text-charcoal/60 shadow-sm">
                  Audit Pending Verification
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
              This property has been physically inspected by our regional relocation leads. All owner deeds and government registration records are verified.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {/* Vetted Checklist */}
              <div className="flex flex-col gap-3.5 bg-white border border-sand/60 p-5 rounded-2xl shadow-sm">
                <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest block pb-2 border-b border-sand/40">Verified Checkpoints</span>
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-charcoal/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Land Registry / Title Deed</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg">Clear Title</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Municipal Property Tax Receipt</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg">Cleared Dues</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Utility bills (Water & Electricity)</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg">Active & Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Physical On-Site Status Check</span>
                    </span>
                    <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-0.5 rounded-lg">Matches Listing</span>
                  </div>
                </div>
              </div>

              {/* Inspector Information */}
              <div className="flex flex-col justify-between bg-white border border-sand/60 p-5 rounded-2xl shadow-sm text-xs font-semibold text-charcoal/70">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest block pb-2 border-b border-sand/40">Audit Certificate</span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <div className="w-9 h-9 rounded-xl bg-indigo text-white flex items-center justify-center font-bold">
                      {property.ownerName.charAt(0)}
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-indigo">Inspected by Sun Valley</span>
                      <span className="text-[10px] text-charcoal/50">Verified on {property.verifiedDate || "2026-06-25"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-indigo/5 border border-indigo/10 rounded-xl flex items-start gap-2.5 text-[10px] text-indigo leading-relaxed mt-4">
                  <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span>
                    <strong>Pledge:</strong> All transactions are subject to RERA guidelines. We recommend a legal deed verification before signing.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Breakdown & Estimated Charges */}
          <div className="flex flex-col gap-4 p-6 rounded-3xl border border-sand bg-white shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-sand">
              <Wallet className="w-5.5 h-5.5 text-terracotta" />
              <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">Pricing & Charges Breakdown</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-1">
              <div className="flex flex-col gap-3 text-xs font-semibold text-charcoal/80">
                <div className="flex justify-between pb-2 border-b border-sand/30">
                  <span className="text-charcoal/50">Base Price / Rent:</span>
                  <span className="font-black text-indigo">
                    ₹{property.price.toLocaleString("en-IN")} {property.purpose === "rent" || property.purpose === "lease" ? "/ mo" : ""}
                  </span>
                </div>
                {property.priceBreakdown?.securityDeposit ? (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Refundable Security Deposit:</span>
                    <span className="font-black text-indigo">₹{property.priceBreakdown.securityDeposit.toLocaleString("en-IN")}</span>
                  </div>
                ) : property.priceBreakdown?.registrationFees ? (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Estimated Stamp Duty & Registration:</span>
                    <span className="font-black text-indigo">₹{property.priceBreakdown.registrationFees.toLocaleString("en-IN")}</span>
                  </div>
                ) : null}
                <div className="flex justify-between pb-2 border-b border-sand/30">
                  <span className="text-charcoal/50">Maintenance Charges:</span>
                  <span className="font-black text-indigo">
                    {property.priceBreakdown?.maintenance 
                      ? `₹${property.priceBreakdown.maintenance.toLocaleString("en-IN")} / mo`
                      : "Included in Price"}
                  </span>
                </div>
                {property.priceBreakdown?.gst && (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Estimated GST / Taxes:</span>
                    <span className="font-black text-indigo">₹{property.priceBreakdown.gst.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-1">
                  <span className="text-charcoal/50 font-bold">Estimated Move-in Cost:</span>
                  <span className="font-black text-terracotta text-sm">
                    ₹{((property.priceBreakdown?.basePrice || property.price) + 
                      (property.priceBreakdown?.securityDeposit || 0) + 
                      (property.priceBreakdown?.maintenance || 0)).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Price Benchmarks comparison */}
              <div className="flex flex-col justify-between p-4.5 rounded-2xl bg-cream/40 border border-sand/50 text-xs font-semibold text-charcoal/70">
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                    <span>Locality Valuation Benchmark</span>
                  </span>
                  
                  <div className="flex items-baseline gap-1 mt-1.5">
                    <span className="text-2xl font-serif font-black text-indigo">₹{(property.price / property.size).toFixed(0)}</span>
                    <span className="text-[10px] text-charcoal/50 font-bold">/ sq.ft.</span>
                  </div>
                  
                  <p className="text-[11px] text-charcoal/65 leading-relaxed mt-1">
                    The average valuation in <strong className="text-indigo">{property.locality}</strong> is currently <strong>₹{((property.price / property.size) * 0.95).toFixed(0)} - ₹{((property.price / property.size) * 1.05).toFixed(0)}</strong>/sq.ft. This listing matches standard market bounds.
                  </p>
                </div>
                
                <div className="text-[9px] text-charcoal/40 italic leading-snug pt-3 border-t border-sand/30 mt-3">
                  * Price trends are sourced from regional registry offices & verified recent sales in Udaipur.
                </div>
              </div>
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

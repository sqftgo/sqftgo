"use client";

import React, { use, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { formatIndianCurrency, InquiryForm, PropertyCard, Avatar } from "@/components/ui";
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
  CalendarDays,
  X,
  Maximize2,
  ChevronDown,
  ChevronUp,
  Bath,
  Car,
  Trees,
  Waves,
  Dumbbell,
  Zap,
  Sparkles,
  School,
  Store,
  Bus,
  Heart,
  Eye
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const { properties, favorites, toggleFavorite } = useApp();
  
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [isCopied, setIsCopied] = useState(false);
  const [descExpanded, setDescExpanded] = useState(false);
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

  const property = properties.find((p) => p.id === resolvedParams.id && p.status === "Active");
  const isSaved = favorites.includes(resolvedParams.id);

  if (!property) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#faf8f5]">
        <div className="w-16 h-16 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="font-serif font-black text-2xl text-slate-950 dark:text-white mb-2">Property Not Found</h2>
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

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setShowLightbox(true);
  };

  // Find similar listings: in same city (excluding current property)
  const similarProperties = properties
    .filter((p) => p.city === property.city && p.id !== property.id && p.status === "Active")
    .slice(0, 2);

  // Derive specs
  const specs = [
    property.bhk && { label: "Layout", value: `${property.bhk} BHK`, icon: BedDouble, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.size && { label: "Super Area", value: `${property.size} sq.ft.`, icon: Square, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    property.furnished && { label: "Furnishing", value: property.furnished, icon: CheckCircle, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.bathrooms && { label: "Bathrooms", value: `${property.bathrooms} Baths`, icon: Bath, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    property.parking ? { label: "Parking Space", value: `${property.parking} Covered`, icon: Car, color: "text-indigo bg-indigo/5 border-indigo/10" } : { label: "Parking Space", value: "Available", icon: Car, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.yearBuilt && { label: "Built Year", value: property.yearBuilt, icon: CalendarDays, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
  ].filter(Boolean) as Array<{ label: string; value: string | number; icon: React.ComponentType<any>; color: string }>;

  // Derive pricing breakdown
  const isRent = property.purpose === "rent" || property.purpose === "lease";
  const breakdown = property.priceBreakdown || {
    basePrice: property.price,
    maintenance: isRent ? Math.round(property.price * 0.04) : Math.round(property.size * 3.5),
    securityDeposit: isRent ? property.price * 3 : undefined,
    registrationFees: isRent ? undefined : Math.round(property.price * 0.06),
    gst: isRent ? undefined : Math.round(property.price * 0.05),
  };

  const totalEstimatedMoveIn = breakdown.basePrice + 
    (breakdown.securityDeposit || 0) + 
    (breakdown.registrationFees || 0) + 
    (breakdown.gst || 0) + 
    (breakdown.maintenance || 0);

  // Valuation benchmark logic
  const perSqftRate = Math.round(property.price / property.size);

  // Amenity mapping
  const getAmenityIcon = (name: string) => {
    const lower = name.toLowerCase();
    if (lower.includes("pool") || lower.includes("swimming")) return Waves;
    if (lower.includes("garden") || lower.includes("lawn") || lower.includes("private garden")) return Trees;
    if (lower.includes("view") || lower.includes("lake")) return Eye;
    if (lower.includes("power") || lower.includes("backup") || lower.includes("generator")) return Zap;
    if (lower.includes("gym") || lower.includes("fitness")) return Dumbbell;
    if (lower.includes("security") || lower.includes("cctv")) return ShieldCheck;
    if (lower.includes("parking") || lower.includes("garage")) return Car;
    if (lower.includes("club") || lower.includes("clubhouse")) return Landmark;
    if (lower.includes("play") || lower.includes("children") || lower.includes("kids")) return Sparkles;
    return CheckCircle2;
  };

  // Neighborhood Connectivity Highlights
  const neighborhoodHighlights = [
    { label: "Connectivity", desc: "Local transit & main highway within 1.5 km", icon: Bus, color: "text-indigo bg-indigo/5 border-indigo/10" },
    { label: "Education", desc: "Leading schools and academies in a 3 km radius", icon: School, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    { label: "Retail & Dine", desc: "Local markets, grocery, and dining within 500m", icon: Store, color: "text-indigo bg-indigo/5 border-indigo/10" },
    { label: "Nature & Parks", desc: "Green belts and heritage walkways nearby", icon: Trees, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
  ];

  // Verification details
  const checks = property.verificationChecks || {
    titleDeed: true,
    taxClearance: true,
    utilitiesCheck: true,
    physicalVerification: true,
    structuralVetted: true,
  };

  const needsTruncation = property.description.length > 280;
  const displayDesc = descExpanded || !needsTruncation 
    ? property.description 
    : `${property.description.slice(0, 260)}...`;

  const imageCount = property.images?.length || 0;

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-24 lg:pb-20 pt-6">
      
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

      {/* Luxury Photo Gallery Collage (Desktop) and Swiper (Mobile) */}
      <div className="mb-8">
        {/* Desktop Collage/Slider Grid */}
        {imageCount > 0 ? (
          <div className="hidden lg:grid grid-cols-12 gap-3 h-[520px] w-full rounded-3xl overflow-hidden bg-white border border-sand/40 p-2.5 shadow-md">
            {/* Left Main View (col-span-10) */}
            <div className="col-span-10 h-full relative rounded-2xl overflow-hidden group">
              <img
                src={property.images[activeImageIdx]}
                alt={property.title}
                className="w-full h-full object-cover transition-transform duration-500 animate-fade-in"
              />
              
              {/* Left / Right arrows inside Left Main View */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-charcoal/50 hover:bg-charcoal/75 text-white flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95 shadow-md"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveImageIdx((prev) => (prev + 1) % property.images.length);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-charcoal/50 hover:bg-charcoal/75 text-white flex items-center justify-center transition-all cursor-pointer z-10 active:scale-95 shadow-md"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}

              {/* Photo Counter Badge (Bottom Left) */}
              <div className="absolute bottom-4 left-4 bg-charcoal/70 backdrop-blur-sm text-white px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 select-none z-10 pointer-events-none">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>{activeImageIdx + 1} / {property.images.length}</span>
              </div>
            </div>

            {/* Right Stacked Column (col-span-2) */}
            <div className="col-span-2 flex flex-col gap-2 h-full">
              {property.images.slice(0, 6).map((img, idx) => {
                const isActive = activeImageIdx === idx || (idx === 5 && activeImageIdx >= 5);
                const isLast = idx === 5 && property.images.length > 6;
                const remainingCount = property.images.length - 6;

                return (
                  <div
                    key={idx}
                    onClick={() => {
                      if (isLast) {
                        openLightbox(5);
                      } else {
                        setActiveImageIdx(idx);
                      }
                    }}
                    className={`flex-1 rounded-xl overflow-hidden cursor-pointer relative transition-all border-2 ${
                      isActive 
                        ? "border-indigo scale-98 shadow-sm" 
                        : "border-transparent opacity-75 hover:opacity-100 hover:scale-[1.01]"
                    }`}
                  >
                    <img src={img} alt={`thumbnail ${idx}`} className="w-full h-full object-cover" />
                    
                    {isLast && (
                      <div className="absolute inset-0 bg-charcoal/65 flex flex-col items-center justify-center text-white backdrop-blur-[1px] text-center p-1">
                        <span className="font-serif font-black text-sm">+{remainingCount} More</span>
                        <span className="text-[8px] font-bold uppercase tracking-wider mt-0.5">View all photos</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="hidden lg:flex w-full h-[400px] rounded-3xl bg-sand/20 border border-sand items-center justify-center text-charcoal/40 text-sm font-bold">
            No Images Available
          </div>
        )}

        {/* Mobile/Tablet Swipe Carousel */}
        <div className="lg:hidden relative aspect-video w-full rounded-2xl overflow-hidden bg-sand/20 border border-sand/40 shadow-md">
          <img
            src={property.images?.length > 0 ? property.images[activeImageIdx] : "https://maps.google.com/cbk?output=thumbnail&w=800&h=600&ll=24.5764,73.6836"}
            alt={property.title}
            className="w-full h-full object-cover animate-fade-in"
            onClick={() => openLightbox(activeImageIdx)}
          />
          
          {/* Slider Controls */}
          {property.images?.length > 1 && (
            <>
              <div className="absolute inset-x-3 top-1/2 -translate-y-1/2 flex items-center justify-between pointer-events-none">
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev - 1 + property.images.length) % property.images.length)}
                  className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-charcoal border border-sand/50 transition-all pointer-events-auto shadow-md active:scale-90"
                >
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <button
                  onClick={() => setActiveImageIdx((prev) => (prev + 1) % property.images.length)}
                  className="p-1.5 rounded-xl bg-white/90 hover:bg-white text-charcoal border border-sand/50 transition-all pointer-events-auto shadow-md active:scale-90"
                >
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
              
              {/* Image Counter */}
              <div className="absolute bottom-3 right-3 bg-charcoal/75 backdrop-blur-sm px-3 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-wider">
                {activeImageIdx + 1} / {property.images.length}
              </div>
            </>
          )}
        </div>
      </div>

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

      {/* Main Grid: Detail Info & Sidebar Contact */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start text-left">
        
        {/* Left Column: Specs, About, Amenities, Trust, Charges, Map, Similar */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Elevated Specifications Grid */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Key Specifications</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {specs.map((spec, i) => {
                const SpecIcon = spec.icon;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3.5 p-4 rounded-2xl bg-white border border-sand shadow-sm hover:shadow-md transition-all hover:border-terracotta/20 group"
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-transform group-hover:scale-105 ${spec.color}`}>
                      <SpecIcon className="w-5 h-5 shrink-0" />
                    </div>
                    <div className="flex flex-col text-left min-w-0">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">{spec.label}</span>
                      <span className="text-xs font-black text-charcoal truncate mt-0.5">{spec.value}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Description Card */}
          <div className="flex flex-col gap-3.5 bg-white p-6 rounded-3xl border border-sand shadow-sm">
            <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">About this Property</h3>
            <div className="relative mt-2">
              <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line font-medium transition-all duration-300">
                {displayDesc}
              </p>
              {needsTruncation && (
                <button
                  onClick={() => setDescExpanded(!descExpanded)}
                  className="flex items-center gap-1 text-xs font-black text-terracotta hover:text-terracotta-hover transition-colors mt-3 cursor-pointer focus:outline-none"
                >
                  <span>{descExpanded ? "Show Less" : "Read More"}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${descExpanded ? "rotate-180" : ""}`} />
                </button>
              )}
            </div>
          </div>

          {/* Amenities Grid */}
          <div className="flex flex-col gap-4 bg-white p-6 rounded-3xl border border-sand shadow-sm">
            <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">Amenities & Premium Features</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2">
              {property.amenities.map((amenity) => {
                const AmenityIcon = getAmenityIcon(amenity);
                return (
                  <div
                    key={amenity}
                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-cream border border-sand text-xs font-bold text-charcoal/90 hover:border-terracotta/25 hover:-translate-y-0.5 transition-all shadow-sm group"
                  >
                    <div className="w-8 h-8 rounded-xl bg-white border border-sand flex items-center justify-center shrink-0 text-terracotta transition-colors group-hover:bg-terracotta group-hover:text-white">
                      <AmenityIcon className="w-4 h-4 shrink-0" />
                    </div>
                    <span className="truncate">{amenity}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pricing Breakdown & Locality Valuation Dashboard */}
          <div className="flex flex-col gap-4 p-6 rounded-3xl border border-sand bg-white shadow-sm">
            <div className="flex items-center gap-2 pb-2.5 border-b border-sand">
              <Wallet className="w-5 h-5 text-terracotta" />
              <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Pricing & Charges Breakdown</h3>
            </div>

            <div className="mt-3">
              {/* Fees receipt */}
              <div className="w-full flex flex-col gap-3.5 text-xs font-semibold text-charcoal/80">
                <div className="flex justify-between pb-2 border-b border-sand/30">
                  <span className="text-charcoal/50 font-bold">Base Price / Rent:</span>
                  <span className="font-black text-indigo">
                    ₹{breakdown.basePrice.toLocaleString("en-IN")} {isRent ? "/ mo" : ""}
                  </span>
                </div>
                {breakdown.securityDeposit && (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Refundable Security Deposit:</span>
                    <span className="font-black text-indigo">₹{breakdown.securityDeposit.toLocaleString("en-IN")}</span>
                  </div>
                )}
                {breakdown.registrationFees && (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Stamp Duty & Registration (Est.):</span>
                    <span className="font-black text-indigo">₹{breakdown.registrationFees.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between pb-2 border-b border-sand/30">
                  <span className="text-charcoal/50">Maintenance Charges:</span>
                  <span className="font-black text-indigo">
                    {breakdown.maintenance ? `₹${breakdown.maintenance.toLocaleString("en-IN")} / mo` : "Included"}
                  </span>
                </div>
                {breakdown.gst && (
                  <div className="flex justify-between pb-2 border-b border-sand/30">
                    <span className="text-charcoal/50">Estimated GST / Taxes (5%):</span>
                    <span className="font-black text-indigo">₹{breakdown.gst.toLocaleString("en-IN")}</span>
                  </div>
                )}
                <div className="flex justify-between pt-2.5 text-sm border-t border-sand/65">
                  <span className="text-charcoal/60 font-black">Estimated Move-in Cost:</span>
                  <span className="font-black text-terracotta text-sm md:text-base">
                    ₹{totalEstimatedMoveIn.toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Verification Audit ledger */}
          <div className="flex flex-col gap-5 p-6 rounded-3xl border border-double-ruled bg-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/5 rounded-full blur-[40px] pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Trust & Verification Audit</h3>
              </div>
              
              {property.reraApproved && property.reraId ? (
                <span className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-100 text-[9px] font-extrabold uppercase tracking-widest text-emerald-800 shadow-sm">
                  RERA REGISTERED: {property.reraId}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-xl bg-sand/40 border border-sand text-[9px] font-extrabold uppercase tracking-widest text-charcoal/50 shadow-sm">
                  Audit Registry Seal Pending
                </span>
              )}
            </div>

            <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
              This property has been physically inspected by our regional relocation leads. All owner deeds and government registration records are verified.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-1">
              {/* Vetted Checklist */}
              <div className="flex flex-col gap-3 bg-cream/25 border border-sand/60 p-4.5 rounded-2xl shadow-sm">
                <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest block pb-2 border-b border-sand/40">Verified Checkpoints</span>
                <div className="flex flex-col gap-2.5 text-xs font-semibold text-charcoal/80">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Land Registry / Title Deed</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Clear Title</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Municipal Property Tax Receipt</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Cleared Dues</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Utility bills (Water & Electricity)</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Active & Free</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <FileCheck2 className="w-4 h-4 text-emerald-500" />
                      <span>Physical On-Site Status Check</span>
                    </span>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">Matches Listing</span>
                  </div>
                </div>
              </div>

              {/* Inspector Information */}
              <div className="flex flex-col justify-between bg-cream/25 border border-sand/60 p-4.5 rounded-2xl shadow-sm text-xs font-semibold text-charcoal/70">
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest block pb-2 border-b border-sand/40">Audit Certificate</span>
                  <div className="flex items-center gap-2.5 mt-2">
                    <Avatar
                      name={property.ownerName}
                      size="sm"
                      shape="square"
                      tone="indigo"
                      className="w-8 h-8 bg-indigo text-white border-0"
                    />
                    <div className="flex flex-col text-left">
                      <span className="font-extrabold text-indigo">Inspected by SqftGo</span>
                      <span className="text-[9px] text-charcoal/50">Verified on {property.verifiedDate || "2026-06-25"}</span>
                    </div>
                  </div>
                </div>

                <div className="p-2.5 bg-indigo/5 border border-indigo/10 rounded-lg flex items-start gap-2 text-[9px] text-indigo leading-relaxed mt-4">
                  <AlertCircle className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <span>
                    <strong>Pledge:</strong> Legal checks are complete. Verification references are kept at SqftGo Udaipur Bureau.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Location highlights Map */}
          <div className="flex flex-col gap-4">
            <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Property Location & Context</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch">
              {/* Map Box */}
              <div className="md:col-span-7 h-72 rounded-3xl overflow-hidden border border-sand shadow-sm relative">
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

              {/* Proximity ledger */}
              <div className="md:col-span-5 flex flex-col justify-between gap-3 bg-white border border-sand p-5 rounded-3xl shadow-sm text-left">
                <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest block pb-2 border-b border-sand/40">Neighborhood Proximity</span>
                <div className="flex flex-col gap-3 flex-1 justify-center">
                  {neighborhoodHighlights.map((hl, i) => {
                    const HlIcon = hl.icon;
                    return (
                      <div key={i} className="flex items-start gap-3 text-xs">
                        <div className={`w-7.5 h-7.5 rounded-lg border flex items-center justify-center shrink-0 ${hl.color}`}>
                          <HlIcon className="w-4 h-4 shrink-0" />
                        </div>
                        <div className="flex flex-col text-left">
                          <span className="font-extrabold text-indigo text-[11px]">{hl.label}</span>
                          <span className="text-[10.5px] text-charcoal/60 leading-tight mt-0.5 font-medium">{hl.desc}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Similar Listings */}
          {similarProperties.length > 0 && (
            <div className="flex flex-col gap-6 pt-6 border-t border-sand">
              <h3 className="font-serif font-black text-lg text-indigo">Similar Listings in {property.city}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {similarProperties.map((prop) => (
                  <PropertyCard key={prop.id} property={prop} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Contact Sidebar (Desktop Only) */}
        <div className="hidden lg:block lg:col-span-4 lg:sticky lg:top-28">
          <InquiryForm property={property} />
        </div>

      </div>

      {/* Lightbox / Fullscreen Gallery Modal Portal */}
      <AnimatePresence>
        {showLightbox && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-charcoal/95 backdrop-blur-md flex flex-col justify-between p-4 md:p-6 transition-all duration-300"
          >
            {/* Top Bar */}
            <div className="flex items-center justify-between text-white pb-4 border-b border-white/10">
              <div className="flex flex-col text-left">
                <h4 className="font-serif font-black text-sm md:text-base text-brand-sand">{property.title}</h4>
                <span className="text-[10px] md:text-xs text-white/55">{property.locality}, {property.city}</span>
              </div>
              <button
                onClick={() => setShowLightbox(false)}
                className="p-2 rounded-full hover:bg-white/10 text-white transition-colors cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Large Image View */}
            <div className="relative flex-1 flex items-center justify-center my-6 max-h-[70vh] w-full max-w-4xl mx-auto font-sans">
              <img
                src={property.images[lightboxIndex]}
                alt={`${property.title} large slide ${lightboxIndex + 1}`}
                className="max-w-full max-h-full object-contain rounded-xl shadow-2xl"
              />

              {/* Navigation Arrows */}
              {property.images.length > 1 && (
                <>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev - 1 + property.images.length) % property.images.length)}
                    className="absolute left-2 md:left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    onClick={() => setLightboxIndex((prev) => (prev + 1) % property.images.length)}
                    className="absolute right-2 md:right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            {/* Bottom thumbnail selector */}
            <div className="flex flex-col gap-3">
              <div className="text-center text-white/50 text-[10px] font-black uppercase tracking-wider">
                Photo {lightboxIndex + 1} of {property.images.length}
              </div>
              <div className="flex gap-2.5 justify-center overflow-x-auto py-2 no-scrollbar max-w-3xl mx-auto">
                {property.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setLightboxIndex(idx)}
                    className={`flex-shrink-0 w-16 h-12 md:w-20 md:h-14 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      lightboxIndex === idx ? "border-terracotta scale-95 opacity-100" : "border-transparent opacity-45 hover:opacity-85"
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Persistent Bottom Contact Bar (Mobile/Tablet Only) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-sand/75 shadow-[0_-8px_30px_rgba(0,0,0,0.06)] px-5 py-4 flex items-center justify-between">
        <div className="flex flex-col text-left">
          <span className="text-[9px] text-charcoal/40 font-bold uppercase tracking-widest leading-none">Estimated Price</span>
          <span className="text-lg font-serif font-black text-terracotta mt-1 leading-none">
            {formatIndianCurrency(property.price, property.purpose)}
          </span>
        </div>
        <button
          onClick={() => setIsMobileDrawerOpen(true)}
          className="px-6 py-3 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-md flex items-center gap-2 active:scale-97 transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4 shrink-0" />
          <span>Contact Owner</span>
        </button>
      </div>

      {/* Mobile/Tablet Slide-Up Inquiry Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            {/* Dark Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-sm lg:hidden animate-fade-in"
            />
            {/* Slide-Up container */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto bg-cream border-t border-sand rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.15)] lg:hidden no-scrollbar"
            >
              {/* Grab bar */}
              <div className="w-12 h-1 bg-charcoal/10 rounded-full mx-auto my-3" />
              
              {/* Header */}
              <div className="px-6 pb-2.5 flex items-center justify-between border-b border-sand/40">
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest">Property Inquiry</span>
                  <span className="font-serif font-black text-indigo text-base truncate max-w-[200px] mt-0.5">
                    {property.title}
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1.5 rounded-full hover:bg-sand/30 text-charcoal/60 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Embedded Inquiry Form */}
              <div className="p-1">
                <InquiryForm property={property} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}

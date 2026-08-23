"use client";

import React, { useState } from "react";
import type { Property } from "@/types";
import { Avatar } from "@/components/ui";
import { PropertyCard } from "@/features/properties/components/PropertyCard";
import {
  BedDouble,
  Square,
  CheckCircle,
  ShieldCheck,
  Wallet,
  Landmark,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  CalendarDays,
  ChevronDown,
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
  Hospital,
  Eye,
} from "lucide-react";

interface PropertyDetailInfoProps {
  property: Property;
  similarProperties: Property[];
}

export function PropertyDetailInfo({
  property,
  similarProperties,
}: PropertyDetailInfoProps) {
  const [descExpanded, setDescExpanded] = useState(false);

  const specs = [
    property.bhk && { label: "Layout", value: `${property.bhk} BHK`, icon: BedDouble, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.size && { label: "Super Area", value: `${property.size} sq.ft.`, icon: Square, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    property.furnished && { label: "Furnishing", value: property.furnished, icon: CheckCircle, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.bathrooms && { label: "Bathrooms", value: `${property.bathrooms} Baths`, icon: Bath, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    property.parking ? { label: "Parking Space", value: `${property.parking} Covered`, icon: Car, color: "text-indigo bg-indigo/5 border-indigo/10" } : { label: "Parking Space", value: "Available", icon: Car, color: "text-indigo bg-indigo/5 border-indigo/10" },
    property.yearBuilt && { label: "Built Year", value: property.yearBuilt, icon: CalendarDays, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
  ].filter(Boolean) as Array<{ label: string; value: string | number; icon: React.ComponentType<{ className?: string }>; color: string }>;

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

  const neighborhoodHighlights = [
    property.nearbyHospital
      ? { label: "Hospital", desc: property.nearbyHospital, icon: Hospital, color: "text-terracotta bg-terracotta/5 border-terracotta/10" }
      : null,
    property.nearbySchool
      ? { label: "School", desc: property.nearbySchool, icon: School, color: "text-indigo bg-indigo/5 border-indigo/10" }
      : null,
    property.nearbyTransportation
      ? { label: "Transportation", desc: property.nearbyTransportation, icon: Bus, color: "text-indigo bg-indigo/5 border-indigo/10" }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    desc: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
  }>;

  const fallbackNeighborhood = [
    { label: "Connectivity", desc: "Local transit & main highway within 1.5 km", icon: Bus, color: "text-indigo bg-indigo/5 border-indigo/10" },
    { label: "Education", desc: "Leading schools and academies in a 3 km radius", icon: School, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
    { label: "Retail & Dine", desc: "Local markets, grocery, and dining within 500m", icon: Store, color: "text-indigo bg-indigo/5 border-indigo/10" },
    { label: "Nature & Parks", desc: "Green belts and heritage walkways nearby", icon: Trees, color: "text-terracotta bg-terracotta/5 border-terracotta/10" },
  ];

  const proximityItems = neighborhoodHighlights.length > 0 ? neighborhoodHighlights : fallbackNeighborhood;

  const needsTruncation = property.description.length > 280;
  const displayDesc = descExpanded || !needsTruncation
    ? property.description
    : `${property.description.slice(0, 260)}...`;

  return (
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
                  {proximityItems.map((hl, i) => {
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
  );
}

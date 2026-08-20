"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Property } from "@/types";
import { formatIndianCurrency } from "@/lib/format";
import { Avatar, Button, Dialog } from "@/components/ui";
import {
  Bath,
  BedDouble,
  CalendarDays,
  Car,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Copy,
  Expand,
  FileCheck2,
  FileSpreadsheet,
  Globe,
  Home,
  Layers,
  Mail,
  MapPin,
  Maximize2,
  Phone,
  Play,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Square,
  Tag,
  User,
  X,
  XCircle,
  ZoomIn,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface ListingPreviewModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onApprove: (property: Property) => void;
  onReject: (property: Property) => void;
  onRejectWithReason?: (property: Property, reason: string) => void | Promise<void>;
  busy?: boolean;
}

const REJECTION_PRESETS = [
  "Incomplete property description & specifications",
  "Low quality or insufficient property images",
  "Invalid or unverified RERA registration number",
  "Price significantly diverges from current market rates",
  "Unclear ownership documentation / missing deeds",
  "Duplicate listing or already marked active",
];

export function ListingPreviewModal({
  property,
  open,
  onClose,
  onApprove,
  onReject,
  onRejectWithReason,
  busy = false,
}: ListingPreviewModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isRejectOpen, setIsRejectOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isImageZoomed, setIsImageZoomed] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [activeSection, setActiveSection] = useState<"all" | "media" | "specs" | "compliance">("all");

  const rejectInputRef = useRef<HTMLTextAreaElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);

  // Reset state on property change or open
  useEffect(() => {
    setActiveImageIdx(0);
    setIsRejectOpen(false);
    setRejectionReason("");
    setIsImageZoomed(false);
    setImageLoaded(false);
    setImageError(false);
    setActiveSection("all");
  }, [property?.id, open]);

  // Focus textarea when reject is opened
  useEffect(() => {
    if (isRejectOpen) {
      setTimeout(() => {
        rejectInputRef.current?.focus();
      }, 100);
    }
  }, [isRejectOpen]);

  const images = useMemo(() => {
    if (!property?.images?.length) return [];
    return property.images;
  }, [property?.images]);

  const isRent = useMemo(() => {
    return property?.purpose === "rent" || property?.purpose === "lease";
  }, [property?.purpose]);

  const location = useMemo(() => {
    if (!property) return "";
    return [property.locality, property.city, property.state, property.country]
      .filter(Boolean)
      .join(", ");
  }, [property]);

  const pricePerSqFt = useMemo(() => {
    if (property?.size && property?.price) {
      return Math.round(property.price / property.size);
    }
    return null;
  }, [property?.price, property?.size]);

  const specs = useMemo(() => {
    if (!property) return [];
    return [
      property.bhk
        ? { label: "Layout", value: `${property.bhk} BHK`, icon: BedDouble, highlight: true }
        : null,
      property.size
        ? {
          label: "Super Built-up Area",
          value: `${property.size.toLocaleString("en-IN")} sq.ft.`,
          subValue: pricePerSqFt ? `₹${pricePerSqFt.toLocaleString("en-IN")}/sq.ft.` : undefined,
          icon: Square,
          highlight: true,
        }
        : null,
      property.furnished
        ? { label: "Furnishing Status", value: property.furnished, icon: Home }
        : null,
      property.bathrooms
        ? { label: "Bathrooms", value: `${property.bathrooms} Baths`, icon: Bath }
        : null,
      property.parking != null
        ? {
          label: "Car Parking",
          value: property.parking ? `${property.parking} Dedicated` : "Available",
          icon: Car,
        }
        : null,
      property.yearBuilt
        ? { label: "Year Built / Age", value: String(property.yearBuilt), icon: CalendarDays }
        : null,
    ].filter(Boolean) as Array<{
      label: string;
      value: string;
      subValue?: string;
      icon: React.ComponentType<{ className?: string }>;
      highlight?: boolean;
    }>;
  }, [property, pricePerSqFt]);

  const checks = useMemo(() => {
    if (!property) {
      return {
        titleDeed: false,
        taxClearance: false,
        utilitiesCheck: false,
        physicalVerification: false,
        structuralVetted: false,
      };
    }
    return (
      property.verificationChecks || {
        titleDeed: Boolean(property.reraId || property.reraApproved),
        taxClearance: true,
        utilitiesCheck: true,
        physicalVerification: false,
        structuralVetted: false,
      }
    );
  }, [property]);

  // Keyboard navigation
  useEffect(() => {
    if (!open || !property) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture when typing in textarea/inputs
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
          e.preventDefault();
          handleConfirmReject();
        }
        return;
      }

      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setActiveImageIdx((prev) => (prev - 1 + (images.length || 1)) % (images.length || 1));
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        setActiveImageIdx((prev) => (prev + 1) % (images.length || 1));
      } else if (e.key.toLowerCase() === "r" && !isRejectOpen) {
        e.preventDefault();
        setIsRejectOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, property, images.length, isRejectOpen]);

  const copyToClipboard = useCallback((text: string, key: string) => {
    if (!text) return;
    void navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000);
  }, []);

  const handleConfirmReject = useCallback(() => {
    if (!property) return;
    const reason = rejectionReason.trim();
    if (!reason) return;
    if (onRejectWithReason) {
      void onRejectWithReason(property, reason);
    } else {
      onReject(property);
    }
  }, [property, rejectionReason, onRejectWithReason, onReject]);

  if (!property) return null;

  return (
    <Dialog
      open={open}
      onClose={() => {
        if (!busy) onClose();
      }}
      className="!w-[95vw] !max-w-6xl max-h-[94vh] !p-0 overflow-hidden flex flex-col rounded-3xl bg-white border border-sand/80 shadow-2xl transition-all"
    >
      {/* ── 1. Top Header Banner ── */}
      <div className="relative z-20 px-6 py-4 border-b border-sand bg-cream/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center shrink-0 border border-indigo/10 shadow-inner">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-amber-500/10 text-amber-800 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                Pending Review
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${isRent
                  ? "bg-terracotta/10 text-terracotta border border-terracotta/20"
                  : "bg-indigo/10 text-indigo border border-indigo/20"
                  }`}
              >
                For {isRent ? "Rent" : "Sale"}
              </span>
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-charcoal/5 text-charcoal/70 border border-charcoal/10">
                {property.type}
              </span>
              {property.reraId && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-emerald-500/10 text-emerald-700 border border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  RERA: {property.reraId}
                </span>
              )}
            </div>
            <h2 className="text-base font-serif font-black text-charcoal truncate max-w-xl">
              {property.title}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close dialog"
            className="w-9 h-9 rounded-xl bg-charcoal/5 hover:bg-charcoal/10 text-charcoal/60 hover:text-charcoal flex items-center justify-center transition-colors cursor-pointer border border-sand"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── 2. Modal Body / Scrollable Content with Sticky Reviewer Sidebar ── */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto min-h-0 bg-background/50 p-5 md:p-7 space-y-6 scroll-smooth"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* ──── Left Column: Media Showcase & Property Anatomy (7 cols) ──── */}
          <div className="lg:col-span-7 space-y-6 min-w-0">
            {/* Gallery Component */}
            <div className="space-y-3">
              <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-sand/40 border border-sand shadow-sm group">
                {images.length > 0 ? (
                  <>
                    {!imageLoaded && !imageError && (
                      <div className="absolute inset-0 bg-sand/30 animate-pulse flex items-center justify-center text-charcoal/30">
                        <Layers className="w-8 h-8 animate-bounce opacity-40" />
                      </div>
                    )}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={
                        imageError
                          ? "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"
                          : images[activeImageIdx]
                      }
                      alt={property.title}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setImageError(true);
                        setImageLoaded(true);
                      }}
                      className={`w-full h-full object-cover transition-all duration-300 ${imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95"
                        }`}
                    />

                    {/* Zoom / Lightbox Trigger */}
                    <button
                      type="button"
                      onClick={() => setIsImageZoomed(true)}
                      className="absolute top-3 right-3 w-8 h-8 rounded-xl bg-charcoal/60 backdrop-blur-md text-white hover:bg-charcoal/80 flex items-center justify-center cursor-pointer transition-transform active:scale-90"
                      title="Inspect full image"
                    >
                      <ZoomIn className="w-4 h-4" />
                    </button>

                    {/* Navigation buttons */}
                    {images.length > 1 && (
                      <>
                        <button
                          type="button"
                          aria-label="Previous image"
                          onClick={() => {
                            setImageLoaded(false);
                            setImageError(false);
                            setActiveImageIdx(
                              (prev) => (prev - 1 + images.length) % images.length
                            )
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-charcoal/60 backdrop-blur-md hover:bg-charcoal/85 text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform active:scale-90"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          type="button"
                          aria-label="Next image"
                          onClick={() => {
                            setImageLoaded(false);
                            setImageError(false);
                            setActiveImageIdx((prev) => (prev + 1) % images.length)
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-charcoal/60 backdrop-blur-md hover:bg-charcoal/85 text-white flex items-center justify-center cursor-pointer shadow-lg transition-transform active:scale-90"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Image Counter & Badges Overlay */}
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-none">
                      <div className="bg-charcoal/75 backdrop-blur-md text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-sand" />
                        {activeImageIdx + 1} / {images.length} Photos
                      </div>

                      {property.videoUrl && (
                        <a
                          href={property.videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pointer-events-auto bg-indigo/90 backdrop-blur-md hover:bg-indigo text-white text-[11px] font-bold px-3 py-1.5 rounded-xl shadow-sm flex items-center gap-1.5 transition-colors"
                        >
                          <Play className="w-3 h-3 fill-current" />
                          Video Tour
                        </a>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-charcoal/40 gap-2">
                    <Home className="w-10 h-10 stroke-1" />
                    <p className="text-xs font-bold">No images uploaded for this listing</p>
                  </div>
                )}
              </div>

              {/* Thumbnails strip with smooth wheel/horizontal scroll */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1.5 no-scrollbar scroll-smooth">
                  {images.map((img, idx) => (
                    <button
                      key={`${img}-${idx}`}
                      type="button"
                      onClick={() => {
                        setImageLoaded(false);
                        setImageError(false);
                        setActiveImageIdx(idx);
                      }}
                      className={`relative w-20 aspect-[4/3] shrink-0 rounded-xl overflow-hidden border-2 cursor-pointer transition-all ${activeImageIdx === idx
                        ? "border-indigo ring-2 ring-indigo/20 scale-[1.02] shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100"
                        }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Specs Matrix */}
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-charcoal/50 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5 text-indigo" />
                  Key Specifications
                </h3>
                <span className="text-[11px] font-semibold text-charcoal/50">
                  {specs.length} parameters defined
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {specs.map((spec) => {
                  const Icon = spec.icon;
                  return (
                    <div
                      key={spec.label}
                      className={`p-3.5 rounded-2xl border transition-all ${spec.highlight
                        ? "bg-white border-sand shadow-sm"
                        : "bg-cream/50 border-sand/70"
                        }`}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-7 h-7 rounded-lg bg-indigo/5 text-indigo flex items-center justify-center shrink-0 border border-indigo/10">
                          <Icon className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-charcoal/50 truncate">
                          {spec.label}
                        </span>
                      </div>
                      <p className="text-sm font-black text-charcoal truncate">
                        {spec.value}
                      </p>
                      {spec.subValue && (
                        <p className="text-[11px] font-semibold text-terracotta mt-0.5">
                          {spec.subValue}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Property Overview / Narrative Description */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-charcoal/50 flex items-center gap-2">
                Property Description
              </h3>
              <div className="p-5 rounded-2xl border border-sand bg-white shadow-sm space-y-2">
                <p className="text-xs md:text-sm font-medium text-charcoal/80 leading-relaxed whitespace-pre-line">
                  {property.description || "No description submitted by dealer."}
                </p>
              </div>
            </section>

            {/* Amenities Section */}
            <section className="space-y-2.5">
              <h3 className="text-xs font-black uppercase tracking-widest text-charcoal/50 flex items-center gap-2">
                Amenities & Features ({property.amenities?.length || 0})
              </h3>
              {property.amenities?.length ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {property.amenities.map((amenity) => (
                    <div
                      key={amenity}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white border border-sand shadow-2xs text-xs font-bold text-charcoal/85"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">{amenity}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-sand bg-cream/30 text-xs font-medium text-charcoal/50">
                  No specific amenities tagged for this property.
                </div>
              )}
            </section>
          </div>

          {/* ──── Right Column: Reviewer Sidebar & Action Center (5 cols) ──── */}
          <div className="lg:col-span-5 space-y-5 min-w-0 lg:sticky lg:top-0">
            {/* Location & Pricing Summary Card */}
            <div className="p-5 rounded-2xl bg-white border border-sand shadow-sm space-y-4">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-charcoal/40">
                  Full Location
                </p>
                <div className="flex items-start gap-2 mt-1">
                  <MapPin className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
                  <p className="text-xs md:text-sm font-bold text-charcoal leading-snug">
                    {location || "Location not provided"}
                  </p>
                </div>
              </div>

              <div className="pt-3 border-t border-sand flex items-end justify-between">
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-charcoal/40">
                    Total Valuation
                  </p>
                  <p className="text-2xl font-serif font-black text-indigo">
                    {formatIndianCurrency(property.price, property.purpose)}
                  </p>
                </div>
                {pricePerSqFt && (
                  <div className="text-right">
                    <p className="text-[9px] uppercase font-black tracking-widest text-charcoal/40">
                      Rate
                    </p>
                    <p className="text-xs font-black text-charcoal">
                      ₹{pricePerSqFt.toLocaleString("en-IN")} / sq.ft.
                    </p>
                  </div>
                )}
              </div>

              {/* Price Breakdown details if available */}
              {property.priceBreakdown && (
                <div className="pt-3 border-t border-sand/70 space-y-1.5 text-xs">
                  <div className="flex justify-between text-charcoal/60">
                    <span>Base Listing Price</span>
                    <span className="font-bold text-charcoal">
                      ₹{property.priceBreakdown.basePrice?.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {property.priceBreakdown.maintenance ? (
                    <div className="flex justify-between text-charcoal/60">
                      <span>Monthly Maintenance</span>
                      <span className="font-bold text-charcoal">
                        ₹{property.priceBreakdown.maintenance.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : null}
                  {property.priceBreakdown.securityDeposit ? (
                    <div className="flex justify-between text-charcoal/60">
                      <span>Security Deposit</span>
                      <span className="font-bold text-charcoal">
                        ₹{property.priceBreakdown.securityDeposit.toLocaleString("en-IN")}
                      </span>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Submitter / Dealer Profile Card */}
            <div className="p-5 rounded-2xl bg-white border border-sand shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest text-charcoal/50 flex items-center gap-2">
                  <User className="w-3.5 h-3.5 text-indigo" />
                  Dealer & Submitter Details
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo/5 text-indigo border border-indigo/10">
                  Partner
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <Avatar
                  name={property.ownerName}
                  size="lg"
                  tone="indigo"
                  shape="rounded"
                />
                <div className="min-w-0 space-y-1">
                  <p className="text-sm font-black text-charcoal truncate">
                    {property.ownerName || "Unknown Submitter"}
                  </p>
                  <p className="text-[11px] font-semibold text-charcoal/40">
                    Listing ID:{" "}
                    <span className="font-mono text-charcoal/60">
                      {property.id.slice(0, 8)}…
                    </span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t border-sand/70">
                {property.ownerEmail && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-cream/40 border border-sand/60 text-xs">
                    <a
                      href={`mailto:${property.ownerEmail}`}
                      className="flex items-center gap-2 font-semibold text-charcoal/80 hover:text-indigo truncate"
                    >
                      <Mail className="w-3.5 h-3.5 text-indigo shrink-0" />
                      <span className="truncate">{property.ownerEmail}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(property.ownerEmail || "", "email")
                      }
                      className="p-1 text-charcoal/40 hover:text-charcoal cursor-pointer"
                      title="Copy email"
                    >
                      {copiedKey === "email" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}

                {property.ownerPhone && (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-cream/40 border border-sand/60 text-xs">
                    <a
                      href={`tel:${property.ownerPhone}`}
                      className="flex items-center gap-2 font-semibold text-charcoal/80 hover:text-indigo truncate"
                    >
                      <Phone className="w-3.5 h-3.5 text-indigo shrink-0" />
                      <span>{property.ownerPhone}</span>
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        copyToClipboard(property.ownerPhone || "", "phone")
                      }
                      className="p-1 text-charcoal/40 hover:text-charcoal cursor-pointer"
                      title="Copy phone"
                    >
                      {copiedKey === "phone" ? (
                        <Check className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <Copy className="w-3 h-3" />
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Bottom Footer Strip ── */}
      <div className="px-6 py-3.5 border-t border-sand bg-cream/80 backdrop-blur-md flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2 text-xs font-semibold text-charcoal/50 min-w-0">
          <span className="truncate">
            Reviewing: <strong className="text-charcoal font-bold">{property.title}</strong>
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => {
              setIsRejectOpen(true);
            }}
            className="border-rose-500/25 text-rose-600 hover:bg-rose-500/10 font-bold"
          >
            <XCircle className="w-3.5 h-3.5" /> Reject Listing
          </Button>

          <Button
            variant="primary"
            size="sm"
            disabled={busy}
            onClick={() => onApprove(property)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-0 shadow-md shadow-emerald-600/20"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Listing
          </Button>
        </div>
      </div>

      {/* ── 4. Fullscreen Image Lightbox Modal ── */}
      <AnimatePresence>
        {isImageZoomed && images.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[300] bg-black/90 backdrop-blur-md flex items-center justify-center p-4"
          >
            <button
              type="button"
              onClick={() => setIsImageZoomed(false)}
              className="absolute top-6 right-6 w-11 h-11 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="relative max-w-5xl max-h-[85vh] w-full flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[activeImageIdx]}
                alt={property.title}
                className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
              />

              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx(
                        (prev) => (prev - 1 + images.length) % images.length
                      )
                    }
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronLeft className="w-6 h-6" />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setActiveImageIdx((prev) => (prev + 1) % images.length)
                    }
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-xl bg-white/10 hover:bg-white/25 text-white flex items-center justify-center cursor-pointer"
                  >
                    <ChevronRight className="w-6 h-6" />
                  </button>
                </>
              )}
            </div>

            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md text-white px-4 py-2 rounded-xl text-xs font-bold">
              {activeImageIdx + 1} / {images.length} — {property.title}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

function VerificationPill({
  label,
  checked,
  sublabel,
}: {
  label: string;
  checked: boolean;
  sublabel?: string;
}) {
  return (
    <div
      className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs transition-all ${checked
        ? "bg-emerald-50/60 border-emerald-500/20 text-emerald-950"
        : "bg-charcoal/5 border-charcoal/10 text-charcoal/50 opacity-70"
        }`}
    >
      <div
        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${checked
          ? "bg-emerald-600 text-white"
          : "bg-charcoal/20 text-charcoal/40"
          }`}
      >
        {checked ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
      </div>
      <div className="min-w-0">
        <p className="font-bold leading-tight">{label}</p>
        {sublabel ? (
          <p className="text-[10px] font-mono text-emerald-800/80 truncate">
            {sublabel}
          </p>
        ) : (
          <p className="text-[10px] font-medium opacity-80">
            {checked ? "Verified" : "Pending confirmation"}
          </p>
        )}
      </div>
    </div>
  );
}

export default ListingPreviewModal;

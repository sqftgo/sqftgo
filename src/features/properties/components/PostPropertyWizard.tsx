"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import type { Property } from "@/types";
import {
  CITIES_WITHOUT_ALL,
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  AMENITIES as AMENITY_FALLBACK,
} from "@/constants";
import StepProgress from "@/components/ui/StepProgress";
import { ErrorState } from "@/components/ui/ErrorState";
import { Alert } from "@/components/ui/Alert";
import { formatIndianCurrency } from "@/lib/format";
import {
  IndianRupee,
  ChevronRight,
  ChevronLeft,
  Upload,
  X,
  FileCheck,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadPropertyImage } from "@/lib/uploads/propertyImage";

const STEPS = ["Type & Purpose", "Location", "Specifications", "Photos", "Price & Terms", "Review"];

type PostPropertyWizardProps = {
  onSuccess?: () => void;
};

export function PostPropertyWizard({ onSuccess }: PostPropertyWizardProps) {
  const router = useRouter();
  const { addProperty, isLoggedIn, userEmail, userRole, amenities } = useApp();
  const amenityOptions = useMemo(() => {
    const live = amenities.filter((a) => a.active).map((a) => a.name);
    return live.length > 0 ? live : [...AMENITY_FALLBACK];
  }, [amenities]);
  const canPost =
    isLoggedIn &&
    (userRole === "admin" || userRole === "broker" || userEmail === "admin@sqftgo.com");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
    if (!canPost) {
      router.push("/");
    }
  }, [canPost, router]);

  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [purpose, setPurpose] = useState<"buy" | "sell" | "rent" | "lease">("buy");
  const [type, setType] = useState<Property["type"]>("Apartment");
  const [city, setCity] = useState("Udaipur");
  const [locality, setLocality] = useState("");
  const [bhk, setBhk] = useState<string>("3");
  const [size, setSize] = useState<string>("");
  const [furnished, setFurnished] = useState<Property["furnished"]>("Semi-Furnished");
  const [description, setDescription] = useState("");
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [price, setPrice] = useState<string>("");
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  if (!mounted || !canPost) {
    return (
      <div className="container mx-auto px-6 py-20 max-w-xl">
        {mounted && (
          <ErrorState
            title="Access Denied"
            message="Only verified brokers and administrators can list new properties. Redirecting..."
          />
        )}
      </div>
    );
  }

  const handleAmenityToggle = (name: string) => {
    setSelectedAmenities((prev) =>
      prev.includes(name) ? prev.filter((a) => a !== name) : [...prev, name]
    );
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files?.length || uploading) return;
    setUploadError(null);
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of Array.from(files)) {
        urls.push(await uploadPropertyImage(file));
      }
      setUploadedImages((prev) => [...prev, ...urls]);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (idx: number) => {
    setUploadedImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const validateStep = (): boolean => {
    if (currentStep === 1 && !locality) return false;
    if (currentStep === 2 && !size) return false;
    if (currentStep === 4 && !price) return false;
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) {
      setError("Please fill in all required fields before moving forward.");
      return;
    }
    setError(null);
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    setError(null);
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    void addProperty({
      title: `${
        type !== "Industrial Plot" && type !== "Agricultural Land" && bhk ? bhk + " BHK " : ""
      }${type} in ${locality}`,
      price: parseInt(price),
      type,
      purpose,
      bhk: type !== "Industrial Plot" && type !== "Agricultural Land" ? parseInt(bhk) : undefined,
      city,
      locality,
      size: parseInt(size),
      furnished,
      description:
        description ||
        `A well-maintained ${bhk ? bhk + " BHK " : ""}${type} located in the pleasant vicinity of ${locality}, ${city}. Ideal for family residence.`,
      amenities: selectedAmenities.length > 0 ? selectedAmenities : ["Security", "Parking"],
      images:
        uploadedImages.length > 0
          ? uploadedImages
          : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80"],
      status: "Pending Review",
    })
      .then(() => {
        setIsSubmitted(true);
        onSuccess?.();
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : "Unable to create property");
      });
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-indigo text-sm">Listing Purpose *</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {(["buy", "sell", "rent", "lease"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPurpose(mode)}
                    className={`p-4 rounded-2xl border-2 text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                      purpose === mode
                        ? "border-terracotta bg-terracotta/5 text-terracotta font-extrabold shadow-sm"
                        : "border-sand bg-white text-charcoal/60 hover:border-terracotta/40"
                    }`}
                  >
                    <span className="text-sm capitalize">
                      {mode === "buy"
                        ? "For Sale (Buy)"
                        : mode === "sell"
                          ? "For Sale (Sell)"
                          : mode === "rent"
                            ? "For Rent"
                            : "For Lease"}
                    </span>
                    <span className="text-[9px] opacity-75 font-semibold leading-tight mt-1">
                      {mode === "buy" && "Purchase outright"}
                      {mode === "sell" && "List as owner/broker"}
                      {mode === "rent" && "Monthly rent tenancy"}
                      {mode === "lease" && "Long-term lease contract"}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-indigo text-sm">Property Type *</span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {PROPERTY_TYPES.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t as Property["type"])}
                    className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                      type === t
                        ? "bg-indigo border-indigo text-white shadow-md"
                        : "bg-white border-sand text-charcoal/70 hover:border-terracotta/40 hover:text-terracotta"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 1:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="citySelect" className="font-extrabold text-indigo text-sm">
                City *
              </label>
              <select
                id="citySelect"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-white border border-sand text-charcoal rounded-xl px-4 py-3 text-sm font-semibold outline-none focus:border-terracotta cursor-pointer"
              >
                {CITIES_WITHOUT_ALL.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="localityInput" className="font-extrabold text-indigo text-sm">
                Locality *
              </label>
              <input
                id="localityInput"
                type="text"
                required
                value={locality}
                onChange={(e) => {
                  setLocality(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. Panchwati, Shastri Nagar, Hiran Magri"
                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-terracotta text-charcoal"
              />
              <span className="text-[10px] text-charcoal/50 font-medium">
                The sub-locality area or neighborhood
              </span>
            </div>
          </motion.div>
        );

      case 2:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6 text-sm"
          >
            {type !== "Industrial Plot" && type !== "Agricultural Land" && (
              <div className="flex flex-col gap-2">
                <span className="font-extrabold text-indigo">BHK Layout Size</span>
                <div className="flex gap-2">
                  {["1", "2", "3", "4", "5"].map((bhkVal) => (
                    <button
                      key={bhkVal}
                      type="button"
                      onClick={() => setBhk(bhkVal)}
                      className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold text-xs transition-all ${
                        bhk === bhkVal
                          ? "bg-terracotta border-terracotta text-white shadow-sm"
                          : "bg-white border-sand text-charcoal/70 hover:border-terracotta/40 hover:text-terracotta"
                      }`}
                    >
                      {bhkVal}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label htmlFor="sizeInput" className="font-extrabold text-indigo">
                Super Area (sq.ft.) *
              </label>
              <input
                id="sizeInput"
                type="number"
                required
                value={size}
                onChange={(e) => {
                  setSize(e.target.value);
                  setError(null);
                }}
                placeholder="e.g. 1500"
                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-terracotta text-charcoal"
              />
            </div>

            {type !== "Industrial Plot" && type !== "Agricultural Land" && (
              <div className="flex flex-col gap-1.5">
                <label htmlFor="furnishSelect" className="font-extrabold text-indigo">
                  Furnishing State
                </label>
                <select
                  id="furnishSelect"
                  value={furnished}
                  onChange={(e) => setFurnished(e.target.value as Property["furnished"])}
                  className="w-full bg-white border border-sand text-charcoal rounded-xl px-4 py-3 text-sm font-semibold focus:border-terracotta cursor-pointer"
                >
                  {FURNISHING_OPTIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex flex-col gap-2">
              <span className="font-extrabold text-indigo">Select Amenities</span>
              <div className="grid grid-cols-2 gap-2">
                {amenityOptions.map((am) => (
                  <label
                    key={am}
                    className="flex items-center gap-2 cursor-pointer text-charcoal/70 font-semibold text-xs"
                  >
                    <input
                      type="checkbox"
                      checked={selectedAmenities.includes(am)}
                      onChange={() => handleAmenityToggle(am)}
                      className="rounded text-terracotta border-sand w-4 h-4 cursor-pointer focus:ring-terracotta"
                    />
                    <span>{am}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="descInput" className="font-extrabold text-indigo">
                Detailed Description
              </label>
              <textarea
                id="descInput"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe key attractions, surrounding facilities, views..."
                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:border-terracotta text-charcoal resize-none"
              />
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <span className="font-extrabold text-indigo text-sm">Upload Photos</span>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              multiple
              className="hidden"
              onChange={(e) => void handleFileUpload(e.target.files)}
            />

            <div
              onClick={() => !uploading && fileInputRef.current?.click()}
              className="border-2 border-dashed border-sand hover:border-terracotta rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors duration-200 bg-sand/10"
            >
              <Upload className="w-10 h-10 text-charcoal/40 mb-3" />
              <span className="text-sm font-bold text-charcoal">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </span>
              <span className="text-xs text-charcoal/50 mt-1">PNG, JPG, WebP, GIF (max 5MB each)</span>
            </div>

            {uploadError ? (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {uploadError}
              </p>
            ) : null}

            {uploadedImages.length > 0 && (
              <div className="flex flex-wrap gap-4 mt-2">
                {uploadedImages.map((img, idx) => (
                  <div
                    key={`${img}-${idx}`}
                    className="relative w-24 h-16 rounded-xl overflow-hidden border border-sand shadow-sm flex-shrink-0"
                  >
                    <img src={img} alt="upload" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(idx)}
                      className="absolute top-1 right-1 p-0.5 rounded-full bg-charcoal/60 hover:bg-charcoal text-white transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        );

      case 4:
        return (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-6"
          >
            <div className="flex flex-col gap-1.5">
              <label htmlFor="priceInput" className="font-extrabold text-indigo text-sm">
                {purpose === "rent" || purpose === "lease"
                  ? "Monthly Rent (Rupees) *"
                  : "Total Price (Rupees) *"}
              </label>
              <div className="relative">
                <input
                  id="priceInput"
                  type="number"
                  required
                  value={price}
                  onChange={(e) => {
                    setPrice(e.target.value);
                    setError(null);
                  }}
                  placeholder={
                    purpose === "rent" || purpose === "lease" ? "e.g. 15000" : "e.g. 7500000"
                  }
                  className="w-full bg-white border border-sand rounded-xl py-3 pl-10 pr-4 text-sm font-bold focus:outline-none focus:border-terracotta text-charcoal"
                />
                <IndianRupee className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40" />
              </div>
              <span className="text-[10px] text-charcoal/50 font-medium italic mt-0.5">
                {price && (
                  <>
                    Formatted Price:{" "}
                    <span className="font-bold text-terracotta">
                      {formatIndianCurrency(parseInt(price), purpose)}
                    </span>
                  </>
                )}
              </span>
            </div>
          </motion.div>
        );

      case 5:
        return (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-4 text-sm font-semibold text-charcoal/70"
          >
            <h3 className="font-serif font-black text-lg text-indigo uppercase tracking-wide">
              Recap Details
            </h3>
            <div className="grid grid-cols-2 gap-4 bg-sand/20 p-5 rounded-2xl border border-sand/80">
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">Purpose</span>
                <span className="text-charcoal font-bold capitalize">
                  {purpose === "rent"
                    ? "For Rent"
                    : purpose === "lease"
                      ? "For Lease"
                      : "For Sale"}
                </span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">
                  Property Type
                </span>
                <span className="text-charcoal font-bold">{type}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">Location</span>
                <span className="text-charcoal font-bold truncate">
                  {locality}, {city}
                </span>
              </div>
              {type !== "Industrial Plot" && type !== "Agricultural Land" && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">
                    BHK Layout
                  </span>
                  <span className="text-charcoal font-bold">{bhk} BHK</span>
                </div>
              )}
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">
                  Super Area
                </span>
                <span className="text-charcoal font-bold">{size} sq.ft.</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-extrabold text-charcoal/50 uppercase">Pricing</span>
                <span className="text-terracotta font-extrabold">
                  {price && formatIndianCurrency(parseInt(price), purpose)}
                </span>
              </div>
            </div>

            <p className="text-xs text-charcoal/50 leading-relaxed italic mt-2">
              By submitting this property, you certify that all information details are correct.
              Listing will go live instantly under the results list.
            </p>
          </motion.div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-20 pt-6">
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div
            key="wizard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col"
          >
            <div className="text-center mb-8">
              <h1 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
                List Your Property
              </h1>
              <p className="text-sm text-charcoal/60 mt-1.5 font-medium">
                Complete the 6-step form below to list your heritage property or plot.
              </p>
            </div>

            <StepProgress currentStep={currentStep} steps={STEPS} />

            <form
              onSubmit={handleSubmit}
              className="bg-white/80 glassmorphism rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 mt-4 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />

              <div className="min-h-[260px] relative z-10">{renderStepContent()}</div>

              {error && (
                <Alert
                  variant="danger"
                  title={error}
                  className="relative z-10"
                  onDismiss={() => setError(null)}
                />
              )}

              <div className="flex items-center justify-between pt-6 border-t border-sand mt-4 relative z-10">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={currentStep === 0}
                  className="px-5 py-2.5 rounded-xl border border-sand text-charcoal/70 text-xs font-bold hover:border-terracotta/40 hover:text-terracotta disabled:opacity-30 disabled:pointer-events-none flex items-center gap-1.5 transition-all bg-white"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>

                {currentStep === STEPS.length - 1 ? (
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-terracotta/20 transition-all duration-200"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>Submit & Publish</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 rounded-xl bg-indigo hover:bg-indigo-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        ) : (
          <motion.div
            key="success-splash"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-12 px-6 rounded-3xl glassmorphism shadow-lg max-w-xl mx-auto mt-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 shadow-inner border border-emerald-500/20"
            >
              <CheckCircle2 className="w-9 h-9" />
            </motion.div>

            <h2 className="font-serif font-black text-2xl text-indigo mb-2 tracking-tight">
              Property Listed Successfully!
            </h2>
            <p className="text-sm text-charcoal/60 max-w-sm leading-relaxed mb-8 font-medium">
              Your property has been submitted successfully and will display to all users browsing
              the heritage listings.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
              <Link
                href="/listings"
                className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-sm rounded-xl shadow-sm transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-sand bg-white text-charcoal/80 font-bold text-sm rounded-xl hover:border-terracotta/40 hover:text-terracotta transition-colors"
              >
                Go to Homepage
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

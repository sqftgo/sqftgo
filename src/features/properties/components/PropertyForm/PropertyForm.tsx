"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import {
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  AMENITIES as AMENITY_FALLBACK,
} from "@/constants";
import { useActiveCities } from "@/hooks/useActiveCities";
import CustomSelect from "@/components/ui/CustomSelect";
import { FormField, TextInput, TextArea } from "@/components/ui/FormField";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { SearchInput } from "@/components/ui/SearchInput";
import { PropertyCard } from "@/features/properties/components/PropertyCard";
import {
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Save,
  Eye,
  Send,
  Check,
  ArrowLeft,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { uploadPropertyImage } from "@/lib/uploads/propertyImage";
import { CREATE_STEPS, PURPOSES, STATUSES, labelClassName, selectBtnClass } from "./constants";
import {
  emptyForm,
  propertyToForm,
  toSubmitData,
  type FormState,
  type PropertyFormProps,
} from "./types";
import { BasicInfoStep } from "./steps/BasicInfoStep";
import { LocationDetailsStep } from "./steps/LocationDetailsStep";
import { PricingStep } from "./steps/PricingStep";
import { AmenitiesStep } from "./steps/AmenitiesStep";
import { MediaSeoStep } from "./steps/MediaSeoStep";
import { ReviewStep } from "./steps/ReviewStep";

export type { PropertyFormProps, PropertyFormSubmitData } from "./types";

export function PropertyForm({ mode, initialProperty, onSubmit }: PropertyFormProps) {
  const router = useRouter();
  const { amenities } = useApp();
  const { cityOptionsWithoutAll, findLocation, locationsReady } = useActiveCities();
  const amenityOptions = useMemo(() => {
    const live = amenities.filter((a) => a.active).map((a) => a.name);
    return live.length > 0 ? live : [...AMENITY_FALLBACK];
  }, [amenities]);
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<"draft" | "published" | null>(null);
  const [saved, setSaved] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<FormState>(() =>
    mode === "edit" && initialProperty ? propertyToForm(initialProperty) : emptyForm()
  );

  useEffect(() => {
    if (mode === "edit" && initialProperty) {
      setForm(propertyToForm(initialProperty));
    }
  }, [mode, initialProperty]);

  const set = (k: keyof FormState, v: FormState[keyof FormState]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const toggleAmenity = (a: string) =>
    set(
      "amenities",
      form.amenities.includes(a) ? form.amenities.filter((x) => x !== a) : [...form.amenities, a]
    );

  const addImageUrl = (url: string) => {
    if (url && url.startsWith("http")) {
      set("images", [...form.images, url]);
      setNewImageUrl("");
    }
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
      setForm((f) => ({ ...f, images: [...f.images, ...urls] }));
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Image upload failed");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    set(
      "images",
      form.images.filter((_, i) => i !== index)
    );
  };

  const handleCreateSubmit = (status: "Draft" | "Pending Review" = "Pending Review") => {
    onSubmit(toSubmitData(form, status));
    setSubmitted(status === "Draft" ? "draft" : "published");
    setTimeout(() => router.push("/dealer/dashboard/properties"), 2000);
  };

  const nearbyComplete = Boolean(
    form.nearbyHospital.trim() && form.nearbySchool.trim() && form.nearbyTransportation.trim()
  );

  const handleEditSave = () => {
    if (!nearbyComplete) return;
    onSubmit(toSubmitData(form, form.status));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/dealer/dashboard/properties");
    }, 1500);
  };

  const canNext = [
    form.title && form.type && form.description,
    form.city && form.locality && form.size && nearbyComplete,
    form.price,
    true,
    true,
    true,
  ][step];

  const previewProperty: Property = {
    id: initialProperty?.id || "preview-id",
    title: form.title || "Untitled Property",
    price: parseInt(form.price) || 0,
    type: form.type as Property["type"],
    purpose: form.purpose as Property["purpose"],
    bhk: parseInt(form.bhk) || undefined,
    bathrooms: parseInt(form.bathrooms) || undefined,
    parking: parseInt(form.parking) || undefined,
    yearBuilt: parseInt(form.yearBuilt) || undefined,
    city: form.city,
    state: form.state,
    country: "India",
    locality: form.locality || "Locality",
    nearbyHospital: form.nearbyHospital.trim() || undefined,
    nearbySchool: form.nearbySchool.trim() || undefined,
    nearbyTransportation: form.nearbyTransportation.trim() || undefined,
    size: parseInt(form.size) || 0,
    furnished: form.furnished as Property["furnished"],
    description: form.description || "No description provided.",
    amenities: form.amenities,
    images:
      form.images.length > 0
        ? form.images
        : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"],
    ownerName: initialProperty?.ownerName || "Dealer preview",
    ownerPhone: initialProperty?.ownerPhone || "+91 99000 99000",
    inquiryCount: initialProperty?.inquiryCount || 0,
    status: form.status,
    reraApproved: !!form.reraId,
    reraId: form.reraId || undefined,
    featured: initialProperty?.featured ?? mode === "create",
  };

  const previewModal = (
    <AnimatePresence>
      {isPreviewOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsPreviewOpen(false)}
            className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-cream border border-sand/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative z-10 p-6 md:p-8 flex flex-col space-y-6"
          >
            <div className="flex justify-between items-start">
              <div className="text-left">
                <span className="text-[10px] font-black text-indigo/60 uppercase tracking-widest leading-none">
                  Double Format Preview
                </span>
                <h2 className="text-2xl font-serif font-black text-indigo mt-1">
                  {form.title || "Untitled Property"}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="p-1.5 bg-white hover:bg-sand border border-sand rounded-xl text-charcoal/50 hover:text-charcoal cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-6 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
                    1. Grid Format (Home / Browse Search Grid)
                  </p>
                  <div className="pointer-events-none bg-white p-3 rounded-2xl border border-sand shadow-sm">
                    <PropertyCard property={previewProperty} layout="grid" />
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
                    2. List Format (Browse Search List View)
                  </p>
                  <div className="pointer-events-none bg-white p-3 rounded-2xl border border-sand shadow-sm">
                    <PropertyCard property={previewProperty} layout="list" />
                  </div>
                </div>
              </div>

              <div className="border-t border-sand/50 pt-5">
                <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1.5">
                  Google Search Snippet Preview
                </p>
                <div className="bg-white border border-sand/60 rounded-3xl p-5 shadow-sm space-y-1.5">
                  <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full">
                    {form.seoTitle || form.title || "Untitled Property - SqftGo"}
                  </p>
                  <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
                    https://sqftgo.com/property/
                    {form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
                  </p>
                  <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
                    {form.seoDescription ||
                      form.description ||
                      "Browse this premium property listing on SqftGo."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-sand/50">
              <button
                type="button"
                onClick={() => setIsPreviewOpen(false)}
                className="px-6 py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (mode === "create" && submitted) {
    return (
      <div className="min-h-full flex items-center justify-center p-8 bg-cream">
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-12 max-w-sm w-full text-center shadow-md">
          <div
            className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 border ${
              submitted === "published"
                ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                : "bg-indigo/10 border-indigo/20 text-indigo"
            }`}
          >
            {submitted === "published" ? (
              <CheckCircle2 className="w-8 h-8" />
            ) : (
              <Save className="w-8 h-8" />
            )}
          </div>
          <h2 className="text-2xl font-serif font-black text-charcoal mb-2">
            {submitted === "published" ? "Listing Submitted!" : "Draft Saved!"}
          </h2>
          <p className="text-charcoal/50 text-sm font-semibold">
            {submitted === "published"
              ? "Your property is pending admin review. You'll be notified once it goes live."
              : "Your draft has been successfully saved. Redirecting to your properties..."}
          </p>
        </div>
      </div>
    );
  }

  if (mode === "create") {
    return (
      <div className="p-6 md:p-8 bg-cream min-h-screen text-charcoal">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8 border-b border-sand/40 pb-5">
            <div>
              <h1 className="text-3xl font-serif font-black text-indigo tracking-tight">
                Add New Property
              </h1>
              <p className="text-charcoal/50 text-xs font-semibold mt-1">
                Complete the wizard to publish your listing or save as draft.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewOpen(true)}
            >
              <Eye className="w-4 h-4" /> Preview both formats
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="flex flex-row lg:flex-col gap-3 lg:col-span-3 overflow-x-auto no-scrollbar pb-3 lg:pb-0">
              {CREATE_STEPS.map((s, i) => {
                const Icon = s.icon;
                const isCurrent = i === step;
                const isCompleted = i < step;
                return (
                  <button
                    key={s.title}
                    type="button"
                    onClick={() => i <= step && setStep(i)}
                    className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left border transition-all duration-200 shrink-0 w-auto lg:w-full select-none cursor-pointer ${
                      isCurrent
                        ? "bg-indigo border-indigo text-white shadow-md shadow-indigo/15 scale-[1.02]"
                        : isCompleted
                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700"
                          : "bg-white border-sand text-charcoal/50 hover:border-indigo/25"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        isCurrent
                          ? "bg-white/10 border-white/20 text-white"
                          : isCompleted
                            ? "bg-emerald-100/50 border-emerald-200 text-emerald-600"
                            : "bg-sand/15 border-sand text-charcoal/40"
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-4 h-4 stroke-[3]" />
                      ) : (
                        <Icon className="w-4 h-4" />
                      )}
                    </div>
                    <div className="hidden sm:block lg:flex flex-col text-left">
                      <span className="text-[10px] font-black uppercase tracking-wider leading-none">
                        {s.title}
                      </span>
                      <span
                        className={`text-[9px] font-semibold mt-1.5 leading-none ${
                          isCurrent
                            ? "text-white/60"
                            : isCompleted
                              ? "text-emerald-600/70"
                              : "text-charcoal/35"
                        }`}
                      >
                        {s.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm lg:col-span-9">
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.div
                    key="s0"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <BasicInfoStep form={form} set={set} />
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <LocationDetailsStep form={form} set={set} />
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <PricingStep form={form} set={set} />
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <AmenitiesStep
                      form={form}
                      amenityOptions={amenityOptions}
                      toggleAmenity={toggleAmenity}
                    />
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="s4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <MediaSeoStep
                      form={form}
                      set={set}
                      fileInputRef={fileInputRef}
                      uploading={uploading}
                      uploadError={uploadError}
                      newImageUrl={newImageUrl}
                      setNewImageUrl={setNewImageUrl}
                      handleFileUpload={handleFileUpload}
                      addImageUrl={addImageUrl}
                      removeImage={removeImage}
                    />
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    key="s5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <ReviewStep form={form} />
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between border-t border-sand/50 pt-6 mt-8">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateSubmit("Draft")}
                  >
                    <Save className="w-4 h-4" /> Save Draft
                  </Button>

                  {step < CREATE_STEPS.length - 1 ? (
                    <Button
                      type="button"
                      variant="secondary"
                      size="sm"
                      onClick={() => canNext && setStep((s) => s + 1)}
                      disabled={!canNext}
                    >
                      Next <ChevronRight className="w-4 h-4" />
                    </Button>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={() => nearbyComplete && handleCreateSubmit("Pending Review")}
                      disabled={!nearbyComplete}
                      className="bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/15"
                    >
                      <Send className="w-4 h-4" /> Publish Listing
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {previewModal}
      </div>
    );
  }

  // Edit mode ΓÇö flat card layout
  return (
    <div className="p-6 md:p-8 bg-cream min-h-screen text-charcoal">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-sand/40 pb-5 bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.back()}
              aria-label="Go back"
              className="px-2.5"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="text-left">
              <h1 className="text-2xl font-serif font-black text-indigo">Edit Property</h1>
              <p className="text-charcoal/50 text-xs font-semibold mt-0.5">
                Modify the listing specifications below.
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsPreviewOpen(true)}
          >
            <Eye className="w-4 h-4" /> Preview both formats
          </Button>
        </div>

        {saved && (
          <Alert
            variant="success"
            title="Changes saved successfully!"
            description="Redirecting..."
            className="mb-6 text-left"
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-9 space-y-6">
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Basic Information</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">
                  Title, type, listing purpose, and description details.
                </p>
              </div>

              <div className="space-y-4">
                <FormField label="Property Title" required>
                  <TextInput
                    value={form.title}
                    onChange={(e) => set("title", e.target.value)}
                    placeholder="e.g. Ultra Luxury Lake-Facing Villa"
                  />
                </FormField>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Property Type">
                    <CustomSelect
                      options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))}
                      value={form.type}
                      onChange={(val) => set("type", val)}
                      buttonClassName={selectBtnClass}
                    />
                  </FormField>

                  <FormField label="Listing Purpose">
                    <CustomSelect
                      options={PURPOSES}
                      value={form.purpose}
                      onChange={(val) => set("purpose", val)}
                      buttonClassName={selectBtnClass}
                    />
                  </FormField>
                </div>

                <FormField label="Description" required>
                  <TextArea
                    value={form.description}
                    onChange={(e) => set("description", e.target.value)}
                    rows={5}
                  />
                </FormField>

                <FormField label="RERA ID (Optional)">
                  <TextInput
                    value={form.reraId}
                    onChange={(e) => set("reraId", e.target.value)}
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">
                  Location & Specifications
                </h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">
                  Physical location specifications and layout parameters.
                </p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField label="City">
                    <CustomSelect
                      options={cityOptionsWithoutAll}
                      value={form.city}
                      onChange={(val) => {
                        set("city", val);
                        const loc = findLocation(val);
                        if (loc) set("state", loc.state);
                      }}
                      searchable
                      placeholder={locationsReady ? "Select city" : "Loading cities…"}
                      buttonClassName={selectBtnClass}
                    />
                  </FormField>

                  <FormField label="Locality" required>
                    <SearchInput
                      value={form.locality}
                      onChange={(val) => set("locality", val)}
                      placeholder="Locality / area"
                      accent="terracotta"
                      containerClassName="w-full min-w-0"
                    />
                  </FormField>

                  <FormField label="State">
                    <TextInput
                      value={form.state}
                      onChange={(e) => set("state", e.target.value)}
                    />
                  </FormField>
                </div>

                <div>
                  <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest mb-3">
                    Nearby landmarks
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField label="Hospital" required hint="Closest hospital or medical facility.">
                      <TextInput
                        value={form.nearbyHospital}
                        onChange={(e) => set("nearbyHospital", e.target.value)}
                        placeholder="e.g. GBH American Hospital, 2 km"
                      />
                    </FormField>
                    <FormField label="School" required hint="Closest school or academy.">
                      <TextInput
                        value={form.nearbySchool}
                        onChange={(e) => set("nearbySchool", e.target.value)}
                        placeholder="e.g. Seedling Public School, 1 km"
                      />
                    </FormField>
                    <FormField label="Transportation" required hint="Closest bus, railway, or highway access.">
                      <TextInput
                        value={form.nearbyTransportation}
                        onChange={(e) => set("nearbyTransportation", e.target.value)}
                        placeholder="e.g. Udaipur City Bus Stand, 3 km"
                      />
                    </FormField>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField label="Size (sq.ft.)" required>
                    <TextInput
                      type="number"
                      value={form.size}
                      onChange={(e) => set("size", e.target.value)}
                    />
                  </FormField>

                  <FormField label="Furnishing">
                    <CustomSelect
                      options={[...FURNISHING_OPTIONS].map((f) => ({ label: f, value: f }))}
                      value={form.furnished}
                      onChange={(val) => set("furnished", val)}
                      buttonClassName={selectBtnClass}
                    />
                  </FormField>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sand/10 border border-indigo/5 p-4 rounded-2xl">
                  {(
                    [
                      ["bhk", "BHK"],
                      ["bathrooms", "Bathrooms"],
                      ["parking", "Parking"],
                      ["yearBuilt", "Year Built"],
                    ] as const
                  ).map(([key, label]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <label className={labelClassName}>{label}</label>
                      <input
                        type="number"
                        value={form[key]}
                        onChange={(e) => set(key, e.target.value)}
                        className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Pricing & Status</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">
                  Listed pricing estimations and listing status.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <FormField label="Price (Γé╣)" required>
                    <TextInput
                      type="number"
                      value={form.price}
                      onChange={(e) => set("price", e.target.value)}
                    />
                  </FormField>
                  {form.price ? (
                    <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1 rounded-lg w-fit">
                      {new Intl.NumberFormat("en-IN", {
                        style: "currency",
                        currency: "INR",
                        maximumFractionDigits: 0,
                      }).format(parseInt(form.price))}
                    </p>
                  ) : null}
                </div>

                <FormField label="Status">
                  <CustomSelect
                    options={STATUSES}
                    value={form.status}
                    onChange={(val) => set("status", val as Property["status"])}
                    buttonClassName={selectBtnClass}
                  />
                </FormField>
              </div>
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Amenities</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">
                  Toggle facilities and properties amenities.
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {amenityOptions.map((a) => {
                  const selected = form.amenities.includes(a);
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => toggleAmenity(a)}
                      className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold border transition-all cursor-pointer text-left select-none ${
                        selected
                          ? "bg-indigo text-white border-indigo shadow-md shadow-indigo/15 scale-[1.01]"
                          : "bg-white border-sand hover:border-indigo/30 text-charcoal/70"
                      }`}
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                          selected
                            ? "bg-white text-indigo border-white"
                            : "border-sand bg-sand/10 text-transparent"
                        }`}
                      >
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                      <span>{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">SEO Options</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">
                  Customize metadata configurations for search rankings.
                </p>
              </div>

              <div className="space-y-4">
                <FormField label="SEO Title">
                  <TextInput
                    value={form.seoTitle}
                    onChange={(e) => set("seoTitle", e.target.value)}
                    placeholder={form.title}
                  />
                </FormField>

                <FormField label="SEO Description">
                  <TextArea
                    value={form.seoDescription}
                    onChange={(e) => set("seoDescription", e.target.value)}
                    rows={3}
                  />
                </FormField>

                <div className="bg-white border border-sand/65 rounded-3xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[9px] font-black text-indigo/60 uppercase tracking-widest mb-1.5">
                    Google Snippet Preview
                  </p>
                  <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full leading-none">
                    {form.seoTitle || form.title || "Untitled Property - SqftGo"}
                  </p>
                  <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
                    https://sqftgo.com/property/
                    {form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
                  </p>
                  <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
                    {form.seoDescription ||
                      form.description ||
                      "Browse this premium property listing on SqftGo."}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => router.back()}>
                Cancel
              </Button>

              <div className="flex flex-col items-end gap-1.5">
                {!nearbyComplete ? (
                  <p className="text-[10px] font-semibold text-terracotta">
                    Hospital, school, and transportation are required.
                  </p>
                ) : null}
                <Button variant="secondary" size="sm" onClick={handleEditSave} disabled={!nearbyComplete}>
                  <Save className="w-4 h-4" /> Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {previewModal}
    </div>
  );
}

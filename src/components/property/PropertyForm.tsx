"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Property } from "@/context/AppContext";
import {
  CITIES_WITHOUT_ALL,
  PROPERTY_TYPES,
  FURNISHING_OPTIONS,
  AMENITIES,
} from "@/constants";
import {
  CustomSelect,
  FormField,
  TextInput,
  TextArea,
  Alert,
  Button,
  SearchInput,
  PropertyCard,
} from "@/components/ui";
import {
  ChevronRight,
  ChevronLeft,
  Building2,
  MapPin,
  DollarSign,
  Image,
  CheckCircle2,
  Upload,
  Save,
  Eye,
  Send,
  AlertCircle,
  FileText,
  Check,
  Trash,
  X,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CREATE_STEPS = [
  { title: "Basic Info", desc: "Title, type & purpose", icon: Building2 },
  { title: "Location & Details", desc: "Dimensions & specifications", icon: MapPin },
  { title: "Pricing & Costing", desc: "Rent or selling details", icon: DollarSign },
  { title: "Amenities Selection", desc: "Fixtures and features", icon: CheckCircle2 },
  { title: "Media & SEO Config", desc: "Images and SEO options", icon: Image },
  { title: "Review & Publish", desc: "Verify details and submit", icon: FileText },
];

const PURPOSES = [
  { value: "buy", label: "For Sale" },
  { value: "rent", label: "For Rent" },
  { value: "lease", label: "For Lease" },
];

const STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Pending Review", label: "Pending Review" },
  { value: "Sold", label: "Sold" },
  { value: "Rented", label: "Rented" },
  { value: "Draft", label: "Draft" },
];

const DEFAULT_IMAGES = [
  "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
];

export type PropertyFormSubmitData = {
  title: string;
  type: Property["type"];
  purpose: Property["purpose"];
  description: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  size: number;
  bhk?: number;
  bathrooms?: number;
  parking?: number;
  yearBuilt?: number;
  furnished: Property["furnished"];
  price: number;
  amenities: string[];
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
  reraId?: string;
  reraApproved?: boolean;
  status: Property["status"];
};

type FormState = {
  title: string;
  type: string;
  purpose: string;
  description: string;
  city: string;
  state: string;
  country: string;
  locality: string;
  size: string;
  bhk: string;
  bathrooms: string;
  parking: string;
  yearBuilt: string;
  furnished: string;
  price: string;
  amenities: string[];
  images: string[];
  seoTitle: string;
  seoDescription: string;
  reraId: string;
  status: Property["status"];
};

function propertyToForm(prop: Property): FormState {
  return {
    title: prop.title,
    type: prop.type,
    purpose: prop.purpose,
    description: prop.description,
    city: prop.city,
    state: prop.state || "Rajasthan",
    country: prop.country || "India",
    locality: prop.locality,
    size: String(prop.size),
    bhk: String(prop.bhk || ""),
    bathrooms: String(prop.bathrooms || ""),
    parking: String(prop.parking || ""),
    yearBuilt: String(prop.yearBuilt || ""),
    furnished: prop.furnished,
    price: String(prop.price),
    amenities: prop.amenities,
    images: prop.images?.length ? [...prop.images] : [...DEFAULT_IMAGES],
    seoTitle: prop.seoTitle || "",
    seoDescription: prop.seoDescription || "",
    reraId: prop.reraId || "",
    status: prop.status,
  };
}

function emptyForm(): FormState {
  return {
    title: "",
    type: "Villa",
    purpose: "buy",
    description: "",
    city: "Udaipur",
    state: "Rajasthan",
    country: "India",
    locality: "",
    size: "",
    bhk: "",
    bathrooms: "",
    parking: "",
    yearBuilt: "",
    furnished: "Semi-Furnished",
    price: "",
    amenities: [],
    images: [...DEFAULT_IMAGES],
    seoTitle: "",
    seoDescription: "",
    reraId: "",
    status: "Pending Review",
  };
}

function toSubmitData(form: FormState, status: Property["status"]): PropertyFormSubmitData {
  return {
    title: form.title,
    type: form.type as Property["type"],
    purpose: form.purpose as Property["purpose"],
    description: form.description,
    city: form.city,
    state: form.state,
    country: form.country,
    locality: form.locality,
    size: parseInt(form.size) || 0,
    bhk: parseInt(form.bhk) || undefined,
    bathrooms: parseInt(form.bathrooms) || undefined,
    parking: parseInt(form.parking) || undefined,
    yearBuilt: parseInt(form.yearBuilt) || undefined,
    furnished: form.furnished as Property["furnished"],
    price: parseInt(form.price) || 0,
    amenities: form.amenities,
    images: form.images,
    seoTitle: form.seoTitle || form.title,
    seoDescription: form.seoDescription || form.description.slice(0, 160),
    reraId: form.reraId || undefined,
    reraApproved: !!form.reraId,
    status,
  };
}

export type PropertyFormProps = {
  mode: "create" | "edit";
  initialProperty?: Property;
  onSubmit: (data: PropertyFormSubmitData) => void;
};

const labelClassName = "text-[9px] font-black text-charcoal/45 uppercase tracking-widest";
const selectBtnClass =
  "bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between";

export function PropertyForm({ mode, initialProperty, onSubmit }: PropertyFormProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState<"draft" | "published" | null>(null);
  const [saved, setSaved] = useState(false);
  const [newImageUrl, setNewImageUrl] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
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

  const handleEditSave = () => {
    onSubmit(toSubmitData(form, form.status));
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.push("/dealer/dashboard/properties");
    }, 1500);
  };

  const canNext = [
    form.title && form.type && form.description,
    form.city && form.locality && form.size,
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
    size: parseInt(form.size) || 0,
    furnished: form.furnished as Property["furnished"],
    description: form.description || "No description provided.",
    amenities: form.amenities,
    images:
      form.images.length > 0
        ? form.images
        : ["https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"],
    ownerName: initialProperty?.ownerName || "Rajesh Mehta (Demo Broker)",
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
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">
                        Basic Information
                      </h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Provide the essential details about your property listing.
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <FormField
                        label="Property Title"
                        required
                        hint="Make it descriptive and highlight key selling points."
                      >
                        <TextInput
                          value={form.title}
                          onChange={(e) => set("title", e.target.value)}
                          placeholder="e.g. Ultra Luxury Lake-Facing Villa"
                        />
                      </FormField>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Property Type" required>
                          <CustomSelect
                            options={PROPERTY_TYPES.map((t) => ({ label: t, value: t }))}
                            value={form.type}
                            onChange={(val) => set("type", val)}
                            buttonClassName={selectBtnClass}
                          />
                        </FormField>

                        <FormField label="Listing Purpose" required>
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
                          placeholder="Describe the property, architecture, ventilation, location perks, and design details..."
                        />
                      </FormField>

                      <FormField
                        label="RERA ID (Optional)"
                        hint="Properties with a valid RERA ID are flagged as verified."
                      >
                        <TextInput
                          value={form.reraId}
                          onChange={(e) => set("reraId", e.target.value)}
                          placeholder="e.g. RAJ/RERA/P/2023/1204"
                        />
                      </FormField>
                    </div>
                  </motion.div>
                )}

                {step === 1 && (
                  <motion.div
                    key="s1"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">
                        Location & Details
                      </h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Provide the physical address, dimensions, and specifications.
                      </p>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="City" required>
                          <CustomSelect
                            options={CITIES_WITHOUT_ALL.map((c) => ({ label: c, value: c }))}
                            value={form.city}
                            onChange={(val) => set("city", val)}
                            searchable
                            buttonClassName={selectBtnClass}
                          />
                        </FormField>

                        <FormField label="Locality / Area" required>
                          <SearchInput
                            value={form.locality}
                            onChange={(val) => set("locality", val)}
                            placeholder="e.g. Lake Palace Road, Fatehsagar"
                            accent="terracotta"
                            containerClassName="w-full min-w-0"
                          />
                        </FormField>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="State">
                          <TextInput
                            value={form.state}
                            onChange={(e) => set("state", e.target.value)}
                            placeholder="e.g. Rajasthan"
                          />
                        </FormField>

                        <FormField label="Area (sq.ft.)" required>
                          <TextInput
                            type="number"
                            value={form.size}
                            onChange={(e) => set("size", e.target.value)}
                            placeholder="e.g. 2400"
                          />
                        </FormField>

                        <FormField label="Furnishing" required>
                          <CustomSelect
                            options={[...FURNISHING_OPTIONS].map((f) => ({ label: f, value: f }))}
                            value={form.furnished}
                            onChange={(val) => set("furnished", val)}
                            buttonClassName={selectBtnClass}
                          />
                        </FormField>
                      </div>

                      <div>
                        <label className="text-[10px] font-black text-indigo/60 uppercase tracking-widest block mb-3">
                          Specification Details
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sand/10 border border-indigo/5 p-4 rounded-2xl">
                          {(
                            [
                              ["bhk", "BHK", "3"],
                              ["bathrooms", "Bathrooms", "2"],
                              ["parking", "Parking", "2"],
                              ["yearBuilt", "Year Built", "2020"],
                            ] as const
                          ).map(([key, label, ph]) => (
                            <div key={key} className="flex flex-col gap-1.5 text-left">
                              <label className={labelClassName}>{label}</label>
                              <input
                                type="number"
                                value={form[key]}
                                onChange={(e) => set(key, e.target.value)}
                                placeholder={`e.g. ${ph}`}
                                className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="s2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">
                        Pricing & Costing
                      </h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Specify your listed price and check tax estimations.
                      </p>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="max-w-sm space-y-1.5">
                        <FormField label="Listed Price (₹)" required>
                          <TextInput
                            type="number"
                            value={form.price}
                            onChange={(e) => set("price", e.target.value)}
                            placeholder="e.g. 15000000"
                          />
                        </FormField>
                        {form.price ? (
                          <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1.5 rounded-lg w-fit">
                            {new Intl.NumberFormat("en-IN", {
                              style: "currency",
                              currency: "INR",
                              maximumFractionDigits: 0,
                            }).format(parseInt(form.price))}
                          </p>
                        ) : null}
                      </div>

                      <div className="bg-sand/15 rounded-3xl p-6 border border-indigo/5 space-y-4">
                        <p className="text-[10px] font-black text-charcoal/45 uppercase tracking-widest">
                          Pricing Estimation Breakdown
                        </p>
                        <div className="space-y-3 text-xs">
                          <div className="flex justify-between border-b border-sand/40 pb-2">
                            <span className="text-charcoal/60 font-semibold">Base Price</span>
                            <span className="text-charcoal font-black">
                              ₹{form.price ? parseInt(form.price).toLocaleString("en-IN") : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-sand/40 pb-2">
                            <span className="text-charcoal/60 font-semibold flex items-center gap-1">
                              Registration & Stamp Duty{" "}
                              <span className="text-[10px] text-charcoal/40 font-bold">(Est. 6%)</span>
                            </span>
                            <span className="text-charcoal/70 font-semibold">
                              ₹
                              {form.price
                                ? Math.round(parseInt(form.price) * 0.06).toLocaleString("en-IN")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between border-b border-sand/40 pb-2">
                            <span className="text-charcoal/60 font-semibold flex items-center gap-1">
                              Goods & Service Tax{" "}
                              <span className="text-[10px] text-charcoal/40 font-bold">(Est. 5%)</span>
                            </span>
                            <span className="text-charcoal/70 font-semibold">
                              ₹
                              {form.price
                                ? Math.round(parseInt(form.price) * 0.05).toLocaleString("en-IN")
                                : "—"}
                            </span>
                          </div>
                          <div className="flex justify-between pt-1">
                            <span className="text-indigo font-black text-sm">Estimated Total Cost</span>
                            <span className="text-indigo font-black text-sm">
                              ₹
                              {form.price
                                ? Math.round(parseInt(form.price) * 1.11).toLocaleString("en-IN")
                                : "—"}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="s3"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">
                        Amenities Selection
                      </h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Select all additional visual elements, features, or architectural benefits.
                      </p>
                    </div>

                    <div className="space-y-4 text-left">
                      <div className="flex items-center justify-between border-b border-sand/50 pb-3">
                        <span className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
                          Available Features
                        </span>
                        <span className="text-[10px] font-bold text-charcoal/50">
                          {form.amenities.length} selected
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {AMENITIES.map((a) => {
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
                  </motion.div>
                )}

                {step === 4 && (
                  <motion.div
                    key="s4"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">Media & SEO</h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Manage listing images and configure search engine results representation.
                      </p>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="bg-sand/15 border border-dashed border-indigo/20 rounded-3xl p-6 text-center space-y-3">
                        <Upload className="w-10 h-10 text-indigo/35 mx-auto" />
                        <div>
                          <p className="text-charcoal/60 text-xs font-bold">Image upload simulated</p>
                          <p className="text-charcoal/40 text-[10px] font-semibold mt-0.5">
                            Drag & drop files or add image URLs below directly.
                          </p>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <TextInput
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="Add image URL (e.g. https://images.unsplash.com/...)"
                          className="flex-1"
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => addImageUrl(newImageUrl)}
                          className="shrink-0"
                        >
                          <Plus className="w-4 h-4" /> Add
                        </Button>
                      </div>

                      {form.images.length > 0 && (
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                          {form.images.map((img, i) => (
                            <div
                              key={i}
                              className="aspect-[4/3] rounded-2xl overflow-hidden bg-sand/35 border border-indigo/5 relative group shadow-sm"
                            >
                              <img src={img} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute inset-0 bg-rose-600/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity duration-150 cursor-pointer"
                              >
                                <Trash className="w-4 h-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-4 pt-4 border-t border-sand/40">
                        <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">
                          Search Engine Optimization (SEO)
                        </p>

                        <div className="grid grid-cols-1 gap-4">
                          <FormField label="SEO Title (Optional)">
                            <TextInput
                              value={form.seoTitle}
                              onChange={(e) => set("seoTitle", e.target.value)}
                              placeholder={form.title || "Auto-filled from property title"}
                            />
                          </FormField>

                          <FormField label="SEO Description (Optional)">
                            <TextArea
                              value={form.seoDescription}
                              onChange={(e) => set("seoDescription", e.target.value)}
                              rows={3}
                              placeholder="Max 160 chars for search engines..."
                              maxLength={160}
                            />
                          </FormField>
                        </div>

                        <div className="bg-white border border-sand/60 rounded-3xl p-5 shadow-sm space-y-1.5">
                          <p className="text-[9px] font-black text-indigo/60 uppercase tracking-widest mb-1.5">
                            Google Snippet Preview
                          </p>
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
                  </motion.div>
                )}

                {step === 5 && (
                  <motion.div
                    key="s5"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="text-left">
                      <h2 className="text-lg font-serif font-black text-indigo">
                        Review & Publish
                      </h2>
                      <p className="text-charcoal/50 text-[11px] font-semibold mt-1">
                        Check all input details and launch the listing publicly.
                      </p>
                    </div>

                    <div className="space-y-5 text-left">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {(
                          [
                            ["Title", form.title],
                            ["Type", form.type],
                            [
                              "Purpose",
                              form.purpose === "buy"
                                ? "For Sale"
                                : form.purpose === "rent"
                                  ? "For Rent"
                                  : "For Lease",
                            ],
                            ["City", `${form.city}, ${form.state}`],
                            ["Locality", form.locality],
                            ["Size", `${form.size} sq.ft.`],
                            ["BHK", form.bhk ? `${form.bhk} BHK` : "—"],
                            [
                              "Price",
                              form.price ? `₹${parseInt(form.price).toLocaleString("en-IN")}` : "—",
                            ],
                            ["Amenities", `${form.amenities.length} selected`],
                            ["Images", `${form.images.length} photos`],
                          ] as const
                        ).map(([label, value]) => (
                          <div
                            key={label}
                            className="bg-sand/15 border border-indigo/5 rounded-2xl px-4 py-3"
                          >
                            <p className="text-[9px] font-black text-charcoal/45 uppercase tracking-widest">
                              {label}
                            </p>
                            <p className="text-xs font-bold text-charcoal mt-1 line-clamp-1">
                              {value || "—"}
                            </p>
                          </div>
                        ))}
                      </div>

                      <div className="flex gap-3 bg-amber-500/5 border border-amber-500/20 rounded-3xl p-5 text-xs text-amber-800 leading-relaxed font-semibold">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                          <p className="font-bold text-amber-900 leading-none">
                            Verification Pending
                          </p>
                          <p className="mt-1.5 text-amber-700/80">
                            By submitting this listing, it will be marked as &quot;Pending
                            Review&quot;. The admin team will verify the details (like RERA status,
                            owner info) before it goes live on the public site.
                          </p>
                        </div>
                      </div>
                    </div>
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
                      onClick={() => handleCreateSubmit("Pending Review")}
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

  // Edit mode — flat card layout
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
                      options={CITIES_WITHOUT_ALL.map((c) => ({ label: c, value: c }))}
                      value={form.city}
                      onChange={(val) => set("city", val)}
                      searchable
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
                  <FormField label="Price (₹)" required>
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
                {AMENITIES.map((a) => {
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

              <Button variant="secondary" size="sm" onClick={handleEditSave}>
                <Save className="w-4 h-4" /> Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      {previewModal}
    </div>
  );
}

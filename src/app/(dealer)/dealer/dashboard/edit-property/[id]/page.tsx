"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp, Property } from "@/context/AppContext";
import CustomSelect from "@/components/ui/CustomSelect";
import PropertyCard from "@/components/ui/PropertyCard";
import { 
  Save, ArrowLeft, CheckCircle2, Building2, MapPin, DollarSign, 
  Sparkles, Check, Eye, X, AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const PROPERTY_TYPES = ["Villa", "Apartment", "Home", "Office Space", "Shop", "Agricultural Land", "Hotel", "Commercial Space", "Industrial Plot"];
const FURNISHING = ["Furnished", "Semi-Furnished", "Unfurnished"];
const PURPOSES = [
  { value: "buy", label: "For Sale" }, 
  { value: "rent", label: "For Rent" }, 
  { value: "lease", label: "For Lease" }
];
const STATUSES = [
  { value: "Active", label: "Active" },
  { value: "Pending Review", label: "Pending Review" },
  { value: "Sold", label: "Sold" },
  { value: "Rented", label: "Rented" },
  { value: "Draft", label: "Draft" }
];
const AMENITIES_LIST = ["Swimming Pool", "Parking", "Gym", "Security", "Power Backup", "Lift", "Garden", "Lake View", "Clubhouse", "Children Play Area", "CCTV", "Wi-Fi", "AC Rooms", "Terrace", "Modular Kitchen", "Vaastu Compliant"];
const CITIES = ["Udaipur", "Jaipur", "Jodhpur", "Jaisalmer", "Kota", "Bikaner", "Ajmer", "Ahmedabad", "Surat", "Rajkot", "Shimla", "Delhi", "Mumbai", "Pune"];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { properties, userEmail, updateProperty, addLog } = useApp();
  const [saved, setSaved] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewLayout, setPreviewLayout] = useState<"grid" | "list">("grid");

  const prop = properties.find(p => p.id === params.id && p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());

  const [form, setForm] = useState({
    title: "", type: "Villa", purpose: "buy", description: "",
    city: "Udaipur", state: "Rajasthan", locality: "",
    size: "", bhk: "", bathrooms: "", parking: "", yearBuilt: "", furnished: "Semi-Furnished",
    price: "", status: "Active" as Property["status"],
    amenities: [] as string[],
    seoTitle: "", seoDescription: "", reraId: "",
  });

  useEffect(() => {
    if (prop) {
      setForm({
        title: prop.title, type: prop.type, purpose: prop.purpose, description: prop.description,
        city: prop.city, state: prop.state || "Rajasthan", locality: prop.locality,
        size: String(prop.size), bhk: String(prop.bhk || ""), bathrooms: String(prop.bathrooms || ""),
        parking: String(prop.parking || ""), yearBuilt: String(prop.yearBuilt || ""),
        furnished: prop.furnished, price: String(prop.price),
        status: prop.status, amenities: prop.amenities,
        seoTitle: prop.seoTitle || "", seoDescription: prop.seoDescription || "",
        reraId: prop.reraId || "",
      });
    }
  }, [prop]);

  if (!prop) return (
    <div className="p-8 text-center bg-[#faf8f5] min-h-screen flex flex-col items-center justify-center">
      <div className="bg-white/80 border border-sand rounded-3xl p-8 max-w-sm w-full">
        <p className="text-charcoal/50 font-bold text-sm">Property not found or access denied.</p>
        <button onClick={() => router.back()} className="mt-4 w-full py-2.5 bg-indigo text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer">
          ← Go Back
        </button>
      </div>
    </div>
  );

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) => set("amenities", form.amenities.includes(a) ? form.amenities.filter((x: string) => x !== a) : [...form.amenities, a]);

  const handleSave = () => {
    updateProperty(prop.id, {
      title: form.title, type: form.type as any, purpose: form.purpose as any,
      description: form.description, city: form.city, state: form.state,
      locality: form.locality, size: parseInt(form.size) || prop.size,
      bhk: parseInt(form.bhk) || undefined, bathrooms: parseInt(form.bathrooms) || undefined,
      parking: parseInt(form.parking) || undefined, yearBuilt: parseInt(form.yearBuilt) || undefined,
      furnished: form.furnished as any, price: parseInt(form.price) || prop.price,
      status: form.status, amenities: form.amenities,
      seoTitle: form.seoTitle, seoDescription: form.seoDescription, reraId: form.reraId || undefined,
    });
    addLog({ action: "Property Updated", performedBy: userEmail, role: "Dealer", target: form.title });
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push("/dealer/dashboard/properties"); }, 1500);
  };

  // Dynamic preview property object targeting the exact Property interface
  const previewProperty: Property = {
    id: prop.id,
    title: form.title || "Untitled Property",
    price: parseInt(form.price) || 0,
    type: form.type as any,
    purpose: form.purpose as any,
    bhk: parseInt(form.bhk) || undefined,
    bathrooms: parseInt(form.bathrooms) || undefined,
    parking: parseInt(form.parking) || undefined,
    yearBuilt: parseInt(form.yearBuilt) || undefined,
    city: form.city,
    state: form.state,
    country: "India",
    locality: form.locality || "Locality",
    size: parseInt(form.size) || 0,
    furnished: form.furnished as any,
    description: form.description || "No description provided.",
    amenities: form.amenities,
    images: prop.images || [
      "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80"
    ],
    ownerName: prop.ownerName || "Rajesh Mehta (Demo Broker)",
    ownerPhone: prop.ownerPhone || "+91 99000 99000",
    inquiryCount: prop.inquiryCount || 0,
    status: form.status,
    reraApproved: !!form.reraId,
    reraId: form.reraId || undefined,
    featured: prop.featured || false,
  };

  const inputClassName = "w-full bg-sand/20 border border-indigo/10 focus:border-indigo/40 hover:border-indigo/25 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-3 rounded-xl focus:outline-none transition-all duration-200";
  const textareaClassName = "w-full bg-sand/20 border border-indigo/10 focus:border-indigo/40 hover:border-indigo/25 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none transition-all duration-200";
  const labelClassName = "text-[9px] font-black text-charcoal/45 uppercase tracking-widest";

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 border-b border-sand/40 pb-5 bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-3.5">
            <button 
              onClick={() => router.back()} 
              className="p-2 border border-sand bg-white hover:bg-sand/30 text-charcoal rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="text-left">
              <h1 className="text-2xl font-serif font-black text-indigo">Edit Property</h1>
              <p className="text-charcoal/50 text-xs font-semibold mt-0.5">Modify the listing specifications below.</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsPreviewOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo/5 border border-indigo/10 hover:bg-indigo/15 text-indigo text-xs font-bold rounded-xl transition-all cursor-pointer shadow-sm"
          >
            <Eye className="w-4 h-4" /> Preview both formats
          </button>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 text-left mb-6">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-emerald-700 text-sm font-bold">Changes saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Editor Cards (Left Column) */}
          <div className="lg:col-span-9 space-y-6">
            {/* Card 1: Basic Information */}
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Basic Information</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">Title, type, listing purpose, and description details.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>Property Title *</label>
                  <input 
                    value={form.title} 
                    onChange={e => set("title", e.target.value)} 
                    placeholder="e.g. Ultra Luxury Lake-Facing Villa" 
                    className={inputClassName} 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Property Type</label>
                    <CustomSelect
                      options={PROPERTY_TYPES.map(t => ({ label: t, value: t }))}
                      value={form.type}
                      onChange={val => set("type", val)}
                      buttonClassName="bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Listing Purpose</label>
                    <CustomSelect
                      options={PURPOSES}
                      value={form.purpose}
                      onChange={val => set("purpose", val)}
                      buttonClassName="bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>Description *</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => set("description", e.target.value)} 
                    rows={5} 
                    className={textareaClassName} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>RERA ID (Optional)</label>
                  <input 
                    value={form.reraId} 
                    onChange={e => set("reraId", e.target.value)} 
                    className={inputClassName} 
                  />
                </div>
              </div>
            </div>

            {/* Card 2: Location & Property Specifications */}
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Location & Specifications</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">Physical location specifications and layout parameters.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>City</label>
                    <CustomSelect
                      options={CITIES.map(c => ({ label: c, value: c }))}
                      value={form.city}
                      onChange={val => set("city", val)}
                      searchable
                      buttonClassName="bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                  />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Locality *</label>
                    <input 
                      value={form.locality} 
                      onChange={e => set("locality", e.target.value)} 
                      className={inputClassName} 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>State</label>
                    <input 
                      value={form.state} 
                      onChange={e => set("state", e.target.value)} 
                      className={inputClassName} 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Size (sq.ft.) *</label>
                    <input 
                      type="number" 
                      value={form.size} 
                      onChange={e => set("size", e.target.value)} 
                      className={inputClassName} 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Furnishing</label>
                    <CustomSelect
                      options={FURNISHING.map(f => ({ label: f, value: f }))}
                      value={form.furnished}
                      onChange={val => set("furnished", val)}
                      buttonClassName="bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-sand/10 border border-indigo/5 p-4 rounded-2xl">
                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>BHK</label>
                    <input 
                      type="number" 
                      value={form.bhk} 
                      onChange={e => set("bhk", e.target.value)} 
                      className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Bathrooms</label>
                    <input 
                      type="number" 
                      value={form.bathrooms} 
                      onChange={e => set("bathrooms", e.target.value)} 
                      className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Parking</label>
                    <input 
                      type="number" 
                      value={form.parking} 
                      onChange={e => set("parking", e.target.value)} 
                      className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none" 
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className={labelClassName}>Year Built</label>
                    <input 
                      type="number" 
                      value={form.yearBuilt} 
                      onChange={e => set("yearBuilt", e.target.value)} 
                      className="w-full bg-white border border-indigo/10 text-charcoal text-xs font-semibold px-3 py-2.5 rounded-xl focus:outline-none" 
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Pricing & Status */}
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Pricing & Status</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">Listed pricing estimations and listing status.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>Price (₹) *</label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo/60" />
                    <input 
                      type="number" 
                      value={form.price} 
                      onChange={e => set("price", e.target.value)} 
                      className="w-full bg-sand/20 border border-indigo/10 focus:border-indigo/40 hover:border-indigo/25 text-charcoal placeholder-charcoal/30 text-xs font-semibold px-4 py-3 pl-10 rounded-xl focus:outline-none transition-all duration-200" 
                    />
                  </div>
                  {form.price && (
                    <p className="text-[10px] text-indigo font-bold bg-indigo/5 border border-indigo/10 px-3 py-1 rounded-lg w-fit mt-1">
                      {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(parseInt(form.price))}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>Status</label>
                  <CustomSelect
                    options={STATUSES}
                    value={form.status}
                    onChange={val => set("status", val as any)}
                    buttonClassName="bg-sand/20 border border-indigo/10 text-charcoal text-xs font-semibold rounded-xl px-4 py-3 hover:border-indigo/25 transition-colors cursor-pointer w-full text-left flex items-center justify-between"
                  />
                </div>
              </div>
            </div>

            {/* Card 4: Amenities */}
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">Amenities</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">Toggle facilities and properties amenities.</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {AMENITIES_LIST.map(a => {
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
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all ${
                        selected ? "bg-white text-indigo border-white" : "border-sand bg-sand/10 text-transparent"
                      }`}>
                        <Check className="w-2.5 h-2.5 stroke-[3.5]" />
                      </div>
                      <span>{a}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Card 5: SEO */}
            <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-5 text-left">
              <div>
                <h3 className="text-base font-serif font-black text-indigo">SEO Options</h3>
                <p className="text-charcoal/45 text-[10px] font-semibold mt-0.5">Customize metadata configurations for search rankings.</p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>SEO Title</label>
                  <input 
                    value={form.seoTitle} 
                    onChange={e => set("seoTitle", e.target.value)} 
                    placeholder={form.title}
                    className={inputClassName} 
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className={labelClassName}>SEO Description</label>
                  <textarea 
                    value={form.seoDescription} 
                    onChange={e => set("seoDescription", e.target.value)} 
                    rows={3} 
                    className={textareaClassName} 
                  />
                </div>

                {/* Google Preview */}
                <div className="bg-white border border-sand/65 rounded-3xl p-5 shadow-sm space-y-1.5">
                  <p className="text-[9px] font-black text-indigo/60 uppercase tracking-widest mb-1.5">Google Snippet Preview</p>
                  <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full leading-none">
                    {form.seoTitle || form.title || "Untitled Property - Sun Valley"}
                  </p>
                  <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
                    https://sunvalley.com/property/{form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
                  </p>
                  <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
                    {form.seoDescription || form.description || "Browse this premium property listing on Sun Valley."}
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex justify-between items-center bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
              <button 
                onClick={() => router.back()} 
                className="px-5 py-2.5 text-charcoal/50 text-xs font-bold hover:text-charcoal transition-colors cursor-pointer"
              >
                Cancel
              </button>
              
              <button 
                onClick={handleSave} 
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo/15"
              >
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {isPreviewOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsPreviewOpen(false)}
              className="fixed inset-0 bg-charcoal/40 backdrop-blur-sm"
            />
            
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#faf8f5] border border-sand/80 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto no-scrollbar shadow-2xl relative z-10 p-6 md:p-8 flex flex-col space-y-6"
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

              {/* Both Previews side-by-side */}
              <div className="space-y-6 text-left">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  {/* Grid format */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">1. Grid Format (Home / Browse Search Grid)</p>
                    <div className="pointer-events-none bg-white p-3 rounded-2xl border border-sand shadow-sm">
                      <PropertyCard property={previewProperty} layout="grid" />
                    </div>
                  </div>
                  {/* List format */}
                  <div className="space-y-2">
                    <p className="text-[10px] font-black text-indigo/60 uppercase tracking-widest">2. List Format (Browse Search List View)</p>
                    <div className="pointer-events-none bg-white p-3 rounded-2xl border border-sand shadow-sm">
                      <PropertyCard property={previewProperty} layout="list" />
                    </div>
                  </div>
                </div>

                <div className="border-t border-sand/50 pt-5">
                  <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1.5">Google Search Snippet Preview</p>
                  <div className="bg-white border border-sand/60 rounded-3xl p-5 shadow-sm space-y-1.5">
                    <p className="text-blue-700 hover:underline text-sm font-serif font-black truncate max-w-full">
                      {form.seoTitle || form.title || "Untitled Property - Sun Valley"}
                    </p>
                    <p className="text-emerald-700 text-xs font-semibold truncate leading-none">
                      https://sunvalley.com/property/{form.title ? form.title.toLowerCase().replace(/\s+/g, "-") : "id"}
                    </p>
                    <p className="text-charcoal/70 text-xs line-clamp-2 leading-relaxed">
                      {form.seoDescription || form.description || "Browse this premium property listing on Sun Valley."}
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
    </div>
  );
}

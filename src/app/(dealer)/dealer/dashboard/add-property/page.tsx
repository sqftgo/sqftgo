"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { ChevronRight, ChevronLeft, Building2, MapPin, DollarSign, Image, CheckCircle2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const STEPS = ["Basic Info", "Location & Details", "Pricing", "Amenities", "Images & SEO", "Review"];
const PROPERTY_TYPES = ["Villa", "Apartment", "Home", "Office Space", "Shop", "Agricultural Land", "Hotel", "Commercial Space", "Industrial Plot"];
const FURNISHING = ["Furnished", "Semi-Furnished", "Unfurnished"];
const PURPOSES = [{ value: "buy", label: "For Sale" }, { value: "rent", label: "For Rent" }, { value: "lease", label: "For Lease" }];
const AMENITIES_LIST = ["Swimming Pool", "Parking", "Gym", "Security", "Power Backup", "Lift", "Garden", "Lake View", "Clubhouse", "Children Play Area", "CCTV", "Wi-Fi", "AC Rooms", "Terrace", "Modular Kitchen", "Vaastu Compliant"];
const CITIES = ["Udaipur", "Jaipur", "Jodhpur", "Jaisalmer", "Kota", "Bikaner", "Ajmer", "Ahmedabad", "Surat", "Rajkot", "Shimla", "Delhi", "Mumbai", "Pune"];

export default function AddPropertyPage() {
  const router = useRouter();
  const { addProperty, addLog, userEmail } = useApp();
  const [step, setStep] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    title: "", type: "Villa", purpose: "buy", description: "",
    city: "Udaipur", state: "Rajasthan", country: "India", locality: "",
    size: "", bhk: "", bathrooms: "", parking: "", yearBuilt: "", furnished: "Semi-Furnished",
    price: "", amenities: [] as string[],
    images: [
      "https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    ],
    seoTitle: "", seoDescription: "", reraId: "",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleAmenity = (a: string) => set("amenities", form.amenities.includes(a) ? form.amenities.filter(x => x !== a) : [...form.amenities, a]);

  const handleSubmit = () => {
    addProperty({
      title: form.title,
      type: form.type as any,
      purpose: form.purpose as any,
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
      furnished: form.furnished as any,
      price: parseInt(form.price) || 0,
      amenities: form.amenities,
      images: form.images,
      seoTitle: form.seoTitle || form.title,
      seoDescription: form.seoDescription || form.description.slice(0, 160),
      reraId: form.reraId || undefined,
      reraApproved: !!form.reraId,
    });
    addLog({ action: "Property Added", performedBy: userEmail, role: "Dealer", target: form.title });
    setSubmitted(true);
    setTimeout(() => router.push("/dealer/dashboard/properties"), 2000);
  };

  const canNext = [
    form.title && form.type && form.description,
    form.city && form.locality && form.size,
    form.price,
    true,
    true,
    true,
  ][step];

  if (submitted) return (
    <div className="min-h-full flex items-center justify-center p-8 bg-[#faf8f5]">
      <div className="bg-white/80 border border-emerald-200 rounded-3xl p-12 max-w-sm w-full text-center shadow-md">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-emerald-500/20">
          <CheckCircle2 className="w-8 h-8 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-serif font-black text-charcoal mb-2">Listing Submitted!</h2>
        <p className="text-charcoal/50 text-sm font-semibold">Your property is pending admin review. You'll be notified once it goes live.</p>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-black text-charcoal">Add New Property</h1>
          <p className="text-charcoal/50 text-sm font-semibold mt-1">Complete all steps to submit your listing for approval.</p>
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto no-scrollbar pb-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => i < step && setStep(i)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                  i === step ? "bg-indigo text-white shadow-sm" :
                  i < step ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20" :
                  "bg-sand/35 text-charcoal/40 border border-indigo/5"
                }`}
              >
                {i < step && <CheckCircle2 className="w-3.5 h-3.5" />}
                {s}
              </button>
              {i < STEPS.length - 1 && <ChevronRight className="w-3.5 h-3.5 text-charcoal/20 shrink-0" />}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="s0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Basic Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Property Title *</label>
                    <input value={form.title} onChange={e => set("title", e.target.value)} placeholder="e.g. Ultra Luxury Lake-Facing Villa" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Property Type *</label>
                    <select value={form.type} onChange={e => set("type", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                      {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Listing Purpose *</label>
                    <select value={form.purpose} onChange={e => set("purpose", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                      {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                  </div>
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Description *</label>
                    <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} placeholder="Describe the property in detail..." className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">RERA ID (Optional)</label>
                    <input value={form.reraId} onChange={e => set("reraId", e.target.value)} placeholder="e.g. RAJ/RERA/P/2023/1204" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Location & Property Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">City *</label>
                    <select value={form.city} onChange={e => set("city", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                      {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Locality / Area *</label>
                    <input value={form.locality} onChange={e => set("locality", e.target.value)} placeholder="e.g. Lake Palace Road" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">State</label>
                    <input value={form.state} onChange={e => set("state", e.target.value)} placeholder="e.g. Rajasthan" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Area (sq.ft.) *</label>
                    <input type="number" value={form.size} onChange={e => set("size", e.target.value)} placeholder="e.g. 2400" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Bedrooms (BHK)</label>
                    <input type="number" value={form.bhk} onChange={e => set("bhk", e.target.value)} placeholder="e.g. 3" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Bathrooms</label>
                    <input type="number" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} placeholder="e.g. 2" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Parking Spots</label>
                    <input type="number" value={form.parking} onChange={e => set("parking", e.target.value)} placeholder="e.g. 2" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Year Built</label>
                    <input type="number" value={form.yearBuilt} onChange={e => set("yearBuilt", e.target.value)} placeholder="e.g. 2020" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Furnishing</label>
                    <select value={form.furnished} onChange={e => set("furnished", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                      {FURNISHING.map(f => <option key={f} value={f}>{f}</option>)}
                    </select>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Pricing</h2>
                <div className="flex flex-col gap-1.5 max-w-xs">
                  <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Listed Price (₹) *</label>
                  <input type="number" value={form.price} onChange={e => set("price", e.target.value)} placeholder="e.g. 15000000" className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  {form.price && <p className="text-xs text-charcoal/40 font-semibold">= {new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(parseInt(form.price))}</p>}
                </div>
                <div className="bg-sand/15 rounded-2xl p-5 border border-indigo/5">
                  <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-wider mb-3">Price Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-charcoal/60">Base Price</span><span className="text-charcoal font-bold">₹{form.price ? parseInt(form.price).toLocaleString("en-IN") : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-charcoal/60">Est. Registration (6%)</span><span className="text-charcoal/60">₹{form.price ? Math.round(parseInt(form.price) * 0.06).toLocaleString("en-IN") : "—"}</span></div>
                    <div className="flex justify-between"><span className="text-charcoal/60">Est. GST (5%)</span><span className="text-charcoal/60">₹{form.price ? Math.round(parseInt(form.price) * 0.05).toLocaleString("en-IN") : "—"}</span></div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Amenities ({form.amenities.length} selected)</h2>
                <div className="flex flex-wrap gap-2">
                  {AMENITIES_LIST.map(a => {
                    const selected = form.amenities.includes(a);
                    return (
                      <button key={a} type="button" onClick={() => toggleAmenity(a)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selected ? "bg-indigo border-indigo text-white shadow-sm" : "bg-white border-indigo/10 text-charcoal/65 hover:border-indigo/40"}`}>
                        {a}
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div key="s4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Images & SEO</h2>
                <div className="bg-sand/15 border border-dashed border-indigo/20 rounded-2xl p-8 text-center">
                  <Upload className="w-10 h-10 text-indigo/35 mx-auto mb-3" />
                  <p className="text-charcoal/50 text-sm font-semibold">Image upload simulated — using default property images</p>
                  <p className="text-charcoal/30 text-xs font-semibold mt-1">{form.images.length} images loaded</p>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-3">
                  {form.images.map((img, i) => (
                    <div key={i} className="aspect-[4/3] rounded-xl overflow-hidden bg-sand/35 border border-indigo/5">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
                <div className="space-y-4 mt-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">SEO Title (Optional)</label>
                    <input value={form.seoTitle} onChange={e => set("seoTitle", e.target.value)} placeholder={form.title || "Auto-filled from property title"} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">SEO Description (Optional)</label>
                    <textarea value={form.seoDescription} onChange={e => set("seoDescription", e.target.value)} rows={3} placeholder="Max 160 chars for search engines..." maxLength={160} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none" />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div key="s5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-base font-serif font-black text-indigo">Review & Submit</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    ["Title", form.title], ["Type", form.type], ["Purpose", form.purpose],
                    ["City", `${form.city}, ${form.state}`], ["Locality", form.locality],
                    ["Size", `${form.size} sq.ft.`], ["BHK", form.bhk || "—"],
                    ["Price", form.price ? `₹${parseInt(form.price).toLocaleString("en-IN")}` : "—"],
                    ["Amenities", `${form.amenities.length} selected`], ["Images", `${form.images.length} photos`],
                  ].map(([label, value]) => (
                    <div key={label} className="bg-sand/15 border border-indigo/5 rounded-2xl px-4 py-3">
                      <p className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">{label}</p>
                      <p className="text-sm font-bold text-charcoal mt-0.5 line-clamp-1">{value || "—"}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 text-xs font-semibold text-amber-700">
                  ⚠️ Your listing will be submitted as "Pending Review". The admin team will verify and approve it before it goes live on the public website.
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setStep(s => Math.max(0, s - 1))}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-5 py-2.5 bg-white border border-indigo/10 hover:bg-sand/20 text-charcoal text-xs font-bold rounded-xl transition-all disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => canNext && setStep(s => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-indigo/15"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-600/15"
            >
              <CheckCircle2 className="w-4 h-4" /> Submit Listing
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { useApp, Property } from "@/context/AppContext";
import { Save, ArrowLeft, CheckCircle2 } from "lucide-react";

const PROPERTY_TYPES = ["Villa", "Apartment", "Home", "Office Space", "Shop", "Agricultural Land", "Hotel", "Commercial Space", "Industrial Plot"];
const FURNISHING = ["Furnished", "Semi-Furnished", "Unfurnished"];
const PURPOSES = [{ value: "buy", label: "For Sale" }, { value: "rent", label: "For Rent" }, { value: "lease", label: "For Lease" }];
const AMENITIES_LIST = ["Swimming Pool", "Parking", "Gym", "Security", "Power Backup", "Lift", "Garden", "Lake View", "Clubhouse", "Children Play Area", "CCTV", "Wi-Fi", "AC Rooms", "Terrace", "Modular Kitchen", "Vaastu Compliant"];
const CITIES = ["Udaipur", "Jaipur", "Jodhpur", "Jaisalmer", "Kota", "Bikaner", "Ajmer", "Ahmedabad", "Surat", "Rajkot", "Shimla", "Delhi", "Mumbai", "Pune"];

export default function EditPropertyPage() {
  const router = useRouter();
  const params = useParams();
  const { properties, userEmail, updateProperty, addLog } = useApp();
  const [saved, setSaved] = useState(false);

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
    <div className="p-8 text-center bg-[#faf8f5] min-h-screen">
      <p className="text-charcoal/50 font-semibold">Property not found or access denied.</p>
      <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-indigo text-white text-xs font-bold rounded-xl cursor-pointer">← Go Back</button>
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

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 bg-white/60 border border-indigo/10 rounded-3xl p-5 shadow-sm">
          <button onClick={() => router.back()} className="p-2 border border-indigo/10 hover:bg-sand/20 text-charcoal rounded-xl transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
          <div>
            <h1 className="text-2xl font-serif font-black text-charcoal">Edit Property</h1>
            <p className="text-charcoal/50 text-xs font-semibold mt-0.5">Update your listing details below</p>
          </div>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            <span className="text-emerald-700 text-sm font-bold">Changes saved successfully! Redirecting...</span>
          </div>
        )}

        {/* Form */}
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 space-y-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Title *</label>
              <input value={form.title} onChange={e => set("title", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Type</label>
              <select value={form.type} onChange={e => set("type", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Purpose</label>
              <select value={form.purpose} onChange={e => set("purpose", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                {PURPOSES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                {["Active", "Pending Review", "Sold", "Rented", "Draft"].map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">City</label>
              <select value={form.city} onChange={e => set("city", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Locality</label>
              <input value={form.locality} onChange={e => set("locality", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Price (₹)</label>
              <input type="number" value={form.price} onChange={e => set("price", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Size (sq.ft.)</label>
              <input type="number" value={form.size} onChange={e => set("size", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">BHK</label>
              <input type="number" value={form.bhk} onChange={e => set("bhk", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Bathrooms</label>
              <input type="number" value={form.bathrooms} onChange={e => set("bathrooms", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Furnishing</label>
              <select value={form.furnished} onChange={e => set("furnished", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                {FURNISHING.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </div>
            <div className="md:col-span-2 flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Description</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={5} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none" />
            </div>
            <div className="md:col-span-2">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider block mb-2">Amenities</label>
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
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-indigo/5">
            <button onClick={() => router.back()} className="px-5 py-2.5 text-charcoal/50 text-xs font-bold hover:text-charcoal transition-colors cursor-pointer">Cancel</button>
            <button onClick={handleSave} className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo/15">
              <Save className="w-4 h-4" /> Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

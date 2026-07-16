"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Save, CheckCircle2, User, Phone, Globe, MapPin, Award, FileText, ShieldCheck, CreditCard, BarChart3, Link as LinkIcon, Building2 } from "lucide-react";

const CATEGORIES = ["Agent & Broker", "Builder & Developer", "Interior Decorator", "Architect", "Building Contractor", "Property Consultant"];
const SPECIALTIES = ["Heritage Havelis", "Lakefront Villas", "Agricultural Lands", "RERA Clearances", "Commercial Leases", "Title Checks", "Luxury Apartments", "Bungalows", "Plots & Land"];

const TABS = ["Personal", "Business", "KYC & Verification", "Bank Details", "Socials", "Subscription & Performance"];

export default function DealerProfilePage() {
  const { userEmail, directoryProfiles, setDirectoryProfiles, properties } = useApp();
  const profile = directoryProfiles.find(p => p.email.toLowerCase() === userEmail.toLowerCase());
  const myProperties = properties.filter(p => p.ownerEmail?.toLowerCase() === userEmail.toLowerCase());

  const [activeTab, setActiveTab] = useState("Personal");
  const [saved, setSaved] = useState(false);
  
  const [form, setForm] = useState({
    firmName: profile?.firmName || "", ownerName: profile?.ownerName || "",
    category: profile?.category || "Agent & Broker", address: profile?.address || "",
    mobile: profile?.mobile || "", website: profile?.website || "",
    reraId: profile?.reraId || "", description: profile?.description || "",
    specialties: profile?.specialties || [], experience: profile?.experience || "",
    pan: "ABCDE1234F", aadhar: "•••• •••• 9876",
    bankName: "HDFC Bank", bankAcc: "50100043219876", bankIfsc: "HDFC0000240", bankBranch: "Lake Palace Branch",
    fb: "facebook.com/me", insta: "instagram.com/me", linkedin: "linkedin.com/in/me"
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const toggleSpec = (s: string) => set("specialties", form.specialties.includes(s) ? form.specialties.filter((x: string) => x !== s) : [...form.specialties, s]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setDirectoryProfiles(prev => prev.map(p =>
      p.email.toLowerCase() === userEmail.toLowerCase()
        ? { ...p, ...form, category: form.category as any }
        : p
    ));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-charcoal">Dealer Profile Hub</h1>
        <p className="text-charcoal/50 text-xs font-semibold mt-1">Configure your partner details, bank settlements, RERA verification, and business metrics.</p>
      </div>

      {saved && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-700 text-sm font-bold">Profile hub updated successfully!</span>
        </div>
      )}

      {/* Profile summary banner */}
      <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row gap-5 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo/10 border border-indigo/25 flex items-center justify-center text-indigo font-serif font-black text-2xl shrink-0">
            {form.ownerName.charAt(0)}
          </div>
          <div>
            <h2 className="text-base font-serif font-black text-charcoal leading-snug">{form.ownerName || "Dealer Name"}</h2>
            <p className="text-xs text-charcoal/40 font-semibold">{userEmail} · {form.category}</p>
            <div className="flex items-center gap-1 mt-1 text-emerald-600"><ShieldCheck className="w-3.5 h-3.5" /><span className="text-[9px] font-black uppercase tracking-wider">KYC Verified Profile</span></div>
          </div>
        </div>
        <div className="flex gap-4">
          <div className="text-center px-4 py-2 bg-sand/35 rounded-2xl border border-indigo/5"><span className="block text-lg font-serif font-black text-indigo">{myProperties.length}</span><span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">Listings</span></div>
          <div className="text-center px-4 py-2 bg-sand/35 rounded-2xl border border-indigo/5"><span className="block text-lg font-serif font-black text-indigo">Pro</span><span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">Subscription</span></div>
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 border-b border-indigo/5">
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-xs font-bold whitespace-nowrap rounded-xl transition-all cursor-pointer ${
              activeTab === tab
                ? "bg-indigo text-white shadow-sm"
                : "text-charcoal/50 hover:text-indigo hover:bg-indigo/5"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab contents form */}
      <form onSubmit={handleSave} className="bg-white/80 border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        
        {activeTab === "Personal" && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-indigo mb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Owner Name *</label>
                <input value={form.ownerName} onChange={e => set("ownerName", e.target.value)} required className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Contact Number *</label>
                <input value={form.mobile} onChange={e => set("mobile", e.target.value)} required className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Experience Level</label>
                <input value={form.experience} onChange={e => set("experience", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Registered Email</label>
                <input value={userEmail} disabled className="bg-sand/20 border border-indigo/5 text-charcoal/50 text-sm font-semibold px-4 py-3 rounded-xl cursor-not-allowed" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Business" && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-indigo mb-2">Business Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Firm / Agency Name *</label>
                <input value={form.firmName} onChange={e => set("firmName", e.target.value)} required className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Website Address</label>
                <input value={form.website} onChange={e => set("website", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Office Address</label>
                <input value={form.address} onChange={e => set("address", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">About Your Agency / Description</label>
                <textarea value={form.description} onChange={e => set("description", e.target.value)} rows={4} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none" />
              </div>
              <div className="md:col-span-2">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider block mb-2">Specialties Selection</label>
                <div className="flex flex-wrap gap-2">
                  {SPECIALTIES.map(s => {
                    const selected = form.specialties.includes(s);
                    return <button key={s} type="button" onClick={() => toggleSpec(s)} className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${selected ? "bg-indigo border-indigo text-white shadow-sm" : "bg-white border-indigo/10 text-charcoal/65 hover:border-indigo/40"}`}>{s}</button>;
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "KYC & Verification" && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-indigo mb-2">KYC Documents & Verification</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">PAN Number</label>
                <input value={form.pan} onChange={e => set("pan", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Aadhar Number</label>
                <input value={form.aadhar} onChange={e => set("aadhar", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">RERA ID Status</label>
                <input value={form.reraId} onChange={e => set("reraId", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 md:col-span-2">
                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                <div>
                  <p className="text-xs font-bold text-emerald-800">Verification Active</p>
                  <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Your agency has uploaded active PAN, RERA ID, and business credentials. Verified profiles receive 3.5x higher leads.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "Bank Details" && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-indigo mb-2">Bank Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Bank Name</label>
                <input value={form.bankName} onChange={e => set("bankName", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Account Number</label>
                <input value={form.bankAcc} onChange={e => set("bankAcc", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">IFSC Code</label>
                <input value={form.bankIfsc} onChange={e => set("bankIfsc", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">IFSC Branch</label>
                <input value={form.bankBranch} onChange={e => set("bankBranch", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Socials" && (
          <div className="space-y-4">
            <h3 className="text-sm font-serif font-black text-indigo mb-2">Social Network Links</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Facebook Link</label>
                <input value={form.fb} onChange={e => set("fb", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Instagram Link</label>
                <input value={form.insta} onChange={e => set("insta", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">LinkedIn Link</label>
                <input value={form.linkedin} onChange={e => set("linkedin", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
            </div>
          </div>
        )}

        {activeTab === "Subscription & Performance" && (
          <div className="space-y-6">
            <div className="bg-indigo/5 border border-indigo/10 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <CreditCard className="w-8 h-8 text-indigo" />
                <div>
                  <h4 className="text-sm font-bold text-charcoal">Active Plan: Pro Partner</h4>
                  <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">Renews automatically on August 15, 2026</p>
                </div>
              </div>
              <span className="text-[9px] font-black uppercase bg-indigo text-white px-3 py-1.5 rounded-lg">Active Pro</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-indigo/10 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest">Metrics</span>
                <p className="text-xl font-serif font-black text-indigo">Active Listings: {myProperties.length}</p>
                <p className="text-xs text-charcoal/65 font-semibold">Total active, reviewed property items currently listed on Sun Valley.</p>
              </div>
              <div className="border border-indigo/10 rounded-2xl p-4 space-y-2">
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-widest">Buyer Conversion</span>
                <p className="text-xl font-serif font-black text-indigo">Total Conversions: 48 Leads</p>
                <p className="text-xs text-charcoal/65 font-semibold">Customers who submitted inquiries or started communication with you.</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end pt-4 border-t border-indigo/5">
          <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo/15">
            <Save className="w-4 h-4" /> Save Profile
          </button>
        </div>
      </form>
    </div>
  );
}

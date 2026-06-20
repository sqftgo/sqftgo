"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  Paintbrush, 
  Compass, 
  Hammer, 
  Users, 
  Map, 
  Calculator, 
  Truck, 
  MapPin, 
  Mail, 
  Globe, 
  Phone, 
  Plus, 
  ArrowUpRight,
  Building2,
  UserCheck,
  Grid,
  ExternalLink,
  ShieldCheck,
  Star,
  FileCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORY_METADATA = [
  { name: "Agent & Broker", title: "Agents & Brokers", desc: "Verified local dealers to buy, sell, rent, or lease heritage and modern spaces.", icon: UserCheck, textClass: "text-amber-600 bg-amber-50" },
  { name: "Builder & Developer", title: "Builders & Developers", desc: "Developing premium residential townships, villas, and industrial projects.", icon: Building2, textClass: "text-indigo-600 bg-indigo-50" },
  { name: "Interior Decorator", title: "Interior Decorators", desc: "Renovate spaces with traditional Rajasthani blocks, carving work, and modern layouts.", icon: Paintbrush, textClass: "text-rose-600 bg-rose-50" },
  { name: "Architect", title: "Architects", desc: "Preserve heritage havelis or build state-of-the-art luxury lakeside villas.", icon: Map, textClass: "text-blue-600 bg-blue-50" },
  { name: "Building Contractor", title: "Building Contractors", desc: "Quality raw materials, local stone craftsmanship, and structural engineering expertise.", icon: Hammer, textClass: "text-emerald-600 bg-emerald-50" },
  { name: "Property Consultant", title: "Property Consultants", desc: "Assisted title screening, lease drafting, and regional RERA validation support.", icon: Users, textClass: "text-purple-600 bg-purple-50" },
  { name: "Vastu Consultant", title: "Vastu Consultants", desc: "Align your home plans with Vedic guidelines to bring peace, health, and prosperity.", icon: Compass, textClass: "text-amber-600 bg-amber-50" },
  { name: "Home Valuation/Inspection", title: "Valuation & Inspection", desc: "Verify structural sanitation, water grids, and get fair value market estimations.", icon: Calculator, textClass: "text-cyan-600 bg-cyan-50" },
  { name: "Home Shifting/Deep Cleaning", title: "Shifting & Deep Cleaning", desc: "Hassle-free interstate relocation, logistics, deep cleaning, and pest control.", icon: Truck, textClass: "text-orange-600 bg-orange-50" }
];

export default function ServicesPage() {
  const { directoryProfiles } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredProfiles = selectedCategory === "all" 
    ? directoryProfiles
    : directoryProfiles.filter(p => p.category === selectedCategory);

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* 1. HERO SECTION */}
      <section className="w-full bg-cream border-b border-sand pt-16 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest bg-terracotta/5 px-3 py-1 rounded-full border border-terracotta/10">
            Professional Network
          </span>
          <h1 className="text-4xl md:text-6xl font-serif font-black text-indigo tracking-tight leading-tight">
            Trusted Real Estate <br className="hidden md:block"/> Service Partners
          </h1>
          <p className="text-sm md:text-base text-charcoal/70 leading-relaxed font-semibold max-w-2xl">
            Whether you are restoring a heritage haveli or building a modern lakeside villa, connect with Rajasthan's most reliable, RERA-compliant professionals to make your vision a reality.
          </p>
        </div>
      </section>

      {/* 2. ASSURANCES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-indigo/5 text-indigo flex items-center justify-center mb-2">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">Verified Identities</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Every professional undergoes a strict background check and business verification before being listed.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-terracotta/5 text-terracotta flex items-center justify-center mb-2">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">RERA Compliant</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Brokers and developers are required to hold valid RERA certification for complete peace of mind.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-2xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-gold/10 text-gold flex items-center justify-center mb-2">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">Quality Assured</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Based on continuous client feedback and successful project completions within the region.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DIRECTORY SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Sidebar Column: Categories List */}
          <div className="lg:col-span-4 flex flex-col gap-4 sticky top-28">
            <div className="bg-white border border-sand rounded-2xl p-5 shadow-sm text-left">
              <h2 className="font-serif font-black text-lg text-indigo pb-3.5 border-b border-sand mb-4">
                Service Categories
              </h2>

              <div className="flex flex-col gap-2">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-indigo border-indigo text-white shadow-md"
                      : "bg-white border-sand hover:border-terracotta/30 text-charcoal/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      selectedCategory === "all" ? "bg-white/10 text-white" : "bg-sand/30 text-indigo"
                    }`}>
                      <Grid className="w-4 h-4" />
                    </div>
                    <span>All Categories</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                    selectedCategory === "all" ? "bg-white/10 text-white" : "bg-sand/40 text-charcoal/50"
                  }`}>
                    {directoryProfiles.length}
                  </span>
                </button>

                {/* Individual Category Buttons */}
                {CATEGORY_METADATA.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = selectedCategory === cat.name;
                  const count = directoryProfiles.filter(p => p.category === cat.name).length;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat.name)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo border-indigo text-white shadow-md"
                          : "bg-white border-sand hover:border-terracotta/30 text-charcoal/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                          isSelected ? "bg-white/10 text-white" : cat.textClass
                        }`}>
                          <IconComponent className="w-4.5 h-4.5" />
                        </div>
                        <span className="truncate max-w-[170px] sm:max-w-none">{cat.title}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black ${
                        isSelected ? "bg-white/10 text-white" : "bg-sand/40 text-charcoal/50"
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Directory Column: Profiles Grid */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* List Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand text-left">
              <div className="flex flex-col">
                <h2 className="font-serif font-black text-xl text-indigo">
                  {selectedCategory === "all" ? "All Service Profiles" : `${selectedCategory}s`}
                </h2>
                <span className="text-[10px] text-charcoal/45 font-bold uppercase tracking-wider mt-0.5">
                  Verified regional registrations
                </span>
              </div>
              
              <span className="text-xs text-charcoal/60 font-bold bg-sand px-3 py-1 rounded-lg">
                {filteredProfiles.length} Profiles
              </span>
            </div>

            {/* Profile Cards */}
            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProfiles.map((profile) => (
                    <motion.div
                      key={profile.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-sand rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col gap-4 text-left relative overflow-hidden group hover:border-indigo/20"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[9px] font-black text-terracotta uppercase tracking-wider bg-terracotta/5 px-2 py-0.5 rounded border border-terracotta/10 w-fit mb-1">
                            {profile.category}
                          </span>
                          <h3 className="font-serif font-black text-base text-indigo line-clamp-1 group-hover:text-terracotta transition-colors">{profile.firmName}</h3>
                          <span className="text-[10px] text-charcoal/40 font-bold flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Director: {profile.ownerName}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-charcoal/65 leading-relaxed font-semibold min-h-[48px] line-clamp-3 mt-1">
                        {profile.description}
                      </p>

                      {/* Address details */}
                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal/70 bg-sand/30 p-2.5 rounded-xl border border-sand/30">
                        <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                        <span className="truncate">{profile.address}</span>
                      </div>

                      {/* Contact Action Buttons */}
                      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-sand mt-auto">
                        {/* Phone */}
                        <a
                          href={`tel:${profile.mobile}`}
                          className="py-2.5 rounded-xl border border-sand hover:border-emerald-500/20 hover:bg-emerald-50/20 text-indigo hover:text-emerald-600 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                        >
                          <Phone className="w-3.5 h-3.5 text-emerald-500" />
                          <span>Call</span>
                        </a>
                        {/* Email */}
                        <a
                          href={`mailto:${profile.email}`}
                          className="py-2.5 rounded-xl border border-sand hover:border-blue-500/20 hover:bg-blue-50/20 text-indigo hover:text-blue-600 flex items-center justify-center gap-1.5 text-xs font-bold transition-all"
                        >
                          <Mail className="w-3.5 h-3.5 text-blue-500" />
                          <span>Email</span>
                        </a>
                        {/* Website */}
                        <a
                          href={`https://${profile.website}`}
                          target="_blank"
                          rel="noreferrer"
                          className="py-2.5 rounded-xl border border-sand hover:border-terracotta/25 hover:bg-terracotta/5 text-indigo hover:text-terracotta flex items-center justify-center gap-1.5 text-xs font-bold transition-all col-span-2"
                        >
                          <Globe className="w-3.5 h-3.5 text-terracotta" />
                          <span>Visit Website</span>
                          <ExternalLink className="w-3 h-3 opacity-60" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-16 px-6 rounded-2xl bg-cream border border-sand max-w-md mx-auto w-full my-4">
                <p className="text-sm text-charcoal/60 font-bold mb-4">No registered profiles in this category yet.</p>
                
                <Link
                  href="/services/register"
                  className="inline-flex items-center gap-1 px-4 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-xs font-bold transition-all"
                >
                  <span>Register a Firm</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="w-full bg-indigo text-white py-16 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[80px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-6 relative z-10">
          <h2 className="text-3xl md:text-4xl font-serif font-black tracking-tight">
            Are you a Real Estate Professional?
          </h2>
          <p className="text-sm md:text-base text-white/80 font-semibold max-w-2xl">
            Join the most trusted property network in Rajasthan. Connect with high-value clients, showcase your portfolio, and grow your local presence.
          </p>
          <Link
            href="/services/register"
            className="group flex items-center justify-center gap-2 px-8 py-4 mt-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all"
          >
            <Plus className="w-4.5 h-4.5" />
            <span>List Your Business Today</span>
          </Link>
        </div>
      </section>

    </div>
  );
}

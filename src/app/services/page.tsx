"use client";

import React, { useState, useMemo } from "react";
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
  FileCheck,
  Search,
  MessageSquare,
  CheckCircle
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
  const [searchQuery, setSearchQuery] = useState("");

  const filteredProfiles = useMemo(() => {
    let profiles = selectedCategory === "all" 
      ? directoryProfiles
      : directoryProfiles.filter(p => p.category === selectedCategory);
    
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      profiles = profiles.filter(p => 
        p.firmName.toLowerCase().includes(q) || 
        p.ownerName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
      );
    }
    return profiles;
  }, [directoryProfiles, selectedCategory, searchQuery]);

  return (
    <div className="w-full flex flex-col items-center bg-cream/30 min-h-screen">
      
      {/* 1. HERO SECTION WITH SEARCH */}
      <section className="w-full bg-cream border-b border-sand pt-16 pb-20 px-6 relative overflow-hidden animate-fade-in">
        {/* Decorative backdrop shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-1/2 left-1/3 w-[300px] h-[300px] bg-gold/5 rounded-full blur-[90px] pointer-events-none" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            
            {/* Left Column: Title, Description, Search, Call-to-action */}
            <div className="lg:col-span-7 flex flex-col text-left items-start gap-6">
              
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sand bg-white shadow-sm hover:shadow transition-shadow">
                <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                <span className="text-terracotta font-black text-[10px] uppercase tracking-[0.2em]">
                  Professional Directory
                </span>
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-[1.1] text-charcoal">
                Rajasthan&apos;s Finest <br />
                <span className="text-indigo">Service Partners</span>
              </h1>
              
              <p className="text-sm md:text-base text-charcoal/80 leading-relaxed font-semibold max-w-xl">
                Whether you are restoring a heritage haveli or building a modern lakeside villa, connect with Rajasthan&apos;s most reliable, RERA-compliant professionals to make your vision a reality.
              </p>

              {/* Quick stats for validation */}
              <div className="flex gap-8 border-y border-sand/60 py-4 w-full max-w-lg my-2 text-charcoal/80">
                <div className="flex flex-col">
                  <span className="text-2xl font-serif font-black text-indigo">450+</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-0.5">Verified Pros</span>
                </div>
                <div className="flex flex-col border-l border-sand/60 pl-8">
                  <span className="text-2xl font-serif font-black text-terracotta">9</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-0.5">Specialist Categories</span>
                </div>
                <div className="flex flex-col border-l border-sand/60 pl-8">
                  <span className="text-2xl font-serif font-black text-indigo">100%</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-0.5">RERA Checked</span>
                </div>
              </div>

              {/* Search Container & CTA Button */}
              <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search by firm name, professional, or keyword..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-sand hover:border-terracotta/30 focus:border-terracotta rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold text-charcoal outline-none transition-all shadow-sm focus:shadow-md"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                </div>
                <Link
                  href="/services/register"
                  className="bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider px-6 py-4 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 border-none cursor-pointer shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Your Business</span>
                </Link>
              </div>

            </div>

            {/* Right Column: Layered Jharokha Arch collage with customized image */}
            <div className="hidden lg:col-span-5 lg:flex flex-col items-center justify-center relative w-full h-[450px]">
              
              {/* Decorative Frame containing Udaipur-style interior rendering */}
              <div className="relative w-[90%] h-[380px] overflow-hidden heritage-arch-double z-10 transition-transform duration-500 hover:scale-[1.02] cursor-pointer">
                <img
                  src="/services_hero.png"
                  alt="Luxury Traditional Rajasthan Courtyard Interior"
                  className="w-full h-full object-cover object-center"
                />
                
                {/* Visual Glassmorphic Tag */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-sand/40 text-[10px] text-indigo font-black uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <ShieldCheck className="w-4 h-4 text-terracotta" />
                  <span>Heritage Certified</span>
                </div>
              </div>

              {/* Ambient Decorative backplates */}
              <div className="absolute w-[95%] h-[390px] border border-sand rounded-3xl -z-10 translate-x-4 translate-y-4 opacity-50" />
            </div>

          </div>
        </div>
      </section>

      {/* 2. ASSURANCES SECTION */}
      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-indigo/5 text-indigo flex items-center justify-center mb-1">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">Verified Identities</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Every professional undergoes a strict background check and business verification before being listed.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-terracotta/5 text-terracotta flex items-center justify-center mb-1">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">RERA Compliant</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Brokers and developers are required to hold valid RERA certification for complete peace of mind.
            </p>
          </div>
          <div className="flex flex-col items-center text-center gap-3 p-6 rounded-3xl bg-white border border-sand shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-2xl bg-gold/10 text-gold flex items-center justify-center mb-1">
              <Star className="w-6 h-6" />
            </div>
            <h3 className="font-serif font-black text-lg text-charcoal">Quality Assured</h3>
            <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">
              Based on continuous client feedback and successful project completions within the region.
            </p>
          </div>
        </div>
      </section>

      {/* 3. DIRECTORY SECTION (Sidebar + Grid) */}
      <section className="w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Sidebar Column: Categories List */}
          <div className="lg:col-span-3 flex flex-col gap-4 sticky top-24">
            <div className="bg-white border border-sand rounded-3xl p-5 shadow-sm text-left">
              <h2 className="font-serif font-black text-lg text-indigo pb-4 border-b border-sand mb-4">
                Categories
              </h2>

              <div className="flex flex-col gap-1.5">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold transition-all cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-indigo text-white shadow-md"
                      : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                      selectedCategory === "all" ? "bg-white/20 text-white" : "bg-sand/50 text-indigo"
                    }`}>
                      <Grid className="w-4 h-4" />
                    </div>
                    <span>All Profiles</span>
                  </div>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    selectedCategory === "all" ? "bg-white/20 text-white" : "bg-sand/50 text-charcoal/50"
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
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo text-white shadow-md"
                          : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected ? "bg-white/20 text-white" : cat.textClass
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className="truncate max-w-[140px] text-left">{cat.title}</span>
                      </div>
                      
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                        isSelected ? "bg-white/20 text-white" : "bg-sand/50 text-charcoal/50"
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
          <div className="lg:col-span-9 flex flex-col gap-6">
            
            {/* List Header */}
            <div className="flex items-center justify-between pb-3 border-b border-sand text-left">
              <div className="flex flex-col">
                <h2 className="font-serif font-black text-2xl text-indigo">
                  {selectedCategory === "all" ? "All Professionals" : `${selectedCategory}s`}
                </h2>
                {searchQuery ? (
                  <span className="text-[11px] text-charcoal/60 font-bold tracking-wide mt-1">
                    Search results for &quot;{searchQuery}&quot;
                  </span>
                ) : (
                  <span className="text-[10px] text-charcoal/45 font-black uppercase tracking-[0.15em] mt-1">
                    Verified regional registrations
                  </span>
                )}
              </div>
              
              <span className="text-[11px] text-charcoal/60 font-black bg-sand/50 border border-sand px-3 py-1.5 rounded-lg">
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
                      initial={{ opacity: 0, scale: 0.98, y: 10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98 }}
                      transition={{ duration: 0.2 }}
                      className="bg-white border border-sand rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col gap-5 text-left relative overflow-hidden group hover:border-indigo/20"
                    >
                      {/* Top Section: Avatar & Name */}
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo to-charcoal flex items-center justify-center text-white font-black text-xl shadow-md flex-shrink-0 relative">
                          {profile.ownerName.charAt(0)}
                          <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 border-[3px] border-white rounded-full flex items-center justify-center shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        </div>
                        <div className="flex flex-col pt-0.5">
                          <span className="text-[9px] font-black text-terracotta uppercase tracking-[0.15em] mb-1">
                            {profile.category}
                          </span>
                          <h3 className="font-serif font-black text-lg text-indigo line-clamp-1 group-hover:text-terracotta transition-colors leading-tight">
                            {profile.firmName}
                          </h3>
                          <span className="text-xs text-charcoal/50 font-bold mt-1.5 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            {profile.ownerName}
                          </span>
                        </div>
                      </div>

                      <p className="text-sm text-charcoal/60 leading-relaxed font-semibold line-clamp-3 min-h-[60px]">
                        {profile.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal/70 bg-cream p-3 rounded-xl border border-sand/50">
                        <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                        <span className="truncate">{profile.address}</span>
                      </div>

                      {/* Contact Action Buttons */}
                      <div className="flex gap-2 pt-2 mt-auto">
                        {/* Primary Contact (Phone) */}
                        <a
                          href={`tel:${profile.mobile}`}
                          className="flex-1 py-3 rounded-xl bg-indigo hover:bg-indigo/90 text-white flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all hover:-translate-y-0.5"
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contact</span>
                        </a>
                        
                        {/* Secondary Icons (Email, Web) */}
                        <a
                          href={`mailto:${profile.email}`}
                          title="Email"
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-sand hover:border-blue-500 hover:bg-blue-50 text-charcoal hover:text-blue-600 transition-colors shadow-sm"
                        >
                          <Mail className="w-4.5 h-4.5" />
                        </a>
                        <a
                          href={`https://${profile.website}`}
                          target="_blank"
                          rel="noreferrer"
                          title="Website"
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-sand hover:border-terracotta hover:bg-terracotta/5 text-charcoal hover:text-terracotta transition-colors shadow-sm"
                        >
                          <Globe className="w-4.5 h-4.5" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              /* Empty State */
              <div className="text-center py-24 px-6 rounded-3xl bg-cream border border-sand max-w-xl mx-auto w-full my-8 shadow-sm">
                <div className="w-20 h-20 rounded-full bg-white border border-sand flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <Search className="w-8 h-8 text-charcoal/30" />
                </div>
                <h3 className="font-serif font-black text-2xl text-indigo mb-2">No profiles found</h3>
                <p className="text-sm text-charcoal/60 font-semibold mb-8 max-w-sm mx-auto">
                  We couldn&apos;t find any professionals matching your criteria. Try adjusting your search or selecting a different category.
                </p>
                
                <Link
                  href="/services/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
                >
                  <span>Register Your Firm Instead</span>
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4. CTA BANNER */}
      <section className="w-full bg-indigo text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-terracotta/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-8 relative z-10">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl md:text-5xl font-serif font-black tracking-tight">
              Are you a Real Estate Professional?
            </h2>
            <p className="text-sm md:text-lg text-white/70 font-semibold max-w-2xl mx-auto">
              Join the most trusted property network in Rajasthan. Connect with high-value clients, showcase your portfolio, and grow your local presence.
            </p>
          </div>
          <Link
            href="/services/register"
            className="group flex items-center justify-center gap-2 px-8 py-4 mt-2 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-xl hover:shadow-2xl transition-all hover:-translate-y-1"
          >
            <Plus className="w-5 h-5 transition-transform group-hover:rotate-90" />
            <span>List Your Business Today</span>
          </Link>
        </div>
      </section>

    </div>
  );
}

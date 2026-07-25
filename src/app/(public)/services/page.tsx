"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
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
  Phone, 
  Plus, 
  ArrowUpRight,
  ArrowRight,
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
  { name: "Builder & Developer", title: "Builders & Developers", desc: "Developing premium residential townships, villas, and industrial projects.", icon: Building2, textClass: "text-indigo bg-indigo/5" },
  { name: "Interior Decorator", title: "Interior Decorators", desc: "Renovate spaces with traditional Rajasthani blocks, carving work, and modern layouts.", icon: Paintbrush, textClass: "text-terracotta bg-terracotta/5" },
  { name: "Architect", title: "Architects", desc: "Preserve heritage havelis or build state-of-the-art luxury lakeside villas.", icon: Map, textClass: "text-indigo bg-indigo/5" },
  { name: "Building Contractor", title: "Building Contractors", desc: "Quality raw materials, local stone craftsmanship, and structural engineering expertise.", icon: Hammer, textClass: "text-charcoal bg-charcoal/5" },
  { name: "Vastu Consultant", title: "Vastu Consultants", desc: "Align your home plans with Vedic guidelines to bring peace, health, and prosperity.", icon: Compass, textClass: "text-gold bg-gold/10" },
  { name: "Home Valuation/Inspection", title: "Valuation & Inspection", desc: "Verify structural sanitation, water grids, and get fair value market estimations.", icon: Calculator, textClass: "text-indigo bg-indigo/5" },
  { name: "Home Shifting/Deep Cleaning", title: "Shifting & Deep Cleaning", desc: "Hassle-free interstate relocation, logistics, deep cleaning, and pest control.", icon: Truck, textClass: "text-terracotta bg-terracotta/5" }
];

export default function ServicesPage() {
  const { directoryProfiles, selectedCity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBySelectedCity, setFilterBySelectedCity] = useState(true);

  // Filter out agent/consultant dealers (builders remain as service partners)
  const serviceProfiles = useMemo(() => {
    return directoryProfiles.filter((p) => isServiceDirectoryCategory(p.category));
  }, [directoryProfiles]);

  const profilesForSelectedCity = useMemo(() => {
    if (!selectedCity) return serviceProfiles;
    return serviceProfiles.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
  }, [serviceProfiles, selectedCity]);

  const activeProfilesForCount = useMemo(() => {
    return filterBySelectedCity ? profilesForSelectedCity : serviceProfiles;
  }, [filterBySelectedCity, profilesForSelectedCity, serviceProfiles]);

  const filteredProfiles = useMemo(() => {
    let profiles = serviceProfiles;

    // Filter by selected city if active
    if (filterBySelectedCity && selectedCity) {
      profiles = profiles.filter(p => p.city.toLowerCase() === selectedCity.toLowerCase());
    }

    // Filter by category
    if (selectedCategory !== "all") {
      profiles = profiles.filter(p => p.category === selectedCategory);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      profiles = profiles.filter(p => 
        p.firmName.toLowerCase().includes(q) || 
        p.ownerName.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        (p.city && p.city.toLowerCase().includes(q))
      );
    }
    return profiles;
  }, [serviceProfiles, selectedCategory, searchQuery, selectedCity, filterBySelectedCity]);

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
                    suppressHydrationWarning
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
          
          {/* Sidebar Column: Location & Categories List */}
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-24">
            
            {/* Regional Location Filter */}
            <div className="bg-white border border-sand rounded-3xl p-5 shadow-sm text-left flex flex-col gap-3">
              <h2 className="font-serif font-black text-sm text-indigo pb-3 border-b border-sand flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terracotta" />
                <span>Regional Filter</span>
              </h2>

              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setFilterBySelectedCity(false)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold transition-all cursor-pointer ${
                    !filterBySelectedCity
                      ? "bg-indigo text-white shadow-md"
                      : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                  }`}
                  suppressHydrationWarning
                >
                  <span className="text-left">All Cities</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    !filterBySelectedCity ? "bg-white/20 text-white" : "bg-sand/50 text-charcoal/50"
                  }`}>
                    {serviceProfiles.length}
                  </span>
                </button>

                <button
                  onClick={() => setFilterBySelectedCity(true)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold transition-all cursor-pointer ${
                    filterBySelectedCity
                      ? "bg-indigo text-white shadow-md"
                      : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                  }`}
                  suppressHydrationWarning
                >
                  <span className="truncate text-left">Only {selectedCity}</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                    filterBySelectedCity ? "bg-white/20 text-white" : "bg-sand/50 text-charcoal/50"
                  }`}>
                    {profilesForSelectedCity.length}
                  </span>
                </button>
              </div>
            </div>

            {/* Categories Box */}
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
                  suppressHydrationWarning
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
                    {activeProfilesForCount.length}
                  </span>
                </button>

                {/* Individual Category Buttons */}
                {CATEGORY_METADATA.map((cat) => {
                  const IconComponent = cat.icon;
                  const isSelected = selectedCategory === cat.name;
                  const count = activeProfilesForCount.filter(p => p.category === cat.name).length;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-indigo text-white shadow-md"
                          : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                      }`}
                      suppressHydrationWarning
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
          <div className="lg:col-span-9 flex flex-col gap-6 w-full">
            
            {/* Mobile Categories Bar */}
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2 mb-2 -mx-4 px-4">
              <div className="flex gap-2 w-max">
                {/* All Categories Button */}
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === "all"
                      ? "bg-indigo text-white shadow-md"
                      : "bg-white border border-sand text-charcoal/70 hover:bg-sand/30"
                  }`}
                  suppressHydrationWarning
                >
                  <span>All ({activeProfilesForCount.length})</span>
                </button>

                {/* Individual Category Buttons */}
                {CATEGORY_METADATA.map((cat) => {
                  const isSelected = selectedCategory === cat.name;
                  const count = activeProfilesForCount.filter(p => p.category === cat.name).length;

                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat.name)}
                      className={`px-4 py-2 rounded-full text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                        isSelected
                          ? "bg-indigo text-white shadow-md"
                          : "bg-white border border-sand text-charcoal/70 hover:bg-sand/30"
                      }`}
                      suppressHydrationWarning
                    >
                      <span>{cat.title} ({count})</span>
                    </button>
                  );
                })}
              </div>
            </div>
            
            {/* List Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-sand text-left">
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
              
              <div className="flex items-center gap-3">
                {/* Mobile Regional switcher */}
                <div className="flex items-center gap-1 bg-sand/35 p-1 rounded-xl border border-sand/60 lg:hidden">
                  <button
                    onClick={() => setFilterBySelectedCity(false)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      !filterBySelectedCity ? "bg-white text-indigo shadow-sm" : "text-charcoal/60"
                    }`}
                    suppressHydrationWarning
                  >
                    All Cities
                  </button>
                  <button
                    onClick={() => setFilterBySelectedCity(true)}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      filterBySelectedCity ? "bg-white text-indigo shadow-sm" : "text-charcoal/60"
                    }`}
                    suppressHydrationWarning
                  >
                    Only {selectedCity}
                  </button>
                </div>

                <span className="text-[11px] text-charcoal/60 font-black bg-sand/50 border border-sand px-3 py-1.5 rounded-lg shrink-0">
                  {filteredProfiles.length} Profiles
                </span>
              </div>
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
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo to-indigo-hover text-[#D4AF37] border border-[#D4AF37]/20 flex items-center justify-center font-black text-xl shadow-md flex-shrink-0 relative">
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
                        <span className="truncate">{profile.address} <span className="text-indigo/80 font-black">({profile.city})</span></span>
                      </div>

                      {/* Contact Action Buttons */}
                      <div className="flex gap-2 pt-2 mt-auto">
                        {/* Primary Contact (Phone) */}
                        <a
                          href={`tel:${profile.mobile}`}
                          className="flex-1 py-3 rounded-xl bg-indigo hover:bg-indigo-hover text-white flex items-center justify-center gap-2 text-sm font-bold shadow-md transition-all hover:-translate-y-0.5"
                          suppressHydrationWarning
                        >
                          <Phone className="w-4 h-4" />
                          <span>Contact</span>
                        </a>
                        
                        {/* Secondary Icon (Email) */}
                        <a
                          href={`mailto:${profile.email}`}
                          title="Email"
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-sand hover:border-indigo hover:bg-indigo/5 text-charcoal hover:text-indigo transition-colors shadow-sm"
                          suppressHydrationWarning
                        >
                          <Mail className="w-4.5 h-4.5" />
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

      {/* 4. PREMIUM CTA BANNER SECTION */}
      <section className="relative z-20 pb-20 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo to-slate-900 text-white p-8 md:p-12 shadow-2xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 gap-8 border-2 border-white/10 group"
        >
          {/* Ambient Back Decor */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            <span className="px-3 py-1 bg-white/20 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded w-fit">
              Partner Services
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                Are you a Real Estate Professional? <br />
                List your business with SQFTGO today.
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-semibold max-w-xl">
                Join the most trusted property network in Rajasthan. Connect with high-value clients, showcase your portfolio, and grow your local presence entirely free.
              </p>
            </div>
            
            <div className="w-fit">
              <Link
                href="/services/register"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-cream text-indigo hover:text-indigo-hover font-black text-xs uppercase tracking-widest shadow-lg transition-all duration-200"
                suppressHydrationWarning
              >
                <span>List Your Business Today</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stylized Collage Column */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative z-10 min-h-[380px]">
            <div className="relative w-[300px] h-[360px]">
              {/* Terracotta Accent Card (Tilted) */}
              <div className="absolute inset-0 bg-terracotta rounded-[32px] shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-all duration-500" />
              
              {/* Offset Tilted White Outline Border */}
              <div className="absolute inset-0 border-2 border-white/80 rounded-[32px] transform rotate-3 group-hover:rotate-0 transition-all duration-500 pointer-events-none" />
              
              {/* Image Container (Tilted slightly differently) */}
              <div className="absolute inset-3 rounded-[24px] overflow-hidden bg-white shadow-lg transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                <img
                  src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=600&auto=format&fit=crop"
                  alt="Luxury Interior Design Sketch Work"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

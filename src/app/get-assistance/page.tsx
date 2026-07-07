"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { useSearchParams } from "next/navigation";
import { 
  Briefcase, 
  MapPin, 
  BedDouble, 
  Calendar, 
  Users, 
  FileText, 
  User, 
  Mail, 
  Phone, 
  Compass, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2, 
  PhoneCall,
  ChevronRight,
  ChevronLeft,
  Info,
  Clock,
  Layers
} from "lucide-react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import RelocationMap from "@/components/ui/RelocationMap";
import { DESTINATIONS } from "@/data/destinations";

const CITIES = [
  "All India",
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];
const BHK_PREFERENCES = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Independent Villa", "Plot / Land"];
const BUDGET_OPTIONS = [
  "Under ₹15,000 / month",
  "₹15,000 - ₹30,000 / month",
  "₹30,000 - ₹50,000 / month",
  "Above ₹50,000 / month",
  "Buying: Under ₹50 Lakh",
  "Buying: ₹50 Lakh - ₹1.5 Crore",
  "Buying: Above ₹1.5 Crore"
];

const TRUST_METRICS = [
  { icon: Layers, label: "Active Highways", value: "Mumbai, Gujarat, Delhi NCR", desc: "Inter-state logistics coordinators" },
  { icon: ShieldCheck, label: "Transit Guarantee", value: "98.4% On-Time Moves", desc: "Insured & vetted packing support" },
  { icon: Clock, label: "Response timeline", value: "Within 2 Hours", desc: "Local sourcing agent assignment" }
];

function GetAssistanceContent() {
  const { addAssistanceRequest, selectedCity } = useApp();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: selectedCity,
    budget: BUDGET_OPTIONS[1],
    bhk: BHK_PREFERENCES[1],
    familySize: 3,
    moveInDate: "",
    notes: "",
  });

  const [localAreas, setLocalAreas] = useState("");
  const [formStep, setFormStep] = useState(0); // 0 = Destination, 1 = Specifications, 2 = Contact info
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [agreeToAssistanceTerms, setAgreeToAssistanceTerms] = useState(false);

  // Sync selectedCity from URL parameter or Navbar
  useEffect(() => {
    const queryCity = searchParams.get("city");
    if (queryCity && CITIES.includes(queryCity)) {
      setFormData((prev) => ({ ...prev, city: queryCity }));
    }
  }, [searchParams]);

  // Sync selectedCity from Navbar
  useEffect(() => {
    if (selectedCity && CITIES.includes(selectedCity)) {
      setFormData((prev) => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  // Handle locality tag chip selection
  const handleLocalityClick = (locality: string) => {
    const currentAreas = localAreas.split(",").map(a => a.trim()).filter(a => a.length > 0);
    if (currentAreas.map(a => a.toLowerCase()).includes(locality.toLowerCase())) {
      setLocalAreas(currentAreas.filter(a => a.toLowerCase() !== locality.toLowerCase()).join(", "));
    } else {
      setLocalAreas([...currentAreas, locality].join(", "));
    }
  };

  // Cost estimator based on target city, BHK, and family size
  const estimates = useMemo(() => {
    let minPacking = 0;
    let maxPacking = 0;
    let depositAdvice = "";
    
    switch (formData.bhk) {
      case "1 BHK":
        minPacking = 6500;
        maxPacking = 9500;
        depositAdvice = "₹15,000 - ₹30,000";
        break;
      case "2 BHK":
        minPacking = 10000;
        maxPacking = 15000;
        depositAdvice = "₹30,000 - ₹60,000";
        break;
      case "3 BHK":
        minPacking = 15000;
        maxPacking = 22000;
        depositAdvice = "₹50,000 - ₹1,00,000";
        break;
      case "4+ BHK":
      case "Independent Villa":
        minPacking = 22000;
        maxPacking = 35000;
        depositAdvice = "₹80,000 - ₹1,50,000";
        break;
      default:
        minPacking = 0;
        maxPacking = 0;
        depositAdvice = "Varies by deal";
    }
    
    // Extra inter-state transit cost
    const interStateCities = ["Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra", "All India"];
    if (interStateCities.includes(formData.city)) {
      minPacking += 8000;
      maxPacking += 15000;
    }
    
    // Scale slightly with family size
    if (formData.familySize > 3) {
      minPacking += (formData.familySize - 3) * 1500;
      maxPacking += (formData.familySize - 3) * 2500;
    }
    
    return { minPacking, maxPacking, depositAdvice };
  }, [formData.bhk, formData.city, formData.familySize]);

  const handleNext = () => {
    setFormError("");
    if (formStep === 0) {
      if (!formData.moveInDate) {
        setFormError("Expected move-in date is required.");
        return;
      }
    } else if (formStep === 1) {
      if (!formData.familySize || formData.familySize < 1) {
        setFormError("Family size must be at least 1.");
        return;
      }
    }
    setDirection(1);
    setFormStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setFormError("");
    setDirection(-1);
    setFormStep((prev) => prev - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!formData.name || !formData.phone || !formData.email) {
      setFormError("All contact information details are required.");
      return;
    }

    if (!agreeToAssistanceTerms) {
      setFormError("You must agree to the relocation sourcing terms and conditions.");
      return;
    }

    setIsSubmitting(true);

    const parsedAreas = localAreas
      ? localAreas.split(",").map((a) => a.trim()).filter((a) => a.length > 0)
      : ["Central Area"];

    // Simulate network delay
    setTimeout(() => {
      addAssistanceRequest({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        budget: formData.budget,
        bhk: formData.bhk,
        familySize: formData.familySize,
        moveInDate: formData.moveInDate || new Date().toISOString().split("T")[0],
        notes: formData.notes,
        areas: parsedAreas,
      });

      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1500);
  };

  const slideVariants: Variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 60 : -60,
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: "easeOut" }
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 60 : -60,
      opacity: 0,
      transition: { duration: 0.2, ease: "easeIn" }
    })
  };

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-24 pt-6">
      
      {/* 1. HERO HEADER AND TRUST METRICS BANNER */}
      <div className="w-full rounded-3xl bg-cream border border-sand p-8 md:p-10 shadow-sm mb-10 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-96 h-96 bg-terracotta/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-3xl relative z-10 flex flex-col gap-3">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest text-terracotta bg-terracotta/5 border border-terracotta/10 w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>Assisted Relocation Program</span>
          </span>
          
          <h1 className="text-3xl md:text-5xl font-serif font-black text-indigo tracking-tight leading-tight">
            Sun Valley Relocation Concierge
          </h1>
          
          <p className="text-xs sm:text-sm text-charcoal/70 font-medium leading-relaxed max-w-2xl">
            Relocating across Rajasthan doesn&apos;t have to be overwhelming. Share your relocation details, and our local leads will search matching listings, inspect sites, draft agreements, and sync packing services.
          </p>
        </div>

        {/* trust metric badges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-t border-sand pt-8 mt-8 relative z-10">
          {TRUST_METRICS.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <div key={idx} className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-xl bg-indigo text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">{metric.label}</span>
                  <span className="text-sm font-serif font-black text-indigo mt-0.5">{metric.value}</span>
                  <span className="text-[11px] text-charcoal/50 font-semibold leading-tight mt-1">{metric.desc}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* 2. LEFT COLUMN: INTERACTIVE ROUTE MAP, ESTIMATOR, ROADMAP, & SUPPORT */}
            <div className="lg:col-span-5 order-2 lg:order-1 flex flex-col gap-6 lg:sticky lg:top-24 lg:max-h-[90vh] lg:overflow-y-auto pr-1 no-scrollbar pb-6">
              
              {/* Relocation Map wrapper */}
              <div className="w-full">
                <RelocationMap city={formData.city} />
              </div>

              {/* Relocation Budget & Advisory Estimator */}
              {estimates.minPacking > 0 && (
                <div className="rounded-2xl border border-sand bg-cream p-5 text-left shadow-sm flex flex-col gap-3.5 animate-fade-in">
                  <h3 className="font-serif font-black text-sm text-indigo pb-2.5 border-b border-sand/40 flex items-center gap-2">
                    <Briefcase className="w-4 h-4 text-terracotta" />
                    <span>Cost Estimator & Advisory</span>
                  </h3>
                  
                  <div className="flex flex-col gap-3 text-xs font-semibold text-charcoal/70">
                    <div className="flex justify-between border-b border-sand/30 pb-2">
                      <span className="text-charcoal/50">Est. Shifting & Packing:</span>
                      <span className="font-extrabold text-indigo text-right">
                        ₹{estimates.minPacking.toLocaleString()} - ₹{estimates.maxPacking.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between border-b border-sand/30 pb-2">
                      <span className="text-charcoal/50">Advised Rental Deposit:</span>
                      <span className="font-extrabold text-indigo text-right">{estimates.depositAdvice}</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span className="text-charcoal/50">Sourcing & Legal Vetting:</span>
                      <span className="font-extrabold text-emerald-600 text-right">₹0 (Free / Concierge Benefit)</span>
                    </div>
                    <div className="text-[10px] text-charcoal/40 font-semibold leading-relaxed bg-white/60 p-2.5 rounded-lg border border-sand/30">
                      💡 Estimates are based on average regional transport tariffs and deposit norms. Shifting rates vary with distance and volume.
                    </div>
                  </div>
                </div>
              )}

              {/* Relocation Roadmap Checklist */}
              <div className="rounded-2xl border border-sand bg-white p-5 text-left shadow-sm flex flex-col gap-4">
                <h3 className="font-serif font-black text-sm text-indigo pb-2.5 border-b border-sand flex items-center gap-2">
                  <Compass className="w-4 h-4 text-terracotta" />
                  <span>Your Relocation Journey</span>
                </h3>
                
                <div className="flex flex-col gap-4 text-xs font-semibold text-charcoal/70">
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo/5 border border-indigo/20 flex items-center justify-center flex-shrink-0 font-bold text-indigo text-[10px]">1</div>
                    <div className="flex flex-col">
                      <span className="font-black text-indigo">Coordinator Assignment</span>
                      <span className="text-[10px] text-charcoal/50 leading-normal mt-0.5">A dedicated sourcing coordinator checks your specifications within 2 hours.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo/5 border border-indigo/20 flex items-center justify-center flex-shrink-0 font-bold text-indigo text-[10px]">2</div>
                    <div className="flex flex-col">
                      <span className="font-black text-indigo">Curated Shortlisting</span>
                      <span className="text-[10px] text-charcoal/50 leading-normal mt-0.5">We scan properties in your chosen localities to short-list 3 high-vibe options.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo/5 border border-indigo/20 flex items-center justify-center flex-shrink-0 font-bold text-indigo text-[10px]">3</div>
                    <div className="flex flex-col">
                      <span className="font-black text-indigo">Video or Guided Tours</span>
                      <span className="text-[10px] text-charcoal/50 leading-normal mt-0.5">Our agent verifies property sanitation, layout, water, and drafts RERA leases.</span>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-6 h-6 rounded-full bg-indigo/5 border border-indigo/20 flex items-center justify-center flex-shrink-0 font-bold text-indigo text-[10px]">4</div>
                    <div className="flex flex-col">
                      <span className="font-black text-indigo">Packing Shifting & Key Handover</span>
                      <span className="text-[10px] text-charcoal/50 leading-normal mt-0.5">Sync with premium logistics and deep cleaning to step into your new home stress-free.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Relocation Sourcing Feed */}
              <div className="rounded-2xl border border-sand bg-white p-5 text-left shadow-sm flex flex-col gap-3.5">
                <h3 className="font-serif font-black text-sm text-indigo pb-2.5 border-b border-sand flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-500 animate-pulse" />
                  <span>Active Relocation Requests</span>
                </h3>
                
                <div className="flex flex-col gap-3">
                  {[
                    { client: "Rohan M.", from: "Mumbai", to: "Jaipur", details: "3 BHK Apartment", time: "3 hrs ago", status: "Agent Assigned" },
                    { client: "Priya S.", from: "Ahmedabad", to: "Udaipur", details: "2 BHK Villa", time: "1 day ago", status: "Matching Listings" },
                    { client: "Vikram K.", from: "Delhi NCR", to: "Jodhpur", details: "4 BHK Bungalow", time: "2 days ago", status: "Completed" }
                  ].map((move, idx) => (
                    <div key={idx} className="flex justify-between items-start text-xs border-b border-sand/30 pb-2.5 last:border-0 last:pb-0 font-semibold text-charcoal/70">
                      <div className="flex flex-col text-left">
                        <span className="font-extrabold text-indigo">{move.client}</span>
                        <span className="text-[10px] text-charcoal/45 mt-0.5">
                          {move.from} &rarr; <span className="text-terracotta">{move.to}</span>
                        </span>
                        <span className="text-[9px] text-charcoal/40 font-bold mt-0.5">{move.details}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                          move.status === "Completed"
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : move.status === "Matching Listings"
                            ? "bg-blue-50 text-blue-600 border border-blue-100"
                            : "bg-amber-50 text-amber-600 border border-amber-100"
                        }`}>
                          {move.status}
                        </span>
                        <span className="text-[9px] text-charcoal/40 mt-1">{move.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Local Support Callout */}
              <div className="rounded-2xl border border-sand bg-white p-5 text-left shadow-sm flex flex-col gap-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                    <Users className="w-4.5 h-4.5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Regional Coordinator</span>
                    <span className="text-xs font-black text-indigo">Vikram Singh Rathore</span>
                  </div>
                </div>
                
                <p className="text-[11px] text-charcoal/60 leading-relaxed font-semibold">
                  Need custom logistics or commercial warehouse listings during transition? Speak directly with our Rajasthan relocation head.
                </p>
 
                <a
                  href="tel:+919876543210"
                  className="w-full py-2.5 rounded-xl border border-sand hover:border-terracotta/35 text-indigo hover:text-terracotta flex items-center justify-center gap-2 text-xs font-black transition-all shadow-sm bg-white"
                >
                  <PhoneCall className="w-4 h-4 text-terracotta" />
                  <span>Call Sourcing Lead Office</span>
                </a>
              </div>
            </div>

            {/* 3. RIGHT COLUMN: MULTI-STEP REQUIREMENTS WIZARD */}
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="bg-white border border-sand rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6 relative">
                
                {/* Wizard Tab Tracker */}
                <div className="flex items-center gap-2 pb-4 border-b border-sand">
                  {[
                    { label: "Destination", num: 1 },
                    { label: "Specifications", num: 2 },
                    { label: "Your Details", num: 3 }
                  ].map((s, idx) => {
                    const isActive = formStep === idx;
                    const isCompleted = formStep > idx;
                    return (
                      <React.Fragment key={idx}>
                        <div className="flex items-center gap-2">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black transition-all ${
                            isActive
                              ? "bg-indigo text-white scale-110 shadow-sm"
                              : isCompleted
                              ? "bg-emerald-500 text-white"
                              : "bg-sand/40 text-charcoal/50"
                          }`}>
                            {isCompleted ? "✓" : s.num}
                          </div>
                          <span className={`text-xs font-bold ${
                            isActive ? "text-indigo" : "text-charcoal/40"
                          }`}>
                            {s.label}
                          </span>
                        </div>
                        {idx < 2 && <div className="h-px bg-sand flex-1 min-w-[20px]" />}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Form Step Contents with Slide Animation */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-6 text-left">
                  <div className="overflow-hidden min-h-[280px] relative">
                    <AnimatePresence mode="popLayout" custom={direction}>
                      <motion.div
                        key={formStep}
                        custom={direction}
                        variants={slideVariants}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        className="w-full flex flex-col gap-5"
                      >
                        {formStep === 0 && (
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col">
                              <h3 className="font-serif font-black text-lg text-indigo">Where are you relocating?</h3>
                              <p className="text-[11px] text-charcoal/50 font-bold mt-0.5">Define your destination municipality and preferred neighborhoods.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                              {/* City */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                                  <span>Target City *</span>
                                </label>
                                <select
                                  value={formData.city}
                                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer"
                                >
                                  {CITIES.map((c) => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Localities */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <Compass className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Preferred Localities</span>
                                </label>
                                <input
                                  type="text"
                                  value={localAreas}
                                  onChange={(e) => setLocalAreas(e.target.value)}
                                  placeholder="e.g. Panchwati, C-Scheme"
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none focus:border-indigo"
                                />
                              </div>

                              {/* Popular Localities suggestions */}
                              {(() => {
                                const currentCityDest = DESTINATIONS.find(d => d.name.toLowerCase() === formData.city.toLowerCase());
                                const localitiesToSuggest = currentCityDest ? currentCityDest.topLocalities : [];
                                if (localitiesToSuggest.length === 0) return null;
                                return (
                                  <div className="flex flex-col gap-1.5 sm:col-span-2 mt-1 animate-fade-in">
                                    <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-widest text-left">
                                      Click to Add Popular Neighborhoods:
                                    </span>
                                    <div className="flex flex-wrap gap-1.5 justify-start">
                                      {localitiesToSuggest.map((loc) => {
                                        const isSelected = localAreas.split(",").map(a => a.trim().toLowerCase()).includes(loc.toLowerCase());
                                        return (
                                          <button
                                            key={loc}
                                            type="button"
                                            onClick={() => handleLocalityClick(loc)}
                                            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                              isSelected
                                                ? "bg-indigo text-white border-indigo shadow-sm"
                                                : "bg-sand/30 hover:bg-sand/65 text-charcoal/70 border-sand"
                                            }`}
                                          >
                                            {loc}
                                          </button>
                                        );
                                      })}
                                    </div>
                                  </div>
                                );
                              })()}

                              {/* Move-in Date */}
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <Calendar className="w-3.5 h-3.5 text-terracotta" />
                                  <span>Expected Move-In Date *</span>
                                </label>
                                <input
                                  type="date"
                                  required
                                  value={formData.moveInDate}
                                  onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none cursor-pointer"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 1 && (
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col">
                              <h3 className="font-serif font-black text-lg text-indigo">Home Specifications</h3>
                              <p className="text-[11px] text-charcoal/50 font-bold mt-0.5">Specify layout scale, transition budget, and custom needs.</p>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-semibold">
                              {/* Layout */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <BedDouble className="w-3.5 h-3.5 text-teal-500" />
                                  <span>Required Layout *</span>
                                </label>
                                <select
                                  value={formData.bhk}
                                  onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer"
                                >
                                  {BHK_PREFERENCES.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Budget */}
                              <div className="flex flex-col gap-1.5">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Budget Boundary *</span>
                                </label>
                                <select
                                  value={formData.budget}
                                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer"
                                >
                                  {BUDGET_OPTIONS.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              {/* Family size */}
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <Users className="w-3.5 h-3.5 text-blue-500" />
                                  <span>Family Scale Size (Persons) *</span>
                                </label>
                                <input
                                  type="number"
                                  required
                                  min={1}
                                  value={formData.familySize}
                                  onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) || 1 })}
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-semibold focus:outline-none"
                                />
                              </div>

                              {/* Notes */}
                              <div className="flex flex-col gap-1.5 sm:col-span-2">
                                <label className="text-charcoal flex items-center gap-1.5">
                                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Specific Relocation Notes</span>
                                </label>
                                <textarea
                                  rows={2}
                                  value={formData.notes}
                                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                  placeholder="Proximity constraints (schools, main highways), pet policy, specific vaastu orientations, etc."
                                  className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-sm font-medium focus:outline-none resize-none placeholder-slate-400"
                                />
                              </div>
                            </div>
                          </div>
                        )}

                        {formStep === 2 && (
                          <div className="flex flex-col gap-5">
                            <div className="flex flex-col">
                              <h3 className="font-serif font-black text-lg text-indigo">Your Contact details</h3>
                              <p className="text-[11px] text-charcoal/50 font-bold mt-0.5">Let our lead coordinators know how to reach you directly.</p>
                            </div>
 
                            <div className="flex flex-col gap-4 text-sm font-semibold">
                              {/* Name */}
                              <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                  <input
                                    type="text"
                                    required
                                    placeholder="Full Name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo text-slate-900 font-bold"
                                  />
                                  <User className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                                </div>
                              </div>
 
                              {/* Phone */}
                              <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                  <input
                                    type="tel"
                                    required
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo text-slate-900 font-bold"
                                  />
                                  <Phone className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                                </div>
                              </div>
 
                              {/* Email */}
                              <div className="flex flex-col gap-1.5">
                                <div className="relative">
                                  <input
                                    type="email"
                                    required
                                    placeholder="Email Address"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:outline-none focus:border-indigo text-slate-900 font-bold"
                                  />
                                  <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-400" />
                                </div>
                              </div>

                              {/* Sourcing Escrow Notice */}
                              <div className="p-3.5 rounded-2xl bg-indigo/5 border border-sand text-left text-xs font-semibold text-charcoal/80 flex flex-col gap-1.5 mt-2">
                                <span className="text-[10px] font-black text-indigo uppercase tracking-wider block">Relocation Escrow & Title Vetting Guarantee</span>
                                <p className="text-[10.5px] text-charcoal/65 leading-relaxed font-medium">
                                  Sun Valley vets all registry cards and keeps property lease token deposits in partner escrow accounts. Capital is only disbursed to verified owners upon physical key delivery and signed RERA verification certificates.
                                </p>
                              </div>

                              {/* Vetting Consent Checkbox */}
                              <div className="flex items-start gap-2.5 text-xs font-semibold select-none cursor-pointer mt-1">
                                <input
                                  id="agreeToAssistanceTerms"
                                  type="checkbox"
                                  required
                                  checked={agreeToAssistanceTerms}
                                  onChange={(e) => setAgreeToAssistanceTerms(e.target.checked)}
                                  className="mt-0.5 w-4 h-4 accent-terracotta shrink-0 cursor-pointer"
                                />
                                <label htmlFor="agreeToAssistanceTerms" className="cursor-pointer leading-tight text-left text-charcoal/75">
                                  I agree to share my moving details with verified local coordinators, and accept the Assured Sourcing terms. *
                                </label>
                              </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </AnimatePresence>
                  </div>
 
                  {/* Form Error Banner */}
                  {formError && (
                    <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-xs font-bold flex items-center gap-2">
                      <Info className="w-4 h-4 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}
 
                  {/* Navigation Panel */}
                  <div className="flex items-center justify-between pt-6 border-t border-sand mt-2">
                    {formStep > 0 ? (
                      <button
                        type="button"
                        onClick={handleBack}
                        className="px-5 py-2.5 rounded-xl border border-sand text-charcoal text-xs font-bold hover:bg-sand/15 flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span>Back</span>
                      </button>
                    ) : (
                      <div />
                    )}
 
                    {formStep < 2 ? (
                      <button
                        type="button"
                        onClick={handleNext}
                        className="px-6 py-2.5 rounded-xl bg-indigo hover:bg-indigo-hover text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <span>Next Step</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting || !agreeToAssistanceTerms}
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50 disabled:pointer-events-none transition-all cursor-pointer shadow-sm shadow-emerald-500/10"
                      >
                        {isSubmitting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                            <span>Registering...</span>
                          </>
                        ) : (
                          <>
                            <span>Request Concierge</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* 4. SUCCESS DOSSIER SCREEN STATE */
          <motion.div
            key="assistance-success"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-2xl mx-auto rounded-3xl bg-cream border border-sand p-8 md:p-10 text-center shadow-lg"
          >
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mb-6 mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            
            <h2 className="font-serif font-black text-2xl text-indigo mb-2">Relocation Dossier Confirmed</h2>
            <p className="text-xs text-charcoal/65 font-semibold max-w-md mx-auto leading-relaxed mb-8">
              Your requirements have been successfully registered under priority sourcing. A local coordinator is preparing physical inspection options for you.
            </p>

            {/* Sourcing summary card */}
            <div className="grid grid-cols-2 gap-4 bg-white border border-sand p-5 rounded-2xl text-left text-xs font-semibold text-charcoal/70 mb-8">
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Destination</span>
                <span className="text-indigo font-bold text-sm mt-0.5">{formData.city}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Required Layout</span>
                <span className="text-indigo font-bold text-sm mt-0.5">{formData.bhk}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Target Budget</span>
                <span className="text-indigo font-bold text-sm mt-0.5">{formData.budget}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Expected move-in</span>
                <span className="text-indigo font-bold text-sm mt-0.5">{formData.moveInDate}</span>
              </div>
              {localAreas && (
                <div className="flex flex-col col-span-2 border-t border-sand/70 pt-2.5 mt-0.5">
                  <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Preferred Localities</span>
                  <span className="text-indigo font-medium mt-0.5">{localAreas}</span>
                </div>
              )}
            </div>

            {/* Assigned agent box */}
            <div className="rounded-2xl border border-sand bg-white p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 text-left shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-indigo text-white flex items-center justify-center font-serif font-black text-lg flex-shrink-0">
                VS
              </div>
              <div className="flex-1 text-center sm:text-left">
                <span className="text-[9px] font-extrabold text-charcoal/40 uppercase tracking-widest block">Assigned Sourcing Agent</span>
                <span className="font-serif font-black text-base text-indigo mt-0.5 block">Vikram Singh Rathore</span>
                <span className="text-xs text-charcoal/50 font-bold block mt-1">Rajasthan Relocation Head</span>
              </div>
              
              <div className="flex gap-2">
                <a
                  href="tel:+919876543210"
                  className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all flex-shrink-0"
                  title="Call Agent"
                >
                  <PhoneCall className="w-4.5 h-4.5" />
                </a>
              </div>
            </div>

            {/* Success navigation */}
            <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
              <Link
                href="/listings"
                className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-xs rounded-xl shadow-sm transition-colors text-center"
              >
                Browse Available Properties
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-sand bg-white text-charcoal font-bold text-xs rounded-xl hover:bg-sand/15 transition-colors text-center"
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

export default function GetAssistancePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 bg-cream/30"><div className="w-8 h-8 rounded-full border-2 border-indigo border-t-transparent animate-spin"></div></div>}>
      <GetAssistanceContent />
    </Suspense>
  );
}

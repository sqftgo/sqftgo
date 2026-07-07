"use client";

import React, { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
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
  Info,
  Clock,
  Layers,
  Truck,
  Heart,
  ChevronDown,
  HelpCircle,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import RelocationMap from "@/components/ui/RelocationMap";

const CITIES = [
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

const SERVICE_PILLARS = [
  {
    icon: Compass,
    title: "1. Verified Property Sourcing",
    desc: "We scan local markets to match listings based on your exact budget, layout, and neighborhood preferences.",
    color: "text-indigo bg-indigo/5 border-indigo/10"
  },
  {
    icon: ShieldCheck,
    title: "2. RERA & Title Inspections",
    desc: "Our sourcing leads perform physical walkthroughs, inspect water/utilities, and audit developer RERA credentials.",
    color: "text-emerald-600 bg-emerald-50 border-emerald-100"
  },
  {
    icon: Truck,
    title: "3. Logistics & Shifting Sync",
    desc: "Coordinate transition schedules with vetted packers & movers, deep cleaning partners, and utility setup desks.",
    color: "text-terracotta bg-terracotta/5 border-terracotta/10"
  }
];


const FAQS = [
  {
    q: "How does the Relocation Concierge service work?",
    a: "Once you submit your relocation requirements, we assign a dedicated coordinator in your target city. They scan our databases and exclusive mandates to shortlist properties, physically inspect the sites, send video walkthroughs, verify RERA certifications, draft agreements, and coordinate with moving crews."
  },
  {
    q: "Is my security deposit safe under the Escrow Lock?",
    a: "Yes. To prevent rental deposit scams, Sun Valley holds advance tokens and deposits in partner escrow accounts. Funds are only transferred to landlords after physical verification checks, final key delivery, and your signed approval certificate."
  },
  {
    q: "What packing and shifting logistics are included?",
    a: "We partner with top-rated, fully insured regional transport and packing companies. We coordinate all transition schedules directly through our sourcing lead office and pass pre-negotiated corporate discounts directly to you."
  },
  {
    q: "How quickly will I receive my property shortlists?",
    a: "Sourcing begins immediately upon registration. Your dedicated coordinator will reach out to you within 2 hours, and the first batch of verified matches is typically delivered within 24 to 48 hours."
  }
];

function GetAssistanceContent() {
  const { addAssistanceRequest, selectedCity } = useApp();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    city: selectedCity || "Udaipur",
    budget: BUDGET_OPTIONS[1],
    bhk: BHK_PREFERENCES[1],
    familySize: 3,
    moveInDate: "",
    notes: "",
  });

  const [localAreas, setLocalAreas] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formError, setFormError] = useState("");
  const [agreeToAssistanceTerms, setAgreeToAssistanceTerms] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Sync selectedCity from Navbar
  useEffect(() => {
    if (selectedCity && CITIES.includes(selectedCity)) {
      setFormData((prev) => ({ ...prev, city: selectedCity }));
    }
  }, [selectedCity]);

  // Cost estimator based on BHK & family size
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
    
    // Scale with family size
    if (formData.familySize > 3) {
      minPacking += (formData.familySize - 3) * 1500;
      maxPacking += (formData.familySize - 3) * 2500;
    }
    
    return { minPacking, maxPacking, depositAdvice };
  }, [formData.bhk, formData.familySize]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    
    if (!formData.name || !formData.phone || !formData.email || !formData.moveInDate) {
      setFormError("All fields marked with * are required.");
      return;
    }

    if (!agreeToAssistanceTerms) {
      setFormError("You must agree to the relocation concierge sourcing terms.");
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

  return (
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6 md:px-8">
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-16">
        
        {/* 1. HERO BLOCK */}
        <div className="bg-white rounded-[2rem] border border-sand p-8 md:p-14 shadow-xl relative overflow-hidden text-center md:text-left">
          <div className="absolute top-0 right-0 w-80 h-80 bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-4 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-serif font-black text-indigo tracking-tight leading-tight">
              Seamless Shifting, <br />
              <span className="text-terracotta">RERA Vetted Living.</span>
            </h1>
            <p className="text-sm text-charcoal/70 font-semibold leading-relaxed">
              Relocating across Rajasthan? Skip the landlord negotiations and coordinate with a dedicated local sourcing manager. We inspect properties, secure legal title checks, hold deposits in escrow, and sync logistics support.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start mt-2">
              <a href="#form" className="px-6 py-3.5 bg-indigo hover:bg-indigo/90 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo/25 transition-all active:scale-95">
                Enquire Sourcing Now
              </a>
              <Link href="/listings" className="px-6 py-3.5 bg-white border border-sand hover:border-terracotta/35 text-indigo font-bold text-xs rounded-xl transition-all shadow-sm">
                Browse Listings
              </Link>
            </div>
          </div>
        </div>

        {/* 2. THE THREE SERVICE PILLARS */}
        <div className="flex flex-col gap-8">
          <div className="text-center">
            <h2 className="text-2xl font-serif font-black text-indigo">How We Assist Your Relocation</h2>
            <p className="text-xs text-charcoal/40 font-black uppercase tracking-widest mt-1.5">End-to-End Managed Move Infrastructure</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {SERVICE_PILLARS.map((pillar, idx) => {
              const Icon = pillar.icon;
              return (
                <div key={idx} className="bg-white border border-sand rounded-3xl p-8 flex flex-col text-left gap-4 shadow-sm hover:border-indigo/25 transition-colors">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shrink-0 ${pillar.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-base font-serif font-black text-indigo">{pillar.title}</h3>
                  <p className="text-xs text-charcoal/60 leading-relaxed font-semibold">{pillar.desc}</p>
                </div>
              );
            })}
          </div>
        </div>


        {/* 4. MAIN ENQUIRY FORM + LIVE ESTIMATOR */}
        <div id="form" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start scroll-mt-24">
          
          {/* Left Panel: Form Enquire Card */}
          <div className="lg:col-span-7 bg-white border border-sand rounded-[2rem] p-8 md:p-10 shadow-sm flex flex-col gap-6 text-left">
            <div className="flex flex-col gap-1 pb-4 border-b border-sand">
              <span className="text-xs font-black text-indigo uppercase tracking-wider">Interactive Enquire Form</span>
              <h2 className="text-2xl font-serif font-black text-charcoal">Submit Relocation Enquiry</h2>
            </div>

            <AnimatePresence mode="wait">
              {!isSuccess ? (
                <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-xs font-semibold text-charcoal">
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Destination City */}
                    <div className="flex flex-col gap-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Target Destination City *</span>
                      </label>
                      <select
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer focus:border-indigo transition-colors"
                      >
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </div>

                    {/* Move Timeline */}
                    <div className="flex flex-col gap-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-terracotta" />
                        <span>Expected Move-In Date *</span>
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.moveInDate}
                        onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none cursor-pointer focus:border-indigo transition-colors"
                      />
                    </div>

                    {/* BHK specifications */}
                    <div className="flex flex-col gap-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <BedDouble className="w-3.5 h-3.5 text-teal-500" />
                        <span>Required Layout BHK *</span>
                      </label>
                      <select
                        value={formData.bhk}
                        onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer focus:border-indigo transition-colors"
                      >
                        {BHK_PREFERENCES.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Budget limit */}
                    <div className="flex flex-col gap-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <Briefcase className="w-3.5 h-3.5 text-amber-500" />
                        <span>Monthly Budget Limit *</span>
                      </label>
                      <select
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 outline-none cursor-pointer focus:border-indigo transition-colors"
                      >
                        {BUDGET_OPTIONS.map((b) => (
                          <option key={b} value={b}>{b}</option>
                        ))}
                      </select>
                    </div>

                    {/* Neighborhood focus */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-blue-500" />
                        <span>Neighborhood Localities</span>
                      </label>
                      <input
                        type="text"
                        value={localAreas}
                        onChange={(e) => setLocalAreas(e.target.value)}
                        placeholder="e.g. Panchwati, C-Scheme, Shastri Nagar (comma separated)"
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-3 text-xs font-semibold focus:outline-none focus:border-indigo transition-colors"
                      />
                    </div>

                    {/* Family size */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-blue-500" />
                        <span>Family Size (Persons) *</span>
                      </label>
                      <input
                        type="number"
                        required
                        min={1}
                        value={formData.familySize}
                        onChange={(e) => setFormData({ ...formData, familySize: parseInt(e.target.value) || 1 })}
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo transition-colors"
                      />
                    </div>

                    {/* Notes */}
                    <div className="flex flex-col gap-2 sm:col-span-2">
                      <label className="text-charcoal/70 font-black uppercase tracking-wider flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>Additional Sourcing Constraints / Notes</span>
                      </label>
                      <textarea
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Vaastu directives, specific school/highway proximities, parking needs, etc."
                        className="bg-slate-50 border border-slate-200 text-slate-900 rounded-xl px-3.5 py-2.5 text-xs font-medium focus:outline-none resize-none placeholder-slate-400 focus:border-indigo transition-colors"
                      />
                    </div>
                  </div>

                  {/* Contact details */}
                  <div className="border-t border-sand pt-6 mt-2 flex flex-col gap-4">
                    <h3 className="font-serif font-black text-sm text-indigo">Your Contact Information</h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Name */}
                      <div className="relative">
                        <input
                          type="text"
                          required
                          placeholder="Your Full Name *"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo text-slate-900 font-bold transition-colors"
                        />
                        <User className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>

                      {/* Phone */}
                      <div className="relative">
                        <input
                          type="tel"
                          required
                          placeholder="Your Mobile Number *"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo text-slate-900 font-bold transition-colors"
                        />
                        <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>

                      {/* Email */}
                      <div className="relative sm:col-span-2">
                        <input
                          type="email"
                          required
                          placeholder="Your Email Address *"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-indigo text-slate-900 font-bold transition-colors"
                        />
                        <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>

                    {/* Vetting checklist terms checkbox */}
                    <div className="flex items-start gap-2.5 text-xs font-semibold select-none cursor-pointer mt-2">
                      <input
                        id="agreeToAssistanceTerms"
                        type="checkbox"
                        required
                        checked={agreeToAssistanceTerms}
                        onChange={(e) => setAgreeToAssistanceTerms(e.target.checked)}
                        className="mt-0.5 w-4 h-4 accent-terracotta shrink-0 cursor-pointer"
                      />
                      <label htmlFor="agreeToAssistanceTerms" className="cursor-pointer leading-tight text-left text-charcoal/70 font-medium">
                        I authorize Sun Valley Sourcing leads to audit RERA details, coordinate local inspectors, and agree to Sourcing Escrow policies. *
                      </label>
                    </div>
                  </div>

                  {/* Sourcing Escrow Notice info box */}
                  <div className="p-4 rounded-xl bg-indigo/5 border border-indigo/10 text-left text-[11px] font-semibold text-charcoal/70 flex flex-col gap-1 leading-relaxed">
                    <span className="text-[9px] font-black text-indigo uppercase tracking-wider block">Concierge Safe Lock Escrow</span>
                    <p className="text-charcoal/65 font-medium text-[10.5px]">
                      Your security deposit and token capital are safely locked in partner escrow setups, disbursed strictly after successful key handover and audited landlord agreements.
                    </p>
                  </div>

                  {/* Form Error Banner */}
                  {formError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 text-[11px] font-bold flex items-center gap-2 animate-fade-in">
                      <Info className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting || !agreeToAssistanceTerms}
                    className="w-full py-4 rounded-xl bg-indigo hover:bg-indigo/90 text-white font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-50 disabled:pointer-events-none cursor-pointer shadow-lg shadow-indigo/25 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Registering Sourcing...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Sourcing Request</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              ) : (
                /* SUCCESS DOSSIER SCREEN STATE */
                <motion.div
                  key="assistance-success"
                  initial={{ scale: 0.96, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="p-6 text-center flex flex-col gap-6"
                >
                  <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-500 mx-auto shadow-inner">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  
                  <div>
                    <h2 className="font-serif font-black text-2xl text-indigo mb-1.5">Relocation Sourcing Registered</h2>
                    <p className="text-xs text-charcoal/50 font-bold max-w-sm mx-auto leading-relaxed">
                      Your requirements have been successfully logged under priority sourcing! An agent is matching active RERA listings.
                    </p>
                  </div>

                  {/* Sourcing Summary */}
                  <div className="grid grid-cols-2 gap-3 bg-[#faf8f5]/80 border border-sand p-5 rounded-2xl text-left text-xs font-semibold text-charcoal/70">
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Destination City</span>
                      <span className="text-indigo font-bold text-sm mt-0.5">{formData.city}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Configuration Layout</span>
                      <span className="text-indigo font-bold text-sm mt-0.5">{formData.bhk}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Budget Boundary</span>
                      <span className="text-indigo font-bold text-sm mt-0.5">{formData.budget}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-extrabold text-charcoal/40 uppercase">Move Date</span>
                      <span className="text-indigo font-bold text-sm mt-0.5">{formData.moveInDate}</span>
                    </div>
                  </div>

                  {/* Assigned Sourcing Agent box */}
                  <div className="rounded-2xl border border-sand bg-[#faf8f5] p-5 flex items-center gap-4 text-left shadow-sm">
                    <div className="w-12 h-12 rounded-xl bg-indigo text-white flex items-center justify-center font-serif font-black text-base flex-shrink-0">
                      VS
                    </div>
                    <div className="flex-1">
                      <span className="text-[9px] font-extrabold text-charcoal/40 uppercase block">Concierge Sourcing Agent</span>
                      <span className="font-serif font-black text-sm text-indigo mt-0.5 block">Vikram Singh Rathore</span>
                      <span className="text-xs text-charcoal/50 font-bold block">Rajasthan Relocation Lead</span>
                    </div>
                    <a
                      href="tel:+919876543210"
                      className="w-11 h-11 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-all flex-shrink-0"
                    >
                      <PhoneCall className="w-4.5 h-4.5" />
                    </a>
                  </div>

                  {/* Back Navigation buttons */}
                  <div className="flex flex-col sm:flex-row gap-3 w-full justify-center mt-2">
                    <Link
                      href="/listings"
                      className="px-6 py-3 bg-indigo hover:bg-indigo/90 text-white font-bold text-xs rounded-xl shadow-sm transition-colors text-center flex-1"
                    >
                      Browse Available Properties
                    </Link>
                    <Link
                      href="/"
                      className="px-6 py-3 border border-sand bg-white text-charcoal font-bold text-xs rounded-xl hover:bg-sand/15 transition-colors text-center flex-1"
                    >
                      Go to Homepage
                    </Link>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Right Panel: Cost Estimator & Sourcing Live Feed */}
          <div className="lg:col-span-5 flex flex-col gap-6 lg:sticky lg:top-32">
            
            {/* Relocation Budget Cost Estimator widget */}
            <div className="bg-[#faf8f5] border border-sand rounded-[2rem] p-6 text-left shadow-sm flex flex-col gap-4">
              <h3 className="font-serif font-black text-sm text-indigo pb-2.5 border-b border-sand flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-terracotta" />
                <span>Transition Cost Estimator</span>
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
                  <span className="text-charcoal/50">Sourcing & Vetting Fee:</span>
                  <span className="font-extrabold text-emerald-600 text-right">₹0 (Concierge Member Benefit)</span>
                </div>
                <div className="text-[10px] text-charcoal/40 font-semibold leading-relaxed bg-white/60 p-2.5 rounded-lg border border-sand/30">
                  💡 Estimates are dynamically computed based on average regional packing tariffs and local rental security norms.
                </div>
              </div>
            </div>

            {/* Live active feeds */}
            <div className="bg-white border border-sand rounded-[2rem] p-6 text-left shadow-sm flex flex-col gap-4">
              <h3 className="font-serif font-black text-sm text-indigo pb-2.5 border-b border-sand flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-500" />
                <span>Active Relocations Sourced</span>
              </h3>
              
              <div className="flex flex-col gap-3">
                {[
                  { name: "Rohan M. (Mumbai &rarr; Jaipur)", type: "3 BHK Apartment", status: "Agent Assigned" },
                  { name: "Priya S. (Ahmedabad &rarr; Udaipur)", type: "2 BHK Villa", status: "Vetting Listings" },
                  { name: "Vikram K. (Delhi NCR &rarr; Jodhpur)", type: "4 BHK Bungalow", status: "Deals Done" }
                ].map((move, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs border-b border-sand/30 pb-2.5 last:border-0 last:pb-0 font-semibold text-charcoal/70">
                    <div className="flex flex-col text-left max-w-[70%]">
                      <span className="font-black text-indigo truncate">{move.name}</span>
                      <span className="text-[9px] text-charcoal/45 mt-0.5">{move.type}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase ${
                      move.status === "Deals Done"
                        ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                        : move.status === "Vetting Listings"
                        ? "bg-blue-50 text-blue-600 border border-blue-100"
                        : "bg-amber-50 text-amber-600 border border-amber-100"
                    }`}>
                      {move.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Coordinator Lead office info card */}
            <div className="bg-white border border-sand rounded-[2rem] p-6 text-left shadow-sm flex flex-col gap-3.5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center flex-shrink-0">
                  <Users className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Concierge Sourcing Manager</span>
                  <span className="text-xs font-black text-indigo">Vikram Singh Rathore</span>
                </div>
              </div>
              <p className="text-[11px] text-charcoal/60 leading-relaxed font-semibold">
                Need details regarding corporate office relocation services, commercial transitions, or heavy freight warehousing?
              </p>
              <a
                href="tel:+919876543210"
                className="w-full py-2.5 rounded-xl border border-sand hover:border-terracotta/35 text-indigo hover:text-terracotta flex items-center justify-center gap-2 text-xs font-black transition-all shadow-sm bg-white"
              >
                <PhoneCall className="w-4 h-4 text-terracotta" />
                <span>Call Concierge Lead Office</span>
              </a>
            </div>

          </div>
        </div>

        {/* 5. FREQUENTLY ASKED QUESTIONS (FAQ) Accordions */}
        <div className="flex flex-col gap-6 mt-6 max-w-4xl mx-auto w-full">
          <div className="text-center mb-4">
            <h2 className="text-xl font-serif font-black text-indigo flex items-center justify-center gap-2">
              <HelpCircle className="w-5.5 h-5.5 text-terracotta animate-pulse" />
              <span>Frequently Asked Questions</span>
            </h2>
            <p className="text-xs text-charcoal/40 font-black uppercase tracking-widest mt-1.5">Common relocation concerns answered</p>
          </div>

          <div className="flex flex-col gap-4">
            {FAQS.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div 
                  key={idx} 
                  className="bg-white border border-sand rounded-2xl overflow-hidden transition-all shadow-sm"
                >
                  <button 
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 flex items-center justify-between text-left font-serif font-black text-sm text-indigo hover:bg-[#faf8f5]/40 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-charcoal/40 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                  </button>
                  
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-sand/40 text-xs font-semibold text-charcoal/60 leading-relaxed">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </main>
  );
}

export default function GetAssistancePage() {
  return (
    <Suspense fallback={<div className="flex-1 flex items-center justify-center py-20 bg-cream/30"><div className="w-8 h-8 rounded-full border-2 border-indigo border-t-transparent animate-spin"></div></div>}>
      <GetAssistanceContent />
    </Suspense>
  );
}

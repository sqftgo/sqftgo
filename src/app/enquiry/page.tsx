"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useApp, GeneralEnquiry } from "@/context/AppContext";
import { 
  User, 
  MapPin, 
  Home, 
  Briefcase, 
  Mail, 
  Phone, 
  FileText, 
  Send, 
  CheckCircle2, 
  Search,
  Trash2,
  Clock,
  Layers,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  Database,
  SlidersHorizontal
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

const PROPERTY_TYPES = [
  "Home", "Villa", "Hotel", "Agricultural Land", "Apartment", 
  "Office Space", "Commercial Space", "Shop", "Industrial Plot"
];

const BHK_PREFERENCES = ["1 BHK", "2 BHK", "3 BHK", "4+ BHK", "Not Applicable"];
const FURNISHING_PREFERENCES = ["Fully Furnished", "Semi-Furnished", "Unfurnished", "Not Applicable"];
const URGENCY_OPTIONS = [
  "Immediate (Within 15 days)",
  "Urgent (Within 1 month)",
  "Flexible (1-3 months)",
  "Just Sourcing (3+ months)"
];

export default function EnquiryPage() {
  const { addGeneralEnquiry, enquiries, properties, selectedCity } = useApp();
  
  // Tab Management: "form" | "feed"
  const [activeTab, setActiveTab] = useState<"form" | "feed">("form");
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    city: selectedCity,
    propertyType: PROPERTY_TYPES[0],
    bhk: BHK_PREFERENCES[2],
    furnishing: FURNISHING_PREFERENCES[1],
    budget: "",
    email: "",
    mobile: "",
    urgency: URGENCY_OPTIONS[1],
    remarks: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Live feed state
  const [localEnquiries, setLocalEnquiries] = useState<GeneralEnquiry[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCity, setFilterCity] = useState("All");

  // Sync global enquiries into local state for interactive session management
  useEffect(() => {
    setLocalEnquiries(enquiries);
  }, [enquiries]);

  // Sync default city selection
  useEffect(() => {
    setFormData((prev) => ({ ...prev, city: selectedCity }));
  }, [selectedCity]);

  // Multi-step validation helpers
  const isStep1Valid = () => {
    return formData.city && formData.propertyType && formData.budget.trim().length > 0;
  };

  const isStep2Valid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return formData.name.trim().length >= 3 && 
           emailRegex.test(formData.email) && 
           formData.mobile.trim().length >= 8;
  };

  const isStep3Valid = () => {
    return formData.remarks.trim().length >= 10;
  };

  const handleNext = () => {
    if (step === 1 && isStep1Valid()) setStep(2);
    else if (step === 2 && isStep2Valid()) setStep(3);
  };

  const handlePrev = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStep1Valid() || !isStep2Valid() || !isStep3Valid()) return;

    setIsSubmitting(true);

    const fullRemarks = `[Urgency: ${formData.urgency}] [BHK: ${formData.bhk}] [Furnishing: ${formData.furnishing}] ${formData.remarks}`;

    setTimeout(() => {
      addGeneralEnquiry({
        name: formData.name,
        city: formData.city,
        propertyType: formData.propertyType,
        budget: formData.budget,
        email: formData.email,
        mobile: formData.mobile,
        remarks: fullRemarks
      });
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 1200);
  };

  const handleReset = () => {
    setIsSuccess(false);
    setStep(1);
    setFormData({
      name: "",
      city: selectedCity,
      propertyType: PROPERTY_TYPES[0],
      bhk: BHK_PREFERENCES[2],
      furnishing: FURNISHING_PREFERENCES[1],
      budget: "",
      email: "",
      mobile: "",
      urgency: URGENCY_OPTIONS[1],
      remarks: ""
    });
  };

  const handleRevoke = (id: string) => {
    setLocalEnquiries((prev) => prev.filter((enq) => enq.id !== id));
  };

  // Helper to count direct catalog matches
  const getMatchingPropertiesCount = (city: string, type: string) => {
    return properties.filter(
      (p) => p.city.toLowerCase() === city.toLowerCase() && 
             p.type.toLowerCase() === type.toLowerCase() &&
             p.status === "Active"
    ).length;
  };

  // Filtered live feed
  const filteredEnquiries = localEnquiries.filter((enq) => {
    const matchesSearch = enq.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          enq.remarks.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          enq.propertyType.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCity = filterCity === "All" || enq.city.toLowerCase() === filterCity.toLowerCase();
    return matchesSearch && matchesCity;
  });

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-5xl pb-20 pt-6">
      
      {/* Top Banner & Stats Row */}
      <div className="w-full rounded-3xl bg-cream/90 border border-sand p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden text-left">
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-terracotta bg-terracotta/5 border border-terracotta/10 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-terracotta animate-ping" />
            <span>Broadcasting Live</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
            Broker Sourcing Hub
          </h1>
          <p className="text-charcoal/70 text-xs font-semibold">
            Post your requirements or monitor active buyer requests in real-time.
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10 border-t md:border-t-0 md:border-l border-sand pt-4 md:pt-0 md:pl-8">
          <div className="flex flex-col">
            <span className="text-2xl font-serif font-black text-indigo">{filteredEnquiries.length}</span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Active Sourcing Feed</span>
          </div>
          <div className="flex flex-col border-l border-sand pl-6">
            <span className="text-2xl font-serif font-black text-terracotta">84</span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Network Brokers</span>
          </div>
        </div>
      </div>

      {/* Main Switcher Toggle Controls */}
      <div className="flex justify-center mb-8">
        <div className="flex items-center p-1.5 bg-sand/30 border border-sand rounded-2xl relative overflow-hidden w-full max-w-md">
          <button
            onClick={() => { setActiveTab("form"); handleReset(); }}
            className={`flex-1 relative z-10 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "form" ? "text-terracotta font-black" : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            {activeTab === "form" && (
              <motion.div
                layoutId="activeEnquiryTabIndicator"
                className="absolute inset-0 bg-white border border-sand/40 rounded-xl shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Send className="w-3.5 h-3.5" />
            <span>Broadcast Requirement</span>
          </button>
          
          <button
            onClick={() => setActiveTab("feed")}
            className={`flex-1 relative z-10 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "feed" ? "text-terracotta font-black" : "text-charcoal/60 hover:text-charcoal"
            }`}
          >
            {activeTab === "feed" && (
              <motion.div
                layoutId="activeEnquiryTabIndicator"
                className="absolute inset-0 bg-white border border-sand/40 rounded-xl shadow-sm -z-10"
                transition={{ type: "spring", stiffness: 350, damping: 28 }}
              />
            )}
            <Layers className="w-3.5 h-3.5" />
            <span>Live Sourcing Feed</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="transition-all duration-300">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: FORM SECTION */}
          {activeTab === "form" && (
            <motion.div
              key="enquiry-form-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-2xl mx-auto"
            >
              {!isSuccess ? (
                <div className="bg-white/95 border border-sand rounded-3xl p-6 md:p-10 shadow-lg flex flex-col gap-6 relative">
                  
                  {/* Stepper Progress Indicator */}
                  <div className="flex items-center justify-between border-b border-sand pb-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 1 ? "bg-indigo text-white" : "bg-sand text-charcoal/50"}`}>
                        1
                      </div>
                      <span className={`text-xs font-black ${step === 1 ? "text-indigo" : "text-charcoal/40"}`}>Specs</span>
                    </div>
                    <div className="flex-1 h-px bg-sand mx-4" />
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 2 ? "bg-indigo text-white" : "bg-sand text-charcoal/50"}`}>
                        2
                      </div>
                      <span className={`text-xs font-black ${step === 2 ? "text-indigo" : "text-charcoal/40"}`}>Contact</span>
                    </div>
                    <div className="flex-1 h-px bg-sand mx-4" />
                    <div className="flex items-center gap-3">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-colors ${step >= 3 ? "bg-indigo text-white" : "bg-sand text-charcoal/50"}`}>
                        3
                      </div>
                      <span className={`text-xs font-black ${step === 3 ? "text-indigo" : "text-charcoal/40"}`}>Remarks</span>
                    </div>
                  </div>

                  {/* Form Submission Wrapper */}
                  <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    
                    {/* STEP 1: SPECIFICATIONS */}
                    {step === 1 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-5"
                      >
                        <h3 className="font-serif font-black text-lg text-indigo text-left">Target Property Specs</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-semibold">
                          {/* City */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-terracotta" />
                              <span>Target City *</span>
                            </label>
                            <select
                              value={formData.city}
                              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-terracotta"
                            >
                              {CITIES.map((c) => (
                                <option key={c} value={c}>{c}</option>
                              ))}
                            </select>
                          </div>

                          {/* Property Type */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <Home className="w-4 h-4 text-terracotta" />
                              <span>Property Type *</span>
                            </label>
                            <select
                              value={formData.propertyType}
                              onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-terracotta"
                            >
                              {PROPERTY_TYPES.map((t) => (
                                <option key={t} value={t}>{t}</option>
                              ))}
                            </select>
                          </div>

                          {/* BHK Preference (Visible if Residential) */}
                          {["Home", "Villa", "Apartment"].includes(formData.propertyType) && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-indigo flex items-center gap-1.5">
                                <Layers className="w-4 h-4 text-terracotta" />
                                <span>BHK Layout *</span>
                              </label>
                              <select
                                value={formData.bhk}
                                onChange={(e) => setFormData({ ...formData, bhk: e.target.value })}
                                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-terracotta"
                              >
                                {BHK_PREFERENCES.map((b) => (
                                  <option key={b} value={b}>{b}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Furnishing Preference */}
                          {["Home", "Villa", "Apartment", "Office Space"].includes(formData.propertyType) && (
                            <div className="flex flex-col gap-1.5 text-left">
                              <label className="text-indigo flex items-center gap-1.5">
                                <Database className="w-4 h-4 text-terracotta" />
                                <span>Furnishing Preference</span>
                              </label>
                              <select
                                value={formData.furnishing}
                                onChange={(e) => setFormData({ ...formData, furnishing: e.target.value })}
                                className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-terracotta"
                              >
                                {FURNISHING_PREFERENCES.map((f) => (
                                  <option key={f} value={f}>{f}</option>
                                ))}
                              </select>
                            </div>
                          )}

                          {/* Estimated Budget */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <Briefcase className="w-4 h-4 text-terracotta" />
                              <span>Estimated Budget *</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. ₹60 Lakhs - ₹1.2 Crore, or ₹35,000 / month"
                              value={formData.budget}
                              onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-semibold"
                            />
                            <span className="text-[10px] text-charcoal/40 font-bold block mt-1">Specify rent (per month) or purchase price limits clearly.</span>
                          </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-end mt-4">
                          <button
                            type="button"
                            disabled={!isStep1Valid()}
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-indigo text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <span>Next: Contact Details</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 2: CONTACT DETAILS */}
                    {step === 2 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-5"
                      >
                        <h3 className="font-serif font-black text-lg text-indigo text-left">Contact Information</h3>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm font-semibold">
                          {/* Name */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <User className="w-4 h-4 text-terracotta" />
                              <span>Full Name *</span>
                            </label>
                            <input
                              type="text"
                              required
                              placeholder="e.g. Vikramaditya Singh"
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-terracotta text-charcoal font-semibold"
                            />
                          </div>

                          {/* Mobile */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <Phone className="w-4 h-4 text-terracotta" />
                              <span>Mobile Number *</span>
                            </label>
                            <input
                              type="tel"
                              required
                              placeholder="e.g. +91 98290 87654"
                              value={formData.mobile}
                              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-terracotta text-charcoal font-semibold"
                            />
                          </div>

                          {/* Email */}
                          <div className="flex flex-col gap-1.5 sm:col-span-2 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <Mail className="w-4 h-4 text-terracotta" />
                              <span>Email Address *</span>
                            </label>
                            <input
                              type="email"
                              required
                              placeholder="e.g. vikram@heritage.in"
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-terracotta text-charcoal font-semibold"
                            />
                          </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-between mt-4">
                          <button
                            type="button"
                            onClick={handlePrev}
                            className="px-5 py-2.5 border border-sand bg-white text-charcoal font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-sand/10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          <button
                            type="button"
                            disabled={!isStep2Valid()}
                            onClick={handleNext}
                            className="px-6 py-2.5 bg-indigo text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                          >
                            <span>Next: Urgency & Remarks</span>
                            <ChevronRight className="w-4 h-4" />
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {/* STEP 3: REMARKS & URGENCY */}
                    {step === 3 && (
                      <motion.div
                        initial={{ opacity: 0, x: 15 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex flex-col gap-5"
                      >
                        <h3 className="font-serif font-black text-lg text-indigo text-left">Move-in Urgency & Remarks</h3>
                        
                        <div className="grid grid-cols-1 gap-5 text-sm font-semibold">
                          {/* Urgency */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <Clock className="w-4 h-4 text-terracotta" />
                              <span>Expected Sourcing Urgency *</span>
                            </label>
                            <select
                              value={formData.urgency}
                              onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm font-semibold outline-none cursor-pointer focus:border-terracotta"
                            >
                              {URGENCY_OPTIONS.map((u) => (
                                <option key={u} value={u}>{u}</option>
                              ))}
                            </select>
                          </div>

                          {/* Remarks */}
                          <div className="flex flex-col gap-1.5 text-left">
                            <label className="text-indigo flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-terracotta" />
                              <span>Sourcing Details / Remarks *</span>
                            </label>
                            <textarea
                              rows={4}
                              required
                              value={formData.remarks}
                              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                              placeholder="e.g. Sourcing coordinates. Must be Vastu compliant, east facing entry preferred. Looking closely around core city landmarks or lake view spots. Proximity to public schools is a plus..."
                              className="w-full bg-white border border-sand rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-terracotta text-charcoal font-semibold resize-none"
                            />
                            <span className="text-[10px] text-charcoal/40 font-bold block mt-1">Please provide at least 10 characters detailing your requirements.</span>
                          </div>
                        </div>

                        {/* Navigation Footer */}
                        <div className="flex justify-between mt-4">
                          <button
                            type="button"
                            onClick={handlePrev}
                            className="px-5 py-2.5 border border-sand bg-white text-charcoal font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer hover:bg-sand/10"
                          >
                            <ChevronLeft className="w-4 h-4" />
                            <span>Back</span>
                          </button>
                          
                          <button
                            type="submit"
                            disabled={isSubmitting || !isStep3Valid()}
                            className="px-6 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl text-xs flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                          >
                            {isSubmitting ? (
                              <>
                                <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                <span>Broadcasting...</span>
                              </>
                            ) : (
                              <>
                                <Send className="w-3.5 h-3.5" />
                                <span>Broadcast Sourcing Request</span>
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}

                  </form>
                </div>
              ) : (
                /* Successful Submission screen */
                <motion.div
                  key="success-box"
                  initial={{ scale: 0.95, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="max-w-xl mx-auto rounded-3xl glassmorphism border border-sand p-8 text-center shadow-lg"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                    className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 mx-auto shadow-inner"
                  >
                    <CheckCircle2 className="w-10 h-10" />
                  </motion.div>
                  
                  <h2 className="font-serif font-black text-2xl text-indigo mb-3">Enquiry Broadcasted!</h2>
                  
                  <p className="text-xs sm:text-sm text-charcoal/70 leading-relaxed mb-8">
                    Your property requirement has been successfully logged. Sourcing specialists in <span className="font-extrabold text-terracotta">{formData.city}</span> will check matchable inventory and connect with you.
                  </p>

                  <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
                    <button
                      onClick={() => setActiveTab("feed")}
                      className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-xs rounded-xl transition-colors shadow-sm cursor-pointer"
                    >
                      View Live Sourcing Feed
                    </button>
                    <button
                      onClick={handleReset}
                      className="px-6 py-3 border border-sand bg-white text-charcoal font-bold text-xs rounded-xl hover:bg-sand/20 transition-colors cursor-pointer"
                    >
                      Submit Another Requirement
                    </button>
                  </div>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* TAB 2: LIVE SOURCING FEED */}
          {activeTab === "feed" && (
            <motion.div
              key="enquiry-feed-container"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="flex flex-col gap-6"
            >
              
              {/* Sourcing Search & Filter Controls */}
              <div className="w-full flex flex-col sm:flex-row gap-4 bg-white/90 border border-sand rounded-2xl p-4 shadow-sm">
                
                {/* Search Bar */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search active requirements..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-50 border border-sand rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal"
                  />
                  <Search className="absolute left-3 top-3 w-4 h-4 text-charcoal/40" />
                </div>

                {/* City Filter */}
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-charcoal/50" />
                  <select
                    value={filterCity}
                    onChange={(e) => setFilterCity(e.target.value)}
                    className="bg-slate-50 border border-sand rounded-xl px-4 py-2 text-xs font-bold outline-none cursor-pointer focus:border-terracotta text-charcoal"
                  >
                    <option value="All">All Cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

              </div>

              {/* Feed Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredEnquiries.length > 0 ? (
                  filteredEnquiries.map((enq) => {
                    const matchedCount = getMatchingPropertiesCount(enq.city, enq.propertyType);
                    return (
                      <motion.div
                        layout
                        key={enq.id}
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="bg-white rounded-2xl border border-sand shadow-sm p-5 hover:shadow-md transition-all flex flex-col justify-between text-left relative overflow-hidden"
                      >
                        {/* Top corner details */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo/5 rounded-bl-full pointer-events-none" />
                        
                        <div>
                          {/* Card Tags Header */}
                          <div className="flex items-center justify-between mb-3.5">
                            <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider text-terracotta bg-terracotta/5 border border-terracotta/10 px-2 py-0.5 rounded-lg">
                              <MapPin className="w-3 h-3" />
                              <span>{enq.city}</span>
                            </span>
                            <span className="text-[9px] font-bold text-charcoal/40 font-mono">
                              ID: {enq.id}
                            </span>
                          </div>

                          {/* Property specifications header */}
                          <h4 className="font-serif font-black text-base text-indigo flex items-center gap-1.5">
                            <span>Sourcing: {enq.propertyType}</span>
                          </h4>

                          <div className="flex items-center gap-1.5 mt-1 text-[11px] font-bold text-charcoal/60">
                            <span className="text-terracotta">Budget Limit:</span>
                            <span className="text-indigo">{enq.budget}</span>
                          </div>

                          {/* Remarks */}
                          <p className="text-xs text-charcoal/70 leading-relaxed font-semibold border-t border-dashed border-sand/60 pt-3 mt-3.5 line-clamp-3">
                            {enq.remarks}
                          </p>
                        </div>

                        {/* Matching Properties Portal Box */}
                        <div className="mt-5 border-t border-sand/65 pt-4 flex flex-col gap-3">
                          
                          {/* Direct catalog matching rate */}
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-widest">Catalog Direct Matches</span>
                              <span className="text-xs font-black text-indigo">
                                {matchedCount > 0 ? `${matchedCount} Properties Found` : "Checking Off-Market Listings"}
                              </span>
                            </div>

                            {matchedCount > 0 && (
                              <Link
                                href={`/listings?city=${enq.city}&type=${enq.propertyType}`}
                                className="text-[10px] font-bold text-terracotta hover:text-terracotta-hover flex items-center gap-1"
                              >
                                <span>Browse Matches</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            )}
                          </div>

                          {/* Action footer */}
                          <div className="flex items-center justify-between border-t border-sand/30 pt-3 text-[10px] font-bold text-charcoal/40">
                            <span className="flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              <span>Broker Broadcast: Active</span>
                            </span>
                            
                            {/* Revoke Broadcast Button */}
                            <button
                              onClick={() => handleRevoke(enq.id)}
                              className="text-red-500 hover:text-red-700 flex items-center gap-1 cursor-pointer"
                              title="Revoke Broadcast"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Revoke</span>
                            </button>
                          </div>

                        </div>

                      </motion.div>
                    );
                  })
                ) : (
                  <div className="col-span-full py-16 text-center bg-white/70 border border-sand rounded-3xl">
                    <Database className="w-10 h-10 text-charcoal/20 mx-auto mb-3" />
                    <h4 className="font-serif font-black text-indigo text-lg">No Active Enquiries</h4>
                    <p className="text-xs text-charcoal/55 max-w-xs mx-auto mt-1">
                      We couldn&apos;t find any requirement broadcasts matching the filters.
                    </p>
                  </div>
                )}
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}

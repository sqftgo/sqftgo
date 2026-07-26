"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import type { DirectoryProfile } from "@/types";
import { 
  Building, 
  User, 
  Tag, 
  MapPin, 
  Mail, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ChevronLeft, 
  Plus,
  AlertCircle 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import CustomSelect from "@/components/ui/CustomSelect";

const CATEGORIES = [
  "Agent & Broker",
  "Builder & Developer",
  "Interior Decorator",
  "Architect",
  "Building Contractor",
  "Property Consultant",
  "Vastu Consultant",
  "Home Valuation/Inspection",
  "Home Shifting/Deep Cleaning"
];

const CITIES = [
  "Udaipur",
  "Jaipur",
  "Jodhpur",
  "Kota",
  "Bikaner",
  "Jaisalmer",
  "Rajsamand",
  "Pali",
  "Pushkar",
  "Alwar",
  "Ahmedabad",
  "Surat",
  "Gandhinagar",
  "Kutch",
  "Anand",
  "Rajkot",
  "Shimla",
  "Dharamshala",
  "Chandigarh",
  "Agra"
];

export default function RegisterServicePage() {
  const { addDirectoryProfile, isLoggedIn } = useApp();

  const [formData, setFormData] = useState<Omit<DirectoryProfile, "id">>({
    firmName: "",
    ownerName: "",
    category: CATEGORIES[0] as DirectoryProfile["category"],
    city: "Udaipur",
    address: "",
    email: "",
    website: "",
    mobile: "",
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [agreeToVettingPledge, setAgreeToVettingPledge] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToVettingPledge || isSubmitting) return;
    if (!isLoggedIn) {
      setError("Please sign in before registering your firm in the directory.");
      return;
    }
    setIsSubmitting(true);
    setError(null);
    try {
      await addDirectoryProfile(formData);
      setIsSuccess(true);
      setAgreeToVettingPledge(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to register. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-3xl pb-20 pt-6">
      
      {/* Back to directory */}
      <Link 
        href="/services" 
        className="flex items-center gap-1.5 text-xs font-bold text-charcoal/60 hover:text-terracotta mb-6 transition-colors w-fit"
      >
        <ChevronLeft className="w-4 h-4" />
        <span>Back to Directory</span>
      </Link>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.div
            key="register-form"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
          >
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-serif font-black text-indigo">
                Register Your Service Business
              </h1>
              <p className="text-sm text-charcoal/65 mt-2">
                Join our regional business network and reach thousands of homeowners looking for architects, builders, decorators, and moving services.
              </p>
            </div>

            {/* Form */}
            <form 
              onSubmit={handleSubmit}
              className="bg-white/95 border border-sand rounded-3xl p-6 md:p-8 shadow-md flex flex-col gap-6"
            >
              <h2 className="font-serif font-black text-lg text-indigo pb-2 border-b border-sand">
                Business Information
              </h2>

              {/* Credential Vetting Notice */}
              <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 text-xs text-indigo leading-relaxed flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
                <div>
                  <strong className="text-terracotta">Verification Notice:</strong> All registered profiles must upload or email supporting credentials (GST registration document, PAN, or RERA license certificate) to <span className="underline">verify@sqftgo.com</span>. Listings will remain hidden on the search feed until vetted by our verification team.
                </div>
              </div>

              <div className="flex flex-col gap-5 text-sm font-semibold">
                
                {/* Firm Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-terracotta" />
                    <span>Firm / Business Name *</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jaipur Royal Architects"
                    value={formData.firmName}
                    onChange={(e) => setFormData({ ...formData, firmName: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                  />
                </div>

                {/* Owner Name & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Owner Name */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <User className="w-4 h-4 text-terracotta" />
                      <span>Owner&apos;s Full Name *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Vikramaditya Vyas"
                      value={formData.ownerName}
                      onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>

                  {/* Category select */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-terracotta" />
                      <span>Business Category *</span>
                    </label>
                    <CustomSelect
                      options={CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
                      value={formData.category}
                      onChange={(val) => setFormData({ ...formData, category: val as DirectoryProfile["category"] })}
                      placeholder="Select Category"
                      searchable
                      buttonClassName="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal shadow-sm"
                      accent="terracotta"
                    />
                  </div>
                </div>

                {/* City & Address */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* City Selection */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      <span>City *</span>
                    </label>
                    <CustomSelect
                      options={CITIES.map((c) => ({ label: c, value: c }))}
                      value={formData.city}
                      onChange={(val) => setFormData({ ...formData, city: val })}
                      placeholder="Select City"
                      searchable
                      buttonClassName="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm font-semibold text-charcoal shadow-sm"
                      accent="terracotta"
                    />
                  </div>
                  
                  {/* Address */}
                  <div className="md:col-span-2 flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-terracotta" />
                      <span>Business Address *</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Sector 11, Hiran Magri, Udaipur, Rajasthan"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>
                </div>

                {/* Email & Mobile */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Email */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-terracotta" />
                      <span>Email Address *</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="contact@jaipurarchitects.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>

                  {/* Mobile */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-indigo flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-terracotta" />
                      <span>Contact Mobile *</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +91 94140 12345"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium"
                    />
                  </div>
                </div>

                {/* Work Description */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-terracotta" />
                    <span>Work Description *</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Provide a comprehensive description of the services, styles, project capacities, and past works your firm manages..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-terracotta text-charcoal font-medium resize-none"
                  />
                </div>

              </div>

              {/* Vetting Pledge Checkbox */}
              <div className="flex items-start gap-2.5 text-xs font-semibold select-none cursor-pointer mt-1">
                <input
                  id="agreeToVettingPledge"
                  type="checkbox"
                  required
                  checked={agreeToVettingPledge}
                  onChange={(e) => setAgreeToVettingPledge(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-terracotta shrink-0 cursor-pointer"
                />
                <label htmlFor="agreeToVettingPledge" className="cursor-pointer leading-tight text-left text-charcoal/70">
                  I pledge that all provided business credentials are legally accurate and agree to submit matching verification proofs to the SqftGo vetting coordinators. *
                </label>
              </div>

              {error ? (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              ) : null}

              {/* Submit button */}
              <button
                type="submit"
                disabled={isSubmitting || !agreeToVettingPledge}
                className="mt-2 py-3 w-full bg-indigo hover:bg-indigo-hover text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-55 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Registering Firm...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4.5 h-4.5" />
                    <span>Save Directory Profile</span>
                  </>
                )}
              </button>

            </form>
          </motion.div>
        ) : (
          <motion.div
            key="register-success"
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="max-w-xl mx-auto rounded-3xl glassmorphism border border-sand p-10 text-center shadow-2xl mt-12"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-6 mx-auto shadow-inner"
            >
              <CheckCircle2 className="w-10 h-10" />
            </motion.div>
            
            <h2 className="font-serif font-black text-2xl text-indigo mb-3">Firm Registered Successfully!</h2>
            
            <p className="text-sm text-charcoal/70 leading-relaxed mb-8">
              Your profile for <span className="font-extrabold text-terracotta">{formData.firmName}</span> has been saved to the professional services network. Homeowners can now filter and view your profile details.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 w-full justify-center">
              <Link
                href="/services"
                className="px-6 py-3 bg-indigo hover:bg-indigo-hover text-white font-bold text-sm rounded-xl transition-colors shadow-sm"
              >
                Go to Services Directory
              </Link>
              <Link
                href="/"
                className="px-6 py-3 border border-sand bg-white text-charcoal font-bold text-sm rounded-xl hover:bg-sand/20 transition-colors"
              >
                Return to Homepage
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

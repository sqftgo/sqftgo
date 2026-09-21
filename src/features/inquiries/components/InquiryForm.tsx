"use client";

import React, { useState, useEffect } from "react";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import {
  Send,
  CheckCircle2,
  User,
  Mail,
  Phone,
  ShieldAlert,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryFormProps {
  property: Property;
  /** Called after a successful inquiry submit (e.g. close a parent modal). */
  onSuccess?: () => void;
}

const DEFAULT_MESSAGE =
  "Hi, I am interested in this property and would like to receive more details. Please contact me.";

const QUICK_PRESETS = [
  { id: "visit", label: "Site Visit", text: "Hi, I would like to schedule a physical site visit for this property. What time works best?" },
  { id: "price", label: "Is Price Negotiable?", text: "Hi, I am interested in this property. Is the asking price negotiable?" },
  { id: "video", label: "Send Video Tour", text: "Hi, could you please share a video walkthrough or recent photos of the property?" },
  { id: "docs", label: "Share Deed Docs", text: "Hi, could you share the title deed status and RERA verification documents for this property?" },
];

export const InquiryForm: React.FC<InquiryFormProps> = ({
  property,
  onSuccess,
}) => {
  const { submitInquiry } = useApp();
  const { userName, userEmail, userProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: DEFAULT_MESSAGE,
  });

  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTrustTerms, setAgreeToTrustTerms] = useState(true);

  // Autofill user details
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      name: prev.name || userName || "",
      email: prev.email || userEmail || "",
      phone: prev.phone || userProfile?.phone || "",
    }));
  }, [userName, userEmail, userProfile]);


  const handleSelectPreset = (preset: typeof QUICK_PRESETS[0]) => {
    setActivePreset(preset.id);
    setFormData((prev) => ({
      ...prev,
      message: preset.text,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTrustTerms || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await submitInquiry(property.id, {
        name: formData.name.trim() || userName || formData.email.trim(),
        email: userEmail || formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      setIsSuccess(true);
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-sand shadow-lg flex flex-col relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-terracotta/5 rounded-full blur-[50px] pointer-events-none" />


      {/* Inquiry Form Section */}
      <div className="p-5 sm:p-6 relative z-10">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-serif font-black text-base text-indigo">Send Message</h3>
          <span className="text-[10px] font-bold text-charcoal/50 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Direct Connect
          </span>
        </div>
        <p className="text-xs text-charcoal/50 mb-4">Request callback, arrange a physical viewing or get brochure.</p>

        {/* Quick presets */}
        <div className="mb-4">
          <label className="block text-[10px] font-black uppercase tracking-wider text-charcoal/50 mb-1.5">
            Quick Inquiries
          </label>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_PRESETS.map((preset) => (
              <button
                key={preset.id}
                type="button"
                onClick={() => handleSelectPreset(preset)}
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${activePreset === preset.id
                  ? "bg-terracotta text-white border-terracotta shadow-xs"
                  : "bg-sand/20 hover:bg-sand/40 border-sand text-charcoal/80"
                  }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5 text-xs"
            >
              {/* Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="inquiryName" className="font-bold text-indigo text-[11px]">
                  Full Name <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-charcoal/40" />
                  <input
                    id="inquiryName"
                    type="text"
                    required
                    placeholder="e.g. Rahul Sharma"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs shadow-xs"
                  />
                </div>
              </div>

              {/* Phone & Email in 2 columns on larger screens */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label htmlFor="inquiryPhone" className="font-bold text-indigo text-[11px]">
                    Phone <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-charcoal/40" />
                    <input
                      id="inquiryPhone"
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs shadow-xs"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label htmlFor="inquiryEmail" className="font-bold text-indigo text-[11px]">
                    Email Address <span className="text-terracotta">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-2.5 w-4 h-4 text-charcoal/40" />
                    <input
                      id="inquiryEmail"
                      type="email"
                      required
                      placeholder="rahul@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-sand rounded-xl py-2 pl-9 pr-3 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs shadow-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="flex flex-col gap-1">
                <label htmlFor="inquiryMessage" className="font-bold text-indigo text-[11px]">
                  Message <span className="text-terracotta">*</span>
                </label>
                <div className="relative">
                  <textarea
                    id="inquiryMessage"
                    rows={3}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-white border border-sand rounded-xl p-2.5 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs resize-none shadow-xs"
                  />
                </div>
              </div>

              {/* Vetting Disclaimer */}
              <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-[10.5px] text-amber-950 leading-relaxed flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>SqftGo Guarantee:</strong> 100% Direct Owner connect with verified records. Never pay advance token money without physical premise inspection.
                </span>
              </div>

              {/* Vetting Consent Checkbox */}
              <div className="flex items-start gap-2 text-[11px] text-charcoal/75 font-semibold select-none cursor-pointer">
                <input
                  id="agreeToTrustTerms"
                  type="checkbox"
                  required
                  checked={agreeToTrustTerms}
                  onChange={(e) => setAgreeToTrustTerms(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 accent-terracotta shrink-0 cursor-pointer"
                />
                <label htmlFor="agreeToTrustTerms" className="cursor-pointer leading-tight text-left">
                  I agree to verify credentials and authorize direct owner contact.
                </label>
              </div>

              {error ? (
                <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              ) : null}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting || !agreeToTrustTerms}
                className="mt-1 w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Sending inquiry...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center justify-center text-center py-6"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-black text-base text-indigo mb-1">Inquiry Submitted!</h4>
              <p className="text-xs text-charcoal/60 max-w-[240px] leading-relaxed mb-4">
                Your message has been sent to {property.ownerName}. They will get in touch shortly.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-4 py-2 border border-sand rounded-xl text-xs font-bold text-charcoal hover:bg-sand/30 transition-colors"
              >
                Send another message
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default InquiryForm;

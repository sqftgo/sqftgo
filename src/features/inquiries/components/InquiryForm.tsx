"use client";

import React, { useState, useEffect } from "react";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { formatIndianCurrency } from "@/lib/format";
import { 
  Send, 
  CheckCircle2, 
  User, 
  Mail, 
  Phone, 
  ShieldAlert, 
  Sparkles,
  BadgeCheck,
  CheckCircle
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";

interface InquiryFormProps {
  property: Property;
  /** Called after a successful inquiry submit (e.g. close a parent modal). */
  onSuccess?: () => void;
}

const DEFAULT_MESSAGE =
  "Hi, I am interested in this property and would like to receive more details. Please contact me.";

const QUICK_PRESETS = [
  { id: "visit", label: "📅 Site Visit", text: "Hi, I would like to schedule a physical site visit for this property. What time works best?" },
  { id: "price", label: "💰 Is Price Negotiable?", text: "Hi, I am interested in this property. Is the asking price negotiable?" },
  { id: "video", label: "📹 Send Video Tour", text: "Hi, could you please share a video walkthrough or recent photos of the property?" },
  { id: "docs", label: "📜 Share Deed Docs", text: "Hi, could you share the title deed status and RERA verification documents for this property?" },
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

  const rawPhone = property.ownerPhone || "9876543210";
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const whatsappPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  const whatsappMessage = encodeURIComponent(
    `Hi ${property.ownerName}, I found your listing "${property.title}" (${formatIndianCurrency(property.price, property.purpose)}) on SqftGo. Is it still available for discussion?`
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

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

      {/* Owner Profile Header */}
      <div className="p-5 sm:p-6 pb-4 flex flex-col gap-4 relative z-10 border-b border-sand/60 bg-cream/30">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative">
              <Avatar
                name={property.ownerName}
                size="md"
                tone="indigo"
                className="w-12 h-12 text-lg shadow-md ring-2 ring-indigo/20 bg-indigo text-white"
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-xs">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1">
                <span className="font-black text-base text-indigo tracking-tight">
                  {property.ownerName}
                </span>
                <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest mt-0.5">
                Verified Owner
              </span>
            </div>
          </div>

          <span className="text-xs font-serif font-black text-terracotta bg-terracotta/10 px-2.5 py-1 rounded-lg border border-terracotta/20">
            {formatIndianCurrency(property.price, property.purpose)}
          </span>
        </div>
        
        {/* Quick Action Channels */}
        <div className="grid grid-cols-2 gap-2 text-xs font-bold">
          <a 
            href={whatsappUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition-all shadow-xs"
          >
            <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.778.978-.954 1.178-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.084-.175-.3-.019-.462.132-.612.136-.135.301-.35.452-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.678-1.636-.93-2.242-.244-.589-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.3-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.2 2.122 3.24 5.14 4.542.718.31 1.278.495 1.716.634.721.23 1.378.198 1.9.12.58-.088 1.78-.727 2.03-1.43.251-.703.251-1.306.176-1.43-.075-.125-.276-.2-.577-.35zM12.04 21.785c-1.85 0-3.664-.498-5.263-1.442l-.377-.224-3.916 1.027 1.045-3.817-.247-.393A9.878 9.878 0 012.16 12.04C2.16 6.594 6.594 2.16 12.04 2.16s9.88 4.434 9.88 9.88-4.434 9.745-9.88 9.745zm0-18.04c-4.555 0-8.26 3.705-8.26 8.26 0 1.597.46 3.136 1.332 4.464l.206.314-.62 2.268 2.325-.61.304.181a8.232 8.232 0 004.713 1.443c4.555 0 8.26-3.705 8.26-8.26s-3.705-8.06-8.26-8.06z" />
            </svg>
            <span>WhatsApp</span>
          </a>

          <a 
            href={`tel:${rawPhone}`} 
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo hover:bg-indigo-hover text-white transition-all shadow-xs"
          >
            <Phone className="w-3.5 h-3.5 shrink-0" />
            <span>Call Owner</span>
          </a>
        </div>
      </div>

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
                className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition-all cursor-pointer ${
                  activePreset === preset.id
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

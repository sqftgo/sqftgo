"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  X,
  Phone,
  Mail,
  User,
  Send,
  CheckCircle2,
  ShieldCheck,
  MapPin,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { usePublicPlatformSettings } from "@/hooks/usePublicPlatformSettings";
import { companyWhatsappUrl } from "@/lib/contact/company-whatsapp";
import { formatIndianCurrency } from "@/lib/format";

interface ContactOwnerModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
}

export function ContactOwnerModal({
  property,
  open,
  onClose,
}: ContactOwnerModalProps) {
  const { submitInquiry } = useApp();
  const { userName, userEmail, userProfile } = useAuth();
  const settings = usePublicPlatformSettings();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTrustTerms, setAgreeToTrustTerms] = useState(true);

  // Autofill user details and default message accurately based on present property data
  useEffect(() => {
    if (open && property) {
      const defaultMsg = `Hi SqftGo, I am interested in "${property.title}" in ${property.locality}, ${property.city} (${formatIndianCurrency(property.price, property.purpose)}). Please contact me with more details.`;
      
      setFormData({
        name: userName || "",
        email: userEmail || "",
        phone: userProfile?.phone || "",
        message: defaultMsg,
      });
      setIsSuccess(false);
      setError(null);
    }
  }, [open, property, userName, userEmail, userProfile]);

  // Keyboard accessibility and body scroll lock
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!property) return null;

  const whatsappUrl = companyWhatsappUrl(
    `Hi SqftGo, I found "${property.title}" (${formatIndianCurrency(property.price, property.purpose)}) in ${property.locality}, ${property.city}. Is it still available?`,
    settings.supportPhone
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTrustTerms || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    try {
      await submitInquiry(property.id, {
        name: formData.name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        message: formData.message.trim(),
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroImage = property.images && property.images.length > 0 ? property.images[0] : "/indian_heritage_hero_bg.png";

  return (
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          {/* Animated Dark Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-charcoal/65 backdrop-blur-md cursor-pointer"
            onClick={onClose}
          />

          {/* Modal Container - Wide 2-Column Single Frame Popup */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`Contact owner for ${property.title}`}
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0,
              transition: {
                type: "spring",
                stiffness: 320,
                damping: 28,
              },
            }}
            exit={{
              opacity: 0,
              scale: 0.96,
              y: 12,
              transition: { duration: 0.2, ease: "easeInOut" },
            }}
            className="relative z-10 w-full max-w-4xl my-auto bg-white rounded-3xl shadow-2xl overflow-hidden border border-sand/80 flex flex-col md:flex-row max-h-[90vh] md:max-h-[560px]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* LEFT COLUMN: Property Snapshot & Verified Owner Quick Connect */}
            <div className="w-full md:w-[44%] bg-cream/40 border-b md:border-b-0 md:border-r border-sand/70 flex flex-col justify-between overflow-hidden">
              {/* Property Image Banner */}
              <div className="relative h-44 sm:h-48 md:h-52 w-full shrink-0 overflow-hidden bg-charcoal">
                <Image
                  src={heroImage}
                  alt={property.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 420px"
                  className="object-cover opacity-75 scale-105"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/50 to-charcoal/20 pointer-events-none" />

                {/* Top Badges */}
                <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5">
                  <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-terracotta text-white shadow-xs">
                    {property.purpose === "buy" || property.purpose === "sell"
                      ? "For Sale"
                      : property.purpose === "rent"
                        ? "For Rent"
                        : "For Lease"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/20 backdrop-blur-md text-white border border-white/30">
                    {property.type}
                  </span>
                  {property.reraApproved && (
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-xs">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{property.reraId ? `RERA: ${property.reraId}` : "RERA Verified"}</span>
                    </span>
                  )}
                </div>

                {/* Bottom Snapshot Details */}
                <div className="absolute bottom-3 inset-x-3 z-10 text-white">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0 pr-2">
                      <h2 className="font-serif font-black text-base md:text-lg text-white line-clamp-1 drop-shadow-sm">
                        {property.title}
                      </h2>
                      <div className="flex items-center gap-1.5 text-[11px] text-white/85 font-medium mt-0.5">
                        <MapPin className="w-3 h-3 text-terracotta-soft shrink-0" />
                        <span className="truncate">{property.locality}, {property.city}</span>
                        {property.bhk ? (
                          <>
                            <span className="text-white/40">•</span>
                            <span className="font-bold">{property.bhk} BHK</span>
                          </>
                        ) : null}
                        {property.size ? (
                          <>
                            <span className="text-white/40">•</span>
                            <span>{property.size} SQFT</span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="text-[9px] uppercase tracking-widest text-white/60 font-black block">
                        Guide Price
                      </span>
                      <span className="text-base md:text-lg font-serif font-black text-gold-soft drop-shadow-xs">
                        {formatIndianCurrency(property.price, property.purpose)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 flex-1">
                <div className="bg-white rounded-2xl p-3.5 border border-sand shadow-xs">
                  <p className="text-sm font-black text-indigo">Talk to SqftGo</p>
                  <p className="mt-1 text-xs font-semibold text-charcoal/60 leading-relaxed">
                    Dealer phone numbers stay private. Message the SqftGo team on WhatsApp and we will connect you.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 flex items-center justify-center gap-1.5 py-2.5 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold"
                  >
                    WhatsApp SqftGo
                  </a>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[10.5px] text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="leading-tight">
                    SqftGo handles the introduction. The listing owner is not contacted directly from this page.
                  </span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Streamlined Single Frame Inquiry Form */}
            <div className="w-full md:w-[56%] p-5 sm:p-6 flex flex-col justify-between bg-white relative">
              {/* Close Button Top Right */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="absolute top-3.5 right-3.5 z-20 p-1.5 rounded-full bg-sand/30 hover:bg-sand/70 text-charcoal/70 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <AnimatePresence mode="wait">
                {isSuccess ? (
                  <motion.div
                    key="success-screen"
                    initial={{ opacity: 0, scale: 0.92 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.92 }}
                    className="py-8 my-auto text-center flex flex-col items-center gap-3"
                  >
                    <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                      <CheckCircle2 className="w-8 h-8 animate-bounce" />
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Inquiry Transmitted
                      </span>
                      <h3 className="text-lg sm:text-xl font-serif font-black text-indigo mt-1.5">
                        Message sent to SqftGo
                      </h3>
                      <p className="text-xs text-charcoal/65 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                        SqftGo has your message and will reply on WhatsApp.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-2 w-full max-w-xs mt-3">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-sm transition-all"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Chat on WhatsApp</span>
                      </a>
                      <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 px-3 rounded-xl bg-sand/40 hover:bg-sand/70 text-charcoal text-xs font-black uppercase tracking-wider transition-all cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="inquiry-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit}
                    className="flex flex-col justify-between h-full space-y-3.5"
                  >
                    {/* Header */}
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-serif font-black text-base text-indigo">
                          Send Direct Inquiry
                        </h3>
                        <span className="text-[9px] font-bold text-terracotta bg-terracotta/10 px-2 py-0.5 rounded-full">
                          Direct
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal/55 mt-0.5">
                        Inquire about price, arrange physical site visit, or request documents.
                      </p>
                    </div>

                    {/* Form Fields: 2 Columns */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Name */}
                      <div>
                        <label htmlFor="modal-name" className="block text-[11px] font-bold text-indigo mb-1">
                          Full Name <span className="text-terracotta">*</span>
                        </label>
                        <div className="relative">
                          <User className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-2.5" />
                          <input
                            id="modal-name"
                            type="text"
                            required
                            placeholder="e.g. Rahul Sharma"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full pl-8.5 pr-2.5 py-2 rounded-xl border border-sand bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none text-xs font-semibold text-charcoal placeholder:text-charcoal/30 shadow-xs"
                          />
                        </div>
                      </div>

                      {/* Phone */}
                      <div>
                        <label htmlFor="modal-phone" className="block text-[11px] font-bold text-indigo mb-1">
                          Phone Number <span className="text-terracotta">*</span>
                        </label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-2.5" />
                          <input
                            id="modal-phone"
                            type="tel"
                            required
                            placeholder="+91 98765 43210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className="w-full pl-8.5 pr-2.5 py-2 rounded-xl border border-sand bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none text-xs font-semibold text-charcoal placeholder:text-charcoal/30 shadow-xs"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Email Address */}
                    <div>
                      <label htmlFor="modal-email" className="block text-[11px] font-bold text-indigo mb-1">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-2.5" />
                        <input
                          id="modal-email"
                          type="email"
                          placeholder="rahul@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full pl-8.5 pr-2.5 py-2 rounded-xl border border-sand bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none text-xs font-semibold text-charcoal placeholder:text-charcoal/30 shadow-xs"
                        />
                      </div>
                    </div>

                    {/* Message Box */}
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label htmlFor="modal-message" className="text-[11px] font-bold text-indigo">
                          Message to Owner <span className="text-terracotta">*</span>
                        </label>
                      </div>
                      <textarea
                        id="modal-message"
                        rows={3}
                        required
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className="w-full p-2.5 rounded-xl border border-sand bg-white focus:border-terracotta focus:ring-1 focus:ring-terracotta focus:outline-none text-xs font-medium text-charcoal placeholder:text-charcoal/30 shadow-xs resize-none leading-relaxed"
                        placeholder="Type your questions or requirements here..."
                      />
                    </div>

                    {/* Trust Agreement Checkbox */}
                    <div className="flex items-center gap-2 text-[11px] text-charcoal/70 font-semibold select-none cursor-pointer">
                      <input
                        id="modalTrustCheckbox"
                        type="checkbox"
                        required
                        checked={agreeToTrustTerms}
                        onChange={(e) => setAgreeToTrustTerms(e.target.checked)}
                        className="w-3.5 h-3.5 accent-terracotta shrink-0 cursor-pointer"
                      />
                      <label htmlFor="modalTrustCheckbox" className="cursor-pointer leading-tight text-left">
                        I authorize direct owner contact and agree to SqftGo terms.
                      </label>
                    </div>

                    {error ? (
                      <p className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1.5">
                        {error}
                      </p>
                    ) : null}

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isSubmitting || !agreeToTrustTerms}
                      className="w-full py-2.5 px-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:pointer-events-none transition-all duration-200 cursor-pointer"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin h-3.5 w-3.5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>Sending Inquiry...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Inquiry to Owner</span>
                        </>
                      )}
                    </button>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>
  );
}

export default ContactOwnerModal;

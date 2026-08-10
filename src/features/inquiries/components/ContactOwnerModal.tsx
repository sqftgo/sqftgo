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
  BadgeCheck,
  Check,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { formatIndianCurrency } from "@/lib/format";
import { Avatar } from "@/components/ui/Avatar";

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
      const defaultMsg = `Hi ${property.ownerName || "Owner"}, I am interested in "${property.title}" in ${property.locality}, ${property.city} (${formatIndianCurrency(property.price, property.purpose)}). Please contact me with more details.`;
      
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

  const rawPhone = property.ownerPhone || "9876543210";
  const digitsOnly = rawPhone.replace(/\D/g, "");
  const whatsappPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;

  const whatsappMessage = encodeURIComponent(
    `Hi ${property.ownerName || "Owner"}, I found your listing "${property.title}" (${formatIndianCurrency(property.price, property.purpose)}) on SqftGo. Is it still available for discussion?`
  );
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${whatsappMessage}`;

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

              {/* Verified Owner Direct Connect Card */}
              <div className="p-4 sm:p-5 flex flex-col justify-between gap-3 flex-1">
                <div className="bg-white rounded-2xl p-3.5 border border-sand shadow-xs">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative shrink-0">
                        <Avatar
                          name={property.ownerName || "Owner"}
                          size="md"
                          tone="indigo"
                          className="w-11 h-11 text-sm font-bold shadow-xs ring-2 ring-indigo/15"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center">
                          <Check className="w-2 h-2 text-white" />
                        </div>
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1">
                          <span className="font-black text-indigo text-sm truncate">
                            {property.ownerName || "Direct Owner"}
                          </span>
                          <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded w-fit mt-0.5">
                          Verified Owner
                        </span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-[9px] uppercase tracking-wider text-charcoal/40 font-bold block">
                        Phone
                      </span>
                      <span className="text-xs font-mono font-bold text-indigo">
                        {rawPhone}
                      </span>
                    </div>
                  </div>

                  {/* 2 Instant Direct Connect Buttons */}
                  <div className="grid grid-cols-2 gap-2 mt-3 pt-2.5 border-t border-sand/60">
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all text-center"
                      title="Chat on WhatsApp"
                    >
                      <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                        <path d="M17.472 14.382c-.301-.15-1.78-.878-2.056-.978-.276-.1-.477-.15-.678.15-.2.3-.778.978-.954 1.178-.175.2-.351.225-.652.075-.301-.15-1.27-.468-2.42-1.493-.895-.798-1.5-1.784-1.676-2.084-.175-.3-.019-.462.132-.612.136-.135.301-.35.452-.525.15-.175.2-.3.301-.5.1-.2.05-.375-.025-.525-.075-.15-.678-1.636-.93-2.242-.244-.589-.493-.509-.678-.518-.175-.009-.376-.01-.577-.01-.2 0-.526.075-.802.375-.276.3-1.054 1.03-1.054 2.512 0 1.482 1.079 2.912 1.23 3.113.15.2 2.122 3.24 5.14 4.542.718.31 1.278.495 1.716.634.721.23 1.378.198 1.9.12.58-.088 1.78-.727 2.03-1.43.251-.703.251-1.306.176-1.43-.075-.125-.276-.2-.577-.35zM12.04 21.785c-1.85 0-3.664-.498-5.263-1.442l-.377-.224-3.916 1.027 1.045-3.817-.247-.393A9.878 9.878 0 012.16 12.04C2.16 6.594 6.594 2.16 12.04 2.16s9.88 4.434 9.88 9.88-4.434 9.745-9.88 9.745zm0-18.04c-4.555 0-8.26 3.705-8.26 8.26 0 1.597.46 3.136 1.332 4.464l.206.314-.62 2.268 2.325-.61.304.181a8.232 8.232 0 004.713 1.443c4.555 0 8.26-3.705 8.26-8.26s-3.705-8.06-8.26-8.06z" />
                      </svg>
                      <span>WhatsApp</span>
                    </a>

                    <a
                      href={`tel:${rawPhone}`}
                      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-indigo hover:bg-indigo-hover active:scale-95 text-white text-xs font-bold shadow-xs transition-all text-center"
                      title="Call Owner Directly"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" />
                      <span>Call Owner</span>
                    </a>
                  </div>
                </div>

                {/* Trust Pledge Footer */}
                <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/70 text-[10.5px] text-amber-950 flex items-center gap-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span className="leading-tight">
                    <strong>Zero Brokerage:</strong> Direct connect with verified owner credentials.
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
                        Message Sent to {property.ownerName || "Owner"}!
                      </h3>
                      <p className="text-xs text-charcoal/65 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
                        The owner has received your contact details and message. They will respond shortly.
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

"use client";

import React, { useEffect, useState } from "react";
import type { Property } from "@/types";
import { useApp } from "@/context/AppContext";
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare, CheckCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar } from "@/components/ui/Avatar";

interface InquiryFormProps {
  property: Property;
  /** Called after a successful inquiry submit (e.g. close a parent modal). */
  onSuccess?: () => void;
}

const DEFAULT_MESSAGE =
  "Hi, I am interested in this property and would like to receive more details. Please contact me.";

export const InquiryForm: React.FC<InquiryFormProps> = ({
  property,
  onSuccess,
}) => {
  const { submitInquiry, isLoggedIn, userEmail, userName } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: DEFAULT_MESSAGE,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [agreeToTrustTerms, setAgreeToTrustTerms] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || userName || "",
      email: userEmail || prev.email,
    }));
  }, [isLoggedIn, userEmail, userName]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeToTrustTerms || isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      const payload = {
        ...formData,
        // Keep inquiry tied to the account so My Inquiries can list it.
        email: isLoggedIn && userEmail ? userEmail : formData.email,
        name: formData.name || userName || formData.email,
      };
      await submitInquiry(property.id, payload);
      setIsSuccess(true);
      setAgreeToTrustTerms(false);
      setFormData({
        name: isLoggedIn ? userName || "" : "",
        email: isLoggedIn ? userEmail || "" : "",
        phone: "",
        message: DEFAULT_MESSAGE,
      });
      onSuccess?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send inquiry. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-cream border border-sand shadow-md flex flex-col relative overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none" />

      {/* Owner Profile Header */}
      <div className="p-6 pb-5 flex flex-col gap-5 relative z-10 border-b border-sand/60">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar
              name={property.ownerName}
              size="lg"
              tone="indigo"
              className="w-14 h-14 text-xl shadow-md border-2 border-white bg-indigo text-white"
            />
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center shadow-sm">
              <CheckCircle className="w-3 h-3 text-white" />
            </div>
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg text-indigo tracking-tight">{property.ownerName}</span>
            <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-0.5">Verified Owner</span>
          </div>
        </div>
        
        <div className="flex flex-col gap-3 text-xs font-bold text-charcoal/80">
          <a href={`tel:${property.ownerPhone}`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-sand/50">
            <div className="w-8 h-8 rounded-full bg-terracotta/10 flex items-center justify-center flex-shrink-0">
              <Phone className="w-4 h-4 text-terracotta" />
            </div>
            <span>{property.ownerPhone}</span>
          </a>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-white transition-colors border border-transparent hover:border-sand/50">
            <div className="w-8 h-8 rounded-full bg-indigo/10 flex items-center justify-center flex-shrink-0">
              <Mail className="w-4 h-4 text-indigo" />
            </div>
            <span>contact@sqftgo.com</span>
          </div>
        </div>
      </div>

      {/* Inquiry Form Section */}
      <div className="p-6 relative z-10">
        <h3 className="font-serif font-black text-lg text-indigo mb-1">Inquire About Property</h3>
        <p className="text-xs text-charcoal/50 mb-6">Send a message directly to request a callback or viewing.</p>

      <AnimatePresence mode="wait">
        {!isSuccess ? (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 text-sm"
          >
            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inquiryName" className="font-bold text-indigo">Full Name</label>
              <div className="relative">
                <input
                  id="inquiryName"
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium"
                />
                <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-terracotta/75" />
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inquiryEmail" className="font-bold text-indigo">Email Address</label>
              <div className="relative">
                <input
                  id="inquiryEmail"
                  type="email"
                  required
                  placeholder="e.g. rahul@example.com"
                  value={formData.email}
                  readOnly={isLoggedIn && Boolean(userEmail)}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full bg-white border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium ${
                    isLoggedIn && userEmail ? "bg-sand/20 cursor-not-allowed" : ""
                  }`}
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-terracotta/75" />
              </div>
              {isLoggedIn && userEmail ? (
                <p className="text-[10px] text-charcoal/45 font-semibold">
                  Using your account email so this shows under My Inquiries.
                </p>
              ) : null}
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inquiryPhone" className="font-bold text-indigo">Phone Number</label>
              <div className="relative">
                <input
                  id="inquiryPhone"
                  type="tel"
                  required
                  placeholder="e.g. +91 98765 43210"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full bg-white border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium"
                />
                <Phone className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-terracotta/75" />
              </div>
            </div>

            {/* Message */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="inquiryMessage" className="font-bold text-indigo">Message</label>
              <div className="relative">
                <textarea
                  id="inquiryMessage"
                  rows={4}
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-white border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium resize-none"
                />
                <MessageSquare className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-terracotta/75" />
              </div>
            </div>

            {/* Vetting Disclaimer */}
            <div className="p-3.5 rounded-2xl bg-indigo/5 border border-sand/50 text-[10.5px] text-indigo/90 leading-relaxed flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 text-terracotta shrink-0 mt-0.5" />
              <span>
                <strong>Vetting Pledge:</strong> SqftGo requires physical premise inspections and RERA registry verification before any lease or sale agreements are signed. Do not pay advance deposits.
              </span>
            </div>

            {/* Vetting Consent Checkbox */}
            <div className="flex items-start gap-2.5 text-[11px] text-charcoal/75 font-semibold select-none cursor-pointer">
              <input
                id="agreeToTrustTerms"
                type="checkbox"
                required
                checked={agreeToTrustTerms}
                onChange={(e) => setAgreeToTrustTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-terracotta shrink-0 cursor-pointer"
              />
              <label htmlFor="agreeToTrustTerms" className="cursor-pointer leading-tight text-left">
                I agree to verify all RERA credentials and deeds, and accept data terms. *
              </label>
            </div>

            {error ? (
              <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                {error}
              </p>
            ) : null}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting || !agreeToTrustTerms}
              className="mt-2 w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-55 disabled:pointer-events-none transition-all duration-200"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Sending inquiry...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </>
              )}
            </button>
          </motion.form>
        ) : (
          <motion.div
            key="success"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center justify-center text-center py-10"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-4 shadow-inner"
            >
              <CheckCircle2 className="w-9 h-9" />
            </motion.div>
            <h4 className="font-serif font-black text-lg text-indigo mb-2">Inquiry Submitted!</h4>
            <p className="text-sm text-charcoal/50 max-w-[240px] leading-relaxed mb-6">
              Your inquiry has been successfully sent to the owner. They will get in touch with you shortly.
            </p>
            <button
              onClick={() => setIsSuccess(false)}
              className="px-4 py-2 border border-sand rounded-xl text-xs font-bold text-charcoal hover:bg-sand/35 transition-colors"
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

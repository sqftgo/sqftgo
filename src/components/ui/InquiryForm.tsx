"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Send, CheckCircle2, User, Mail, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InquiryFormProps {
  propertyId: string;
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ propertyId }) => {
  const { submitInquiry } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "Hi, I am interested in this property and would like to receive more details. Please contact me.",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate network latency
    setTimeout(() => {
      submitInquiry(propertyId, formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "Hi, I am interested in this property and would like to receive more details. Please contact me.",
      });
    }, 1200);
  };

  return (
    <div className="w-full rounded-2xl bg-white/80 border border-sand p-6 shadow-md">
      <h3 className="font-serif font-black text-lg text-indigo mb-1">Inquire About Property</h3>
      <p className="text-xs text-charcoal/50 mb-6">Send a message directly to the owner/agent to request a callback or viewing.</p>

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
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium"
                />
                <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-terracotta/75" />
              </div>
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
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
  );
};
export default InquiryForm;

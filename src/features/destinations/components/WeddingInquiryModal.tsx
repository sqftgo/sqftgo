"use client";

import React, { useState } from "react";
import { X, Calendar, Users, Send, CheckCircle2, Phone, Sparkles } from "lucide-react";
import { WeddingVenue, WeddingProperty } from "../data/destinations";

interface WeddingInquiryModalProps {
  item: WeddingVenue | WeddingProperty | null;
  itemType: "venue" | "property" | null;
  destinationName: string;
  onClose: () => void;
}

export default function WeddingInquiryModal({
  item,
  itemType,
  destinationName,
  onClose,
}: WeddingInquiryModalProps) {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    eventDate: "",
    guestCount: "",
    notes: "",
  });

  if (!item || !itemType) return null;

  const isVenue = itemType === "venue";
  const venue = isVenue ? (item as WeddingVenue) : null;
  const property = !isVenue ? (item as WeddingProperty) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Dark backdrop */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm animate-fade-in-quick" 
      />

      {/* Modal Container */}
      <div className="relative z-10 w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-sand animate-slide-up-quick text-left">
        {/* Top Header Bar */}
        <div className="relative bg-indigo p-6 text-white overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-terracotta/20 rounded-full blur-3xl pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-gold/20 text-gold px-2.5 py-1 rounded-md border border-gold/30">
              {isVenue ? "💒 Wedding Venue Inquiry" : "💎 Unique Wedding Property"}
            </span>
            <span className="text-xs font-semibold text-white/70">&bull; {destinationName}</span>
          </div>

          <h3 className="text-2xl font-serif font-black text-white leading-tight">
            {isVenue ? venue?.name : property?.title}
          </h3>

          <p className="text-xs text-white/70 font-semibold mt-1">
            {isVenue ? `${venue?.type} • ${venue?.pricePerEvent}` : `${property?.propertyType} • ${property?.price}`}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8">
          {submitted ? (
            <div className="py-8 text-center flex flex-col items-center gap-4 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <div>
                <h4 className="text-2xl font-serif font-black text-indigo">Inquiry Sent Successfully!</h4>
                <p className="text-xs text-charcoal/70 font-semibold max-w-sm mx-auto mt-2 leading-relaxed">
                  Our Concierge Lead for <strong className="text-terracotta">{destinationName}</strong> will contact you within 2 hours with availability, custom pricing, and private tour arrangements.
                </p>
              </div>
              <button
                onClick={onClose}
                className="mt-4 px-8 py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-md transition-all cursor-pointer"
              >
                Done
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200/80 rounded-2xl p-3 text-xs text-amber-900 font-semibold">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Get direct quote, event date availability & site visit invitation.</span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maharani Devika Shah"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98765 43210"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                    Preferred Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                    <input
                      type="date"
                      value={formData.eventDate}
                      onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                    Estimated Guests
                  </label>
                  <div className="relative">
                    <Users className="w-4 h-4 text-charcoal/40 absolute left-3.5 top-3.5" />
                    <input
                      type="text"
                      placeholder="e.g. 500 Guests"
                      value={formData.guestCount}
                      onChange={(e) => setFormData({ ...formData, guestCount: e.target.value })}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black uppercase text-charcoal/70 tracking-wider mb-1">
                  Specific Requirements / Notes
                </label>
                <textarea
                  rows={3}
                  placeholder="Mention any specific preferences (e.g., sangeet lawn requirements, guest suite count, budget)..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-sand bg-sand/10 focus:bg-white focus:border-terracotta focus:outline-none text-xs font-semibold text-charcoal resize-none"
                />
              </div>

              <button
                type="submit"
                className="mt-2 flex items-center justify-center gap-2 w-full py-4 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-2xl shadow-lg transition-all cursor-pointer"
              >
                <span>Submit Destination Inquiry</span>
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

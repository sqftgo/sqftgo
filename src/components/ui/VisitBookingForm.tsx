"use client";

import React, { useEffect, useState } from "react";
import { Property, useApp } from "@/context/AppContext";
import { Calendar, CheckCircle2, Clock, User, Mail, Phone, MessageSquare } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TIME_SLOTS = [
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

interface VisitBookingFormProps {
  property: Property;
}

function tomorrowIso(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().slice(0, 10);
}

export const VisitBookingForm: React.FC<VisitBookingFormProps> = ({ property }) => {
  const { bookVisit, userName, userEmail, userProfile, isLoggedIn } = useApp();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    date: tomorrowIso(),
    time: "11:00 AM",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoggedIn) return;
    setFormData((prev) => ({
      ...prev,
      name: prev.name || userName || userProfile?.name || "",
      email: prev.email || userEmail || "",
      phone: prev.phone || userProfile?.phone || "",
    }));
  }, [isLoggedIn, userName, userEmail, userProfile?.name, userProfile?.phone]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);
    try {
      await bookVisit(property.id, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        date: formData.date,
        time: formData.time,
        notes: formData.notes.trim() || undefined,
      });
      setIsSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to book visit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full rounded-3xl bg-white border border-sand shadow-sm flex flex-col overflow-hidden">
      <div className="p-6 pb-4 border-b border-sand/60">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-indigo/10 flex items-center justify-center">
            <Calendar className="w-4 h-4 text-indigo" />
          </div>
          <h3 className="font-serif font-black text-lg text-indigo">Book a Tour</h3>
        </div>
        <p className="text-xs text-charcoal/50 pl-12">
          Schedule a site visit with the verified broker for this listing.
        </p>
      </div>

      <div className="p-6">
        <AnimatePresence mode="wait">
          {!isSuccess ? (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit}
              className="flex flex-col gap-3.5 text-sm"
            >
              <div className="flex flex-col gap-1.5">
                <label htmlFor="visitName" className="font-bold text-indigo">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    id="visitName"
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium"
                  />
                  <User className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo/50" />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visitEmail" className="font-bold text-indigo">
                    Email
                  </label>
                  <div className="relative">
                    <input
                      id="visitEmail"
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium"
                    />
                    <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visitPhone" className="font-bold text-indigo">
                    Phone
                  </label>
                  <div className="relative">
                    <input
                      id="visitPhone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium"
                    />
                    <Phone className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo/50" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visitDate" className="font-bold text-indigo">
                    Preferred Date
                  </label>
                  <input
                    id="visitDate"
                    type="date"
                    required
                    min={new Date().toISOString().slice(0, 10)}
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 px-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="visitTime" className="font-bold text-indigo">
                    Preferred Time
                  </label>
                  <div className="relative">
                    <select
                      id="visitTime"
                      required
                      value={formData.time}
                      onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium appearance-none"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                    <Clock className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo/50" />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="visitNotes" className="font-bold text-indigo">
                  Notes <span className="font-semibold text-charcoal/40">(optional)</span>
                </label>
                <div className="relative">
                  <textarea
                    id="visitNotes"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Any timing preferences or group size?"
                    className="w-full bg-cream/40 border border-sand rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:border-indigo focus:ring-1 focus:ring-indigo text-charcoal font-medium resize-none"
                  />
                  <MessageSquare className="absolute left-3.5 top-3.5 w-4 h-4 text-indigo/50" />
                </div>
              </div>

              {error ? (
                <p className="text-xs font-semibold text-red-600 bg-red-50 border border-red-100 rounded-xl px-3 py-2">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-1 w-full py-3 bg-indigo hover:bg-indigo-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-55 disabled:pointer-events-none transition-all duration-200"
              >
                {isSubmitting ? "Booking tour..." : "Request Site Visit"}
              </button>
            </motion.form>
          ) : (
            <motion.div
              key="success"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex flex-col items-center text-center py-8"
            >
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h4 className="font-serif font-black text-lg text-indigo mb-2">Tour Requested</h4>
              <p className="text-sm text-charcoal/50 max-w-[240px] leading-relaxed mb-5">
                The broker will confirm your visit shortly. Track it under My Visits.
              </p>
              <button
                type="button"
                onClick={() => setIsSuccess(false)}
                className="px-4 py-2 border border-sand rounded-xl text-xs font-bold text-charcoal hover:bg-sand/35 transition-colors"
              >
                Book another slot
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default VisitBookingForm;

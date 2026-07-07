"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Building2, User, Star, ShieldCheck, BadgeCheck, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";
import { PropertyCard } from "@/components/ui/PropertyCard";

export default function DealerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { directoryProfiles, properties } = useApp();
  const [messageSent, setMessageSent] = useState(false);

  const profileId = params.id as string;
  const profile = directoryProfiles.find(p => p.id === profileId);

  const brokerProperties = React.useMemo(() => {
    if (!profile) return [];
    return properties.filter(
      p => p.city.toLowerCase() === profile.city.toLowerCase() && p.status === "Active"
    );
  }, [properties, profile]);

  if (!profile) {
    return (
      <main className="min-h-screen bg-cream pt-32 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-serif font-black text-charcoal mb-4">Profile Not Found</h1>
        <p className="text-charcoal/60 mb-8">The dealer profile you are looking for does not exist or has been removed.</p>
        <button onClick={() => router.back()} className="px-6 py-3 bg-indigo text-white rounded-xl font-bold">
          Go Back
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-cream pt-24 pb-24 px-6">
      <div className="max-w-6xl mx-auto w-full">

        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-charcoal/50 hover:text-indigo font-bold text-sm mb-8 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dealers
        </button>

        {/* Profile Header Card */}
        <div className="bg-white rounded-[2rem] border border-sand p-8 md:p-12 shadow-xl mb-8 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row gap-8 items-start md:items-center justify-between">

            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="w-24 h-24 shrink-0 rounded-3xl bg-indigo text-white flex items-center justify-center shadow-lg shadow-indigo/20">
                <Building2 className="w-10 h-10" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <span className="bg-[#f4f7fb] text-indigo border border-indigo/10 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {profile.category}
                  </span>

                  {profile.reraId ? (
                    <div className="flex items-center gap-1 bg-emerald-50 border border-emerald-100 text-emerald-800 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                      RERA ID: {profile.reraId}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-[10px] font-black uppercase border border-emerald-100">
                      <BadgeCheck className="w-3.5 h-3.5 shrink-0" />
                      Verified Professional
                    </div>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-charcoal mb-2">
                  {profile.firmName}
                </h1>
                <div className="flex items-center gap-2 text-indigo font-bold text-sm">
                  <User className="w-4 h-4 text-terracotta" />
                  <span>Principal: {profile.ownerName}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats/Rating */}
            <div className="flex flex-row md:flex-col gap-6 md:gap-3 bg-[#faf8f5] rounded-2xl p-5 border border-sand w-full md:w-auto shrink-0">
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal/50 font-black uppercase tracking-widest mb-1">User Rating</span>
                <div className="flex items-center gap-1 text-gold">
                  <Star className="w-4 h-4 fill-gold" />
                  <Star className="w-4 h-4 fill-gold" />
                  <Star className="w-4 h-4 fill-gold" />
                  <Star className="w-4 h-4 fill-gold" />
                  <Star className="w-4 h-4 fill-gold" />
                  <span className="text-charcoal font-bold text-xs ml-1">(48)</span>
                </div>
              </div>
              <div className="w-[1px] md:w-full h-auto md:h-[1px] bg-sand/60" />
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal/50 font-black uppercase tracking-widest mb-1">Office Location</span>
                <span className="text-charcoal font-black text-sm">{profile.city}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

          {/* Left Column: About & Specialties */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div className="bg-white rounded-3xl border border-sand p-8 shadow-sm">
              <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
                About the Firm
              </h2>
              <div className="w-12 h-1 bg-terracotta rounded-full mb-6" />
              <p className="text-charcoal/80 font-semibold leading-relaxed whitespace-pre-wrap text-sm">
                {profile.description}
              </p>

              {profile.specialties && (
                <div className="mt-8 pt-6 border-t border-sand/60">
                  <h3 className="text-xs font-black text-indigo mb-3.5 uppercase tracking-wider">
                    Specialties & Core Focus
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {profile.specialties.map((spec) => (
                      <span key={spec} className="px-3.5 py-2 rounded-xl bg-indigo/5 text-indigo text-xs font-bold border border-indigo/10">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Trust Badges & Verified Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:border-indigo/25 transition-colors">
                <ShieldCheck className="w-6 h-6 text-emerald-600" />
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">RERA Registry</span>
                <span className="text-xs font-black text-charcoal leading-none mt-1">{profile.reraId ? "Registered" : "Vetted Pro"}</span>
              </div>

              <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:border-indigo/25 transition-colors">
                <Building2 className="w-6 h-6 text-indigo" />
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">Active Deals</span>
                <span className="text-xs font-black text-charcoal leading-none mt-1">{profile.listingsCount || 6} Listings</span>
              </div>

              <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:border-indigo/25 transition-colors">
                <User className="w-6 h-6 text-terracotta" />
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">Experience</span>
                <span className="text-xs font-black text-charcoal leading-none mt-1">{profile.experience || "5+ Years"}</span>
              </div>

              <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2 hover:border-indigo/25 transition-colors">
                <Star className="w-6 h-6 text-gold" />
                <span className="text-[9px] font-black text-charcoal/40 uppercase tracking-wider">Team Size</span>
                <span className="text-xs font-black text-charcoal leading-none mt-1">{profile.teamSize || 2} Experts</span>
              </div>
            </div>
          </div>

          {/* Right Column: Contact Info & Form */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-3xl border border-sand p-8 shadow-sm sticky top-32">
              <h2 className="text-xl font-serif font-black text-indigo mb-4">
                Contact Details
              </h2>
              <div className="w-12 h-1 bg-terracotta rounded-full mb-8" />

              <div className="flex flex-col gap-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-indigo/5 text-indigo flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1">Office Address</span>
                    <span className="text-sm font-semibold text-charcoal leading-snug">{profile.address}</span>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/5 text-terracotta flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pt-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1">Mobile</span>
                    <a href={`tel:${profile.mobile}`} className="text-sm font-semibold text-charcoal hover:text-terracotta transition-colors">{profile.mobile}</a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gold/10 text-gold flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col pt-1 overflow-hidden">
                    <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1">Email</span>
                    <a href={`mailto:${profile.email}`} className="text-sm font-semibold text-charcoal hover:text-gold transition-colors truncate">{profile.email}</a>
                  </div>
                </div>

                {profile.website && (
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col pt-1 overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-widest text-charcoal/40 mb-1">Website</span>
                      <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-charcoal hover:text-emerald-600 transition-colors truncate">
                        {profile.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Message form section inside right column */}
              <div className="mt-8 pt-8 border-t border-sand flex flex-col gap-4">
                <h3 className="text-xs font-black uppercase tracking-wider text-indigo mb-1">Inquire with Broker</h3>
                {messageSent ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl text-center text-emerald-800 text-xs font-semibold"
                  >
                    Inquiry sent successfully! Rajesh will contact you shortly.
                  </motion.div>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); setMessageSent(true); }} className="flex flex-col gap-3">
                    <input
                      type="text"
                      required
                      placeholder="Your Name"
                      className="w-full bg-cream/30 border border-sand rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo text-charcoal"
                    />
                    <input
                      type="email"
                      required
                      placeholder="Your Email"
                      className="w-full bg-cream/30 border border-sand rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo text-charcoal"
                    />
                    <textarea
                      required
                      rows={3}
                      placeholder="How can we help you?"
                      className="w-full bg-cream/30 border border-sand rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-indigo resize-none text-charcoal"
                    />
                    <button type="submit" className="w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl font-bold text-xs uppercase tracking-wider shadow transition-all active:scale-95 flex items-center justify-center gap-2 mt-1 cursor-pointer">
                      <Mail className="w-3.5 h-3.5" />
                      Send Message
                    </button>
                  </form>
                )}
              </div>

            </div>
          </div>

        </div>

        {/* Properties Listed by Broker */}
        <div className="mt-16 pt-12 border-t border-sand">
          <div className="mb-8">
            <h2 className="text-2xl font-serif font-black text-indigo">
              Exclusive Listings by {profile.firmName}
            </h2>
            <p className="text-xs text-charcoal/50 font-black uppercase tracking-wider mt-1.5">
              Verified active listings in {profile.city} under exclusive mandate
            </p>
          </div>

          {brokerProperties.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {brokerProperties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-sand rounded-[2rem] p-12 text-center shadow-sm">
              <Building2 className="w-12 h-12 text-charcoal/30 mx-auto mb-4" />
              <p className="text-charcoal/60 font-semibold text-sm">No active listings found for this broker currently.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

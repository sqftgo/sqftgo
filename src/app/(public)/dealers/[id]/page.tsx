"use client";

import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { 
  ArrowLeft, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Building2, 
  User, 
  Star, 
  ShieldCheck, 
  BadgeCheck, 
  MessageSquare,
  AlertCircle,
  CheckCircle2
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    const directMatches = properties.filter(
      p => (p.ownerEmail && p.ownerEmail.toLowerCase() === profile.email.toLowerCase()) || 
           p.ownerPhone === profile.mobile
    );
    if (directMatches.length > 0) {
      return directMatches.filter(p => p.status === "Active");
    }
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

  // Generate initials for avatar
  const initials = profile.firmName
    .split(" ")
    .map(w => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <main className="min-h-screen bg-cream pt-24 pb-24 px-4 md:px-6">
      <div className="max-w-6xl mx-auto w-full">

        {/* Navigation Breadcrumbs & Back Button */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 text-left">
          <nav className="flex flex-wrap items-center gap-1.5 text-[11px] md:text-xs font-bold text-charcoal/50 tracking-wide">
            <Link href="/" className="hover:text-terracotta transition-colors">HOME</Link>
            <span>/</span>
            <Link href="/dealers" className="hover:text-terracotta transition-colors">DEALERS</Link>
            <span>/</span>
            <span className="text-indigo font-extrabold">{profile.firmName.toUpperCase()}</span>
          </nav>

          <button
            onClick={() => router.back()}
            className="flex items-center gap-1.5 text-xs font-black text-charcoal/65 hover:text-indigo group transition-colors self-start md:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            <span>BACK TO DEALERS</span>
          </button>
        </div>

        {/* Cover Banner */}
        <div className="relative h-44 md:h-56 w-full bg-gradient-to-r from-indigo via-indigo-hover to-charcoal rounded-[2rem] overflow-hidden border border-sand/40 shadow-inner">
          <div className="absolute inset-0 opacity-[0.05] bg-[radial-gradient(#faf8f5_1.5px,transparent_1.5px)] [background-size:16px_16px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-[80px] pointer-events-none" />
        </div>

        {/* Profile Info Card Header (Overlapping Banner) */}
        <div className="relative px-6 md:px-10 pb-8 flex flex-col md:flex-row gap-5 md:gap-8 items-start justify-between z-10 border-b border-sand/55 mb-8">
          <div className="flex flex-col md:flex-row gap-5 md:gap-6 items-start w-full">
            {/* Overlapping Initials Logo Card */}
            <div className="-mt-12 md:-mt-16 shrink-0 z-20">
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-indigo text-white border-4 border-white shadow-xl flex items-center justify-center font-serif text-3xl md:text-4xl font-black shrink-0 relative overflow-hidden group">
                <div className="absolute inset-0 bg-charcoal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[1.5px]">
                  <Building2 className="w-8 h-8 md:w-9 md:h-9 text-white" />
                </div>
                <span>{initials}</span>
              </div>
            </div>

            <div className="flex-1 text-left mt-2 md:mt-0 pt-3 md:pt-4">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-indigo/5 text-indigo border border-indigo/10 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider">
                  {profile.category}
                </span>
                {profile.reraId ? (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>RERA ID: {profile.reraId}</span>
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-800 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider flex items-center gap-1 shadow-sm">
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Verified Partner</span>
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-black text-indigo leading-tight mb-2">
                {profile.firmName}
              </h1>
              
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-charcoal/70 text-sm font-semibold">
                <span className="flex items-center gap-1.5">
                  <User className="w-4 h-4 text-terracotta shrink-0" />
                  <span>Principal: <strong className="text-indigo font-bold">{profile.ownerName}</strong></span>
                </span>
                <span className="text-sand hidden sm:inline">|</span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-4 h-4 text-terracotta shrink-0" />
                  <span>{profile.city}, Rajasthan</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid: Information & Sticky Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: Description, Specs stats, Specialties */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            
            {/* Description card */}
            <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
              <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">About the Firm</h3>
              <p className="text-charcoal/80 text-sm leading-relaxed whitespace-pre-line font-medium mt-4">
                {profile.description}
              </p>
            </div>

            {/* Trust Metrics Dashboard Grid */}
            <div className="flex flex-col gap-4 text-left">
              <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide">Firm Credentials</h3>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Stat 1: Experience */}
                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-terracotta/5 border border-terracotta/10 text-terracotta flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Star className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Experience</span>
                    <span className="text-xs font-black text-charcoal mt-0.5">{profile.experience || "5+ Years"}</span>
                  </div>
                </div>

                {/* Stat 2: Active Deals */}
                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Active Deals</span>
                    <span className="text-xs font-black text-charcoal mt-0.5">{brokerProperties.length} Listings</span>
                  </div>
                </div>

                {/* Stat 3: Team Size */}
                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-indigo/5 border border-indigo/10 text-indigo flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <User className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Team Size</span>
                    <span className="text-xs font-black text-charcoal mt-0.5">{profile.teamSize || 2} Experts</span>
                  </div>
                </div>

                {/* Stat 4: Vetting Clearance */}
                <div className="bg-white border border-sand rounded-2xl p-5 flex items-center gap-4 hover:border-terracotta/25 hover:shadow-md transition-all group">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-600 flex items-center justify-center shrink-0 transition-transform group-hover:scale-105">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Sun Valley Vetted</span>
                    <span className="text-xs font-black text-charcoal mt-0.5">{profile.reraId ? "RERA Vetted" : "Clear Records"}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Specialties & Core Focus */}
            {profile.specialties && (
              <div className="bg-white rounded-3xl border border-sand p-6 md:p-8 shadow-sm text-left">
                <h3 className="font-serif font-black text-base text-indigo uppercase tracking-wide pb-2.5 border-b border-sand/40">Specialties & Core Focus</h3>
                <div className="flex flex-wrap gap-2.5 mt-4">
                  {profile.specialties.map((spec) => (
                    <span key={spec} className="px-4 py-2.5 rounded-xl bg-cream border border-sand text-charcoal/90 text-xs font-bold hover:border-terracotta/25 hover:-translate-y-0.5 transition-all">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Unified Contacts & Message Sidebar Console */}
          <div className="lg:col-span-5 w-full sticky lg:top-28">
            <div className="w-full rounded-3xl bg-cream border border-sand shadow-md flex flex-col relative overflow-hidden text-left">
              {/* Decorative background circle */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo/5 rounded-full blur-[40px] pointer-events-none" />

              {/* Office Details */}
              <div className="p-6 pb-5 flex flex-col gap-4 border-b border-sand/65 relative z-10">
                <h3 className="font-serif font-black text-lg text-indigo mb-1">Office Contacts</h3>
                <div className="w-10 h-0.5 bg-terracotta rounded-full mb-2" />
                
                <div className="flex flex-col gap-4 text-xs font-semibold text-charcoal/80">
                  {/* Address */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0">
                      <MapPin className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Office Address</span>
                      <span className="text-charcoal leading-snug mt-0.5 font-medium">{profile.address}</span>
                    </div>
                  </div>

                  {/* Phone */}
                  <a href={`tel:${profile.mobile}`} className="flex items-center gap-3.5 group cursor-pointer">
                    <div className="w-8.5 h-8.5 rounded-xl bg-terracotta/5 border border-terracotta/10 flex items-center justify-center text-terracotta shrink-0 transition-transform group-hover:scale-105">
                      <Phone className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Mobile Phone</span>
                      <span className="text-charcoal group-hover:text-terracotta transition-colors mt-0.5">{profile.mobile}</span>
                    </div>
                  </a>

                  {/* Email */}
                  <a href={`mailto:${profile.email}`} className="flex items-center gap-3.5 group overflow-hidden cursor-pointer">
                    <div className="w-8.5 h-8.5 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo shrink-0 transition-transform group-hover:scale-105">
                      <Mail className="w-4 h-4 shrink-0" />
                    </div>
                    <div className="flex flex-col text-left overflow-hidden">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Email Address</span>
                      <span className="text-charcoal group-hover:text-indigo transition-colors truncate mt-0.5">{profile.email}</span>
                    </div>
                  </a>

                  {/* Website */}
                  {profile.website && (
                    <a href={`https://${profile.website}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3.5 group overflow-hidden cursor-pointer">
                      <div className="w-8.5 h-8.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shrink-0 transition-transform group-hover:scale-105">
                        <Globe className="w-4 h-4 shrink-0" />
                      </div>
                      <div className="flex flex-col text-left overflow-hidden">
                        <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest">Website</span>
                        <span className="text-charcoal group-hover:text-emerald-600 transition-colors truncate mt-0.5">{profile.website}</span>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {/* Inquiry Form */}
              <div className="p-6 relative z-10 text-left">
                <h3 className="font-serif font-black text-lg text-indigo mb-1">Inquire with Broker</h3>
                <p className="text-xs text-charcoal/50 mb-5">Send a message directly to request callbacks or consulting.</p>

                <AnimatePresence mode="wait">
                  {messageSent ? (
                    <motion.div
                      key="success"
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="flex flex-col items-center justify-center text-center py-6"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600 mb-3 shadow-inner">
                        <CheckCircle2 className="w-7 h-7" />
                      </div>
                      <h4 className="font-serif font-black text-base text-indigo mb-1">Inquiry Submitted!</h4>
                      <p className="text-xs text-charcoal/50 max-w-[200px] leading-relaxed mb-4">
                        Your message has been sent successfully. They will contact you shortly.
                      </p>
                      <button
                        onClick={() => setMessageSent(false)}
                        className="px-3.5 py-1.5 border border-sand rounded-xl text-[10px] font-bold text-charcoal hover:bg-sand/35 transition-colors cursor-pointer"
                      >
                        Send another message
                      </button>
                    </motion.div>
                  ) : (
                    <form 
                      onSubmit={(e) => { e.preventDefault(); setMessageSent(true); }} 
                      className="flex flex-col gap-4 text-sm"
                    >
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="inquiryName" className="font-bold text-indigo text-xs">Full Name</label>
                        <input
                          id="inquiryName"
                          type="text"
                          required
                          placeholder="e.g. Rahul Sharma"
                          className="w-full bg-white border border-sand rounded-xl py-2.5 px-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs"
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="inquiryEmail" className="font-bold text-indigo text-xs">Email Address</label>
                        <input
                          id="inquiryEmail"
                          type="email"
                          required
                          placeholder="e.g. rahul@example.com"
                          className="w-full bg-white border border-sand rounded-xl py-2.5 px-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs"
                        />
                      </div>

                      {/* Message */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="inquiryMessage" className="font-bold text-indigo text-xs">Message</label>
                        <textarea
                          id="inquiryMessage"
                          rows={3}
                          required
                          defaultValue={`I am interested in listings managed by your firm and would like to request more details.`}
                          className="w-full bg-white border border-sand rounded-xl py-2.5 px-4 focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta text-charcoal font-medium text-xs resize-none"
                        />
                      </div>

                      {/* Security Pledge */}
                      <div className="p-3 rounded-xl bg-indigo/5 border border-sand/50 text-[10px] text-indigo/90 leading-relaxed flex items-start gap-2">
                        <AlertCircle className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                        <span>
                          <strong>Security Pledge:</strong> We verify physical registry credentials and title deeds for relocation transactions.
                        </span>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        className="w-full py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer text-xs uppercase tracking-wider mt-1"
                      >
                        <Mail className="w-4 h-4" />
                        <span>Send Message</span>
                      </button>
                    </form>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

        </div>

        {/* Properties Listed by Broker Section */}
        <div className="mt-16 pt-12 border-t border-sand text-left">
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
              <Building2 className="w-12 h-12 text-charcoal/30 mx-auto mb-4 animate-sway-slow" />
              <p className="text-charcoal/60 font-semibold text-sm">No active listings found for this broker currently.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

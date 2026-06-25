"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { ArrowLeft, MapPin, Phone, Mail, Globe, Building2, User, Star, ShieldCheck, BadgeCheck } from "lucide-react";

export default function DealerProfilePage() {
  const params = useParams();
  const router = useRouter();
  const { directoryProfiles } = useApp();

  const profileId = params.id as string;
  const profile = directoryProfiles.find(p => p.id === profileId);

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
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6">
      <div className="max-w-4xl mx-auto w-full">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-charcoal/50 hover:text-indigo font-bold text-sm mb-8 transition-colors"
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
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-terracotta/10 text-terracotta border border-terracotta/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {profile.category}
                  </span>
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-bold uppercase border border-emerald-100">
                    <BadgeCheck className="w-3 h-3" />
                    Verified
                  </div>
                </div>
                <h1 className="text-3xl md:text-4xl font-serif font-black text-charcoal mb-2">
                  {profile.firmName}
                </h1>
                <div className="flex items-center gap-2 text-indigo font-bold">
                  <User className="w-4 h-4" />
                  <span>{profile.ownerName}</span>
                </div>
              </div>
            </div>

            {/* Quick Stats/Rating (Mock data for visual premium feel) */}
            <div className="flex flex-row md:flex-col gap-6 md:gap-3 bg-sand/20 rounded-2xl p-5 border border-sand w-full md:w-auto shrink-0">
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
              <div className="w-[1px] md:w-full h-auto md:h-[1px] bg-sand" />
              <div className="flex flex-col">
                <span className="text-[10px] text-charcoal/50 font-black uppercase tracking-widest mb-1">Member Since</span>
                <span className="text-charcoal font-bold text-sm">2018</span>
              </div>
            </div>

          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: About */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            <div className="bg-white rounded-3xl border border-sand p-8 shadow-sm">
              <h2 className="text-xl font-serif font-black text-indigo mb-4 flex items-center gap-2">
                About the Firm
              </h2>
              <div className="w-12 h-1 bg-terracotta rounded-full mb-6" />
              <p className="text-charcoal/80 font-medium leading-relaxed whitespace-pre-wrap">
                {profile.description}
              </p>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
               <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                 <ShieldCheck className="w-6 h-6 text-emerald-600" />
                 <span className="text-xs font-bold text-charcoal">RERA Certified</span>
               </div>
               <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2">
                 <Building2 className="w-6 h-6 text-indigo" />
                 <span className="text-xs font-bold text-charcoal">Premium Listings</span>
               </div>
               <div className="bg-white border border-sand rounded-2xl p-5 flex flex-col items-center text-center gap-2 sm:col-span-1 col-span-2">
                 <User className="w-6 h-6 text-terracotta" />
                 <span className="text-xs font-bold text-charcoal">Verified Local</span>
               </div>
            </div>
          </div>

          {/* Right Column: Contact Info */}
          <div className="lg:col-span-1">
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

              <div className="mt-8 pt-8 border-t border-sand">
                <button className="w-full py-4 bg-terracotta hover:bg-terracotta-hover text-white rounded-xl font-bold shadow-lg shadow-terracotta/20 transition-all active:scale-95 flex items-center justify-center gap-2">
                  <Mail className="w-4 h-4" />
                  Send Message
                </button>
              </div>
            </div>
          </div>

        </div>

      </div>
    </main>
  );
}

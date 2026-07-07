"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, Phone, Mail, Globe, ArrowRight, Building2, User, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";

export default function DealersPage() {
  const { directoryProfiles, selectedCity } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const dealerProfiles = directoryProfiles.filter(
    p => p.category === "Agent & Broker" || p.category === "Property Consultant"
  );

  const categories = ["All", ...Array.from(new Set(dealerProfiles.map(p => p.category)))];

  const filteredProfiles = dealerProfiles.filter(profile => {
    const matchesCity = profile.city.toLowerCase() === selectedCity.toLowerCase();
    const matchesSearch = profile.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          profile.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || profile.category === selectedCategory;
    return matchesCity && matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest block mb-2">
            Professional Network in {selectedCity}
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-charcoal tracking-tight mb-4">
            Top Real Estate Dealers in {selectedCity}
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto font-medium text-lg">
            Connect with the most trusted agents, brokers, architects, and developers in {selectedCity}.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 mb-12 justify-center items-center">
          <div className="relative w-full md:w-96">
            <input
              type="text"
              placeholder="Filter by Place, Firm, or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-sand rounded-2xl px-12 py-3.5 text-sm focus:outline-none focus:border-indigo text-charcoal font-semibold shadow-sm"
            />
            <Search className="w-5 h-5 text-charcoal/40 absolute left-4 top-1/2 -translate-y-1/2" />
          </div>

          <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`whitespace-nowrap px-6 py-3.5 rounded-2xl text-xs font-bold transition-all duration-300 ${
                  selectedCategory === cat 
                  ? "bg-indigo text-white shadow-md" 
                  : "bg-white border border-sand text-charcoal hover:border-indigo/30"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Dealers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredProfiles.length > 0 ? (
            filteredProfiles.map((profile, idx) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.1 }}
                className="bg-white rounded-3xl border border-sand hover:border-indigo/25 p-8 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo group-hover:bg-indigo group-hover:text-white transition-all duration-300 shadow-inner shrink-0">
                    <Building2 className="w-5.5 h-5.5" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${
                      profile.category === "Agent & Broker" 
                        ? "bg-[#faf6e8] text-[#9b7216] border-[#dfab34]/20" 
                        : "bg-[#f4f7fb] text-indigo border-indigo/10"
                    }`}>
                      {profile.category}
                    </span>
                  </div>
                </div>
                
                <h3 className="text-lg font-serif font-black text-charcoal mb-1 line-clamp-1 group-hover:text-indigo transition-colors duration-200">
                  {profile.firmName}
                </h3>
                
                <div className="flex items-center gap-1.5 text-xs text-charcoal/50 mb-4">
                  <span className="font-bold">Principal:</span>
                  <span className="font-extrabold text-charcoal/80 group-hover:text-indigo transition-colors">{profile.ownerName}</span>
                </div>

                <p className="text-xs text-charcoal/65 leading-relaxed font-semibold mb-5 line-clamp-2 min-h-[2.5rem]">
                  {profile.description}
                </p>
                
                <div className="flex flex-col gap-2.5 mb-6 text-[11px] font-semibold text-charcoal/70 bg-[#faf8f5]/60 p-4 rounded-2xl border border-sand/40">
                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-3.5 h-3.5 text-terracotta shrink-0 mt-0.5" />
                    <span>{profile.address}</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Phone className="w-3.5 h-3.5 text-indigo shrink-0" />
                    <span>{profile.mobile}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-5 border-t border-sand/50">
                  <Link 
                    href={`/dealers/${profile.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-indigo/25 text-indigo hover:border-indigo hover:bg-indigo hover:text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all duration-300 shadow-sm"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20">
              <p className="text-charcoal/50 font-semibold">No dealers found matching your criteria.</p>
            </div>
          )}
        </div>

      </div>
    </main>
  );
}

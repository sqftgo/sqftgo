"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, Phone, Mail, Globe, ArrowRight, Building2, User } from "lucide-react";
import { motion } from "framer-motion";

export default function DealersPage() {
  const { directoryProfiles } = useApp();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const categories = ["All", ...Array.from(new Set(directoryProfiles.map(p => p.category)))];

  const filteredProfiles = directoryProfiles.filter(profile => {
    const matchesSearch = profile.address.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          profile.firmName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          profile.ownerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || profile.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="min-h-screen bg-cream pt-32 pb-24 px-6">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12 relative z-10">
          <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest block mb-2">
            Professional Network
          </span>
          <h1 className="text-4xl md:text-5xl font-serif font-black text-charcoal tracking-tight mb-4">
            Top Real Estate Dealers
          </h1>
          <p className="text-charcoal/70 max-w-2xl mx-auto font-medium text-lg">
            Connect with the most trusted agents, brokers, architects, and developers in the market.
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
                className="bg-white rounded-3xl border border-sand p-8 shadow-sm hover:shadow-xl hover:border-terracotta/30 transition-all duration-300 flex flex-col group"
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-indigo/5 flex items-center justify-center text-indigo group-hover:scale-110 transition-transform duration-300">
                    <Building2 className="w-7 h-7" />
                  </div>
                  <span className="bg-sand/30 text-charcoal px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest">
                    {profile.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-serif font-black text-charcoal mb-1 line-clamp-1 group-hover:text-indigo transition-colors">
                  {profile.firmName}
                </h3>
                
                <div className="flex items-center gap-2 text-charcoal/60 mb-6">
                  <User className="w-4 h-4 text-terracotta" />
                  <span className="text-sm font-semibold">{profile.ownerName}</span>
                </div>
                
                <div className="flex flex-col gap-3 mb-8">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-charcoal/40 mt-0.5 shrink-0" />
                    <span className="text-xs text-charcoal/70 font-medium">{profile.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-charcoal/40 shrink-0" />
                    <span className="text-xs text-charcoal/70 font-medium">{profile.mobile}</span>
                  </div>
                </div>
                
                <div className="mt-auto pt-6 border-t border-sand">
                  <Link 
                    href={`/dealers/${profile.id}`}
                    className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-indigo text-indigo hover:bg-indigo hover:text-white rounded-xl font-bold text-sm transition-colors duration-300"
                  >
                    View Profile
                    <ArrowRight className="w-4 h-4" />
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

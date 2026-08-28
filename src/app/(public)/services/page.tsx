"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useApp } from "@/context/AppContext";
import { isServiceDirectoryCategory } from "@/features/dealers";
import { servicePlatformService } from "@/services";
import type { ServiceType } from "@/types";
import {
  Plus,
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Phone,
  Mail,
  Search,
  ShieldCheck,
  Grid,
  UserCheck,
  CheckCircle,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ServicesPage() {
  const { directoryProfiles, selectedCity } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);

  useEffect(() => {
    void servicePlatformService
      .listServiceTypes(false)
      .then(setServiceTypes)
      .catch(() => setServiceTypes([]));
  }, []);

  const serviceProfiles = useMemo(() => {
    return directoryProfiles.filter(
      (p) => isServiceDirectoryCategory(p.category) && p.listingActive !== false
    );
  }, [directoryProfiles]);

  const cityProfiles = useMemo(() => {
    if (!selectedCity || selectedCity === "All India") return serviceProfiles;
    return serviceProfiles.filter(
      (p) => p.city.toLowerCase() === selectedCity.toLowerCase()
    );
  }, [serviceProfiles, selectedCity]);

  const filteredProfiles = useMemo(() => {
    let profiles = cityProfiles;
    if (selectedCategory !== "all") {
      profiles = profiles.filter((p) => p.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      profiles = profiles.filter(
        (p) =>
          p.firmName.toLowerCase().includes(q) ||
          p.ownerName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          (p.servicesOffered ?? []).some((s) => s.toLowerCase().includes(q))
      );
    }
    return profiles;
  }, [cityProfiles, selectedCategory, searchQuery]);

  const categoryMeta = useMemo(() => {
    if (serviceTypes.length > 0) {
      return serviceTypes.map((st) => ({
        name: st.name,
        title: st.name,
        desc: st.description,
      }));
    }
    return Array.from(new Set(cityProfiles.map((p) => p.category))).map((name) => ({
      name,
      title: name,
      desc: "",
    }));
  }, [serviceTypes, cityProfiles]);

  return (
    <div className="w-full flex flex-col items-center bg-cream/30 min-h-screen">
      <section className="w-full bg-cream border-b border-sand pt-16 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-terracotta/5 rounded-full blur-[140px] pointer-events-none" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
            <div className="lg:col-span-7 flex flex-col text-left items-start gap-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-sand bg-white shadow-sm">
                <span className="w-2 h-2 rounded-full bg-terracotta animate-pulse" />
                <span className="text-terracotta font-black text-[10px] uppercase tracking-[0.2em]">
                  City services for relocators
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-[1.1] text-charcoal">
                Everything you need{" "}
                <span className="text-indigo">
                  in {selectedCity && selectedCity !== "All India" ? selectedCity : "your city"}
                </span>
              </h1>

              <p className="text-sm md:text-base text-charcoal/80 leading-relaxed font-semibold max-w-xl">
                New to town? Find architects, contractors, interiors, shifting, and more — filtered
                by the city in the header.
              </p>

              <div className="w-full max-w-xl flex flex-col sm:flex-row gap-3 mt-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Search firms, people, or services…"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white border border-sand focus:border-terracotta rounded-2xl py-3.5 pl-12 pr-6 text-sm font-semibold text-charcoal outline-none shadow-sm"
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-charcoal/40" />
                </div>
                <Link
                  href="/services/register"
                  className="bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider px-6 py-4 rounded-2xl shadow-md flex items-center justify-center gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>List Your Business</span>
                </Link>
              </div>
            </div>

            <div className="hidden lg:col-span-5 lg:flex flex-col items-center justify-center relative w-full h-[450px]">
              <div className="relative w-[90%] h-[380px] overflow-hidden heritage-arch-double z-10">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/services_hero.png"
                  alt="City services"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              title: "Local to your city",
              body: "Uses the city selected in the header so relocators see nearby partners first.",
            },
            {
              title: "Book a visit",
              body: "Request a time slot on any service profile. Owners confirm from their manage page.",
            },
            {
              title: "Verified when approved",
              body: "Service owners submit registration details; admins approve the verified badge.",
            },
          ].map((card) => (
            <div
              key={card.title}
              className="flex flex-col items-center text-center gap-3 p-6 rounded-3xl bg-white border border-sand shadow-sm"
            >
              <h3 className="font-serif font-black text-lg text-charcoal">{card.title}</h3>
              <p className="text-xs text-charcoal/60 font-semibold leading-relaxed">{card.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="w-full max-w-7xl mx-auto px-6 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="hidden lg:flex lg:col-span-3 flex-col gap-5 sticky top-24">
            <div className="bg-white border border-sand rounded-3xl p-5 shadow-sm">
              <h2 className="font-serif font-black text-lg text-indigo pb-4 border-b border-sand mb-4">
                Categories
              </h2>
              <div className="flex flex-col gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold cursor-pointer ${
                    selectedCategory === "all"
                      ? "bg-indigo text-white shadow-md"
                      : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Grid className="w-4 h-4" />
                    <span>All Profiles</span>
                  </div>
                  <span className="text-[10px] font-black">{cityProfiles.length}</span>
                </button>
                {categoryMeta.map((cat) => {
                  const count = cityProfiles.filter((p) => p.category === cat.name).length;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.name}
                      type="button"
                      onClick={() => setSelectedCategory(isSelected ? "all" : cat.name)}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl border-none text-xs font-bold cursor-pointer ${
                        isSelected
                          ? "bg-indigo text-white shadow-md"
                          : "bg-transparent hover:bg-sand/30 text-charcoal/70"
                      }`}
                    >
                      <span className="truncate text-left">{cat.title}</span>
                      <span className="text-[10px] font-black">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-9 flex flex-col gap-6 w-full">
            <div className="lg:hidden w-full overflow-x-auto no-scrollbar py-2 -mx-4 px-4">
              <div className="flex gap-2 w-max">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className={`px-4 py-2 rounded-full text-xs font-bold ${
                    selectedCategory === "all"
                      ? "bg-indigo text-white"
                      : "bg-white border border-sand text-charcoal/70"
                  }`}
                >
                  All ({cityProfiles.length})
                </button>
                {categoryMeta.map((cat) => (
                  <button
                    key={cat.name}
                    type="button"
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.name ? "all" : cat.name)
                    }
                    className={`px-4 py-2 rounded-full text-xs font-bold ${
                      selectedCategory === cat.name
                        ? "bg-indigo text-white"
                        : "bg-white border border-sand text-charcoal/70"
                    }`}
                  >
                    {cat.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 pb-3 border-b border-sand">
              <h2 className="font-serif font-black text-2xl text-indigo">
                {selectedCategory === "all" ? "All professionals" : selectedCategory}
              </h2>
              <span className="text-[11px] text-charcoal/60 font-black bg-sand/50 border border-sand px-3 py-1.5 rounded-lg">
                {filteredProfiles.length} profiles
              </span>
            </div>

            {filteredProfiles.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredProfiles.map((profile) => (
                    <motion.div
                      key={profile.id}
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="bg-white border border-sand rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all flex flex-col gap-5 text-left"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-indigo text-[#D4AF37] flex items-center justify-center font-black text-xl relative">
                          {profile.ownerName.charAt(0)}
                          {profile.verificationStatus === "verified" ? (
                            <div className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-emerald-500 border-[3px] border-white rounded-full flex items-center justify-center">
                              <CheckCircle className="w-3.5 h-3.5 text-white" />
                            </div>
                          ) : null}
                        </div>
                        <div className="flex flex-col pt-0.5 min-w-0">
                          <span className="text-[9px] font-black text-terracotta uppercase tracking-[0.15em] mb-1">
                            {profile.category}
                          </span>
                          <Link
                            href={`/services/${profile.id}`}
                            className="font-serif font-black text-lg text-indigo hover:text-terracotta truncate"
                          >
                            {profile.firmName}
                          </Link>
                          <span className="text-xs text-charcoal/50 font-bold mt-1.5 flex items-center gap-1.5">
                            <UserCheck className="w-3.5 h-3.5" />
                            {profile.ownerName}
                          </span>
                          {profile.verificationStatus === "verified" ? (
                            <span className="mt-2 inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-700">
                              <ShieldCheck className="w-3.5 h-3.5" /> Verified
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <p className="text-sm text-charcoal/60 leading-relaxed font-semibold line-clamp-3 min-h-[60px]">
                        {profile.description}
                      </p>

                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal/70 bg-cream p-3 rounded-xl border border-sand/50">
                        <MapPin className="w-4 h-4 text-terracotta flex-shrink-0" />
                        <span className="truncate">
                          {profile.address}{" "}
                          <span className="text-indigo/80 font-black">({profile.city})</span>
                        </span>
                      </div>

                      <div className="flex gap-2 pt-2 mt-auto">
                        <Link
                          href={`/services/${profile.id}`}
                          className="flex-1 py-3 rounded-xl bg-indigo hover:bg-indigo-hover text-white flex items-center justify-center gap-2 text-sm font-bold shadow-md"
                        >
                          View profile
                        </Link>
                        <a
                          href={`tel:${profile.mobile}`}
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-sand text-charcoal"
                        >
                          <Phone className="w-4 h-4" />
                        </a>
                        <a
                          href={`mailto:${profile.email}`}
                          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white border border-sand text-charcoal"
                        >
                          <Mail className="w-4 h-4" />
                        </a>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="text-center py-24 px-6 rounded-3xl bg-cream border border-sand max-w-xl mx-auto w-full my-8">
                <Search className="w-8 h-8 text-charcoal/30 mx-auto mb-6" />
                <h3 className="font-serif font-black text-2xl text-indigo mb-2">No profiles found</h3>
                <p className="text-sm text-charcoal/60 font-semibold mb-8">
                  Try another category or change the city in the header.
                </p>
                <Link
                  href="/services/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-terracotta text-white text-sm font-bold"
                >
                  Register Your Firm Instead
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative z-20 pb-20 px-6 max-w-7xl mx-auto w-full">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-indigo to-slate-900 text-white p-8 md:p-12 shadow-2xl lg:grid lg:grid-cols-12 lg:items-center gap-8">
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            <span className="px-3 py-1 bg-white/20 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded w-fit">
              Partner Services
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight">
              Are you a local service professional?
              <br />
              List your business with SQFTGO.
            </h2>
            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed font-semibold max-w-xl">
              Reach relocators searching for trusted partners in your city. Free to start — manage
              your profile, verification, and bookings in one place.
            </p>
            <Link
              href="/services/register"
              className="w-fit flex items-center gap-2 px-6 py-3.5 rounded-xl bg-white text-indigo font-black text-xs uppercase tracking-widest shadow-lg"
            >
              <span>List Your Business Today</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

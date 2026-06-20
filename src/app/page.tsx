"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import SearchBar from "@/components/ui/SearchBar";
import PropertyCard from "@/components/ui/PropertyCard";
import {
  Compass,
  MapPin,
  ArrowUpRight,
  ArrowRight,
  Sparkles,
  Home as HomeIcon,
  MessageSquare,
  Key,
  ShieldCheck,
  Star
} from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";

export default function Home() {
  const router = useRouter();
  const { properties, setSelectedCity, reviews, addReview } = useApp();
  const { scrollY } = useScroll();

  const [reviewName, setReviewName] = useState("");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewName || !reviewFeedback) return;
    addReview({
      name: reviewName,
      feedback: reviewFeedback,
      rating: reviewRating
    });
    setReviewName("");
    setReviewFeedback("");
    setReviewSubmitted(true);
    setTimeout(() => {
      setReviewSubmitted(false);
    }, 4000);
  };



  // Featured listings asymmetric scroll offsets (columns slide relative to each other)
  const yCard1 = useTransform(scrollY, [500, 1400], [0, -30]);
  const yCard2 = useTransform(scrollY, [500, 1400], [0, 15]);
  const yCard3 = useTransform(scrollY, [500, 1400], [0, -15]);



  // Featured listings (featured: true)
  const featuredProperties = properties.filter((p) => p.featured).slice(0, 3);

  const rajasthanCities = [
    { name: "Udaipur", count: 240, desc: "City of Lakes & Palaces", bg: "from-blue-600/10 to-teal-500/10", image: "https://content.jdmagicbox.com/comp/udaipur-rajasthan/h6/9999px294.x294.190109172305.s8h6/catalogue/archi-s-galaxy-udaipur-rajasthan-th9b6z57si.jpg" },
    { name: "Jaipur", count: 480, desc: "Heritage Forts & Royalty", bg: "from-rose-500/10 to-amber-500/10", image: "https://www.jaipurpropertyhouse.in/wp-content/uploads/2022/12/arihant-avana-mansarovar-jaipur.jpg" },
    { name: "Jodhpur", count: 180, desc: "The Stunning Blue City", bg: "from-indigo-600/10 to-blue-500/10", image: "" },
    { name: "Kota", count: 110, desc: "River Chambal & Study Hub", bg: "from-emerald-600/10 to-teal-500/10", image: "https://images.unsplash.com/photo-1566837945700-30057527ade0?auto=format&fit=crop&w=400&q=80" },
    { name: "Ajmer", count: 95, desc: "Aravalli Hills & Sufi Shrine", bg: "from-teal-600/10 to-cyan-500/10", image: "https://images.unsplash.com/photo-1626125345510-4603468eedfb?auto=format&fit=crop&w=400&q=80" },
    { name: "Bikaner", count: 75, desc: "Desert Dunes & Havelis", bg: "from-amber-600/10 to-orange-500/10", image: "https://images.unsplash.com/photo-1509305717901-8473a93b9fef?auto=format&fit=crop&w=400&q=80" },
  ];

  const handleCityBrowse = (cityName: string) => {
    setSelectedCity(cityName);
    router.push(`/listings?city=${cityName}`);
  };

  // Stagger animation container
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
  };

  return (
    <div className="flex-1 flex flex-col w-full relative">

      {/* 1. HERO SECTION (Daylight Heritage theme - No Background Image & No Parallax) */}
      <section className="relative min-h-[85vh] md:min-h-[90vh] flex items-center justify-center pt-16 pb-20 overflow-hidden z-10 px-4 md:px-6">

        <div className="container mx-auto max-w-7xl flex flex-col gap-10 w-full z-10">

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full">
            {/* Left Column: Text Content & Stats */}
            <div className="lg:col-span-7 flex flex-col text-left gap-8 md:gap-9">

              {/* Heading */}
              <div className="flex flex-col gap-4">
                <div className="flex items-center gap-2 text-terracotta font-serif font-black text-sm md:text-base tracking-wide uppercase">
                  <span>Khamagani Sa!</span>
                </div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif font-black tracking-tight leading-none text-charcoal">
                  Sun Valley <br className="hidden sm:inline" />
                  <span className="text-indigo">
                    Real Estate Private Limited
                  </span>
                </h1>
                <p className="text-terracotta font-serif font-black text-sm md:text-base tracking-wide uppercase mt-1">
                  Buy, Sell, Rent, Lease Property in India
                </p>
                <p className="max-w-xl text-xs sm:text-sm text-charcoal/85 leading-relaxed font-semibold">
                  We have been serving the needs of Real Estate in India since 2008. Our platform is designed to meet the needs of buyers, sellers, and brokers in real estate. Our success is attributed to understanding the needs of our customers and we are consistently working to fulfill those needs by utilizing innovative e-commerce solutions.
                </p>
              </div>

              {/* Micro Stats */}
              <div className="grid grid-cols-3 gap-6 sm:gap-12 mt-4 text-charcoal/80">
                <div className="flex flex-col items-start">
                  <span className="text-xl md:text-3xl font-serif font-black text-indigo">1200+</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-1">Properties Listed</span>
                </div>
                <div className="flex flex-col items-start border-x border-sand px-6 sm:px-12">
                  <span className="text-xl md:text-3xl font-serif font-black text-terracotta">20+</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-1">Indian Cities</span>
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xl md:text-3xl font-serif font-black text-indigo">98%</span>
                  <span className="text-[10px] font-bold text-charcoal/50 uppercase tracking-widest mt-1">Happy Clients</span>
                </div>
              </div>
            </div>

            {/* Right Column: Layered Asymmetric Images Collage (Jharokha Palace Arches - Static) */}
            <div className="hidden lg:col-span-5 lg:flex flex-col items-center justify-center relative h-[500px] w-full">
              {/* Image 1: Main Udaipur lakeside terrace villa (Large) */}
              <div className="absolute w-[80%] h-[320px] rounded-3xl overflow-hidden border border-sand shadow-2xl z-10 top-0 left-0">
                <img
                  src="https://images.unsplash.com/photo-1598977123418-45f04b615e52?auto=format&fit=crop&w=800&q=80"
                  alt="Rambagh Palace Jaipur"
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {/* Image 2: Small heritage Haveli courtyard (Small, overlaps) */}
              <div className="absolute w-[60%] h-[240px] rounded-3xl overflow-hidden border border-sand shadow-2xl z-20 bottom-4 right-0">
                <img
                  src="https://images.unsplash.com/photo-1595238612450-e3c18b3550a4?auto=format&fit=crop&w=600&q=80"
                  alt="Heritage Haveli Courtyard Archway"
                  className="w-full h-full object-cover object-center"
                />
                {/* Overlay Badge inside Image */}
                <div className="absolute bottom-3.5 left-3.5 bg-cream px-3 py-1 rounded-xl border border-sand text-[9px] text-indigo uppercase font-black tracking-widest flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                  <span>Verified Portals</span>
                </div>
              </div>
            </div>
          </div>

          {/* SearchBar Widget centered and below columns - Static */}
          <div className="w-full max-w-5xl mx-auto mt-6 relative z-30 text-center flex flex-col gap-6">
            <SearchBar />

            {/* Quick Action Navigation Segment: Buy, Rent, Plot */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-2">
              <Link
                href="/listings?purpose=buy"
                className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white border border-sand hover:border-terracotta/35 text-charcoal hover:text-terracotta shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-terracotta/10 text-terracotta flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Compass className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide uppercase leading-none mb-1">Buy Property</span>
                  <span className="text-[10px] text-charcoal/50 font-bold">Explore villas & havelis</span>
                </div>
              </Link>

              <Link
                href="/listings?purpose=rent"
                className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white border border-sand hover:border-indigo/35 text-charcoal hover:text-indigo shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-indigo/10 text-indigo flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <Key className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide uppercase leading-none mb-1">Rent Property</span>
                  <span className="text-[10px] text-charcoal/50 font-bold">Premium lease spaces</span>
                </div>
              </Link>

              <Link
                href="/listings?purpose=buy&type=Plot"
                className="group flex items-center gap-3.5 px-6 py-3.5 rounded-2xl bg-white border border-sand hover:border-gold/45 text-charcoal hover:text-gold/90 shadow-md hover:shadow-lg transition-all duration-300"
              >
                <div className="w-9 h-9 rounded-xl bg-gold/10 text-gold/90 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <MapPin className="w-4.5 h-4.5" />
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-xs font-black tracking-wide uppercase leading-none mb-1">Explore Plots</span>
                  <span className="text-[10px] text-charcoal/50 font-bold">Invest in raw land</span>
                </div>
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 2. FEATURED LISTINGS */}
      <section className="relative py-24 z-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1 text-terracotta font-extrabold text-xs uppercase tracking-widest">
              <Compass className="w-4 h-4" />
              <span>Handpicked Collection</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-charcoal tracking-tight">
              Featured Properties
            </h2>
          </div>
          <Link
            href="/listings"
            className="group flex items-center gap-1.5 text-sm font-bold text-terracotta hover:text-indigo transition-colors duration-200"
          >
            <span>View all listings</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Property cards grid with asymmetric parallax offsets */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-start">
          {featuredProperties.map((property, idx) => {
            const yTransform = idx === 0 ? yCard1 : idx === 1 ? yCard2 : yCard3;
            return (
              <motion.div key={property.id} style={{ y: yTransform }} className="w-full">
                <PropertyCard property={property} />
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* 2.5 HERITAGE HIGHLIGHT (Static, Spaced Layout with Real Rajasthan Haveli Image) */}
      <section className="relative py-28 z-20 px-6 max-w-7xl mx-auto w-full overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">

          {/* Left: Restoration Photo (Static) */}
          <div className="lg:col-span-6 relative h-[450px] w-full">
            <div className="absolute inset-0 rounded-3xl overflow-hidden border border-sand shadow-xl">
              <img
                src="https://images.unsplash.com/photo-1598977123418-45f04b615e52?auto=format&fit=crop&w=1200&q=80"
                alt="Rajasthan Restored Haveli courtyard"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Right: Text Card (Proper spacing, no overlap, Static) */}
          <div className="lg:col-span-6 relative z-10 flex justify-center lg:justify-start mt-8 lg:mt-0">
            <div className="w-full max-w-xl rounded-3xl bg-cream text-charcoal p-8 border border-sand shadow-2xl relative">
              <span className="text-terracotta font-extrabold text-[10px] uppercase tracking-widest block mb-2">
                Restoration Collection
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black tracking-tight leading-tight mb-4 text-indigo">
                The Havelis of Old Jodhpur & Udaipur
              </h2>
              <p className="text-charcoal/70 text-xs sm:text-sm leading-relaxed mb-6 font-semibold">
                Living in a Haveli is an inheritance of culture. We work with structural preservation teams to restore ancient lime-plastered courtyards, stone-carved jharokhas, and structural woodwork. Every heritage home listed in our Restoration Collection meets modern sanitation, electricity, and plumbing codes while retaining its royal architectural soul.
              </p>

              <div className="flex items-center gap-3.5 mt-2">
                <Link
                  href="/listings?type=Independent House"
                  className="px-5 py-2.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-xs hover:shadow-md transition-colors shadow-sm"
                >
                  Explore Havelis
                </Link>
                <Link
                  href="/get-assistance"
                  className="px-5 py-2.5 rounded-xl border border-sand hover:border-terracotta/30 text-charcoal font-bold text-xs transition-colors"
                >
                  Request Heritage Hunt
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 3. BROWSE BY CITY */}
      <section className="relative py-24 z-20 bg-sand/35 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 gap-3">
            <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest">
              Explore Neighborhoods
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-charcoal tracking-tight">
              Browse by Rajasthan City
            </h2>
            <p className="text-charcoal/70 text-sm">
              Discover unique residential options, prices, and locations across Rajasthan&apos;s most iconic municipalities.
            </p>
          </div>

          {/* Cities 2-Column Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            {rajasthanCities.map((city) => {
              return (
                <motion.div
                  key={city.name}
                  variants={itemVariants}
                  onClick={() => handleCityBrowse(city.name)}
                  className="group relative h-64 rounded-3xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-500 border border-sand/50 bg-indigo"
                >
                  {/* Background Image or Gradient */}
                  {city.image ? (
                    <img
                      src={city.image}
                      alt={city.name}
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${city.bg.replace(/\/10/g, '/80')} opacity-80`} />
                  )}
                  
                  {/* Overlay Gradient for readability */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/30 to-charcoal/10 opacity-80 group-hover:opacity-90 transition-opacity duration-500" />

                  {/* Card Content Layout */}
                  <div className="absolute inset-0 p-6 flex flex-col justify-between">
                    
                    {/* Top Row: Count Tag & Action Icon */}
                    <div className="flex items-start justify-between w-full">
                      <span className="bg-white/20 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm">
                        <MapPin className="w-3 h-3 text-gold" />
                        {city.count} Properties
                      </span>
                      
                      <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 group-hover:-translate-y-1 transition-all duration-300">
                        <ArrowUpRight className="w-5 h-5" />
                      </div>
                    </div>

                    {/* Bottom Row: City Info */}
                    <div className="flex flex-col gap-1 transform translate-y-2 group-hover:translate-y-0 transition-transform duration-500">
                      <h3 className="text-2xl lg:text-3xl font-serif font-black text-white drop-shadow-md">
                        {city.name}
                      </h3>
                      <p className="text-xs text-slate-200 font-semibold line-clamp-1 opacity-90">
                        {city.desc}
                      </p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* 3.1 TOP TOURIST DESTINATIONS */}
      <section className="relative py-24 z-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 gap-3">
          <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest">
            Royal Landmarks
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
            Top Tourist Destinations
          </h2>
          <p className="text-charcoal/70 text-sm">
            Experience the cultural legacy, massive architecture, and scenic dunes of North India&apos;s most celebrated heritage locations.
          </p>
        </div>

        {/* Tourist Destination Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              name: "Udaipur",
              title: "The City of Lakes",
              desc: "Known for floating marble palaces, historic Mewar arches, and serene lakeside sunsets.",
              image: "https://images.unsplash.com/photo-1595238612450-e3c18b3550a4?auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "Jaipur",
              title: "The Pink City",
              desc: "Home of the majestic Hawa Mahal, block printers, royal fort gates, and bustling bazaars.",
              image: "https://images.unsplash.com/photo-1477587458883-471a5ed08be4?auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "Jaisalmer",
              title: "The Golden City",
              desc: "Discover ancient sandstone forts emerging from the Thar desert and yellow dune camps.",
              image: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=600&q=80"
            },
            {
              name: "Mount Abu",
              title: "Hill Station Oasis",
              desc: "Aravalli range hill retreat showcasing Nakki Lake views and Dilwara Jain stone carvings.",
              image: "https://images.unsplash.com/photo-1562813733-b31f71025d54?auto=format&fit=crop&w=600&q=80"
            }
          ].map((dest) => (
            <div
              key={dest.name}
              className="group relative h-72 rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 border border-sand"
            >
              <img
                src={dest.image}
                alt={dest.name}
                className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-charcoal/50" />
              <div className="absolute inset-0 flex flex-col justify-end p-5">
                <span className="text-[10px] font-extrabold text-gold uppercase tracking-wider mb-1">
                  Destination
                </span>
                <h3 className="text-lg font-serif font-black text-white">{dest.name}</h3>
                <span className="text-[11px] text-white/85 font-medium leading-none mb-1.5">{dest.title}</span>
                <p className="text-[10px] text-slate-300 font-medium leading-relaxed line-clamp-2">{dest.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3.2 WEDDING PLACES IN INDIA */}
      <section className="relative py-24 z-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 gap-3">
            <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest">
              Elite Celebrations
            </span>
            <h2 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
              Premium Wedding Places
            </h2>
            <p className="text-charcoal/70 text-sm">
              Discover Udaipur&apos;s floating lake palaces and North India&apos;s hilltop heritage forts, serving as the world&apos;s most romantic wedding hosts.
            </p>
          </div>

          {/* Wedding Venues Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: "Lake Palace, Udaipur",
                location: "Udaipur, Rajasthan",
                desc: "Floating marble monument on Lake Pichola, offering pure royal exclusivity.",
                image: "https://images.unsplash.com/photo-1595238612450-e3c18b3550a4?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Umaid Bhawan, Jodhpur",
                location: "Jodhpur, Rajasthan",
                desc: "One of the world's largest private residences built with golden sandstone arches.",
                image: "https://images.unsplash.com/photo-1590050752117-238cb0612b1b?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Rambagh Palace, Jaipur",
                location: "Jaipur, Rajasthan",
                desc: "The Jewel of Jaipur, displaying symmetrical Mughal gardens and heritage corridors.",
                image: "https://images.unsplash.com/photo-1598977123418-45f04b615e52?auto=format&fit=crop&w=600&q=80"
              },
              {
                name: "Neemrana Fort, Alwar",
                location: "Alwar, Delhi NCR Ext",
                desc: "15th-century heritage hill fort with tiered garden terraces and amphitheaters.",
                image: "https://images.unsplash.com/photo-1605538032432-a9f0c8d9baac?auto=format&fit=crop&w=600&q=80"
              }
            ].map((venue) => (
              <div
                key={venue.name}
                className="group bg-white rounded-2xl overflow-hidden border border-sand hover:border-terracotta/40 hover:-translate-y-1 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand/30">
                  <img
                    src={venue.image}
                    alt={venue.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-2.5 left-2.5 bg-cream px-2 py-0.5 rounded text-[8px] text-indigo font-black tracking-widest border border-sand uppercase">
                    {venue.location.split(",")[0]}
                  </div>
                </div>
                <div className="p-5 flex flex-col gap-2 text-left">
                  <h3 className="font-serif font-black text-base text-indigo line-clamp-1 group-hover:text-terracotta transition-colors duration-200">
                    {venue.name}
                  </h3>
                  <span className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">
                    {venue.location}
                  </span>
                  <p className="text-xs text-charcoal/65 font-medium leading-relaxed line-clamp-2">
                    {venue.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. THE BOUTIQUE APPROACH (How It Works) */}
      <section className="relative py-24 z-20 px-6 max-w-7xl mx-auto w-full">
        <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 gap-3">
          <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest">
            The Sourcing Protocol
          </span>
          <h2 className="text-3xl md:text-4xl font-serif font-black text-charcoal tracking-tight">
            Our Sourcing & Verification Process
          </h2>
          <p className="text-charcoal/70 text-sm">
            We operate differently from standard automated real estate sites. Every address undergoes strict title screening and physical assessment.
          </p>
        </div>

        {/* Steps Road (Systematic Overlapping Card Stack) */}
        <div className="flex flex-col md:flex-row items-stretch justify-center max-w-5xl mx-auto py-8 md:-space-x-8 lg:-space-x-10 space-y-4 md:space-y-0 px-4">
          {[
            {
              step: "01",
              title: "Physical Vetting",
              desc: "Our local agents inspect each listing in-person. We verify the structural integrity and document correct coordinates.",
              icon: <MapPin className="w-6 h-6 text-indigo" />,
            },
            {
              step: "02",
              title: "Legal Title Scrutiny",
              desc: "We perform full RERA verification and property title checks to protect you from encumbrances or leasehold disputes.",
              icon: <HomeIcon className="w-6 h-6 text-terracotta" />,
            },
            {
              step: "03",
              title: "Accompanied Tours",
              desc: "Schedule private physical viewings or high-definition live virtual walk-throughs with our local experts.",
              icon: <MessageSquare className="w-6 h-6 text-indigo" />,
            },
            {
              step: "04",
              title: "Registrar Handover",
              desc: "We assist with contract drafting, registrar registration, local stamp duties, and utilities handover.",
              icon: <Key className="w-6 h-6 text-gold" />,
            },
          ].map((item, idx) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="w-full md:w-72 bg-white border border-sand p-6 sm:p-7 rounded-3xl shadow-md hover:shadow-2xl hover:z-30 transition-all duration-300 transform hover:-translate-y-4 group hover:border-terracotta/40 cursor-pointer"
            >
              {/* Step indicator */}
              <span className="absolute top-4 right-5 text-3xl font-black text-sand/65 select-none group-hover:text-terracotta/20 transition-colors">
                {item.step}
              </span>

              {/* Icon container */}
              <div className="w-12 h-12 rounded-xl bg-sand/35 flex items-center justify-center mb-5 border border-sand group-hover:bg-terracotta/10 group-hover:border-terracotta/20 transition-all duration-200">
                {item.icon}
              </div>

              <h3 className="font-serif font-black text-base text-charcoal mb-2 group-hover:text-indigo transition-colors">
                {item.title}
              </h3>
              <p className="text-charcoal/70 text-xs leading-relaxed font-semibold">
                {item.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 4.5 CUSTOMER REVIEWS & INTAKE FORM */}
      <section className="relative py-24 z-20 bg-sand/10 border-t border-sand/30 px-6 w-full">
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12">

          {/* Left Side: Existing Reviews */}
          <div className="lg:col-span-7 flex flex-col gap-8 text-left">
            <div>
              <span className="text-terracotta font-extrabold text-xs uppercase tracking-widest block mb-2">
                Client Testimonials
              </span>
              <h2 className="text-3xl font-serif font-black text-indigo tracking-tight">
                Customer Reviews
              </h2>
              <p className="text-charcoal/70 text-sm mt-1">
                Read experiences from people who bought, sold, or relocated through our network.
              </p>
            </div>

            <div className="flex flex-col gap-6">
              {reviews.map((rev) => (
                <div
                  key={rev.id}
                  className="bg-white border border-sand p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between gap-4 mb-3">
                    <div className="flex flex-col">
                      <span className="font-serif font-black text-base text-indigo">{rev.name}</span>
                      <span className="text-[10px] text-charcoal/40 font-bold">{rev.date}</span>
                    </div>
                    {/* Stars */}
                    <div className="flex items-center gap-0.5 text-gold">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < rev.rating ? "fill-gold text-gold" : "text-sand"}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-charcoal/70 leading-relaxed font-semibold italic">
                    &ldquo;{rev.feedback}&rdquo;
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Simple Submission Interface */}
          <div className="lg:col-span-5">
            <div className="bg-white border border-sand p-6 sm:p-8 rounded-3xl shadow-lg text-left">
              <h3 className="font-serif font-black text-lg text-indigo mb-1">Leave Your Feedback</h3>
              <p className="text-xs text-charcoal/50 mb-6">Let us know about your property hunt or relocation experience.</p>

              <form onSubmit={handleReviewSubmit} className="flex flex-col gap-4 text-sm font-semibold">

                {/* Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Vikram Chauhan"
                    value={reviewName}
                    onChange={(e) => setReviewName(e.target.value)}
                    className="w-full bg-white border border-sand rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-terracotta text-charcoal font-medium"
                  />
                </div>

                {/* Rating */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo">Rating *</label>
                  <div className="flex gap-1.5 items-center">
                    {[1, 2, 3, 4, 5].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setReviewRating(val)}
                        className="p-1 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-5 h-5 ${val <= reviewRating ? "fill-gold text-gold" : "text-sand"
                            }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Feedback text */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-indigo">Your Experience *</label>
                  <textarea
                    rows={4}
                    required
                    placeholder="Tell us what you liked, your interactions with agents, or restoration quality..."
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    className="w-full bg-white border border-sand rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:border-terracotta text-charcoal font-medium resize-none"
                  />
                </div>

                {reviewSubmitted && (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 rounded-xl p-3 text-xs font-bold text-center">
                    Review submitted successfully! Khamagani Sa.
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 py-3 bg-terracotta hover:bg-terracotta-hover text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-1.5 hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer"
                >
                  <span>Submit Feedback</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

              </form>
            </div>
          </div>

        </div>
      </section>

      {/* 5. RELOCATION CONCIERGE BANNER (Sandstone Double Ruled Quote Box) */}
      <section className="relative z-20 pb-24 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-[#f5ebd2] text-charcoal p-8 md:p-12 lg:p-16 border-double-ruled border-terracotta/35 shadow-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-10"
        >
          {/* Background Decor Accents */}
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-terracotta/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo/5 rounded-full blur-[80px] pointer-events-none" />

          {/* Banner Text Content */}
          <div className="flex flex-col gap-5 max-w-2xl relative z-10 text-left">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-terracotta/10 border border-terracotta/20 text-terracotta text-[10px] font-extrabold tracking-widest uppercase w-fit">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Assisted Relocation</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black tracking-tight leading-tight text-indigo">
              Moving to Udaipur or Jaipur? <br className="hidden sm:inline" />
              Let Our Concierge Handle the Search.
            </h2>
            <p className="text-charcoal/85 text-xs sm:text-sm leading-relaxed font-semibold">
              Relocating from another state can be overwhelming. Let us know your specifications (budget, BHK layout, school distance), and our local city leads will secure RERA-certified properties, negotiate contract terms, and support your move-in.
            </p>

            {/* Real human quote overlay */}
            <div className="border-l-2 border-terracotta pl-4 py-1 mt-2 text-xs italic text-indigo font-bold max-w-lg">
              &ldquo;Finding a property in Udaipur that feels authentic yet modern was incredibly difficult from Bangalore. The concierge team found us a private lakeside villa within a week.&rdquo; <br />
              <span className="text-[10px] text-charcoal/60 font-extrabold uppercase tracking-wide block mt-1.5">— Dr. Amitabh Sen, Relocated in July 2025</span>
            </div>
          </div>

          {/* CTA Action button */}
          <div className="flex-shrink-0 relative z-10">
            <Link
              href="/get-assistance"
              className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm shadow-lg shadow-terracotta/20 hover:-translate-y-0.5 transition-all duration-200"
            >
              <span>Get Relocation Assistance</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.div>
      </section>

    </div>
  );
}

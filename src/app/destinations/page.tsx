"use client";

import React, { useState } from "react";
import Link from "next/link";
import { MapPin, ArrowRight, Compass, ShieldCheck, Filter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const DESTINATIONS = [
  // Rajasthan
  {
    name: "Udaipur",
    title: "The City of Lakes",
    desc: "Known for floating marble palaces, historic Mewar arches, and serene lakeside sunsets.",
    image: "https://images.unsplash.com/photo-1615836245337-f58249622d10?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Jaipur",
    title: "The Pink City",
    desc: "Home of the majestic Hawa Mahal, block printers, royal fort gates, and bustling bazaars.",
    image: "https://images.unsplash.com/photo-1599661509650-13f9f753229b?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Jaisalmer",
    title: "The Golden City",
    desc: "Discover ancient sandstone forts emerging from the Thar desert and yellow dune camps.",
    image: "https://images.unsplash.com/photo-1596895111956-bf1cf0599ce5?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Jodhpur",
    title: "The Blue City",
    desc: "Experience the imposing Mehrangarh Fort and vast azure neighborhoods stretching below.",
    image: "https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Mount Abu",
    title: "Hill Station Oasis",
    desc: "Aravalli range hill retreat showcasing Nakki Lake views and Dilwara Jain stone carvings.",
    image: "https://images.unsplash.com/photo-1621245595913-9114dce1fbd3?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Pushkar",
    title: "The Holy City",
    desc: "Sacred lakes, spiritual ghats, and the world-famous camel fair surrounded by hills.",
    image: "https://images.unsplash.com/photo-1587591605556-9d2c20dd93b3?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Kota",
    title: "River & Education Hub",
    desc: "Situated on the banks of the Chambal River, known for its educational prominence and gardens.",
    image: "https://images.unsplash.com/photo-1623910278913-99ab9403d526?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Bikaner",
    title: "Desert Heritage",
    desc: "Renowned for its impressive Junagarh Fort, Karni Mata Temple, and vibrant desert culture.",
    image: "https://images.unsplash.com/photo-1601058223659-43ccefc2f6e9?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  {
    name: "Rajsamand",
    title: "Lakes & Marble",
    desc: "Famous for the massive Rajsamand Lake and its thriving marble production industry.",
    image: "https://images.unsplash.com/photo-1634547432360-0ed6568285cb?q=80&w=800&auto=format&fit=crop",
    tag: "Rajasthan"
  },
  // Gujarat
  {
    name: "Ahmedabad",
    title: "Heritage City",
    desc: "India's first UNESCO World Heritage City, blending modern commerce with intricate architecture.",
    image: "https://images.unsplash.com/photo-1600150806193-01306b49233f?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat"
  },
  {
    name: "Surat",
    title: "The Diamond City",
    desc: "A bustling commercial center renowned worldwide for its diamond cutting and textile industries.",
    image: "https://images.unsplash.com/photo-1624647963283-4a159fbe9066?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat"
  },
  {
    name: "Rajkot",
    title: "Industrial Hub",
    desc: "A rapidly growing city in Saurashtra, known for its manufacturing and vibrant culture.",
    image: "https://images.unsplash.com/photo-1598977123118-4e50bb6c469b?q=80&w=800&auto=format&fit=crop",
    tag: "Gujarat"
  },
  // Himachal Pradesh
  {
    name: "Shimla",
    title: "Queen of Hills",
    desc: "The historic summer capital, featuring colonial architecture and breathtaking mountain views.",
    image: "https://images.unsplash.com/photo-1599839619722-39751411ea63?q=80&w=800&auto=format&fit=crop",
    tag: "Himachal Pradesh"
  },
  {
    name: "Dharamshala",
    title: "Spiritual Valleys",
    desc: "Home to the Dalai Lama, offering serene pine forests and vibrant Tibetan culture.",
    image: "https://images.unsplash.com/photo-1605640840469-87a1d1b31a89?q=80&w=800&auto=format&fit=crop",
    tag: "Himachal Pradesh"
  },
  // Rest of India
  {
    name: "Chandigarh",
    title: "The Planned City",
    desc: "Famed for its urban design by Le Corbusier, lush green sectors, and the Rock Garden.",
    image: "https://images.unsplash.com/photo-1609100877905-22d5140bf1dd?q=80&w=800&auto=format&fit=crop",
    tag: "Rest of India"
  },
  {
    name: "Agra",
    title: "City of the Taj",
    desc: "World-renowned for the magnificent Taj Mahal and deep Mughal historical roots.",
    image: "https://images.unsplash.com/photo-1564507592208-02754ba318dc?q=80&w=800&auto=format&fit=crop",
    tag: "Rest of India"
  }
];

const TAGS = ["All", "Rajasthan", "Gujarat", "Himachal Pradesh", "Rest of India"];

export default function DestinationsPage() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filteredDestinations = activeFilter === "All" 
    ? DESTINATIONS 
    : DESTINATIONS.filter(d => d.tag === activeFilter);

  return (
    <div className="flex flex-col w-full min-h-screen relative bg-cream/30">
      
      {/* 1. HERO SECTION (Editorial Split/Gradient) */}
      <section className="relative w-full h-[70vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-charcoal">
        {/* High Quality Background */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=2000&auto=format&fit=crop" 
            alt="Royal Rajasthan Palace" 
            className="w-full h-full object-cover opacity-60 mix-blend-overlay"
          />
          {/* Refined gradient overlay instead of heavy blur */}
          <div className="absolute inset-0 bg-gradient-to-b from-indigo/80 via-charcoal/50 to-cream/30" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 text-center flex flex-col items-center px-6 max-w-4xl mt-20">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black tracking-[0.2em] uppercase mb-8 shadow-2xl"
          >
            <Compass className="w-3.5 h-3.5 text-gold" />
            <span>Discover North India</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-serif font-black text-white tracking-tight leading-tight mb-6 drop-shadow-2xl"
          >
            Explore Royal <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold to-white">Destinations</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-white/80 font-medium text-base md:text-lg leading-relaxed max-w-2xl drop-shadow-md"
          >
            Experience the cultural legacy, massive architecture, and scenic landscapes of India&apos;s most celebrated locations. Find your next dream home or investment property across multiple states.
          </motion.p>
        </div>
        
        {/* Decorative mask at bottom */}
        <div className="absolute bottom-0 w-full h-32 bg-gradient-to-t from-cream/30 to-transparent z-10" />
      </section>

      {/* 2. FILTER & GRID SECTION */}
      <section className="relative py-16 px-6 max-w-7xl mx-auto w-full z-20 -mt-10">
        
        {/* Filters */}
        <div className="flex flex-col items-center gap-4 mb-16 relative z-30">
          <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-4 no-scrollbar px-4">
            <Filter className="w-4 h-4 text-charcoal/40 mr-2 flex-shrink-0" />
            {TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => setActiveFilter(tag)}
                className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold transition-all border ${
                  activeFilter === tag 
                    ? "bg-indigo text-white shadow-lg border-indigo"
                    : "bg-white/80 backdrop-blur-md text-charcoal/70 border-sand hover:border-terracotta/40 hover:bg-white"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Tall Luxury Cards Grid */}
        <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredDestinations.map((dest) => (
              <motion.div 
                key={dest.name} 
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4 }}
                className="group relative flex flex-col rounded-3xl overflow-hidden bg-white shadow-md hover:shadow-2xl transition-all duration-500 h-[500px]"
              >
                {/* Full-bleed Image Container */}
                <div className="absolute inset-0 z-0 bg-sand overflow-hidden">
                  <img 
                    src={dest.image} 
                    alt={dest.name} 
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                  />
                  {/* Heavy gradient at bottom to make text readable */}
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent opacity-90 transition-opacity duration-500 group-hover:opacity-80" />
                </div>
                
                {/* Top Tag Overlay */}
                <div className="absolute top-5 left-5 z-10 bg-white/10 backdrop-blur-md border border-white/20 text-white text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-full shadow-sm">
                  {dest.tag}
                </div>
                
                {/* Content Panel (Bottom) */}
                <div className="relative z-10 flex flex-col justify-end h-full p-6 pb-8">
                  <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
                    <h3 className="text-4xl font-serif font-black text-white drop-shadow-md mb-1">{dest.name}</h3>
                    <p className="text-xs text-gold font-bold uppercase tracking-widest mb-4">{dest.title}</p>
                    
                    <p className="text-sm text-white/80 font-medium leading-relaxed mb-6 line-clamp-3">
                      {dest.desc}
                    </p>
                    
                    <Link 
                      href={`/listings?city=${dest.name}`}
                      className="inline-flex items-center justify-between w-full p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white hover:text-indigo text-white transition-all duration-300 group/btn"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span className="text-xs font-bold tracking-widest uppercase">View Properties</span>
                      </div>
                      <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 3. VIP RELOCATION CTA */}
      <section className="relative z-20 py-24 px-6 max-w-5xl mx-auto w-full">
        <div className="relative rounded-[2rem] overflow-hidden bg-gradient-to-br from-indigo to-charcoal text-white p-10 md:p-14 border border-indigo/20 shadow-2xl flex flex-col items-center text-center gap-8">
          {/* Decorative luxury accents */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gold/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-terracotta/20 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="absolute top-4 left-4 right-4 bottom-4 border border-white/5 rounded-[1.5rem] pointer-events-none" />

          <div className="flex flex-col items-center gap-6 relative z-10">
            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mb-2 shadow-inner">
              <ShieldCheck className="w-8 h-8 text-gold" />
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-black tracking-tight leading-tight">
              Fell in love with a city? <br className="hidden md:inline" />
              Let Our Concierge Handle Your Move.
            </h2>
            <p className="text-white/70 text-sm md:text-base leading-relaxed font-medium max-w-2xl">
              Relocating from another state or city can be overwhelming. Let us know your specifications, and our local city leads will secure premium properties, negotiate contract terms, and seamlessly support your move-in.
            </p>
          </div>

          <div className="relative z-10 mt-2">
            <Link
              href="/get-assistance"
              className="group flex items-center justify-center gap-3 px-8 py-4 rounded-xl bg-gold hover:bg-gold-hover text-charcoal font-black text-sm uppercase tracking-widest shadow-xl shadow-gold/20 hover:-translate-y-1 transition-all duration-300"
            >
              <span>Request VIP Assistance</span>
              <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}

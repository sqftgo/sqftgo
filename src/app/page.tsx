"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useApp, Property } from "@/context/AppContext";
import PropertyCard, { formatIndianCurrency } from "@/components/ui/PropertyCard";
import CustomSelect from "@/components/ui/CustomSelect";
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
  Building2,
  User,
  Phone,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Star,
  Check,
  UserCheck,
  FileText,
  HelpCircle,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner",
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar",
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand",
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

const PROPERTY_TYPES = [
  { label: "All Types", value: "any" },
  { label: "Home", value: "Home" },
  { label: "Villa", value: "Villa" },
  { label: "Apartment", value: "Apartment" },
  { label: "Plots / Land", value: "Industrial Plot" },
  { label: "Commercial Space", value: "Commercial Space" },
  { label: "Office Space", value: "Office Space" },
];

const BUDGET_OPTIONS_BUY = [
  { label: "Any Price", value: "any" },
  { label: "Under ₹50 Lakh", value: "0-5000000" },
  { label: "₹50L - ₹1 Crore", value: "5000000-10000000" },
  { label: "₹1Cr - ₹3 Crore", value: "10000000-30000000" },
  { label: "Above ₹3 Crore", value: "30000000-999999999" },
];

const BUDGET_OPTIONS_RENT = [
  { label: "Any Rent", value: "any" },
  { label: "Under ₹15,000", value: "0-15000" },
  { label: "₹15,000 - ₹30,000", value: "15000-30000" },
  { label: "₹30,000 - ₹50,000", value: "30000-50000" },
  { label: "Above ₹50,000", value: "50000-999999" },
];

export default function Home() {
  const router = useRouter();
  const { properties, setSelectedCity, directoryProfiles } = useApp();

  // Search States
  const [heroTab, setHeroTab] = useState<"buy" | "rent" | "plots" | "commercial">("buy");
  const [searchCity, setSearchCity] = useState("Udaipur");
  const [searchLocality, setSearchLocality] = useState("");
  const [searchType, setSearchType] = useState("any");
  const [searchBudget, setSearchBudget] = useState("any");


  // Toggle for Top Picks
  const [topPicksTab, setTopPicksTab] = useState<"buy" | "rent" | "plots">("buy");

  const [shortlistedCount, setShortlistedCount] = useState(0);
  const [showToast, setShowToast] = useState(false);

  // Modals States
  const [showPriceTrends, setShowPriceTrends] = useState(false);
  const [showLocalityReviews, setShowLocalityReviews] = useState(false);
  const [showBuyersGuide, setShowBuyersGuide] = useState(false);

  // Carousel scroll refs
  const topPicksScrollRef = useRef<HTMLDivElement>(null);
  const prominentProjectsScrollRef = useRef<HTMLDivElement>(null);
  const developersScrollRef = useRef<HTMLDivElement>(null);
  const sellersScrollRef = useRef<HTMLDivElement>(null);
  const newlyAddedScrollRef = useRef<HTMLDivElement>(null);

  const scrollContainer = (ref: React.RefObject<HTMLDivElement | null>, direction: "left" | "right") => {
    if (ref.current) {
      const { scrollLeft, clientWidth } = ref.current;
      const scrollAmount = clientWidth * 0.75;
      ref.current.scrollTo({
        left: direction === "left" ? scrollLeft - scrollAmount : scrollLeft + scrollAmount,
        behavior: "smooth"
      });
    }
  };

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(searchCity);
    const params = new URLSearchParams();
    params.set("city", searchCity);
    
    if (heroTab === "rent") {
      params.set("purpose", "rent");
    } else {
      params.set("purpose", "buy");
    }

    if (heroTab === "plots") {
      params.set("type", "Industrial Plot");
    } else if (heroTab === "commercial") {
      params.set("type", "Commercial Space");
    } else if (searchType !== "any") {
      params.set("type", searchType);
    }

    if (searchLocality) params.set("locality", searchLocality);
    if (searchBudget !== "any") params.set("budget", searchBudget);

    router.push(`/listings?${params.toString()}`);
  };


  const handleShortlist = () => {
    setShortlistedCount((prev) => prev + 1);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCityBrowse = (cityName: string) => {
    setSelectedCity(cityName);
    router.push(`/listings?city=${cityName}`);
  };

  // Filters for Top Picks
  const filteredTopPicks = properties.filter((p) => {
    if (topPicksTab === "buy") {
      return p.purpose === "buy" && p.featured;
    } else if (topPicksTab === "rent") {
      return p.purpose === "rent" && p.featured;
    } else {
      return p.type === "Industrial Plot" || p.type === "Agricultural Land";
    }
  });

  const displayTopPicks = filteredTopPicks.length > 0 ? filteredTopPicks : properties.slice(0, 6);

  // Filters for Builders
  const builders = directoryProfiles.filter((p) => p.category === "Builder & Developer");
  
  // Filters for Sellers
  const sellers = directoryProfiles.filter((p) => p.category === "Agent & Broker" || p.category === "Property Consultant");

  // Newly Added Properties (last 6 properties in database)
  const newlyAddedProperties = [...properties]
    .sort((a, b) => b.id.localeCompare(a.id))
    .slice(0, 6);

  // Quick Browse cities list with custom visuals
  const browseCities = [
    { name: "Udaipur", count: 240, desc: "Lake & Restoration Villas", image: "https://content.jdmagicbox.com/comp/udaipur-rajasthan/h6/9999px294.x294.190109172305.s8h6/catalogue/archi-s-galaxy-udaipur-rajasthan-th9b6z57si.jpg" },
    { name: "Jaipur", count: 480, desc: "Elite Penthouses & Apartments", image: "https://www.jaipurpropertyhouse.in/wp-content/uploads/2022/12/arihant-avana-mansarovar-jaipur.jpg" },
    { name: "Jodhpur", count: 180, desc: "Sun City Heritage Haveli Estates", image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.2700,73.0100" },
    { name: "Jaisalmer", count: 110, desc: "Sandstone Havelis & Thar Plots", image: "https://maps.google.com/cbk?output=thumbnail&w=600&h=400&ll=26.9124,70.9127" },
  ];

  // Static Projects list
  const mockProjects = [
    {
      id: "proj-1",
      name: "Sun Valley Royal Vista",
      developer: "Mewar Builders & Developers",
      price: "₹75 Lakh - ₹1.8 Crore",
      location: "Fateh Sagar, Udaipur",
      bhk: "2, 3 & 4 BHK Luxury Apartments",
      image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=24.5764,73.6836"
    },
    {
      id: "proj-2",
      name: "Aravali Ridge Residency",
      developer: "Jaipur Heritage Housing",
      price: "₹85 Lakh - ₹2.5 Crore",
      location: "Malviya Nagar, Jaipur",
      bhk: "3 & 4 BHK Premium Apartments",
      image: "https://www.jaipurpropertyhouse.in/wp-content/uploads/2022/12/arihant-avana-mansarovar-jaipur.jpg"
    },
    {
      id: "proj-3",
      name: "Fort View Meadows",
      developer: "Marwar Palace Homes",
      price: "₹1.2 Crore - ₹3.7 Crore",
      location: "Mehrangarh Road, Jodhpur",
      bhk: "Independent Heritage Villas",
      image: "https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.2700,73.0100"
    },
    {
      id: "proj-4",
      name: "Chambal Heights",
      developer: "Riverfront Builders Group",
      price: "₹38 Lakh - ₹85 Lakh",
      location: "Kunhari, Kota",
      bhk: "1, 2 & 3 BHK Flats & Penthouses",
      image: "https://maps.google.com/cbk?output=thumbnail&w=600&h=400&ll=25.1800,75.8300"
    }
  ];

  return (
    <div className="flex-1 flex flex-col w-full relative">

      {/* 1. HERO SECTION WITH INTEGRATED SEARCH BANNER */}
      <section className="relative pt-2 pb-12 text-charcoal overflow-hidden z-10 px-4 md:px-6 bg-[#faf8f5]">
        <div className="max-w-7xl mx-auto w-full relative overflow-hidden rounded-[36px] bg-[#0c1b33] min-h-[480px] md:min-h-[520px] flex items-center justify-center p-6 sm:p-8 shadow-xl border border-white/5">
          {/* Background Image */}
          <img
            src="/indian_heritage_hero_bg.png"
            alt="Luxury Rajasthan Heritage Lake Palace Background"
            className="absolute inset-0 w-full h-full object-cover object-center select-none pointer-events-none"
          />
          {/* Dark overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#09152b]/65 via-[#09152b]/55 to-[#09152b]/75" />
          
          <div className="w-full relative z-20 flex flex-col items-center justify-center text-center gap-5 py-4">
            <div className="flex flex-col items-center gap-2">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-sans font-black tracking-tight leading-tight text-white max-w-3xl text-center">
                <span className="text-terracotta">believe</span> in finding it
              </h1>
              
              <p className="text-white/80 text-sm sm:text-base md:text-lg font-medium max-w-2xl leading-relaxed mt-1 text-center">
                with India's largest choice of luxury & heritage homes
              </p>
            </div>

            {/* Floating Search Card — Matching Reference Layout */}
            <div className="w-full max-w-3xl relative z-20">
              <form onSubmit={handleHeroSearch} className="bg-white rounded-2xl shadow-2xl border-t-[4px] border-t-[#0c1b33]">
                
                {/* Tab Row */}
                <div className="flex items-center gap-6 px-6 sm:px-8 pt-5 pb-4">
                  {[
                    { key: "buy", label: "BUY" },
                    { key: "rent", label: "RENT" },
                    { key: "plots", label: "PLOTS" },
                    { key: "commercial", label: "COMMERCIAL" }
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      type="button"
                      onClick={() => {
                        setHeroTab(tab.key as any);
                        setSearchType("any");
                        setSearchBudget("any");
                      }}
                      className={`text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer relative ${
                        heroTab === tab.key
                          ? "text-indigo border border-indigo rounded-full px-4 py-1.5"
                          : "text-charcoal/50 hover:text-charcoal px-1 py-1.5"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {/* Divider */}
                <div className="border-t border-gray-200 mx-6 sm:mx-8" />

                {/* 4-Column Filter Row */}
                <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-0 px-6 sm:px-8 py-5">
                  
                  {/* SELECT CITY */}
                  <div className="flex items-center gap-3 pr-4 border-r border-gray-200 last:border-r-0">
                    <div className="w-9 h-9 rounded-full border-2 border-terracotta/30 flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-4 h-4 text-terracotta" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-1">Select City</span>
                      <CustomSelect
                        options={CITIES.map((c) => ({ label: c, value: c }))}
                        value={searchCity}
                        onChange={setSearchCity}
                        placeholder="Select City"
                        searchable
                        buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer"
                        inlineChevron
                      />
                    </div>
                  </div>

                  {/* LOCALITY */}
                  <div className="flex items-center gap-3 px-4 border-r border-gray-200 last:border-r-0">
                    <div className="w-9 h-9 rounded-full border-2 border-indigo/20 flex items-center justify-center flex-shrink-0">
                      <Compass className="w-4 h-4 text-indigo" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-1">Locality</span>
                      <input
                        type="text"
                        placeholder="Search locality..."
                        value={searchLocality}
                        onChange={(e) => setSearchLocality(e.target.value)}
                        className="text-sm font-bold text-charcoal bg-transparent outline-none placeholder:text-charcoal/30 w-full py-0"
                      />
                    </div>
                  </div>

                  {/* TYPE */}
                  <div className="flex items-center gap-3 px-4 border-r border-gray-200 last:border-r-0">
                    <div className="w-9 h-9 rounded-full border-2 border-indigo/20 flex items-center justify-center flex-shrink-0">
                      <HomeIcon className="w-4 h-4 text-indigo" />
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-1">Type</span>
                      <CustomSelect
                        options={PROPERTY_TYPES}
                        value={searchType}
                        onChange={setSearchType}
                        placeholder="All Types"
                        buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer"
                        inlineChevron
                      />
                    </div>
                  </div>

                  {/* BUDGET LIMIT */}
                  <div className="flex items-center gap-3 pl-4">
                    <div className="w-9 h-9 rounded-full border-2 border-indigo/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-indigo font-bold text-sm">₹</span>
                    </div>
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none mb-1">Budget Limit</span>
                      <CustomSelect
                        options={heroTab === "rent" ? BUDGET_OPTIONS_RENT : BUDGET_OPTIONS_BUY}
                        value={searchBudget}
                        onChange={setSearchBudget}
                        placeholder="Any Price"
                        buttonClassName="text-sm font-bold text-charcoal py-0 cursor-pointer"
                        inlineChevron
                      />
                    </div>
                  </div>

                </div>

                {/* CTA Button */}
                <div className="px-6 sm:px-8 pb-6 pt-1">
                  <button
                    type="submit"
                    className="w-full bg-terracotta hover:bg-terracotta-hover text-white font-extrabold text-sm uppercase tracking-wider py-4 rounded-xl shadow-lg transition-all duration-200 cursor-pointer active:scale-[0.98] flex items-center justify-center gap-2.5 border-none"
                  >
                    <span>Find Properties</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </form>
            </div>

            {/* Professional Trust Stats Counter */}
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 mt-4 pt-6 border-t border-white/10 w-full max-w-3xl">
              {[
                { value: "1,200+", label: "Verified Listings" },
                { value: "100%", label: "RERA Certified" },
                { value: "₹4,200 Cr+", label: "Property Managed" },
                { value: "24/7", label: "Relocation Help" }
              ].map((stat, i) => (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[120px]">
                  <span className="text-lg sm:text-xl font-serif font-black text-white leading-none">
                    {stat.value}
                  </span>
                  <span className="text-[8px] font-bold text-white/50 uppercase tracking-widest leading-none">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 2. SVREPL'S TOP PICKS SECTION (Housing's Top Picks Style) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-1.5 text-terracotta font-black text-xs uppercase tracking-wider">
              <Compass className="w-4 h-4 animate-spin-slow" />
              <span>Handpicked Real Estate</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
              SVREPL&apos;s Top Picks
            </h2>
          </div>

          {/* Quick Filter Tabs & Navigation */}
          <div className="flex items-center flex-wrap gap-4">
            
            {/* Filter Tabs */}
            <div className="flex bg-sand/35 border border-sand/50 p-1 rounded-xl">
              {[
                { key: "buy", label: "For Sale" },
                { key: "rent", label: "For Rent" },
                { key: "plots", label: "Land/Plots" }
              ].map((pickTab) => (
                <button
                  key={pickTab.key}
                  type="button"
                  onClick={() => setTopPicksTab(pickTab.key as any)}
                  className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                    topPicksTab === pickTab.key
                      ? "bg-white text-indigo shadow-sm border border-sand/30"
                      : "text-charcoal/50 hover:text-charcoal"
                  }`}
                >
                  {pickTab.label}
                </button>
              ))}
            </div>

            {/* Slider Navigation Buttons */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollContainer(topPicksScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollContainer(topPicksScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>

        </div>

        {/* Top Picks Horizontal Carousel */}
        <div
          ref={topPicksScrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
        >
          {displayTopPicks.map((property) => (
            <div key={property.id} className="w-[300px] sm:w-[360px] flex-shrink-0 snap-start relative group flex flex-col bg-white border border-sand rounded-2xl shadow-sm hover:shadow-xl hover:border-terracotta/30 transition-all duration-300 overflow-hidden">
              
              {/* Image & Badges */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand/30">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                {/* Overlay Badge */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
                  <span className={`px-3 py-1 rounded text-[8px] font-black uppercase tracking-wider text-white shadow-sm w-fit ${
                    property.purpose === "buy" || property.purpose === "sell" 
                      ? "bg-indigo" 
                      : "bg-terracotta"
                  }`}>
                    {property.purpose === "buy" || property.purpose === "sell" ? "For Sale" : "For Rent"}
                  </span>
                  
                  {property.reraApproved && (
                    <span className="px-2.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider text-emerald-800 bg-white/95 border border-emerald-200 shadow-sm">
                      RERA Registered
                    </span>
                  )}
                </div>

                {/* Shortlist Button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleShortlist();
                  }}
                  className="absolute top-3 right-3 z-20 w-8 h-8 rounded-full bg-white/95 hover:bg-white text-charcoal hover:text-terracotta flex items-center justify-center shadow-md active:scale-90 transition-all duration-200 cursor-pointer"
                  title="Shortlist"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4.5 h-4.5 hover:fill-terracotta">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                  </svg>
                </button>
              </div>

              {/* Card Details */}
              <div className="p-5 flex flex-col flex-grow text-left justify-between">
                <div className="flex flex-col gap-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="text-xl font-serif font-black text-terracotta">
                      {formatIndianCurrency(property.price, property.purpose)}
                    </span>
                    <span className="text-[9px] font-black text-indigo bg-indigo/5 border border-indigo/10 px-2 py-0.5 rounded uppercase">
                      {property.type}
                    </span>
                  </div>

                  <h3 className="font-serif font-black text-base text-charcoal line-clamp-1 group-hover:text-indigo transition-colors duration-200">
                    {property.title}
                  </h3>

                  <div className="flex items-center gap-1 text-charcoal/60 text-xs">
                    <MapPin className="w-3.5 h-3.5 text-terracotta/80 shrink-0" />
                    <span className="font-semibold truncate">{property.locality}, {property.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-sand pt-4 mt-4">
                  <div className="flex items-center gap-3 text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">
                    {property.bhk && <span>{property.bhk} BHK</span>}
                    <span>{property.size} SQFT</span>
                  </div>
                  
                  <Link
                    href={`/property/${property.id}`}
                    className="flex items-center gap-1 px-4 py-2 bg-indigo hover:bg-indigo-hover text-white rounded-xl font-bold text-[10px] uppercase tracking-wider transition-colors"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 3. PROMINENT PROJECTS TO EXPLORE (Housing's Prominent Projects Style) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Elite Residential Communities
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Prominent Projects to Explore
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollContainer(prominentProjectsScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollContainer(prominentProjectsScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Projects Horizontal Carousel */}
          <div
            ref={prominentProjectsScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {mockProjects.map((project) => (
              <div key={project.id} className="w-[300px] sm:w-[380px] flex-shrink-0 snap-start bg-white border border-sand rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group overflow-hidden">
                
                {/* Project Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand/35">
                  <img
                    src={project.image}
                    alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute bottom-3 left-3 bg-cream/90 backdrop-blur-sm px-3 py-1 rounded-lg border border-sand text-[9px] text-indigo font-black uppercase tracking-wider">
                    {project.location.split(",")[1]?.trim() || project.location}
                  </div>
                </div>

                {/* Project Info */}
                <div className="p-5 flex flex-col text-left justify-between flex-grow">
                  <div className="flex flex-col gap-2">
                    <span className="text-[9px] font-black text-indigo/60 uppercase tracking-widest">
                      Developer: {project.developer}
                    </span>
                    <h3 className="font-serif font-black text-lg text-charcoal line-clamp-1 group-hover:text-terracotta transition-colors duration-200">
                      {project.name}
                    </h3>
                    <p className="text-xs text-charcoal/60 font-semibold">{project.bhk}</p>
                    <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-bold uppercase mt-1">
                      <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                      <span className="truncate">{project.location}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-sand pt-4 mt-5">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase tracking-wider">Starting Price</span>
                      <span className="text-base font-serif font-black text-indigo">{project.price.split("-")[0]}</span>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => router.push(`/listings?city=${project.location.split(",")[1]?.trim() || "Udaipur"}`)}
                      className="px-4 py-2 bg-indigo hover:bg-indigo-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all"
                    >
                      Explore Project
                    </button>
                  </div>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 4. TOP HIGHLIGHTED PROJECTS (Side-by-side Showcase Cards) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2.5">
          <span className="text-terracotta font-black text-xs uppercase tracking-wider">
            Premium Highlight Collections
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
            Top Highlighted Projects
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm">
            Handpicked architecture portfolios, showcasing elite properties in highly sought-after cities.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Highlight 1 */}
          <div className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-sand transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
              alt="Udaipur Lakeside Villas"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-charcoal/10" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left items-start">
              <span className="text-gold text-[9px] font-black uppercase tracking-widest mb-1.5">Exclusive Collection</span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-2">Restored Lakeside Villas, Udaipur</h3>
              <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-md mb-5">
                Breathtaking view plots, swimming pools, and limestone arches resting on the shores of Lake Pichola and Fateh Sagar.
              </p>
              <button
                onClick={() => handleCityBrowse("Udaipur")}
                className="px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
              >
                <span>Browse Villas</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Highlight 2 */}
          <div className="group relative h-80 rounded-3xl overflow-hidden shadow-md hover:shadow-xl border border-sand transition-all duration-300">
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
              alt="Jaipur Luxury Penthouses"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/40 to-charcoal/10" />
            <div className="absolute inset-0 p-8 flex flex-col justify-end text-left items-start">
              <span className="text-gold text-[9px] font-black uppercase tracking-widest mb-1.5">Modern Heritage</span>
              <h3 className="text-xl sm:text-2xl font-serif font-black text-white mb-2">Premium Royal Penthouses, Jaipur</h3>
              <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-md mb-5">
                High-rise residential configurations in Malviya Nagar & Mansarovar, featuring modern amenities and Aravali hill views.
              </p>
              <button
                onClick={() => handleCityBrowse("Jaipur")}
                className="px-5 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-[10px] font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1"
              >
                <span>Browse Penthouses</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>

      </section>

      {/* 5. PROJECTS BY TRUSTED DEVELOPERS (Housing's Builders Showcases) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Verified Builders Directory
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Projects by Trusted Developers
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollContainer(developersScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollContainer(developersScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Developers Carousel */}
          <div
            ref={developersScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {builders.map((profile) => (
              <div key={profile.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white border border-sand p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-indigo/25 transition-all duration-300 flex flex-col justify-between group">
                
                <div className="flex flex-col gap-4 text-left">
                  {/* Builder Header Logo/Avatar */}
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-indigo/5 border border-indigo/10 flex items-center justify-center text-indigo group-hover:scale-110 group-hover:bg-indigo/10 transition-all duration-300">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <h4 className="font-serif font-black text-sm text-charcoal truncate">{profile.firmName}</h4>
                      <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider flex items-center gap-0.5">
                        <Check className="w-2.5 h-2.5" />
                        <span>RERA Registered Builder</span>
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-charcoal/60 leading-relaxed font-semibold line-clamp-3">
                    {profile.description}
                  </p>

                  {/* Micro Stats */}
                  <div className="grid grid-cols-2 gap-4 border-y border-sand/40 py-3.5 my-1">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase">Owner</span>
                      <span className="text-[11px] font-black text-charcoal truncate">{profile.ownerName}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-charcoal/40 uppercase">Category</span>
                      <span className="text-[11px] font-black text-terracotta truncate">{profile.category.split("&")[0]}</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-4">
                  <div className="flex items-center gap-2 text-xs text-charcoal/50 font-bold">
                    <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                    <span className="truncate">{profile.address}</span>
                  </div>

                  <Link
                    href={`/dealers/${profile.id}`}
                    className="w-full py-2.5 mt-2 bg-indigo/5 hover:bg-indigo border border-indigo/10 hover:border-indigo text-indigo hover:text-white rounded-xl text-center font-bold text-[10px] uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1.5"
                  >
                    <span>View Projects</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 6. RESEARCH & INSIGHTS (Housing's Insights Cards with Modal Trigger) */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="text-center max-w-2xl mx-auto mb-12 flex flex-col gap-2.5">
          <span className="text-terracotta font-black text-xs uppercase tracking-wider">
            Market Intelligence
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
            Research & Insights
          </h2>
          <p className="text-charcoal/60 text-xs sm:text-sm">
            Make informed financial decisions with real-time analytics, local reviews, and compliance checklists.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          
          {/* Card 1: Price Trends */}
          <div
            onClick={() => setShowPriceTrends(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-terracotta/35 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-terracotta/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-terracotta/10 border border-terracotta/20 text-terracotta flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-terracotta transition-colors">
                Real Estate Price Trends
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                Review historical price per sqft values across Udaipur, Jaipur, and Jodhpur over the last 5 years.
              </p>
            </div>
            <span className="text-[10px] text-terracotta font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Analyze Trends</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 2: Locality Review */}
          <div
            onClick={() => setShowLocalityReviews(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-indigo/25 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-indigo/10 border border-indigo/20 text-indigo flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-indigo transition-colors">
                Locality Review Index
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                Read independent scores regarding connectivity, safety, and school density in top residential neighborhoods.
              </p>
            </div>
            <span className="text-[10px] text-indigo font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Read Reviews</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

          {/* Card 3: Buyer's Guide */}
          <div
            onClick={() => setShowBuyersGuide(true)}
            className="group bg-white border border-sand p-6 rounded-3xl shadow-sm hover:shadow-xl hover:border-gold/45 transition-all duration-300 cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-gold/5 to-transparent rounded-bl-full" />
            <div>
              <div className="w-12 h-12 rounded-xl bg-gold/15 border border-gold/30 text-gold flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="font-serif font-black text-lg text-charcoal mb-2 group-hover:text-gold/90 transition-colors">
                Red-Tape Buyer&apos;s Guide
              </h3>
              <p className="text-charcoal/60 text-xs font-semibold leading-relaxed">
                A checklist of legal document procedures, registry structures, stamp duty protocols, and title scrutiny.
              </p>
            </div>
            <span className="text-[10px] text-gold/90 font-black uppercase tracking-wider mt-6 flex items-center gap-1">
              <span>Browse Checklist</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </div>

        </div>

      </section>

      {/* 7. RECOMMENDED SELLERS SECTION (Housing's Certified Agents) */}
      <section className="relative py-20 bg-sand/20 border-y border-sand/40 w-full px-6">
        <div className="max-w-7xl mx-auto w-full">

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
            <div className="flex flex-col gap-2 text-left">
              <span className="text-terracotta font-black text-xs uppercase tracking-wider">
                Certified Professional Partners
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
                Recommended Sellers
              </h2>
            </div>

            {/* Slider Navigation */}
            <div className="hidden sm:flex items-center gap-2">
              <button
                type="button"
                onClick={() => scrollContainer(sellersScrollRef, "left")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Left"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => scrollContainer(sellersScrollRef, "right")}
                className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
                title="Scroll Right"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Recommended Sellers Carousel */}
          <div
            ref={sellersScrollRef}
            className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
          >
            {sellers.map((profile) => (
              <div key={profile.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white border border-sand p-6 rounded-2xl shadow-sm hover:shadow-xl hover:border-terracotta/30 transition-all duration-300 flex flex-col justify-between group">
                
                <div className="flex flex-col gap-4 text-left">
                  
                  {/* Seller Header */}
                  <div className="flex items-start justify-between">
                    <div className="w-12 h-12 rounded-xl bg-terracotta/5 border border-terracotta/10 flex items-center justify-center text-terracotta font-bold">
                      <User className="w-6 h-6" />
                    </div>
                    
                    <span className="inline-flex items-center gap-1 bg-gold/15 text-gold border border-gold/30 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider">
                      <Award className="w-2.5 h-2.5" />
                      <span>RECOMMENDED</span>
                    </span>
                  </div>

                  <div className="flex flex-col">
                    <h3 className="font-serif font-black text-base text-charcoal line-clamp-1 group-hover:text-indigo transition-colors duration-200">
                      {profile.firmName}
                    </h3>
                    <span className="text-[10px] text-charcoal/50 font-bold uppercase tracking-wider">{profile.ownerName}</span>
                  </div>

                  <p className="text-[11px] text-charcoal/60 leading-relaxed font-semibold line-clamp-2">
                    {profile.description}
                  </p>

                  <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 border border-amber-200 px-2 py-1 rounded w-fit">
                    <Star className="w-3 h-3 fill-amber-500" />
                    <span>4.9 / 5.0 Rated Agent</span>
                  </div>

                </div>

                <div className="flex flex-col gap-3 mt-5 pt-4 border-t border-sand">
                  
                  {/* Address & Contacts */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2 text-xs text-charcoal/50 font-bold">
                      <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                      <span className="truncate">{profile.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-charcoal/50 font-bold">
                      <Phone className="w-3.5 h-3.5 text-indigo/70 shrink-0" />
                      <span>{profile.mobile}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dealers/${profile.id}`}
                    className="w-full py-2.5 bg-indigo hover:bg-indigo-hover text-white rounded-xl text-center font-bold text-[10px] uppercase tracking-wider transition-all shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Contact Seller</span>
                  </Link>

                </div>

              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 8. NEWLY-ADDED PROPERTIES SECTION */}
      <section className="relative py-20 px-6 max-w-7xl mx-auto w-full">
        
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-8">
          <div className="flex flex-col gap-2 text-left">
            <span className="text-terracotta font-black text-xs uppercase tracking-wider">
              Fresh Listings In The Region
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-black text-charcoal tracking-tight">
              Newly-Added Properties
            </h2>
          </div>

          {/* Slider Navigation */}
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollContainer(newlyAddedScrollRef, "left")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Left"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => scrollContainer(newlyAddedScrollRef, "right")}
              className="w-9 h-9 rounded-full bg-white hover:bg-sand border border-sand text-charcoal flex items-center justify-center shadow-sm cursor-pointer active:scale-95 transition-transform"
              title="Scroll Right"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Newly Added Properties Carousel */}
        <div
          ref={newlyAddedScrollRef}
          className="flex overflow-x-auto gap-6 pb-6 pt-2 scrollbar-none snap-x snap-mandatory scroll-smooth items-stretch"
        >
          {newlyAddedProperties.map((property) => (
            <div key={property.id} className="w-[280px] sm:w-[320px] flex-shrink-0 snap-start bg-white border border-sand rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col group overflow-hidden">
              
              {/* Thumbnail */}
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand/35">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                
                <div className="absolute top-2.5 left-2.5 bg-indigo/95 px-2 py-0.5 rounded text-[8px] font-black uppercase text-white tracking-wider">
                  New Listing
                </div>
              </div>

              {/* Info Details */}
              <div className="p-4 flex flex-col text-left justify-between flex-grow">
                <div className="flex flex-col gap-1.5">
                  <span className="text-[10px] font-black text-terracotta uppercase">{formatIndianCurrency(property.price, property.purpose)}</span>
                  <h3 className="font-serif font-black text-sm text-charcoal line-clamp-1 group-hover:text-indigo transition-colors duration-200">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-1 text-[11px] text-charcoal/50 font-bold uppercase truncate">
                    <MapPin className="w-3.5 h-3.5 text-terracotta/75 shrink-0" />
                    <span>{property.locality}, {property.city}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-sand pt-3.5 mt-4">
                  <div className="flex items-center gap-2 text-[9px] text-charcoal/40 font-bold uppercase">
                    {property.bhk && <span>{property.bhk} BHK</span>}
                    <span>{property.size} SQFT</span>
                  </div>
                  
                  <Link
                    href={`/property/${property.id}`}
                    className="text-[9px] font-black uppercase tracking-wider text-indigo hover:text-terracotta font-sans flex items-center gap-0.5 transition-colors"
                  >
                    <span>View</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

            </div>
          ))}
        </div>

      </section>

      {/* 9. HAVE A PROPERTY TO SELL? CTA BANNER */}
      <section className="relative z-20 pb-20 px-6 max-w-7xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-terracotta to-orange-600 text-white p-8 md:p-12 shadow-2xl lg:grid lg:grid-cols-12 lg:items-center lg:gap-12 gap-8 border-2 border-white/10 group"
        >
          {/* Subtle Back Decor */}
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-white/5 rounded-full blur-[80px] pointer-events-none" />
          
          <div className="lg:col-span-7 flex flex-col gap-6 text-left relative z-10">
            <span className="px-3 py-1 bg-white/20 border border-white/10 text-white text-[9px] font-black uppercase tracking-widest rounded w-fit">
              Owner services
            </span>
            <div className="flex flex-col gap-3">
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-black tracking-tight leading-tight text-white">
                Have a property to sell or rent? <br />
                List it with SVREPL completely free.
              </h2>
              <p className="text-slate-100 text-xs sm:text-sm leading-relaxed font-semibold max-w-xl">
                Connect with genuine RERA-compliant buyers, agents, and brokers in Rajasthan. Reach out to our verified active database of thousands of clients looking for heritage villas and luxury houses.
              </p>
            </div>
            
            <div className="w-fit">
              <Link
                href="/post-property"
                className="flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white hover:bg-cream text-terracotta hover:text-terracotta-hover font-black text-xs uppercase tracking-widest shadow-lg transition-all duration-200"
              >
                <span>List Property Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Stylized Image Column */}
          <div className="hidden lg:flex lg:col-span-5 justify-center items-center relative z-10 min-h-[380px]">
            <div className="relative w-[300px] h-[360px]">
              {/* Peach Background Card (Tilted) */}
              <div className="absolute inset-0 bg-[#ffd6cc] rounded-[32px] shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-all duration-500" />
              
              {/* Offset Tilted White Outline Border */}
              <div className="absolute inset-0 border-2 border-white/80 rounded-[32px] transform rotate-3 group-hover:rotate-0 transition-all duration-500 pointer-events-none" />
              
              {/* Image Container (Tilted slightly differently) */}
              <div className="absolute inset-3 rounded-[24px] overflow-hidden bg-white shadow-lg transform -rotate-2 group-hover:rotate-0 transition-all duration-500">
                <img
                  src="/services_hero.png"
                  alt="Couple using tablet for listing a property"
                  className="w-full h-full object-cover object-center"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* 11. PRICE TRENDS MODAL */}
      <AnimatePresence>
        {showPriceTrends && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPriceTrends(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                type="button"
                onClick={() => setShowPriceTrends(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-terracotta" />
                <h3 className="font-serif font-black text-xl text-indigo">Average Property Price Trends (2021-2026)</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Average valuation in Rupees per Square Foot (₹/sqft) for luxury residential properties across Rajasthan&apos;s key municipalities.
              </p>

              {/* SVG Line Chart */}
              <div className="w-full bg-sand/15 border border-sand/40 rounded-2xl p-4 sm:p-6 mb-6">
                <svg viewBox="0 0 500 250" className="w-full h-auto text-charcoal">
                  
                  {/* Grid Lines */}
                  <line x1="40" y1="40" x2="480" y2="40" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="90" x2="480" y2="90" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  <line x1="40" y1="190" x2="480" y2="190" stroke="rgba(28, 37, 48, 0.08)" strokeDasharray="3" />
                  
                  {/* Axes */}
                  <line x1="40" y1="20" x2="40" y2="210" stroke="rgba(28, 37, 48, 0.3)" />
                  <line x1="40" y1="210" x2="490" y2="210" stroke="rgba(28, 37, 48, 0.3)" />

                  {/* Y Axis Labels */}
                  <text x="35" y="44" textAnchor="end" className="text-[9px] font-black text-charcoal/50">10k</text>
                  <text x="35" y="94" textAnchor="end" className="text-[9px] font-black text-charcoal/50">7.5k</text>
                  <text x="35" y="144" textAnchor="end" className="text-[9px] font-black text-charcoal/50">5k</text>
                  <text x="35" y="194" textAnchor="end" className="text-[9px] font-black text-charcoal/50">2.5k</text>
                  
                  {/* X Axis Labels */}
                  <text x="40" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2021</text>
                  <text x="128" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2022</text>
                  <text x="216" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2023</text>
                  <text x="304" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2024</text>
                  <text x="392" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2025</text>
                  <text x="480" y="225" textAnchor="middle" className="text-[9px] font-black text-charcoal/50">2026</text>

                  {/* Line 1: Jaipur (Indigo) */}
                  {/* points: 2021: 5.5k (y=130), 2022: 6.0k (y=120), 2023: 6.8k (y=104), 2024: 7.2k (y=96), 2025: 8.1k (y=78), 2026: 8.9k (y=62) */}
                  <path d="M 40 130 L 128 120 L 216 104 L 304 96 L 392 78 L 480 62" fill="none" stroke="var(--brand-indigo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  
                  {/* Line 2: Udaipur (Terracotta) */}
                  {/* points: 2021: 4.5k (y=150), 2022: 4.9k (y=142), 2023: 5.5k (y=130), 2024: 6.1k (y=118), 2025: 6.8k (y=104), 2026: 7.5k (y=90) */}
                  <path d="M 40 150 L 128 142 L 216 130 L 304 118 L 392 104 L 480 90" fill="none" stroke="var(--brand-terracotta)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Line 3: Jodhpur (Gold) */}
                  {/* points: 2021: 3.8k (y=164), 2022: 4.0k (y=160), 2023: 4.4k (y=152), 2024: 5.0k (y=140), 2025: 5.5k (y=130), 2026: 6.1k (y=118) */}
                  <path d="M 40 164 L 128 160 L 216 152 L 304 140 L 392 130 L 480 118" fill="none" stroke="var(--brand-gold)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

                </svg>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-4 flex-wrap text-xs font-bold">
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-indigo block" />
                    <span>Jaipur (Avg. +12.4% y-o-y)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-terracotta block" />
                    <span>Udaipur (Avg. +10.8% y-o-y)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-4 h-1.5 rounded-full bg-gold block" />
                    <span>Jodhpur (Avg. +9.6% y-o-y)</span>
                  </div>
                </div>
              </div>

              <div className="bg-sand/20 border border-sand/40 rounded-2xl p-4 text-xs leading-relaxed font-semibold">
                <span className="text-indigo font-black block mb-1">Key Takeaway:</span>
                Due to the massive surge in post-pandemic destination weddings, hospitality groups buying out heritage locations, and active RERA infrastructure development, Udaipur and Jaipur have outpaced national real estate averages by over 4.2%.
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 12. LOCALITY REVIEWS MODAL */}
      <AnimatePresence>
        {showLocalityReviews && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowLocalityReviews(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                type="button"
                onClick={() => setShowLocalityReviews(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-6 h-6 text-indigo" />
                <h3 className="font-serif font-black text-xl text-indigo">Locality Index Ratings</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Consolidated live rating reports by independent RERA compliance experts, rating critical lifestyle indices.
              </p>

              <div className="flex flex-col gap-6">
                {[
                  {
                    name: "Fateh Sagar Lake Locality",
                    city: "Udaipur",
                    connectivity: 4.8,
                    safety: 4.9,
                    schools: 4.5,
                    description: "Udaipur's most premium residential lake edge. Extreme security, tourist-friendly, highly walkable, and completely pollution controlled."
                  },
                  {
                    name: "Malviya Nagar",
                    city: "Jaipur",
                    connectivity: 4.9,
                    safety: 4.8,
                    schools: 4.9,
                    description: "High-density retail malls, luxury apartments, and metro-rail access. One of Rajasthan's most premium and active family neighborhoods."
                  },
                  {
                    name: "Mehrangarh Road Haveli District",
                    city: "Jodhpur",
                    connectivity: 4.2,
                    safety: 4.7,
                    schools: 4.0,
                    description: "Steeped in royal history. Historic blue-walled havelis. Moderate vehicle access but highly sought-after for tourism and homestay conversions."
                  }
                ].map((loc, idx) => (
                  <div key={idx} className="bg-sand/15 border border-sand/35 p-5 rounded-2xl text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                      <div className="flex flex-col">
                        <h4 className="font-serif font-black text-base text-charcoal">{loc.name}</h4>
                        <span className="text-[9px] font-black text-indigo uppercase">{loc.city}</span>
                      </div>
                      <div className="flex gap-4 text-[10px] font-black text-indigo uppercase tracking-wider bg-white px-3 py-1 rounded-lg border border-sand/30 shadow-sm w-fit shrink-0">
                        <span>Conn: ⭐ {loc.connectivity}</span>
                        <span>Safe: ⭐ {loc.safety}</span>
                        <span>Edu: ⭐ {loc.schools}</span>
                      </div>
                    </div>
                    <p className="text-xs text-charcoal/70 leading-relaxed font-semibold">
                      {loc.description}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 13. BUYER'S GUIDE CHECKLIST MODAL */}
      <AnimatePresence>
        {showBuyersGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBuyersGuide(false)}
              className="absolute inset-0 bg-charcoal/60 backdrop-blur-sm"
            />
            
            {/* Modal Body */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-sand z-10 text-charcoal max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <button
                type="button"
                onClick={() => setShowBuyersGuide(false)}
                className="absolute top-4 right-4 text-charcoal/40 hover:text-charcoal transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-6 h-6 text-gold" />
                <h3 className="font-serif font-black text-xl text-indigo">Property Purchase Compliance Checklist</h3>
              </div>
              
              <p className="text-xs text-charcoal/60 mb-6 font-semibold">
                Avoid real estate fraud and disputes by ensuring the following document legal milestones are completely checked.
              </p>

              <div className="flex flex-col gap-4 text-left">
                {[
                  {
                    step: "01",
                    title: "RERA Registration Number Check",
                    description: "Verify that the project or property is registered on the Rajasthan Real Estate Regulatory Authority (RERA) website. This guarantees regulatory compliance and delivery security."
                  },
                  {
                    step: "02",
                    title: "Title Deed Verification",
                    description: "Request a clean trace of ownership. Check that there are no pending legal mortgage encumbrances by demanding a 30-year non-encumbrance certificate."
                  },
                  {
                    step: "03",
                    title: "Land Use Conversion Documents",
                    description: "Ensure the plot has correct CLU (Change of Land Use) clearance for residential construction if purchasing agricultural land."
                  },
                  {
                    step: "04",
                    title: "Stamp Duty & Local Registration Details",
                    description: "Make sure stamp duty values are calculated based on Rajasthan circle rates. Pay via government e-GRAS and register at the local Sub-Registrar office."
                  }
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-4 border-b border-sand/40 pb-4 last:border-b-0">
                    <div className="w-8 h-8 rounded-full bg-sand/30 text-indigo flex-shrink-0 flex items-center justify-center font-bold text-xs">
                      {item.step}
                    </div>
                    <div className="flex flex-col gap-1">
                      <h4 className="font-serif font-black text-sm text-charcoal">{item.title}</h4>
                      <p className="text-xs text-charcoal/65 leading-relaxed font-semibold">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Shortlist Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 bg-indigo text-white px-5 py-3 rounded-2xl shadow-2xl border border-sand/20 flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center text-gold">
              ★
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold font-sans">Added to Shortlist!</span>
              <span className="text-[10px] text-white/60 font-semibold">{shortlistedCount} properties saved</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

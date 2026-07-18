"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Search, MapPin, Home, IndianRupee, Compass } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

const CITIES = [
  "All India",
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

const PROPERTY_TYPES = [
  "Home", "Villa", "Hotel", "Agricultural Land", "Apartment", 
  "Office Space", "Commercial Space", "Shop", "Industrial Plot"
];

const BUDGET_BUY_OPTIONS = [
  { label: "Any Price", value: "any" },
  { label: "Under ₹50 Lakh", value: "0-5000000" },
  { label: "₹50L - ₹1 Crore", value: "5000000-10000000" },
  { label: "₹1Cr - ₹3 Crore", value: "10000000-30000000" },
  { label: "Above ₹3 Crore", value: "30000000-999999999" },
];

const BUDGET_RENT_OPTIONS = [
  { label: "Any Rent", value: "any" },
  { label: "Under ₹15,000", value: "0-15000" },
  { label: "₹15,000 - ₹30,000", value: "15000-30000" },
  { label: "₹30,000 - ₹50,000", value: "30000-50000" },
  { label: "Above ₹50,000", value: "50000-999999" },
];

export const SearchBar: React.FC = () => {
  const router = useRouter();
  const { selectedCity, setSelectedCity } = useApp();
  
  const [purpose, setPurpose] = useState<"buy" | "sell" | "rent" | "lease">("buy");
  const [locality, setLocality] = useState("");
  const [type, setType] = useState("any");
  const [budget, setBudget] = useState("any");

  const [searchCity, setSearchCity] = useState(selectedCity);

  useEffect(() => {
    setSearchCity(selectedCity);
  }, [selectedCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSelectedCity(searchCity);
    
    const params = new URLSearchParams();
    params.set("city", searchCity);
    params.set("purpose", purpose);
    if (locality) params.set("locality", locality);
    if (type !== "any") params.set("type", type);
    if (budget !== "any") params.set("budget", budget);
    
    router.push(`/listings?${params.toString()}`);
  };

  const budgetOptions = (purpose === "buy" || purpose === "sell") ? BUDGET_BUY_OPTIONS : BUDGET_RENT_OPTIONS;

  return (
    <div className="w-full max-w-6xl mx-auto rounded-3xl bg-cream border border-sand p-5 shadow-2xl">
      
      {/* 1. Left-aligned outline Tabs Selector */}
      <div className="flex flex-wrap gap-2.5 mb-4 px-1">
        {(["buy", "sell", "rent", "lease"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            onClick={() => {
              setPurpose(mode);
              setBudget("any");
            }}
            className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer ${
              purpose === mode
                ? "bg-sand border border-terracotta/40 text-terracotta shadow-sm"
                : "bg-transparent text-charcoal/60 hover:text-charcoal border border-transparent"
            }`}
          >
            {mode === "buy" ? "Buy" : mode === "sell" ? "Sell" : mode === "rent" ? "Rent" : "Lease"} Property
          </button>
        ))}
      </div>

      {/* 2. Grid Fields (City, Locality, Type, Budget, Search Button) */}
      <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3.5 items-stretch">
        
        {/* Field 1: City Dropdown */}
        <div className="lg:col-span-3 flex items-center gap-3 border border-sand bg-white/70 hover:border-terracotta/25 rounded-2xl px-4 py-2.5 transition-colors relative group">
          <MapPin className="w-5 h-5 text-terracotta/75 flex-shrink-0" />
          <div className="flex flex-col flex-1 text-left min-w-0 w-full">
            <span className="text-[10px] font-bold text-charcoal/50 tracking-wide uppercase leading-none mb-1">
              Select City
            </span>
            <CustomSelect
              options={CITIES.map((c) => ({ label: c, value: c }))}
              value={searchCity}
              onChange={setSearchCity}
              searchable
              className="w-full"
              buttonClassName="text-sm font-bold text-charcoal bg-transparent py-0.5 leading-tight"
            />
          </div>
        </div>

        {/* Field 2: Locality Input */}
        <div className="lg:col-span-3 flex items-center gap-3 border border-sand bg-white/70 hover:border-terracotta/25 rounded-2xl px-4 py-2.5 transition-colors relative group">
          <Compass className="w-5 h-5 text-terracotta/75 flex-shrink-0" />
          <div className="flex flex-col flex-1 text-left min-w-0">
            <span className="text-[10px] font-bold text-charcoal/50 tracking-wide uppercase leading-none mb-1">
              Locality
            </span>
            <input
              type="text"
              value={locality}
              onChange={(e) => setLocality(e.target.value)}
              placeholder="e.g. Fateh Sagar, Malviya Nagar"
              className="text-sm font-bold text-charcoal bg-transparent outline-none w-full py-0.5 placeholder-charcoal/40 leading-tight"
            />
          </div>
        </div>

        {/* Field 3: Property Type Dropdown */}
        <div className="lg:col-span-2 flex items-center gap-3 border border-sand bg-white/70 hover:border-terracotta/25 rounded-2xl px-4 py-2.5 transition-colors relative group">
          <Home className="w-5 h-5 text-terracotta/75 flex-shrink-0" />
          <div className="flex flex-col flex-1 text-left min-w-0 w-full">
            <span className="text-[10px] font-bold text-charcoal/50 tracking-wide uppercase leading-none mb-1">
              Property Type
            </span>
            <CustomSelect
              options={[{ label: "All Types", value: "any" }, ...PROPERTY_TYPES.map((t) => ({ label: t, value: t }))]}
              value={type}
              onChange={setType}
              className="w-full"
              buttonClassName="text-sm font-bold text-charcoal bg-transparent py-0.5 leading-tight"
            />
          </div>
        </div>

        {/* Field 4: Budget Dropdown */}
        <div className="lg:col-span-2 flex items-center gap-3 border border-sand bg-white/70 hover:border-terracotta/25 rounded-2xl px-4 py-2.5 transition-colors relative group">
          <IndianRupee className="w-5 h-5 text-terracotta/75 flex-shrink-0" />
          <div className="flex flex-col flex-1 text-left min-w-0 w-full">
            <span className="text-[10px] font-bold text-charcoal/50 tracking-wide uppercase leading-none mb-1">
              Budget
            </span>
            <CustomSelect
              options={budgetOptions}
              value={budget}
              onChange={setBudget}
              className="w-full"
              buttonClassName="text-sm font-bold text-charcoal bg-transparent py-0.5 leading-tight"
            />
          </div>
        </div>

        {/* Field 5: Capsule Search Button */}
        <div className="lg:col-span-2 flex items-stretch">
          <button
            type="submit"
            className="w-full py-3.5 px-5 rounded-2xl bg-terracotta hover:bg-terracotta-hover text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-terracotta/15 hover:shadow-terracotta/25 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <Search className="w-4.5 h-4.5" />
            <span>Search</span>
          </button>
        </div>

      </form>
    </div>
  );
};
export default SearchBar;

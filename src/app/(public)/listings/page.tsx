"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, Property } from "@/context/AppContext";
import {
  PropertyCard,
  formatIndianCurrency,
  FilterPanel,
  type FilterState,
  CustomSelect,
  EmptyState,
  CityMap,
} from "@/components/ui";
import { SlidersHorizontal, Info, MapPin, Grid, Map, X, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

const PROPERTY_TYPES = [
  "Home", "Villa", "Hotel", "Agricultural Land", "Apartment", 
  "Office Space", "Commercial Space", "Shop", "Industrial Plot"
];

const BUDGET_BUY_MIN_OPTIONS = [
  { label: "Min Price", value: "" },
  { label: "₹10 Lakhs", value: "1000000" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹75 Lakhs", value: "7500000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" }
];

const BUDGET_BUY_MAX_OPTIONS = [
  { label: "Max Price", value: "" },
  { label: "₹25 Lakhs", value: "2500000" },
  { label: "₹50 Lakhs", value: "5000000" },
  { label: "₹75 Lakhs", value: "7500000" },
  { label: "₹1 Crore", value: "10000000" },
  { label: "₹2 Crores", value: "20000000" },
  { label: "₹5 Crores", value: "50000000" },
  { label: "₹10 Crores", value: "100000000" },
  { label: "₹15 Crores", value: "150000000" }
];

const BUDGET_RENT_MIN_OPTIONS = [
  { label: "Min Rent", value: "" },
  { label: "₹5,000", value: "5000" },
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹1 Lakh", value: "100000" }
];

const BUDGET_RENT_MAX_OPTIONS = [
  { label: "Max Rent", value: "" },
  { label: "₹10,000", value: "10000" },
  { label: "₹15,000", value: "15000" },
  { label: "₹20,000", value: "20000" },
  { label: "₹30,000", value: "30000" },
  { label: "₹50,000", value: "50000" },
  { label: "₹1 Lakh", value: "100000" },
  { label: "₹2 Lakhs", value: "200000" }
];

// Helper to filter listings based on criteria
const filterProperties = (list: Property[], filters: FilterState): Property[] => {
  return list.filter((p) => {
    // 1. City check
    if (filters.city && filters.city.toLowerCase() !== "all india" && p.city.toLowerCase() !== filters.city.toLowerCase()) return false;

    // 2. Locality check
    if (filters.locality && !p.locality.toLowerCase().includes(filters.locality.toLowerCase())) return false;

    // 3. Purpose (rent vs buy)
    if (filters.purpose !== "all" && p.purpose !== filters.purpose) return false;

    // 4. Property Type
    if (filters.type !== "any" && p.type !== filters.type) return false;

    // 5. BHK
    if (filters.bhk.length > 0 && p.bhk && !filters.bhk.includes(p.bhk.toString())) return false;

    // 6. Furnishing
    if (filters.furnishing.length > 0 && !filters.furnishing.includes(p.furnished)) return false;

    // 7. Min Price
    if (filters.minPrice) {
      const minVal = parseInt(filters.minPrice);
      if (!isNaN(minVal) && p.price < minVal) return false;
    }

    // 8. Max Price
    if (filters.maxPrice) {
      const maxVal = parseInt(filters.maxPrice);
      if (!isNaN(maxVal) && p.price > maxVal) return false;
    }

    // 9. RERA registered check
    if (filters.reraApprovedOnly && !p.reraApproved) return false;

    // 10. Featured curation check
    if (filters.featuredOnly && !p.featured) return false;

    // 11. Active status
    if (p.status !== "Active") return false;

    // 12. Size check
    if (filters.minSize) {
      const minS = parseInt(filters.minSize);
      if (!isNaN(minS) && p.size < minS) return false;
    }
    if (filters.maxSize) {
      const maxS = parseInt(filters.maxSize);
      if (!isNaN(maxS) && p.size > maxS) return false;
    }

    // 13. Amenities check
    if (filters.selectedAmenities && filters.selectedAmenities.length > 0) {
      const hasAll = filters.selectedAmenities.every((amenity) =>
        p.amenities.some((a) => a.toLowerCase().includes(amenity.toLowerCase()))
      );
      if (!hasAll) return false;
    }

    return true;
  });
};

function ListingsContent() {
  const searchParams = useSearchParams();
  const { properties, selectedCity, setSelectedCity, propertiesError, propertiesReady } = useApp();

  // Initializing state with query parameters
  const [filters, setFilters] = useState<FilterState>({
    city: selectedCity,
    locality: "",
    purpose: "all",
    type: "any",
    bhk: [],
    furnishing: [],
    minPrice: "",
    maxPrice: "",
    reraApprovedOnly: false,
    featuredOnly: false,
    minSize: "",
    maxSize: "",
    selectedAmenities: [],
  });

  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"grid" | "split">("grid");
  const [activeMapCity, setActiveMapCity] = useState<string>(selectedCity);
  // Sync parameters from URL
  useEffect(() => {
    const urlCity = searchParams.get("city") || selectedCity;
    const urlPurpose = (searchParams.get("purpose") as "all" | "buy" | "sell" | "rent" | "lease") || "all";
    const urlLocality = searchParams.get("locality") || "";
    const urlType = searchParams.get("type") || "any";
    const urlBudget = searchParams.get("budget") || "any";
    const urlRera = searchParams.get("rera") === "true";
    const urlFeatured = searchParams.get("featured") === "true";
    const urlBhkParam = searchParams.get("bhk");
    const urlBhk = urlBhkParam ? urlBhkParam.split(",") : [];

    let min = "";
    let max = "";

    if (urlBudget !== "any") {
      const parts = urlBudget.split("-");
      min = parts[0] || "";
      max = parts.length > 1 ? parts[1] : "";
    }

    setFilters({
      city: urlCity,
      locality: urlLocality,
      purpose: urlPurpose,
      type: urlType,
      bhk: urlBhk,
      furnishing: [],
      minPrice: min,
      maxPrice: max,
      reraApprovedOnly: urlRera,
      featuredOnly: urlFeatured,
      minSize: "",
      maxSize: "",
      selectedAmenities: [],
    });
    
    if (urlCity !== selectedCity) {
      setSelectedCity(urlCity);
    }
  }, [searchParams]);

  // Keep filters.city in sync with context
  useEffect(() => {
    if (selectedCity !== filters.city) {
      setFilters((prev) => ({ ...prev, city: selectedCity }));
    }
    setActiveMapCity(selectedCity);
  }, [selectedCity]);

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    if (newFilters.city !== selectedCity) {
      setSelectedCity(newFilters.city);
    }
  };

  const resetFilters = () => {
    setFilters({
      city: selectedCity,
      locality: "",
      purpose: "all",
      type: "any",
      bhk: [],
      furnishing: [],
      minPrice: "",
      maxPrice: "",
      reraApprovedOnly: false,
      featuredOnly: false,
      minSize: "",
      maxSize: "",
      selectedAmenities: [],
    });
  };

  // Active Filter Chips calculation
  const getActiveChips = () => {
    const chips: { label: string; key: keyof FilterState; value?: string }[] = [];
    if (filters.city) chips.push({ label: `City: ${filters.city}`, key: "city" });
    if (filters.locality) chips.push({ label: `Locality: ${filters.locality}`, key: "locality" });
    if (filters.purpose !== "all") chips.push({ label: `Purpose: ${filters.purpose}`, key: "purpose" });
    if (filters.type !== "any") chips.push({ label: `Type: ${filters.type}`, key: "type" });
    
    if (filters.minPrice) {
      const minVal = parseInt(filters.minPrice);
      const minText = formatIndianCurrency(minVal, filters.purpose === "all" ? "buy" : filters.purpose);
      chips.push({ label: `Min: ${minText}`, key: "minPrice" });
    }
    if (filters.maxPrice) {
      const maxVal = parseInt(filters.maxPrice);
      const maxText = formatIndianCurrency(maxVal, filters.purpose === "all" ? "buy" : filters.purpose);
      chips.push({ label: `Max: ${maxText}`, key: "maxPrice" });
    }
    if (filters.minSize) {
      chips.push({ label: `Min Size: ${filters.minSize} sq.ft.`, key: "minSize" });
    }
    if (filters.maxSize) {
      chips.push({ label: `Max Size: ${filters.maxSize} sq.ft.`, key: "maxSize" });
    }
    if (filters.reraApprovedOnly) chips.push({ label: "RERA Registered", key: "reraApprovedOnly" });
    if (filters.featuredOnly) chips.push({ label: "Featured Collection", key: "featuredOnly" });
    filters.bhk.forEach((b) => chips.push({ label: `${b} BHK`, key: "bhk", value: b }));
    filters.furnishing.forEach((f) => chips.push({ label: f, key: "furnishing", value: f }));
    (filters.selectedAmenities || []).forEach((a) => chips.push({ label: a, key: "selectedAmenities", value: a }));
    return chips;
  };

  const removeChip = (chip: { label: string; key: keyof FilterState; value?: string }) => {
    if (chip.key === "bhk") {
      handleFilterChange({
        ...filters,
        bhk: filters.bhk.filter((b) => b !== chip.value)
      });
    } else if (chip.key === "furnishing") {
      handleFilterChange({
        ...filters,
        furnishing: filters.furnishing.filter((f) => f !== chip.value)
      });
    } else if (chip.key === "selectedAmenities") {
      handleFilterChange({
        ...filters,
        selectedAmenities: (filters.selectedAmenities || []).filter((a) => a !== chip.value)
      });
    } else if (chip.key === "purpose") {
      handleFilterChange({ ...filters, purpose: "all", minPrice: "", maxPrice: "" });
    } else if (chip.key === "type") {
      handleFilterChange({ ...filters, type: "any" });
    } else if (chip.key === "reraApprovedOnly" || chip.key === "featuredOnly") {
      handleFilterChange({ ...filters, [chip.key]: false });
    } else if (chip.key === "city") {
      handleFilterChange({ ...filters, city: "Udaipur" });
    } else {
      handleFilterChange({ ...filters, [chip.key]: "" });
    }
  };

  // 1. Filtered listings
  const filteredList = filterProperties(properties, filters);

  // 2. Sorted listings
  const sortedList = [...filteredList].sort((a, b) => {
    if (sortOrder === "price-low") return a.price - b.price;
    if (sortOrder === "price-high") return b.price - a.price;
    if (sortOrder === "size-high") return b.size - a.size;
    return b.id.localeCompare(a.id); // mock latest by ID
  });

  const listContainerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06
      }
    }
  };

  const cardItemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.98 },
    show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 100, damping: 15 } },
    exit: { opacity: 0, y: -15, scale: 0.98, transition: { duration: 0.15 } }
  };

  const activeChips = getActiveChips();

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-20 pt-6">

      {propertiesError ? (
        <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
          Could not refresh listings: {propertiesError}. Showing last loaded data if any.
        </div>
      ) : null}
      {!propertiesReady ? (
        <div className="mb-4 rounded-2xl border border-indigo/10 bg-indigo/5 px-4 py-3 text-sm font-semibold text-indigo">
          Loading properties…
        </div>
      ) : null}
      
      {/* Premium Header Banner Card */}
      <div className="w-full rounded-3xl bg-cream/90 border border-sand p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10 text-left">
          <h1 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
            Properties in {filters.city}
          </h1>
          <p className="text-charcoal/70 text-xs font-semibold">
            Browse restored heritage havelis, luxury villas, offices, and plots in {filters.city}.
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10 border-t md:border-t-0 md:border-l border-sand pt-4 md:pt-0 md:pl-8">
          <div className="flex flex-col text-left">
            <span className="text-2xl font-serif font-black text-indigo">
              {sortedList.length}
            </span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Matching listings</span>
          </div>
          <div className="flex flex-col text-left border-l border-sand pl-6">
            <span className="text-2xl font-serif font-black text-terracotta">
              {sortedList.filter(p => p.featured).length}
            </span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Featured</span>
          </div>
        </div>
      </div>

      {/* Horizontal Filter Header Bar (99acres / Housing.com inspired) */}
      <div className="w-full bg-white border border-sand rounded-3xl p-4 md:p-5 shadow-md grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-nowrap gap-4 items-end mb-4 z-20 relative text-left">
        {/* City Filter */}
        <div className="flex flex-col gap-1.5 min-w-[130px] flex-grow md:flex-grow-0">
          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">City</span>
          <CustomSelect
            options={CITIES.map(c => ({ label: c, value: c }))}
            value={filters.city}
            onChange={(val) => handleFilterChange({ ...filters, city: val })}
            searchable
            buttonClassName="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl px-3 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
          />
        </div>

        {/* Locality Input */}
        <div className="flex flex-col gap-1.5 min-w-[180px] flex-grow">
          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Search Locality</span>
          <div className="relative">
            <input
              type="text"
              value={filters.locality}
              onChange={(e) => handleFilterChange({ ...filters, locality: e.target.value })}
              placeholder="e.g. Fateh Sagar, Malviya Nagar"
              className="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl pl-8 pr-3 py-2.5 hover:border-terracotta focus:outline-none focus:border-terracotta transition-colors w-full"
            />
            <Search className="w-3.5 h-3.5 text-charcoal/40 absolute left-3 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-1.5 min-w-[140px] flex-grow md:flex-grow-0">
          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Property Type</span>
          <CustomSelect
            options={[{ label: "All Types", value: "any" }, ...PROPERTY_TYPES.map(t => ({ label: t, value: t }))]}
            value={filters.type}
            onChange={(val) => handleFilterChange({ ...filters, type: val })}
            buttonClassName="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl px-3 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
          />
        </div>

        {/* Purpose */}
        <div className="flex flex-col gap-1.5 min-w-[100px] flex-grow md:flex-grow-0">
          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Purpose</span>
          <CustomSelect
            options={[
              { label: "All Modes", value: "all" },
              { label: "Buy", value: "buy" },
              { label: "Sell", value: "sell" },
              { label: "Rent", value: "rent" },
              { label: "Lease", value: "lease" }
            ]}
            value={filters.purpose}
            onChange={(val: string) => handleFilterChange({ ...filters, purpose: val as "buy" | "sell" | "rent" | "lease" | "all", minPrice: "", maxPrice: "" })}
            buttonClassName="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl px-3 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
          />
        </div>

        {/* Budget Min/Max range */}
        <div className="flex flex-col gap-1.5 min-w-[260px] flex-grow">
          <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest leading-none">Budget Price Range</span>
          <div className="flex items-center gap-2">
            <CustomSelect
              options={filters.purpose === "rent" || filters.purpose === "lease" ? BUDGET_RENT_MIN_OPTIONS : BUDGET_BUY_MIN_OPTIONS}
              value={filters.minPrice}
              onChange={(val) => handleFilterChange({ ...filters, minPrice: val })}
              className="w-full"
              buttonClassName="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
            />
            <span className="text-charcoal/30 text-xs font-bold font-sans">to</span>
            <CustomSelect
              options={filters.purpose === "rent" || filters.purpose === "lease" ? BUDGET_RENT_MAX_OPTIONS : BUDGET_BUY_MAX_OPTIONS}
              value={filters.maxPrice}
              onChange={(val) => handleFilterChange({ ...filters, maxPrice: val })}
              className="w-full"
              buttonClassName="bg-cream/40 border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
            />
          </div>
        </div>

        {/* Filter Toggle Mobile Button / Desktop Action */}
        <div className="flex lg:hidden gap-2 items-stretch pt-2 lg:pt-0 self-end w-full sm:col-span-2 lg:col-span-1">
          <button
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-sand bg-white text-charcoal text-xs font-bold flex-grow cursor-pointer"
          >
            <SlidersHorizontal className="w-4 h-4 text-terracotta" />
            <span>More Filters</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Row */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-left">
          <span className="text-[10px] font-bold text-charcoal/40 uppercase tracking-wider">Active Filters:</span>
          {activeChips.map((chip) => (
            <span
              key={chip.label}
              className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-sand/35 text-indigo border border-sand"
            >
              <span>{chip.label}</span>
              <button
                onClick={() => removeChip(chip)}
                className="p-0.5 rounded-full hover:bg-sand text-charcoal/50 hover:text-terracotta cursor-pointer"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
          <button
            onClick={resetFilters}
            className="text-[10px] font-black text-terracotta uppercase hover:underline ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-4">
        
        {/* Left Sidebar Filters (Simplified for advanced features only) */}
        <div className="hidden lg:block lg:col-span-3">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
            showBasicFilters={false}
          />
        </div>

        {/* Results Container */}
        <div className="col-span-1 lg:col-span-9 transition-all duration-300">
          <div className="flex flex-col gap-5">
            
            {/* View Mode & Sort Header row */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-sand text-left">
              <div>
                <span className="text-[10px] font-black text-charcoal/40 uppercase tracking-wider">
                  Showing {sortedList.length} Properties in {filters.city}
                </span>
              </div>

              <div className="flex items-center gap-3">


                {/* Sorting */}
                <CustomSelect
                  options={[
                    { label: "Latest First", value: "latest" },
                    { label: "Price: Low to High", value: "price-low" },
                    { label: "Price: High to Low", value: "price-high" },
                    { label: "Size: Largest First", value: "size-high" }
                  ]}
                  value={sortOrder}
                  onChange={setSortOrder}
                  className="w-48"
                  buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-3 py-2.5 hover:border-terracotta transition-colors text-left w-full cursor-pointer"
                  align="right"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Cards Grid */}
              <div className={`transition-all duration-300 flex flex-col gap-6 ${
                viewMode === "split" ? "lg:col-span-7 xl:col-span-7" : "lg:col-span-12 xl:col-span-12"
              }`}>
                {sortedList.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`${filters.city}-${filters.type}-${filters.purpose}-${viewMode}`}
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="show"
                      className={`grid gap-6 ${
                        viewMode === "split"
                          ? "grid-cols-1 sm:grid-cols-2"
                          : "grid-cols-1"
                      }`}
                    >
                      {sortedList.map((property) => (
                        <motion.div key={property.id} variants={cardItemVariants}>
                          <PropertyCard 
                            property={property} 
                            onSelect={(p) => setActiveMapCity(p.city)}
                            layout={viewMode === "split" ? "grid" : "list"}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <EmptyState
                    title="No Listings Found"
                    description={`We couldn't find any properties matching your criteria in ${filters.city}. Try resetting the filters or modifying details.`}
                    actionLabel="Reset Filters"
                    onAction={resetFilters}
                  />
                )}
              </div>

              {/* Sticky Relocation Map */}
              {viewMode === "split" && (
                <div className="lg:col-span-5 xl:col-span-5 lg:sticky lg:top-24 z-10 transition-all duration-300">
                  <CityMap city={activeMapCity} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Side Drawer Modal */}
      <AnimatePresence>
        {mobileFiltersOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileFiltersOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />
            {/* Side sheet drawer */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed top-0 right-0 bottom-0 w-[85%] max-w-sm bg-white dark:bg-slate-900 shadow-2xl z-50 p-1 overflow-y-auto"
            >
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                onReset={resetFilters}
                onClose={() => setMobileFiltersOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex-1 flex items-center justify-center py-32">
        <svg className="animate-spin h-8 w-8 text-emerald-500" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

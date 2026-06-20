"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useApp, Property } from "@/context/AppContext";
import PropertyCard, { formatIndianCurrency } from "@/components/ui/PropertyCard";
import FilterPanel, { FilterState } from "@/components/ui/FilterPanel";
import CustomSelect from "@/components/ui/CustomSelect";
import EmptyState from "@/components/ui/EmptyState";
import { SlidersHorizontal, Info, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper to filter listings based on criteria
const filterProperties = (list: Property[], filters: FilterState): Property[] => {
  return list.filter((p) => {
    // 1. City check
    if (p.city.toLowerCase() !== filters.city.toLowerCase()) return false;

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

    // 9. Active status
    if (p.status !== "Active") return false;

    return true;
  });
};

function ListingsContent() {
  const searchParams = useSearchParams();
  const { properties, selectedCity, setSelectedCity } = useApp();

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
  });

  const [sortOrder, setSortOrder] = useState<string>("latest");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState<boolean>(false);

  // Sync parameters from URL
  useEffect(() => {
    const urlCity = searchParams.get("city") || selectedCity;
    const urlPurpose = (searchParams.get("purpose") as "all" | "buy" | "sell" | "rent" | "lease") || "all";
    const urlLocality = searchParams.get("locality") || "";
    const urlType = searchParams.get("type") || "any";
    const urlBudget = searchParams.get("budget") || "any";

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
      bhk: [],
      furnishing: [],
      minPrice: min,
      maxPrice: max,
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
    });
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

  const QUICK_FILTERS = [
    { label: "All Properties", value: "any" },
    { label: "Villas", value: "Villa" },
    { label: "Heritage Homes", value: "Home" },
    { label: "Apartments", value: "Apartment" },
    { label: "Office Spaces", value: "Office Space" },
    { label: "Commercial", value: "Commercial Space" },
    { label: "Retail Shops", value: "Shop" },
    { label: "Industrial Plots", value: "Industrial Plot" },
    { label: "Agricultural Land", value: "Agricultural Land" }
  ];

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

  return (
    <div className="container mx-auto px-4 md:px-6 max-w-7xl pb-20 pt-6">
      
      {/* Premium Header Banner Card */}
      <div className="w-full rounded-3xl bg-cream/90 border border-sand p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-terracotta/5 rounded-full blur-[80px] pointer-events-none" />
        
        <div className="flex flex-col gap-2 relative z-10 text-left">
          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-terracotta bg-terracotta/5 border border-terracotta/10 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            <span>Live Properties Sourcing</span>
          </span>
          <h1 className="text-3xl md:text-4xl font-serif font-black text-indigo tracking-tight">
            Properties in {filters.city}
          </h1>
          <p className="text-charcoal/70 text-xs font-semibold">
            Browse restored heritage havelis, luxury villas, offices, and plots in {filters.city}.
          </p>
        </div>

        <div className="flex items-center gap-6 relative z-10 border-t md:border-t-0 md:border-l border-sand pt-4 md:pt-0 md:pl-8">
          <div className="flex flex-col text-left">
            <span className="text-2xl font-serif font-black text-indigo">{sortedList.length}</span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Available Listings</span>
          </div>
          <div className="flex flex-col text-left border-l border-sand pl-6">
            <span className="text-2xl font-serif font-black text-terracotta">
              {sortedList.filter(p => p.featured).length}
            </span>
            <span className="text-[9px] font-bold text-charcoal/40 uppercase tracking-widest mt-1">Featured Spots</span>
          </div>
        </div>
      </div>

      {/* Main Results Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Desktop Sidebar Filters */}
        <div className="hidden md:block lg:col-span-3">
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onReset={resetFilters}
          />
        </div>

        {/* Results Container (Listings + Mock Map) */}
        <div className="col-span-1 md:col-span-12 lg:col-span-9 transition-all duration-300">
          <div className="flex flex-col gap-5">
            
            {/* Quick Categories Bar + Views Switcher Row */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pb-4 border-b border-sand">
              {/* Quick Tags Scrollable Container */}
              <div className="flex-1 overflow-x-auto no-scrollbar py-0.5">
                <div className="flex items-center gap-2">
                  {QUICK_FILTERS.map((item) => {
                    const isActive = filters.type === item.value;
                    return (
                      <button
                        key={item.label}
                        onClick={() => handleFilterChange({ ...filters, type: item.value })}
                        className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                          isActive
                            ? "bg-terracotta text-white shadow-sm border border-terracotta"
                            : "bg-white border border-sand hover:border-terracotta/35 text-charcoal/70"
                        }`}
                      >
                        {item.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* View Layout Controls & Sort Order */}
              <div className="flex items-center gap-3 flex-shrink-0 flex-wrap sm:flex-nowrap">
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
                  buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-3 py-2.5 hover:border-terracotta transition-colors"
                  align="right"
                />



                {/* Mobile Filters Toggle Button */}
                <button
                  onClick={() => setMobileFiltersOpen(true)}
                  className="md:hidden flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-sand bg-white text-charcoal text-xs font-bold flex-1"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
              
              {/* Cards Grid */}
              <div className="xl:col-span-12 flex flex-col gap-6">
                {sortedList.length > 0 ? (
                  <AnimatePresence mode="wait">
                    <motion.div 
                      key={`${filters.city}-${filters.type}-${filters.purpose}`}
                      variants={listContainerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
                    >
                      {sortedList.map((property) => (
                        <motion.div key={property.id} variants={cardItemVariants}>
                          <PropertyCard property={property} />
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

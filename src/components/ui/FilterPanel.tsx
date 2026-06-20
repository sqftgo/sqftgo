"use client";

import React from "react";
import { Filter, X, RefreshCw } from "lucide-react";
import CustomSelect from "@/components/ui/CustomSelect";

export interface FilterState {
  city: string;
  locality: string;
  purpose: "all" | "buy" | "sell" | "rent" | "lease";
  type: string;
  bhk: string[]; // e.g. ["1", "2", "3"]
  furnishing: string[]; // e.g. ["Furnished", "Semi-Furnished", "Unfurnished"]
  minPrice: string;
  maxPrice: string;
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

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

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpen = true,
  onClose,
}) => {
  const handlePurposeChange = (purpose: "all" | "buy" | "sell" | "rent" | "lease") => {
    onFilterChange({ ...filters, purpose, minPrice: "", maxPrice: "" });
  };

  const handleCityChange = (city: string) => {
    onFilterChange({ ...filters, city });
  };

  const handleLocalityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, locality: e.target.value });
  };

  const handleTypeChange = (type: string) => {
    onFilterChange({ ...filters, type });
  };

  const handleBhkToggle = (bhkVal: string) => {
    const nextBhk = filters.bhk.includes(bhkVal)
      ? filters.bhk.filter((b) => b !== bhkVal)
      : [...filters.bhk, bhkVal];
    onFilterChange({ ...filters, bhk: nextBhk });
  };

  const handleFurnishingToggle = (furnishingVal: string) => {
    const nextFurnishing = filters.furnishing.includes(furnishingVal)
      ? filters.furnishing.filter((f) => f !== furnishingVal)
      : [...filters.furnishing, furnishingVal];
    onFilterChange({ ...filters, furnishing: nextFurnishing });
  };

  const handlePriceChange = (field: "minPrice" | "maxPrice", value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const showSpecs = filters.type !== "Industrial Plot" && filters.type !== "Agricultural Land";

  return (
    <div
      className={`w-full flex-col bg-white/95 border border-sand rounded-2xl p-6 shadow-md transition-all duration-300 ${
        isOpen ? "flex" : "hidden"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-sand mb-5">
        <div className="flex items-center gap-2 font-serif font-black text-base text-indigo">
          <Filter className="w-4.5 h-4.5 text-terracotta" />
          <span>Filter Properties</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-charcoal/60 hover:text-terracotta font-bold transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-sand/40 text-charcoal/60 md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 overflow-y-auto max-h-[calc(100vh-250px)] pr-1 no-scrollbar">
        {/* Purpose: Buy vs Sell vs Rent vs Lease */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Purpose</span>
          <div className="grid grid-cols-5 gap-1 bg-sand/35 border border-sand/60 p-1 rounded-xl">
            {(["all", "buy", "sell", "rent", "lease"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => handlePurposeChange(p)}
                className={`py-1.5 text-[10px] font-bold rounded-lg transition-all duration-150 ${
                  filters.purpose === p
                    ? "bg-white text-terracotta shadow-sm border border-sand"
                    : "text-charcoal/60 hover:text-charcoal"
                }`}
              >
                {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* City Select */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">City</span>
          <CustomSelect
            options={CITIES.map((c) => ({ label: c, value: c }))}
            value={filters.city}
            onChange={handleCityChange}
            searchable
            className="w-full"
            buttonClassName="bg-white border border-sand text-charcoal rounded-xl px-3 py-2.5 text-sm font-semibold hover:border-terracotta transition-colors"
          />
        </div>

        {/* Locality Input */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Locality</span>
          <input
            type="text"
            value={filters.locality}
            onChange={handleLocalityChange}
            placeholder="Search locality (e.g. Fateh Sagar)"
            className="w-full bg-white border border-sand text-charcoal rounded-xl px-3 py-2.5 text-sm font-medium focus:outline-none focus:border-terracotta focus:ring-1 focus:ring-terracotta transition-colors"
          />
        </div>

        {/* Property Type */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Property Type</span>
          <CustomSelect
            options={[{ label: "All Types", value: "any" }, ...PROPERTY_TYPES.map((t) => ({ label: t, value: t }))]}
            value={filters.type}
            onChange={handleTypeChange}
            className="w-full"
            buttonClassName="bg-white border border-sand text-charcoal rounded-xl px-3 py-2.5 text-sm font-semibold hover:border-terracotta transition-colors"
          />
        </div>

        {/* BHK Selector */}
        {showSpecs && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-indigo uppercase tracking-wide">BHK Size</span>
            <div className="flex flex-wrap gap-2">
              {["1", "2", "3", "4"].map((bhkVal) => {
                const selected = filters.bhk.includes(bhkVal);
                return (
                  <button
                    key={bhkVal}
                    type="button"
                    onClick={() => handleBhkToggle(bhkVal)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all duration-150 ${
                      selected
                        ? "bg-terracotta border-terracotta text-white shadow-sm"
                        : "bg-white border-sand text-charcoal hover:border-terracotta/40"
                    }`}
                  >
                    {bhkVal} BHK
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Price Range Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">
            {filters.purpose === "rent" || filters.purpose === "lease" ? "Monthly Rent/Lease (₹)" : "Price (₹)"}
          </span>
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              placeholder="Min"
              value={filters.minPrice}
              onChange={(e) => handlePriceChange("minPrice", e.target.value)}
              className="w-full bg-white border border-sand text-charcoal rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-terracotta transition-colors"
            />
            <input
              type="number"
              placeholder="Max"
              value={filters.maxPrice}
              onChange={(e) => handlePriceChange("maxPrice", e.target.value)}
              className="w-full bg-white border border-sand text-charcoal rounded-xl px-3 py-2 text-sm font-medium focus:outline-none focus:border-terracotta transition-colors"
            />
          </div>
          <span className="text-[10px] text-charcoal/50 font-medium italic mt-0.5">
            {filters.purpose === "rent" || filters.purpose === "lease"
              ? "e.g. 10000 to 30000"
              : "e.g. 50L (5000000) to 2Cr (20000000)"}
          </span>
        </div>

        {/* Furnishing Status */}
        {showSpecs && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-indigo uppercase tracking-wide">Furnishing</span>
            <div className="flex flex-col gap-2">
              {["Furnished", "Semi-Furnished", "Unfurnished"].map((fVal) => {
                const selected = filters.furnishing.includes(fVal);
                return (
                  <label
                    key={fVal}
                    className="flex items-center gap-2 text-sm text-charcoal/80 font-semibold cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={() => handleFurnishingToggle(fVal)}
                      className="rounded accent-terracotta text-terracotta focus:ring-terracotta w-4 h-4 cursor-pointer"
                    />
                    <span>{fVal}</span>
                  </label>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default FilterPanel;

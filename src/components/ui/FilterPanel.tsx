"use client";

import React, { useMemo } from "react";
import { Filter, X, RefreshCw } from "lucide-react";
import CustomSelect from "./CustomSelect";
import { useApp } from "@/context/AppContext";
import {
  CITIES,
  PROPERTY_TYPES,
  BUDGET_BUY_MIN_OPTIONS,
  BUDGET_BUY_MAX_OPTIONS,
  BUDGET_RENT_MIN_OPTIONS,
  BUDGET_RENT_MAX_OPTIONS,
  SIZE_MIN_OPTIONS,
  SIZE_MAX_OPTIONS,
  BHK_OPTIONS,
  AMENITIES as AMENITY_FALLBACK,
} from "@/constants";

export interface FilterState {
  city: string;
  locality: string;
  purpose: "all" | "buy" | "sell" | "rent" | "lease";
  type: string;
  bhk: string[]; // e.g. ["1", "2", "3"]
  furnishing: string[]; // e.g. ["Furnished", "Semi-Furnished", "Unfurnished"]
  minPrice: string;
  maxPrice: string;
  reraApprovedOnly?: boolean;
  featuredOnly?: boolean;
  minSize?: string;
  maxSize?: string;
  selectedAmenities?: string[];
}

interface FilterPanelProps {
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onReset: () => void;
  isOpen?: boolean;
  onClose?: () => void;
  showBasicFilters?: boolean;
}

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  onFilterChange,
  onReset,
  isOpen = true,
  onClose,
  showBasicFilters = true,
}) => {
  const { categories, locations, amenities } = useApp();

  const cityOptions = useMemo(() => {
    const live = locations.filter((l) => l.active).map((l) => l.city);
    const cities = live.length > 0 ? live : CITIES.filter((c) => c !== "All India");
    return ["All India", ...cities.filter((c) => c !== "All India")].map((c) => ({
      label: c,
      value: c,
    }));
  }, [locations]);

  const typeOptions = useMemo(() => {
    const live = categories.filter((c) => c.active).map((c) => c.name);
    const types = live.length > 0 ? live : [...PROPERTY_TYPES];
    return [{ label: "All Types", value: "any" }, ...types.map((t) => ({ label: t, value: t }))];
  }, [categories]);

  const amenityOptions = useMemo(() => {
    const live = amenities.filter((a) => a.active).map((a) => a.name);
    return live.length > 0 ? live : [...AMENITY_FALLBACK];
  }, [amenities]);

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

  const handleToggleRera = () => {
    onFilterChange({ ...filters, reraApprovedOnly: !filters.reraApprovedOnly });
  };

  const handleToggleFeatured = () => {
    onFilterChange({ ...filters, featuredOnly: !filters.featuredOnly });
  };

  const handleSizeChange = (field: "minSize" | "maxSize", value: string) => {
    onFilterChange({ ...filters, [field]: value });
  };

  const handleAmenityToggle = (amenity: string) => {
    const current = filters.selectedAmenities || [];
    const nextAmenities = current.includes(amenity)
      ? current.filter((a) => a !== amenity)
      : [...current, amenity];
    onFilterChange({ ...filters, selectedAmenities: nextAmenities });
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

      <div className="flex flex-col gap-6">
        {showBasicFilters && (
          <>
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
                options={cityOptions}
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
                options={typeOptions}
                value={filters.type}
                onChange={handleTypeChange}
                className="w-full"
                buttonClassName="bg-white border border-sand text-charcoal rounded-xl px-3 py-2.5 text-sm font-semibold hover:border-terracotta transition-colors"
              />
            </div>
          </>
        )}

        {/* BHK Selector */}
        {showSpecs && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-indigo uppercase tracking-wide">BHK Size</span>
            <div className="flex flex-wrap gap-2">
              {BHK_OPTIONS.map((bhkVal) => {
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

        {showBasicFilters && (
          /* Price Range Filter */
          <div className="flex flex-col gap-2">
            <span className="text-xs font-bold text-indigo uppercase tracking-wide">
              {filters.purpose === "rent" || filters.purpose === "lease" ? "Monthly Rent/Lease" : "Budget Price"}
            </span>
            <div className="flex flex-col gap-2">
              <CustomSelect
                options={filters.purpose === "rent" || filters.purpose === "lease" ? BUDGET_RENT_MIN_OPTIONS : BUDGET_BUY_MIN_OPTIONS}
                value={filters.minPrice}
                onChange={(val) => handlePriceChange("minPrice", val)}
                className="w-full"
                buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left"
              />
              <CustomSelect
                options={filters.purpose === "rent" || filters.purpose === "lease" ? BUDGET_RENT_MAX_OPTIONS : BUDGET_BUY_MAX_OPTIONS}
                value={filters.maxPrice}
                onChange={(val) => handlePriceChange("maxPrice", val)}
                className="w-full"
                buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left"
              />
            </div>
          </div>
        )}

        {/* Size Range Filter */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Property Size (sq.ft.)</span>
          <div className="flex flex-col gap-2">
            <CustomSelect
              options={SIZE_MIN_OPTIONS}
              value={filters.minSize || ""}
              onChange={(val) => handleSizeChange("minSize", val)}
              className="w-full"
              buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left"
            />
            <CustomSelect
              options={SIZE_MAX_OPTIONS}
              value={filters.maxSize || ""}
              onChange={(val) => handleSizeChange("maxSize", val)}
              className="w-full"
              buttonClassName="bg-white border border-sand text-charcoal text-xs font-bold rounded-xl px-2.5 py-2.5 hover:border-terracotta transition-colors text-left"
            />
          </div>
        </div>

        {/* Verification & Curations Status */}
        <div className="flex flex-col gap-2.5 pt-4 border-t border-sand">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Verification & Curation</span>
          <div className="flex flex-col gap-2.5">
            <label className="flex items-center gap-2.5 text-xs font-bold text-charcoal/80 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.reraApprovedOnly}
                onChange={handleToggleRera}
                className="rounded accent-terracotta text-terracotta focus:ring-terracotta w-4.5 h-4.5 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>RERA Registered Only</span>
              </span>
            </label>
            <label className="flex items-center gap-2.5 text-xs font-bold text-charcoal/80 cursor-pointer">
              <input
                type="checkbox"
                checked={!!filters.featuredOnly}
                onChange={handleToggleFeatured}
                className="rounded accent-terracotta text-terracotta focus:ring-terracotta w-4.5 h-4.5 cursor-pointer"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                <span>Featured Collection Only</span>
              </span>
            </label>
          </div>
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

        {/* Amenities checklist */}
        <div className="flex flex-col gap-2 pt-4 border-t border-sand">
          <span className="text-xs font-bold text-indigo uppercase tracking-wide">Amenities</span>
          <div className="grid grid-cols-2 gap-x-2 gap-y-2">
            {amenityOptions.map((amenity) => {
              const selected = (filters.selectedAmenities || []).includes(amenity);
              return (
                <label
                  key={amenity}
                  className="flex items-center gap-2 text-xs text-charcoal/80 font-semibold cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleAmenityToggle(amenity)}
                    className="rounded accent-terracotta text-terracotta focus:ring-terracotta w-4 h-4 cursor-pointer"
                  />
                  <span>{amenity}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
export default FilterPanel;

"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";
import { ALL_INDIA_CITY } from "@/constants/cities";

const CityIcon = () => (
  <div className="w-8 h-8 rounded-full bg-indigo/5 border border-indigo/10 flex items-center justify-center flex-shrink-0 transition-transform duration-300 group-hover:scale-110">
    <MapPin className="w-4 h-4 text-indigo" />
  </div>
);

interface CitySelectorDropdownProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
  /** Active admin-managed cities (required for production control). */
  cities: string[];
  align?: "left" | "right";
  includeAllIndia?: boolean;
}

export const CitySelectorDropdown: React.FC<CitySelectorDropdownProps> = ({
  selectedCity,
  onSelectCity,
  onClose,
  cities,
  align = "right",
  includeAllIndia = true,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const catalog = useMemo(() => {
    const unique = Array.from(new Set(cities.map((c) => c.trim()).filter(Boolean)));
    return includeAllIndia ? [ALL_INDIA_CITY, ...unique] : unique;
  }, [cities, includeAllIndia]);

  const popular = useMemo(() => catalog.filter((c) => c !== ALL_INDIA_CITY).slice(0, 12), [catalog]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return catalog.filter((city) => city.toLowerCase().includes(q));
  }, [searchQuery, catalog]);

  const handleSelect = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <div
      className={`fixed sm:absolute z-[100] left-4 right-4 top-[72px] sm:top-auto sm:mt-3 mx-auto sm:mx-0 w-[calc(100vw-32px)] sm:w-[540px] max-w-[540px] rounded-3xl bg-white text-charcoal shadow-2xl border border-indigo/10 overflow-hidden flex flex-col ${
        align === "right" ? "sm:left-auto sm:right-0" : "sm:right-auto sm:left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      <div
        className={`absolute -top-2 w-4 h-4 rotate-45 bg-white border-t border-l border-indigo/10 z-[101] hidden sm:block ${
          align === "right" ? "right-12" : "left-12"
        }`}
      />

      <div className="p-4 pb-3 z-10 bg-white">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input
            suppressHydrationWarning
            ref={inputRef}
            type="text"
            placeholder="Search for city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 text-sm font-medium text-charcoal bg-white border border-indigo/20 focus:border-indigo rounded-2xl outline-none transition-all duration-200 placeholder-charcoal/40 shadow-sm"
          />
          {searchQuery ? (
            <button
              suppressHydrationWarning
              type="button"
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal p-1 rounded-full hover:bg-indigo/5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          ) : null}
        </div>
      </div>

      <div className="max-h-[350px] overflow-y-auto px-4 pb-4 no-scrollbar">
        {searchQuery.trim() === "" ? (
          <div>
            {includeAllIndia ? (
              <button
                suppressHydrationWarning
                type="button"
                onClick={() => handleSelect(ALL_INDIA_CITY)}
                className={`w-full mb-3 text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 flex items-center gap-2.5 cursor-pointer ${
                  selectedCity === ALL_INDIA_CITY
                    ? "bg-indigo/10 text-indigo font-bold"
                    : "hover:bg-indigo/[0.02] text-charcoal/70 font-medium border border-indigo/10"
                }`}
              >
                <MapPin className="w-4 h-4" />
                {ALL_INDIA_CITY}
              </button>
            ) : null}

            <h3 className="text-xs font-bold text-charcoal/40 tracking-wider uppercase mb-3 pl-1">
              Available cities
            </h3>
            {popular.length === 0 ? (
              <p className="py-8 text-center text-xs text-charcoal/40 font-medium">
                No cities available yet. An admin must add locations first.
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2.5">
                {popular.map((city) => {
                  const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      suppressHydrationWarning
                      key={city}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`group flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                        isSelected
                          ? "border-indigo bg-indigo/5 text-indigo shadow-sm font-semibold"
                          : "border-indigo/10 hover:border-indigo/50 hover:bg-indigo/[0.01] text-charcoal/70 font-medium"
                      }`}
                    >
                      <div className="flex-shrink-0">
                        <CityIcon />
                      </div>
                      <span className="text-xs md:text-sm truncate">{city}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xs font-bold text-charcoal/40 tracking-wider uppercase mb-2 pl-1">
              Search Results
            </h3>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {searchResults.map((city) => {
                  const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      suppressHydrationWarning
                      key={city}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-indigo/10 text-indigo font-bold"
                          : "hover:bg-indigo/[0.02] text-charcoal/70 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin
                          className={`w-4 h-4 ${isSelected ? "text-indigo" : "text-charcoal/40"}`}
                        />
                        <span>{city}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-charcoal/40 font-medium">
                {`No cities matching "${searchQuery}"`}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

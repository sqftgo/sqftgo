"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, X } from "lucide-react";
import { ALL_INDIA_CITY } from "@/constants/cities";

// Custom drawn SVGs for known popular cities (Brand colors: Navy Indigo stroke + Gold sun accent)
const UdaipurIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V14C8 14 10 10 16 10C22 10 24 14 24 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 24V17C12 15 20 15 20 17V24" stroke="#1B3864" strokeWidth="1.2" />
    <path d="M14 24C14 21.5 18 21.5 18 24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M4 26C8 26 8 28 12 28C16 28 16 26 20 26C24 26 24 28 28 28" stroke="#1B3864" strokeWidth="1" strokeLinecap="round" />
  </svg>
);

const JaipurIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="12" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 24V11H26V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M6 11L16 6L26 11" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 24V17H14V24" stroke="#1B3864" strokeWidth="1" />
    <path d="M18 24V17H22V24" stroke="#1B3864" strokeWidth="1" />
    <path d="M10 14H14M18 14H22" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const JodhpurIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="23" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 24V12H12V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 24V8H20V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M20 24V14H26V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 8V5" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const KotaIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V14C8 14 9 13 11 13C13 13 14 14 14 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 24V14C18 14 19 13 21 13C23 13 24 14 24 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 18H18V24H14V18Z" stroke="#1B3864" strokeWidth="1.5" />
  </svg>
);

const DefaultCityIcon = () => (
  <div className="w-8 h-8 rounded-full bg-indigo/5 border border-indigo/10 flex items-center justify-center">
    <MapPin className="w-4 h-4 text-indigo" />
  </div>
);

const CITY_ICONS: Record<string, React.ComponentType> = {
  Udaipur: UdaipurIcon,
  Jaipur: JaipurIcon,
  Jodhpur: JodhpurIcon,
  Kota: KotaIcon,
};

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
                  const Icon = CITY_ICONS[city] ?? DefaultCityIcon;
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
                        <Icon />
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

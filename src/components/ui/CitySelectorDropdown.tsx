"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { Search, MapPin, X, ArrowRight } from "lucide-react";

// Custom drawn SVGs for 12 Popular Cities (Brand colors: Navy Indigo stroke + Gold sun accent)
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
    <line x1="8" y1="15" x2="10" y2="15" stroke="#1B3864" strokeWidth="1" />
    <line x1="8" y1="19" x2="10" y2="19" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const KotaIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V14C8 14 9 13 11 13C13 13 14 14 14 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M18 24V14C18 14 19 13 21 13C23 13 24 14 24 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 18H18V24H14V18Z" stroke="#1B3864" strokeWidth="1.5" />
    <path d="M15 24C15 22 17 22 17 24" stroke="#1B3864" strokeWidth="1.5" />
  </svg>
);

const BikanerIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="9" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V16H24V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 16L16 10L24 16" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M16 10V7" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M13 24C13 21 19 21 19 24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="19" x2="13" y2="19" stroke="#1B3864" strokeWidth="1" />
    <line x1="19" y1="19" x2="21" y2="19" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const JaisalmerIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="10" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M6 24V14L10 11V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 24V12L16 8L22 12V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M22 24V14L26 11V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <line x1="13" y1="14" x2="13" y2="24" stroke="#1B3864" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
    <line x1="19" y1="14" x2="19" y2="24" stroke="#1B3864" strokeWidth="0.8" strokeDasharray="1.5 1.5" />
  </svg>
);

const RajsamandIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V14H24V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M8 14C8 8 24 8 24 14" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M14 24C14 21 18 21 18 24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <line x1="11" y1="17" x2="13" y2="17" stroke="#1B3864" strokeWidth="1" />
    <line x1="19" y1="17" x2="21" y2="17" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const PaliIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="22" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M10 24V16H22V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M10 16L16 11L22 16" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 24V19H18V24" stroke="#1B3864" strokeWidth="1" />
    <path d="M16 11V8" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const PushkarIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="16" cy="12" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24L10 18H22L24 24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M10 18L12 13H20L22 18" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 13L14 9H18L20 13" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M14 9C14 7 18 7 18 9" stroke="#1B3864" strokeWidth="1.5" />
    <path d="M14 24C14 21.5 18 21.5 18 24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

const AlwarIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="8" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 24V11H25V24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 11H26" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 11L12 8H20L23 11" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M12 24V17C12 14.5 20 14.5 20 17V24" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M9 14H23" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const AhmedabadIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="21" cy="11" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M8 24V14C8 8 24 8 24 14V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M12 24V17C12 13 20 13 20 17V24" stroke="#1B3864" strokeWidth="1.2" />
    <path d="M16 13C16 13 14 10 11 11" stroke="#1B3864" strokeWidth="1" />
    <path d="M16 13C16 13 18 10 21 11" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

const SuratIcon = () => (
  <svg viewBox="0 0 32 32" className="w-8 h-8 transition-transform duration-300 group-hover:scale-110" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="10" cy="10" r="5" fill="#DFAB34" />
    <path d="M4 24H28" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M14 24V8H24V24" stroke="#1B3864" strokeWidth="1.5" strokeLinejoin="round" />
    <path d="M7 24V13H14" stroke="#1B3864" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <line x1="17" y1="11" x2="19" y2="11" stroke="#1B3864" strokeWidth="1" />
    <line x1="17" y1="15" x2="19" y2="15" stroke="#1B3864" strokeWidth="1" />
    <line x1="17" y1="19" x2="19" y2="19" stroke="#1B3864" strokeWidth="1" />
    <line x1="21" y1="11" x2="23" y2="11" stroke="#1B3864" strokeWidth="1" />
    <line x1="21" y1="15" x2="23" y2="15" stroke="#1B3864" strokeWidth="1" />
    <line x1="21" y1="19" x2="23" y2="19" stroke="#1B3864" strokeWidth="1" />
  </svg>
);

interface PopularCity {
  name: string;
  icon: React.ComponentType;
}

const POPULAR_CITIES: PopularCity[] = [
  { name: "Udaipur", icon: UdaipurIcon },
  { name: "Jaipur", icon: JaipurIcon },
  { name: "Jodhpur", icon: JodhpurIcon },
  { name: "Kota", icon: KotaIcon },
  { name: "Bikaner", icon: BikanerIcon },
  { name: "Jaisalmer", icon: JaisalmerIcon },
  { name: "Rajsamand", icon: RajsamandIcon },
  { name: "Pali", icon: PaliIcon },
  { name: "Pushkar", icon: PushkarIcon },
  { name: "Alwar", icon: AlwarIcon },
  { name: "Ahmedabad", icon: AhmedabadIcon },
  { name: "Surat", icon: SuratIcon }
];

const ALL_CITIES = [
  "Udaipur",
  "Jaipur",
  "Jodhpur",
  "Kota",
  "Bikaner",
  "Jaisalmer",
  "Rajsamand",
  "Pali",
  "Pushkar",
  "Alwar",
  "Ahmedabad",
  "Surat",
  "Gandhinagar",
  "Kutch",
  "Anand",
  "Rajkot",
  "Shimla",
  "Chandigarh",
  "Dharamshala",
  "Agra"
];

interface CitySelectorDropdownProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  onClose: () => void;
  align?: "left" | "right";
}

export const CitySelectorDropdown: React.FC<CitySelectorDropdownProps> = ({
  selectedCity,
  onSelectCity,
  onClose,
  align = "right"
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-focus input on mount
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // Filtered list of all cities for search autocomplete
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return ALL_CITIES.filter((city) =>
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSelect = (cityName: string) => {
    onSelectCity(cityName);
    onClose();
  };

  return (
    <div
      className={`absolute z-[100] mt-3 w-[92vw] sm:w-[540px] max-w-[540px] rounded-3xl bg-white text-charcoal shadow-2xl border border-gray-100 overflow-hidden flex flex-col ${
        align === "right" ? "right-0" : "left-0"
      }`}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Upward Tooltip Caret */}
      <div 
        className={`absolute -top-2 w-4 h-4 rotate-45 bg-white border-t border-l border-gray-100 z-[101] ${
          align === "right" ? "right-12" : "left-12"
        }`} 
      />

      {/* Search Input Section */}
      <div className="p-4 pb-3 z-10 bg-white">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search for city"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-10 py-3.5 text-sm font-medium text-charcoal bg-white border border-gray-200 focus:border-indigo rounded-2xl outline-none transition-all duration-200 placeholder-gray-400 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-charcoal p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Body */}
      <div className="max-h-[350px] overflow-y-auto px-4 pb-4 no-scrollbar">
        {searchQuery.trim() === "" ? (
          /* Popular Cities View */
          <div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-3 pl-1">
              Popular cities
            </h3>
            <div className="grid grid-cols-3 gap-2.5">
              {POPULAR_CITIES.map((city) => {
                const Icon = city.icon;
                const isSelected = selectedCity.toLowerCase() === city.name.toLowerCase();

                return (
                  <button
                    key={city.name}
                    type="button"
                    onClick={() => handleSelect(city.name)}
                    className={`group flex items-center gap-3 p-3 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? "border-indigo bg-indigo/5 text-indigo shadow-sm font-semibold"
                        : "border-gray-200 hover:border-indigo/50 hover:bg-indigo/[0.01] text-gray-700 font-medium"
                    }`}
                  >
                    <div className="flex-shrink-0">
                      <Icon />
                    </div>
                    <span className="text-xs md:text-sm truncate">{city.name}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Search Results View */
          <div>
            <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase mb-2 pl-1">
              Search Results
            </h3>
            {searchResults.length > 0 ? (
              <div className="flex flex-col gap-1.5">
                {searchResults.map((city) => {
                  const isSelected = selectedCity.toLowerCase() === city.toLowerCase();
                  return (
                    <button
                      key={city}
                      type="button"
                      onClick={() => handleSelect(city)}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-150 flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? "bg-indigo/10 text-indigo font-bold"
                          : "hover:bg-indigo/[0.02] text-gray-700 font-medium"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <MapPin className={`w-4 h-4 ${isSelected ? "text-indigo" : "text-gray-400"}`} />
                        <span>{city}</span>
                      </div>
                      <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">Select &rarr;</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-gray-400 font-medium">
                No cities matching "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

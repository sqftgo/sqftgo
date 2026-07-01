"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface SelectOption {
  label: string;
  value: string;
}

interface CustomSelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchable?: boolean;
  className?: string;
  align?: "left" | "right";
  buttonClassName?: string;
  inlineChevron?: boolean;
}

export default function CustomSelect({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchable = false,
  className = "",
  align = "left",
  buttonClassName = "",
  inlineChevron = false,
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = searchable && searchQuery
    ? options.filter((opt) => opt.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : options;

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearchQuery("");
        }}
        className={inlineChevron
          ? `flex items-center gap-1.5 text-left focus:outline-none ${buttonClassName}`
          : `w-full flex items-center justify-between text-left focus:outline-none ${buttonClassName}`
        }
      >
        <span className="truncate">
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        <ChevronDown
          className={`text-charcoal/40 transition-transform duration-200 flex-shrink-0 ${
            isOpen ? "rotate-180" : ""
          } ${inlineChevron ? "w-3.5 h-3.5 ml-0.5" : "w-4 h-4 ml-2"}`}
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.15 }}
            className={`absolute z-[100] top-[calc(100%+8px)] min-w-[200px] w-full bg-white border border-sand rounded-xl shadow-xl overflow-hidden flex flex-col ${
              align === "right" ? "right-0" : "left-0"
            }`}
          >
            {searchable && (
              <div className="p-2 border-b border-sand/50 bg-sand/10">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-charcoal/40" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs text-charcoal bg-white border border-sand rounded-lg focus:outline-none focus:border-terracotta transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            )}
            
            <div className="max-h-60 overflow-y-auto no-scrollbar py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-3.5 py-2 text-sm flex items-center justify-between hover:bg-sand/30 transition-colors ${
                      value === opt.value ? "text-terracotta font-bold bg-terracotta/5" : "text-charcoal font-medium"
                    }`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {value === opt.value && <Check className="w-3.5 h-3.5 flex-shrink-0" />}
                  </button>
                ))
              ) : (
                <div className="px-3.5 py-3 text-xs text-charcoal/50 text-center">
                  No options found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

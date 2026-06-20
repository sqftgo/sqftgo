"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { MapPin, Plus, ChevronDown, User, LogOut, Home, Search, MessageSquare, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RAJASTHAN_CITIES = [
  "Udaipur", "Jaipur", "Jodhpur", "Kota", "Bikaner", 
  "Jaisalmer", "Rajsamand", "Pali", "Pushkar", "Alwar", 
  "Ahmedabad", "Surat", "Gandhinagar", "Kutch", "Anand", 
  "Rajkot", "Shimla", "Chandigarh", "Dharamshala", "Agra"
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCity, setSelectedCity, isLoggedIn, setIsLoggedIn, userEmail } = useApp();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  const isAuthPage = pathname === "/login" || pathname === "/signup";

  // Monitor scroll for header styling and progress indicator
  useEffect(() => {
    if (isAuthPage) return;
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isAuthPage]);

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Browse Properties", href: "/listings" },
    { name: "Relocation Help", href: "/get-assistance" },
    { name: "Enquiry", href: "/enquiry" },
    { name: "Services", href: "/services" },
  ];

  const mobileTabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/listings", icon: Search },
    { name: "Services", href: "/services", icon: Briefcase },
    { name: "Enquiry", href: "/enquiry", icon: MessageSquare },
  ];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    
    // If on homepage or search page, it updates context and results filter
    if (pathname !== "/listings" && pathname !== "/") {
      router.push("/listings");
    }
  };

  if (isAuthPage) {
    return null;
  }

  return (
    <>
      <header
        className={`fixed top-1 left-0 right-0 mx-auto w-[96%] max-w-7xl rounded-2xl transition-all duration-300 z-40 ${
          isScrolled
            ? "glassmorphism shadow-lg py-3 mt-2"
            : "bg-transparent py-5 mt-3 border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex flex-col">
              <span className="font-extrabold text-lg leading-none tracking-tight text-indigo">
                Sun Valley
              </span>
              <span className="text-[10px] text-charcoal/60 font-bold tracking-widest uppercase mt-0.5">
                SVREPL.com
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`relative px-4 py-2 text-sm font-semibold rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "text-terracotta"
                      : "text-charcoal/70 hover:text-indigo"
                  }`}
                >
                  {link.name}
                  {isActive && (
                    <motion.span
                      layoutId="activeNavIndicator"
                      className="absolute bottom-0.5 left-4 right-4 h-0.5 bg-terracotta rounded-full"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right actions: City Selector, Auth / Create Listing, Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* City Selector */}
            <div className="relative">
              <button
                onClick={() => setShowCityDropdown(!showCityDropdown)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs md:text-sm font-bold text-charcoal bg-sand hover:bg-sand/80 rounded-xl transition-all duration-200"
              >
                <MapPin className="w-3.5 h-3.5 text-terracotta" />
                <span>{selectedCity}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-charcoal/50 transition-transform duration-200 ${showCityDropdown ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {showCityDropdown && (
                  <>
                    {/* Backdrop */}
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowCityDropdown(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 rounded-xl glassmorphism text-charcoal shadow-xl py-2 z-50 border border-sand"
                    >
                      <div className="px-3 py-1 text-[10px] font-bold text-charcoal/40 tracking-wider uppercase border-b border-sand mb-1">
                        Select City
                      </div>
                      {RAJASTHAN_CITIES.map((city) => (
                        <button
                          key={city}
                          onClick={() => handleCityChange(city)}
                          className={`w-full text-left px-4 py-2 text-sm transition-colors duration-150 flex items-center justify-between ${
                            selectedCity === city
                              ? "bg-terracotta/10 text-terracotta font-bold"
                              : "hover:bg-sand/40 text-charcoal/85"
                          }`}
                        >
                          {city}
                          {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop-only Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* User Login/Dashboard Control */}
              {isLoggedIn ? (
                <div className="flex items-center gap-2">
                  <Link
                    href="/post-property"
                    className="w-9 h-9 rounded-xl bg-sand flex items-center justify-center text-indigo hover:bg-sand/80 transition-colors duration-200"
                    title={userEmail}
                  >
                    <User className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => setIsLoggedIn(false)}
                    className="w-9 h-9 rounded-xl bg-sand hover:bg-red-50 flex items-center justify-center text-charcoal/65 hover:text-red-500 transition-colors duration-200"
                    title="Logout"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-bold text-indigo hover:bg-sand/50 rounded-xl transition-colors duration-200 border border-sand"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Floating Bottom Navigation Bar */}
      <div className="fixed bottom-5 inset-x-4 md:hidden z-50">
        <div className="glassmorphism rounded-2xl shadow-xl border border-sand/50 py-2.5 px-4 flex items-center justify-between mx-auto max-w-lg">
          {mobileTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href;

            return (
              <Link
                key={tab.name}
                href={tab.href}
                className={`flex flex-col items-center justify-center w-12 py-1 transition-colors duration-200 relative ${
                  isActive ? "text-terracotta font-extrabold" : "text-charcoal/60 font-semibold hover:text-indigo"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[2]"}`} />
                <span className="text-[9px] mt-1 tracking-tight">
                  {tab.name}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeMobileIndicator"
                    className="absolute -bottom-1.5 w-1 h-1 rounded-full bg-terracotta"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Navbar;

"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { MapPin, Plus, ChevronDown, User, Users, LogOut, Home, Search, MessageSquare, Briefcase } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { CitySelectorDropdown } from "@/components/ui/CitySelectorDropdown";
import { UserDropdown } from "@/components/ui/UserDropdown";


export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { selectedCity, setSelectedCity, isLoggedIn, setIsLoggedIn, userEmail } = useApp();
  
  const [isScrolled, setIsScrolled] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

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
    { name: "Destinations", href: "/destinations" },
    { name: "Dealers", href: "/dealers" },
    { name: "Relocation Help", href: "/get-assistance" },
    { name: "Services", href: "/services" },
  ];

  const mobileTabs = [
    { name: "Home", href: "/", icon: Home },
    { name: "Search", href: "/listings", icon: Search },
    { name: "Dealers", href: "/dealers", icon: Users },
    { name: "Services", href: "/services", icon: Briefcase },
  ];

  const handleCityChange = (city: string) => {
    setSelectedCity(city);
    setShowCityDropdown(false);
    
    // If not on one of the main interactive regional pages, redirect to search listings
    if (pathname !== "/listings" && pathname !== "/" && pathname !== "/services" && pathname !== "/destinations") {
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
            ? "glassmorphism shadow-lg py-2 mt-1.5"
            : "bg-transparent py-3 mt-1.5 border-transparent"
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
                      className="absolute right-0 z-50"
                    >
                      <CitySelectorDropdown
                        selectedCity={selectedCity}
                        onSelectCity={handleCityChange}
                        onClose={() => setShowCityDropdown(false)}
                        align="right"
                      />
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Desktop-only Actions */}
            <div className="hidden md:flex items-center gap-3">
              {/* User Login/Dashboard Control */}
              {isLoggedIn ? (
                <div className="relative">
                  <button
                    onClick={() => setShowUserDropdown(!showUserDropdown)}
                    className="flex items-center gap-2 px-3 py-2 text-xs md:text-sm font-bold text-charcoal bg-sand hover:bg-sand/80 rounded-xl transition-all duration-200 shadow-sm"
                  >
                    <div className="w-5 h-5 rounded-md bg-indigo text-white flex items-center justify-center font-extrabold text-[10px]">
                      {userEmail ? userEmail.charAt(0).toUpperCase() : "U"}
                    </div>
                    <span className="max-w-[100px] truncate text-charcoal">{userEmail}</span>
                    <ChevronDown className={`w-3.5 h-3.5 text-charcoal/50 transition-transform duration-200 ${showUserDropdown ? "rotate-180" : ""}`} />
                  </button>

                  <AnimatePresence>
                    {showUserDropdown && (
                      <>
                        {/* Backdrop */}
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowUserDropdown(false)}
                        />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 z-50"
                        >
                          <UserDropdown
                            userEmail={userEmail}
                            onClose={() => setShowUserDropdown(false)}
                            onLogout={() => setIsLoggedIn(false)}
                            align="right"
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
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

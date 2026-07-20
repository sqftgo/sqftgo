"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SLIDES = [
  {
    image: "https://images.unsplash.com/featured/1200x800/?udaipur,palace,heritage",
    title: "LAKEVIEW HAVELI",
    desc: "Experience heritage living with gorgeous lake-facing suites in Udaipur.",
    label: "Udaipur Suite"
  },
  {
    image: "https://images.unsplash.com/featured/1200x800/?jaipur,palace,fort",
    title: "ROYAL PALACE VILLA",
    desc: "Indulge in grand sandstone architecture and private courtyards in Jaipur.",
    label: "Jaipur Palace"
  },
  {
    image: "https://images.unsplash.com/featured/1200x800/?jaisalmer,desert,haveli",
    title: "DESERT RETREAT",
    desc: "Unwind under the golden skies in curated heritage structures in Jaisalmer.",
    label: "Golden Fort"
  },
  {
    image: "https://images.unsplash.com/featured/1200x800/?jodhpur,fort,bluecity",
    title: "BLUE CITY MANSION",
    desc: "Discover beautiful boutique stays surrounded by historic fort views in Jodhpur.",
    label: "Mehrangarh Vista"
  }
];

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsLoggedIn, setUserEmail, setUserRole, setUserName, mockUsers, setMockUsers, directoryProfiles } = useApp();

  // Determine initial tab from query parameter (?tab=signup)
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

  // Form input states

  // Slideshow active index
  const [activeSlide, setActiveSlide] = useState(0);

  // Slideshow interval timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Sync active tab with search parameter updates
  useEffect(() => {
    const tabParam = searchParams.get("tab");
    if (tabParam === "signup") {
      setActiveTab("signup");
    } else {
      setActiveTab("login");
    }
  }, [searchParams]);

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [keepLoggedIn, setKeepLoggedIn] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill defaults
  useEffect(() => {
    if (activeTab === "signup") {
      setEmail("");
      setPassword("");
    }
  }, [activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    let finalRole: "user" | "broker" | "admin" = "user";
    let finalName = name || email.split("@")[0];

    const foundUser = mockUsers.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (activeTab === "signup") {
      if (email === "admin@svrepl.com") {
        alert("The admin account cannot be registered here.");
        return;
      }
      if (!name || !confirmPassword) return;
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }

      // Add new registered user
      const isBrokerEmail = email.toLowerCase().includes("broker") || email.toLowerCase().includes("dealer");
      finalRole = isBrokerEmail ? "broker" : "user";

      const newUser = {
        id: `usr-${Date.now()}`,
        name: finalName,
        email: email,
        role: finalRole,
        status: "active" as const,
        joinedDate: new Date().toISOString().split("T")[0],
        inquiriesCount: 0
      };
      setMockUsers(prev => [...prev, newUser]);
    } else {
      // Login check
      if (email.toLowerCase() === "admin@svrepl.com") {
        if (password !== "admin2026" && password !== "admin123") {
          alert("Invalid admin credentials! Please use admin2026 or admin123");
          return;
        }
        finalRole = "admin";
        finalName = "Admin User";
      } else if (email.toLowerCase() === "broker@svrepl.com") {
        if (password !== "broker2026" && password !== "broker123") {
          alert("Invalid broker credentials! Please use broker2026 or broker123");
          return;
        }
        finalRole = "broker";
        finalName = "Rajesh Mehta";
      } else if (email.toLowerCase() === "user@svrepl.com") {
        if (password !== "user2026" && password !== "user123") {
          alert("Invalid client credentials! Please use user2026 or user123");
          return;
        }
        finalRole = "user";
        finalName = "Arjun Sharma";
      } else if (foundUser) {
        finalRole = foundUser.role;
        finalName = foundUser.name;
      } else {
        // Fallback check in broker directories
        const isDealer = directoryProfiles.some(d => d.email.toLowerCase() === email.toLowerCase());
        finalRole = isDealer ? "broker" : "user";
      }
    }

    setIsSubmitting(true);

    // Simulate auth network delay
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail(email);
      setUserRole(finalRole);
      if (setUserName) setUserName(finalName);
      setIsSubmitting(false);

      // Navigate dynamically based on role
      if (finalRole === "admin") {
        router.push("/admin");
      } else if (finalRole === "broker") {
        router.push("/dealer/dashboard");
      } else {
        router.push("/");
      }
    }, 1000);
  };

  const handleTabToggle = () => {
    const nextTab = activeTab === "login" ? "signup" : "login";
    setActiveTab(nextTab);

    // Update URL query parameters for consistency without reloading
    const params = new URLSearchParams(window.location.search);
    if (nextTab === "signup") {
      params.set("tab", "signup");
    } else {
      params.delete("tab");
    }
    router.replace(`/login?${params.toString()}`);
  };

  return (
    <div className="fixed inset-0 w-full h-full min-h-screen bg-white text-charcoal z-50 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none font-sans">

      {/* LEFT COLUMN: AUTH FORM */}
      <div className="w-full lg:w-[42%] xl:w-[38%] bg-white flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 relative z-10 min-h-full border-r border-sand">

        {/* Back Button */}
        <button
          type="button"
          onClick={() => {
            if (typeof window !== "undefined" && window.history.length > 1) {
              router.back();
            } else {
              router.push("/");
            }
          }}
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo transition-colors cursor-pointer select-none group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          <span>Back</span>
        </button>

        <div className="max-w-md w-full mx-auto flex flex-col justify-center">
          {/* Logo and Header */}
          <div className="flex flex-col items-center mb-6">
            <Link href="/" className="flex items-center justify-center mb-4">
              <span className="font-logo text-3xl leading-none text-indigo hover:text-indigo/80 transition-colors select-none">
                Sun Valley
              </span>
            </Link>

            <h1 className="text-3xl font-black tracking-tight text-charcoal mt-1 text-center">
              Welcome to Sun Valley
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 text-center font-medium">
              {activeTab === "login" ? "Sign in to access your portal" : "Create an account to search or list properties"}
            </p>
          </div>

          {/* Forms Section */}
          <div className="flex flex-col gap-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-slate-700">

              <AnimatePresence mode="wait">
                {activeTab === "signup" ? (
                  <motion.div
                    key="signup-fields"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-4"
                  >
                    {/* Full Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-slate-500">Full Name</label>
                      <div className="relative">
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Full Name"
                          className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30 transition-colors"
                        />
                        <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40" />
                      </div>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>

              {/* Email Address */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Email Address</label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email Address"
                    className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30 transition-colors"
                  />
                  <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40" />
                </div>
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-500">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30 transition-colors"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-charcoal/40 hover:text-indigo cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "signup" ? (
                  <motion.div
                    key="signup-confirm-password"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-1.5"
                  >
                    <label className="text-slate-500">Confirm Password</label>
                    <div className="relative">
                      <input
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm Password"
                        className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30 transition-colors"
                      />
                      <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/40" />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="login-extra"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center justify-between text-[11px] font-bold text-slate-500 mt-1 select-none"
                  >
                    <label className="flex items-center gap-2 cursor-pointer text-charcoal/70">
                      <input
                        type="checkbox"
                        checked={keepLoggedIn}
                        onChange={(e) => setKeepLoggedIn(e.target.checked)}
                        className="rounded border-sand text-indigo w-3.5 h-3.5 cursor-pointer focus:ring-indigo bg-slate-50"
                      />
                      <span>Keep me logged in</span>
                    </label>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        alert("Password recovery is not implemented in this demo.");
                      }}
                      className="text-indigo hover:underline"
                    >
                      Forgot password?
                    </a>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="mt-2 py-3.5 w-full bg-indigo hover:bg-indigo-hover text-white font-extrabold rounded-2xl shadow-md shadow-indigo/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] transition-all duration-200 cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <span>
                    {activeTab === "login" ? "Sign In" : "Sign Up"}
                  </span>
                )}
              </button>
            </form>

            {/* Mock Credentials Helper */}
            {activeTab === "login" && (
              <div className="bg-sand/20 border border-sand/40 rounded-xl p-3.5 mt-1 text-[11px] font-semibold text-charcoal/65 flex flex-col gap-2">
                <span className="text-[9px] font-black text-indigo uppercase tracking-wider">Quick Demo Login Autocomplete</span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("user@svrepl.com");
                      setPassword("user2026");
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-sand rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer text-center whitespace-nowrap"
                  >
                    Client User
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("broker@svrepl.com");
                      setPassword("broker2026");
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-sand rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer text-center whitespace-nowrap"
                  >
                    Broker Dealer
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail("admin@svrepl.com");
                      setPassword("admin2026");
                    }}
                    className="py-1.5 px-2 bg-white hover:bg-slate-100 border border-sand rounded-lg text-[10px] font-bold text-slate-700 cursor-pointer text-center whitespace-nowrap"
                  >
                    Super Admin
                  </button>
                </div>
              </div>
            )}

            {/* Divider */}
            <div className="flex items-center justify-center my-2 relative w-full">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sand/55" /></div>
              <span className="relative px-3.5 bg-white text-[10px] font-black text-charcoal/40 uppercase tracking-widest leading-none select-none">
                or continue with
              </span>
            </div>

            {/* Google Authentication Button */}
            <button
              type="button"
              onClick={() => alert("Google Sign-In is not configured for this demo.")}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-sand bg-white hover:bg-slate-50 text-charcoal hover:border-indigo/40 shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" fill="currentColor" />
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Tab switch link */}
          <p className="text-center text-xs text-slate-500 font-bold mt-8">
            {activeTab === "login" ? (
              <>
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  onClick={handleTabToggle}
                  className="text-indigo font-extrabold hover:underline ml-1 cursor-pointer bg-transparent border-none outline-none"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={handleTabToggle}
                  className="text-indigo font-extrabold hover:underline ml-1 cursor-pointer bg-transparent border-none outline-none"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

      </div>

      {/* RIGHT COLUMN: GRAPHICS & PROMO SLIDESHOW */}
      <div className="hidden lg:flex w-full lg:w-[58%] xl:w-[62%] h-full bg-charcoal border-l border-sand/40 relative overflow-hidden items-center justify-center min-h-full">

        {/* Carousel Background Slide Image */}
        <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none transition-all duration-700 ease-in-out">
          <img
            src={SLIDES[activeSlide].image}
            alt={SLIDES[activeSlide].title}
            className="w-full h-full object-cover object-center brightness-[0.5] contrast-[1.05] scale-[1.01] transition-all duration-700 ease-in-out"
          />
          {/* Gradients to look aesthetic */}
          <div className="absolute inset-0 bg-neutral-950/40" />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30" />
        </div>

        {/* Close Button "x" at top right */}
        <Link
          href="/"
          className="absolute top-6 right-6 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 border border-white/10 text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg backdrop-blur-md cursor-pointer"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </Link>

        {/* Modern Typography Overlay */}
        <div className="absolute left-12 bottom-28 right-12 z-10 flex flex-col gap-3.5 text-left select-none pointer-events-none max-w-xl">
          <div className="w-fit bg-white/20 text-gold border border-white/20 font-black text-[9px] tracking-widest uppercase py-1 px-3.5 rounded-full mb-1">
            Heritage Portal
          </div>

          <h2 className="text-4xl xl:text-5xl font-serif font-black text-white leading-tight tracking-tight drop-shadow-xl">
            {SLIDES[activeSlide].title}
          </h2>
          <p className="text-white/80 text-sm font-semibold drop-shadow-md leading-relaxed">
            {SLIDES[activeSlide].desc}
          </p>
        </div>

        {/* Slideshow Progress Indicators (Higgsfield Style) */}
        <div className="absolute bottom-8 left-12 right-12 z-20 flex gap-4">
          {SLIDES.map((slide, idx) => {
            const isActive = idx === activeSlide;
            return (
              <div
                key={idx}
                onClick={() => setActiveSlide(idx)}
                className="flex-1 flex flex-col gap-1 cursor-pointer group"
              >
                <div className="h-1 bg-white/20 rounded-full overflow-hidden relative transition-all duration-300 group-hover:bg-white/30">
                  {isActive && (
                    <motion.div
                      key={activeSlide}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                      className="absolute inset-y-0 left-0 bg-gold"
                    />
                  )}
                  {!isActive && idx < activeSlide && (
                    <div className="absolute inset-0 bg-white" />
                  )}
                </div>
                <span className={`text-[9px] font-black tracking-wider transition-colors uppercase ${isActive ? "text-gold" : "text-white/40 group-hover:text-white"
                  }`}>
                  {slide.label}
                </span>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-white z-50 flex items-center justify-center text-indigo font-bold">Loading auth...</div>}>
      <AuthForm />
    </Suspense>
  );
}

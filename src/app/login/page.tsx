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
  const { setIsLoggedIn, setUserEmail, setUserRole } = useApp();

  // Determine initial tab from query parameter (?tab=signup)
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);
  
  // Backdoor url check: only show admin options if role=admin or admin=true is in URL parameters
  const showAdminBackdoor = searchParams.get("role") === "admin" || searchParams.get("admin") === "true";
  const [selectedRole, setSelectedRole] = useState<"user" | "broker" | "admin">("user");

  // State to reveal email/password inputs (Higgsfield style)
  const [showEmailForm, setShowEmailForm] = useState(false);

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
      if (selectedRole === "admin") {
        setSelectedRole("user");
      }
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

  // Auto-fill credentials when role/tab changes for testing convenience
  useEffect(() => {
    if (activeTab === "login") {
      if (selectedRole === "admin") {
        setEmail("admin@svrepl.com");
        setPassword("admin2026");
      } else if (selectedRole === "broker") {
        setEmail("broker@svrepl.com");
        setPassword("broker2026");
      } else {
        setEmail("user@svrepl.com");
        setPassword("user2026");
      }
    } else {
      setEmail("");
      setPassword("");
    }
  }, [selectedRole, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    if (activeTab === "signup") {
      if (selectedRole === "admin" || email === "admin@svrepl.com") {
        alert("The admin account cannot be registered here.");
        return;
      }
      if (!name || !confirmPassword) return;
      if (password !== confirmPassword) {
        alert("Passwords do not match!");
        return;
      }
    } else {
      if (selectedRole === "admin") {
        if (email !== "admin@svrepl.com" || password !== "admin2026") {
          alert("Invalid admin credentials!");
          return;
        }
      }
    }

    setIsSubmitting(true);
    
    // Simulate auth network delay
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail(email);
      setUserRole(selectedRole);
      setIsSubmitting(false);
      
      // Navigate to correct dashboard/page after successful authentication
      if (selectedRole === "admin") {
        router.push("/admin");
      } else if (selectedRole === "broker") {
        router.push("/listings");
      } else {
        router.push("/");
      }
    }, 1000);
  };

  const handleTabToggle = () => {
    const nextTab = activeTab === "login" ? "signup" : "login";
    setActiveTab(nextTab);
    setShowEmailForm(false); // Reset form reveal when toggling tab
    
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
              {activeTab === "login" ? "Sign up and list properties for free" : "Create a partner account to begin sourcing"}
            </p>
          </div>



          {/* Role Segmented Controller */}
          <div className="w-full bg-sand/35 p-1 rounded-2xl flex gap-1 mb-6 border border-sand">
            <button
              type="button"
              onClick={() => setSelectedRole("user")}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all duration-300 relative ${
                selectedRole === "user"
                  ? "bg-indigo text-white shadow-md"
                  : "text-slate-500 hover:text-indigo hover:bg-sand/20"
              }`}
            >
              Client
            </button>
            <button
              type="button"
              onClick={() => setSelectedRole("broker")}
              className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all duration-300 relative ${
                selectedRole === "broker"
                  ? "bg-indigo text-white shadow-md"
                  : "text-slate-500 hover:text-indigo hover:bg-sand/20"
              }`}
            >
              Broker
            </button>
            {activeTab === "login" && showAdminBackdoor && (
              <button
                type="button"
                onClick={() => setSelectedRole("admin")}
                className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all duration-300 relative bg-[#f1f1e9] border border-indigo/30 ${
                  selectedRole === "admin"
                    ? "bg-indigo text-white border-transparent"
                    : "text-indigo hover:text-white hover:bg-indigo/90"
                }`}
              >
                Superadmin
              </button>
            )}
          </div>

          {/* Forms Section */}
          <AnimatePresence mode="wait">
            {!showEmailForm ? (
              <motion.div
                key="social-auth-options"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {/* Social Login Stack */}
                <button
                  type="button"
                  onClick={() => alert("Google Sign-In is not configured for this demo.")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-sand bg-white hover:bg-slate-50/50 text-charcoal hover:border-indigo/35 shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Apple Sign-In is not configured for this demo.")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-sand bg-white hover:bg-slate-50/50 text-charcoal hover:border-indigo/35 shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.73-1.2 1.87-1.05 2.98 1.12.09 2.27-.57 3-1.42z" />
                  </svg>
                  <span>Continue with Apple</span>
                </button>

                <button
                  type="button"
                  onClick={() => alert("Microsoft Sign-In is not configured for this demo.")}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-2xl border border-sand bg-white hover:bg-slate-50/50 text-charcoal hover:border-indigo/35 shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
                >
                  <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 23 23" fill="currentColor">
                    <path fill="#f35325" d="M0 0h11v11H0z" />
                    <path fill="#81bc06" d="M12 0h11v11H12z" />
                    <path fill="#05a6f0" d="M0 12h11v11H0z" />
                    <path fill="#ffba08" d="M12 12h11v11H12z" />
                  </svg>
                  <span>Continue with Microsoft</span>
                </button>

                {/* Divider */}
                <div className="flex items-center justify-center my-4 relative w-full">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sand/40" /></div>
                  <span className="relative px-3.5 bg-white text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none select-none">
                    OR
                  </span>
                </div>

                {/* Continue with Email Trigger */}
                <button
                  type="button"
                  onClick={() => setShowEmailForm(true)}
                  className="w-full flex items-center justify-center gap-2.5 px-4 py-3.5 rounded-2xl border border-sand bg-sand/35 hover:bg-sand/60 text-indigo shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
                >
                  <Mail className="w-4.5 h-4.5" />
                  <span>Continue with Email</span>
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="email-auth-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {/* Back to social links option */}
                <button
                  type="button"
                  onClick={() => setShowEmailForm(false)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo mb-4 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Other sign in options</span>
                </button>

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
                    className="mt-4 py-3.5 w-full bg-[#6851f5] hover:bg-[#5741e0] text-white font-extrabold rounded-2xl shadow-md shadow-indigo/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] transition-all duration-200 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Authenticating as {selectedRole}...</span>
                      </>
                    ) : (
                      <span>
                        {activeTab === "login" 
                          ? `Login as ${selectedRole === "admin" ? "Superadmin" : selectedRole === "broker" ? "Broker" : "Client"}` 
                          : `Sign Up as ${selectedRole === "broker" ? "Broker" : "Client"}`}
                      </span>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

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

          <span className="text-center text-[10px] text-slate-400 font-medium mt-16 select-none leading-normal">
            SSO available for institutional partners. <br/>
            Sun Valley Sourcing Security Desk © {new Date().getFullYear()}
          </span>
        </div>

      </div>

      {/* RIGHT COLUMN: GRAPHICS & PROMO SLIDESHOW */}
      <div className="hidden lg:flex w-full lg:w-[58%] xl:w-[62%] h-full bg-[#0a0a0c] border-l border-sand/40 relative overflow-hidden items-center justify-center min-h-full">
        
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
          <div className="w-fit bg-white/20 text-[#f5ba68] border border-white/20 font-black text-[9px] tracking-widest uppercase py-1 px-3.5 rounded-full mb-1">
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
                      className="absolute inset-y-0 left-0 bg-[#ffd899]"
                    />
                  )}
                  {!isActive && idx < activeSlide && (
                    <div className="absolute inset-0 bg-white" />
                  )}
                </div>
                <span className={`text-[9px] font-black tracking-wider transition-colors uppercase ${
                  isActive ? "text-[#ffd899]" : "text-white/40 group-hover:text-white"
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

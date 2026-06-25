"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { Mail, Lock, User, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function AuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setIsLoggedIn, setUserEmail } = useApp();

  // Determine initial tab from query parameter (?tab=signup)
  const initialTab = searchParams.get("tab") === "signup" ? "signup" : "login";
  const [activeTab, setActiveTab] = useState<"login" | "signup">(initialTab);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

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
    } else {
      if (email === "admin@svrepl.com" && password !== "admin2026") {
        alert("Invalid admin password!");
        return;
      }
    }

    setIsSubmitting(true);
    
    // Simulate auth network delay
    setTimeout(() => {
      setIsLoggedIn(true);
      setUserEmail(email);
      setIsSubmitting(false);
      
      // Navigate to homepage or admin dashboard after successful authentication
      if (email === "admin@svrepl.com") {
        router.push("/admin");
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
    <div className="fixed inset-0 w-full h-full min-h-screen bg-white z-50 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden select-none">
      
      {/* LEFT COLUMN: AUTH FORM */}
      <div className="w-full lg:w-[42%] xl:w-[38%] bg-white flex flex-col justify-center px-6 sm:px-12 xl:px-16 py-12 relative z-10 min-h-full">
        
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
          className="absolute top-6 left-6 sm:left-12 flex items-center gap-2 text-xs font-extrabold text-slate-500 hover:text-indigo transition-colors cursor-pointer select-none group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform stroke-[2.5]" />
          <span>Back</span>
        </button>
        
        {/* logo and Header */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex flex-col items-center group mb-4">
            <span className="font-serif font-black text-2xl leading-none tracking-tight text-indigo hover:text-[#5741e0] transition-colors select-none">
              Sun Valley
            </span>
          </Link>
          
          <h1 className="text-2xl font-black tracking-tight text-charcoal mt-1">
            {activeTab === "login" ? "Login" : "Create Account"}
          </h1>
        </div>

        {/* Google Sign In */}
        <button
          type="button"
          onClick={() => alert("Google Sign-In is not configured for this demo.")}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-2xl border border-sand hover:border-indigo/35 bg-white text-charcoal hover:bg-slate-50/50 shadow-sm active:scale-[0.99] transition-all font-bold text-xs tracking-wide cursor-pointer"
        >
          <svg className="w-4.5 h-4.5 flex-shrink-0" viewBox="0 0 24 24">
            <path fill="#EA4335" d="M12 5.04c1.62 0 3.08.56 4.22 1.66l3.15-3.15C17.45 1.71 14.94 1 12 1 7.35 1 3.39 3.65 1.45 7.55l3.77 2.92C6.12 7.07 8.84 5.04 12 5.04z" />
            <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.47h6.44c-.28 1.47-1.11 2.72-2.36 3.56l3.66 2.84c2.14-1.97 3.39-4.87 3.39-8.51z" />
            <path fill="#FBBC05" d="M5.22 14.53c-.23-.69-.36-1.43-.36-2.2s.13-1.51.36-2.2L1.45 7.21C.53 9.07 0 11.13 0 13.3c0 2.17.53 4.23 1.45 6.09l3.77-2.86z" />
            <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.92l-3.66-2.84c-1.01.68-2.31 1.09-3.9 1.09-3.16 0-5.88-2.03-6.84-4.99l-3.77 2.92C3.39 20.35 7.35 23 12 23z" />
          </svg>
          <span>{activeTab === "login" ? "Sign in with Google" : "Sign up with Google"}</span>
        </button>

        {/* Divider */}
        <div className="flex items-center justify-center my-6 relative w-full">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-sand/40" /></div>
          <span className="relative px-3.5 bg-white text-[10px] font-bold text-charcoal/40 uppercase tracking-widest leading-none select-none">
            {activeTab === "login" ? "Or sign in with email" : "Or sign up with email"}
          </span>
        </div>

        {/* Forms Container */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs font-bold text-charcoal/85">
          
          <AnimatePresence mode="wait">
            {activeTab === "signup" ? (
              <motion.div
                key="signup-fields"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4"
              >
                {/* Full Name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-600 dark:text-slate-400">Full Name</label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30"
                    />
                    <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/45" />
                  </div>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>

          {/* Email Address */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-600 dark:text-slate-400">Email Address</label>
            <div className="relative">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30"
              />
              <Mail className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/45" />
            </div>
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <label className="text-slate-600 dark:text-slate-400">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-10 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30"
              />
              <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/45" />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-charcoal/45 hover:text-charcoal cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "signup" ? (
              <motion.div
                key="signup-confirm-password"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-1.5"
              >
                <label className="text-slate-600 dark:text-slate-400">Confirm Password</label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm Password"
                    className="w-full bg-slate-50 border border-sand rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-indigo text-charcoal placeholder-charcoal/30"
                  />
                  <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-charcoal/45" />
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
                    className="rounded text-[#6851f5] w-3.5 h-3.5 cursor-pointer focus:ring-[#6851f5]"
                  />
                  <span>Keep me logged in</span>
                </label>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    alert("Password recovery is not implemented in this demo.");
                  }}
                  className="text-[#6851f5] hover:underline"
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
            className="mt-4 py-3.5 w-full bg-[#6851f5] hover:bg-[#5741e0] text-white font-extrabold rounded-2xl shadow-md shadow-[#6851f5]/25 flex items-center justify-center gap-2 hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none active:scale-[0.99] transition-all duration-200 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>{activeTab === "login" ? "Logging in..." : "Creating account..."}</span>
              </>
            ) : (
              <span>{activeTab === "login" ? "Login" : "Sign Up"}</span>
            )}
          </button>
        </form>

        {/* Tab switch link */}
        <p className="text-center text-xs text-slate-500 font-semibold mt-8">
          {activeTab === "login" ? (
            <>
              Don&apos;t have an account?{" "}
              <button
                type="button"
                onClick={handleTabToggle}
                className="text-[#6851f5] font-extrabold hover:underline ml-1 cursor-pointer bg-transparent border-none outline-none"
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
                className="text-[#6851f5] font-extrabold hover:underline ml-1 cursor-pointer bg-transparent border-none outline-none"
              >
                Sign in
              </button>
            </>
          )}
        </p>

      </div>

      {/* RIGHT COLUMN: GRAPHICS & PROMO */}
      <div className="hidden lg:flex w-full lg:w-[58%] xl:w-[62%] h-full bg-[#111827] border-l border-sand/40 relative overflow-hidden items-center justify-center min-h-full">
        
        {/* Background Image of Rajasthan Heritage Palace/Villa */}
        <div className="absolute inset-0 w-full h-full z-0 select-none pointer-events-none">
          <img
            src="https://maps.google.com/cbk?output=thumbnail&w=1200&h=800&ll=26.9239,75.8267"
            alt="Rajasthan Heritage Palace at Sunset"
            className="w-full h-full object-cover object-center brightness-[0.7] contrast-[1.05]"
          />
          {/* Solid overlay to ensure text legibility and brand integration */}
          <div className="absolute inset-0 bg-slate-950/60" />
          <div className="absolute inset-0 bg-indigo-950/20 mix-blend-multiply" />
        </div>

        {/* FLOATING ORGANIC PASTEL SHAPES (Translucent/Glassmorphic) */}
        
        {/* Soft blue-purple blur circle (Top Left background) */}
        <div className="absolute top-[8%] left-[8%] w-56 h-56 rounded-full bg-indigo-500/10 blur-[30px] pointer-events-none" />

        {/* Semicircle Orange (Top Center/Right) */}
        <div className="absolute top-0 right-[25%] w-40 h-20 rounded-b-full bg-[#dfab34]/20 border-b border-x border-white/10 pointer-events-none" />

        {/* Semicircle Purple (Top Right edge) */}
        <div className="absolute top-[10%] right-[-5%] w-32 h-32 rounded-full bg-[#6851f5]/10 blur-[2px] pointer-events-none" />

        {/* Floating circle (Top center) */}
        <motion.div
          animate={{ y: [0, -10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[18%] left-[30%] w-24 h-24 rounded-full bg-white/10 border border-white/10 pointer-events-none"
        />

        {/* Large Purple Circle (Top Right) */}
        <motion.div
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[15%] right-[40%] w-36 h-36 rounded-full bg-purple-500/15 border border-white/10 pointer-events-none"
        />

        {/* Grid dots decorative pattern */}
        <div className="absolute top-[28%] right-[10%] opacity-20 text-white select-none pointer-events-none">
          <svg width="100" height="100" viewBox="0 0 100 100" fill="currentColor">
            <circle cx="10" cy="10" r="1.5" /><circle cx="30" cy="10" r="1.5" /><circle cx="50" cy="10" r="1.5" /><circle cx="70" cy="10" r="1.5" /><circle cx="90" cy="10" r="1.5" />
            <circle cx="10" cy="30" r="1.5" /><circle cx="30" cy="30" r="1.5" /><circle cx="50" cy="30" r="1.5" /><circle cx="70" cy="30" r="1.5" /><circle cx="90" cy="30" r="1.5" />
            <circle cx="10" cy="50" r="1.5" /><circle cx="30" cy="50" r="1.5" /><circle cx="50" cy="50" r="1.5" /><circle cx="70" cy="50" r="1.5" /><circle cx="90" cy="50" r="1.5" />
            <circle cx="10" cy="70" r="1.5" /><circle cx="30" cy="70" r="1.5" /><circle cx="50" cy="70" r="1.5" /><circle cx="70" cy="70" r="1.5" /><circle cx="90" cy="70" r="1.5" />
            <circle cx="10" cy="90" r="1.5" /><circle cx="30" cy="90" r="1.5" /><circle cx="50" cy="90" r="1.5" /><circle cx="70" cy="90" r="1.5" /><circle cx="90" cy="90" r="1.5" />
          </svg>
        </div>

        {/* Half circle Pink/Rose (Bottom Center-Left) */}
        <motion.div
          animate={{ rotate: [45, 52, 45] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[35%] left-[10%] w-32 h-16 rounded-t-full bg-rose-500/15 border-t border-x border-white/10 origin-bottom pointer-events-none"
          style={{ transform: "rotate(45deg)" }}
        />

        {/* Floating red capsule shape (Bottom center edge) */}
        <motion.div
          animate={{ y: [0, -12, 0], rotate: [0, 4, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[8%] left-[38%] w-20 h-40 rounded-full bg-[#c95b3c]/20 border border-white/10 pointer-events-none"
        />

        {/* Capsule Cyan shape (Bottom center right) */}
        <motion.div
          animate={{ x: [0, 8, 0], y: [0, -8, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[8%] right-[32%] w-36 h-18 rounded-full bg-cyan-400/15 border border-white/10 rotate-[-35deg] pointer-events-none"
        />

        {/* Lavender Rounded Triangle (Bottom Right) */}
        <motion.div
          animate={{ y: [0, 10, 0], rotate: [15, 10, 15] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[20%] right-[10%] w-32 h-32 rounded-3xl bg-indigo/15 border border-white/10 rotate-[15deg] pointer-events-none"
          style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
        />

        {/* Semicircle Purple (Bottom Right edge) */}
        <div className="absolute bottom-[35%] right-[-5%] w-32 h-32 rounded-full bg-purple-500/10 blur-[1px] pointer-events-none" />

        {/* PROMO TEXT (High contrast white typography) */}
        <div className="relative z-10 text-left max-w-xl px-12 flex flex-col gap-5 pointer-events-none">
          <div className="w-fit bg-white/20 border border-white/20 text-[#f5ba68] font-extrabold text-[10px] tracking-widest uppercase py-1.5 px-4 rounded-full mb-1">
            Exclusive Portal
          </div>
          <h2 className="text-4xl xl:text-5xl font-sans font-black text-white leading-tight tracking-tight select-none drop-shadow-lg">
            Finding the address <br className="hidden xl:inline" />
            where your story begins
          </h2>
          <p className="text-white/80 text-sm font-semibold max-w-md drop-shadow-md leading-relaxed">
            Explore authentic havelis, lakeview villas, and premium properties across the heritage cities of Rajasthan.
          </p>
        </div>

      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="fixed inset-0 bg-white z-50 flex items-center justify-center text-charcoal/50 font-bold">Loading auth...</div>}>
      <AuthForm />
    </Suspense>
  );
}

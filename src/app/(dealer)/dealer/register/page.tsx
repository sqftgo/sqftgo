"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useActiveCities } from "@/hooks/useActiveCities";
import Link from "next/link";
import { Building2, CheckCircle2, Eye, EyeOff } from "lucide-react";

export default function DealerRegisterPage() {
  const router = useRouter();
  const { addDirectoryProfile } = useApp();
  const { signup } = useAuth();
  const { cities, cityOptionsWithoutAll, locationsReady } = useActiveCities();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({
    name: "", firmName: "", email: "", phone: "", password: "", confirmPassword: "",
    reraId: "", city: "", category: "Agent & Broker",
  });
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (!form.city || !cities.some((c) => c.toLowerCase() === form.city.toLowerCase())) {
      set("city", cities[0] ?? "");
    }
  }, [locationsReady, cities, form.city]);

  const handleRegister = async () => {
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);
    try {
      // Dealer signup grants broker role so the dashboard unlocks immediately.
      // Public "verified" badge still requires admin KYC approval.
      const result = await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        intent: "dealer",
      });

      // Directory profile requires an authenticated session; skip until email confirm when needed.
      if (result.status !== "confirm_email") {
        try {
          await addDirectoryProfile({
            firmName: form.firmName,
            ownerName: form.name,
            email: form.email.trim().toLowerCase(),
            mobile: form.phone,
            category: form.category as
              | "Agent & Broker"
              | "Property Consultant"
              | "Builder & Developer"
              | "Interior Decorator"
              | "Architect",
            city: form.city,
            address: form.city,
            description: "",
            reraId: form.reraId || undefined,
            website: "",
            verificationStatus: "pending",
          });
        } catch {
          // Account created; directory entry can be completed later from dealer profile.
        }
      }

      if (result.status === "confirm_email") {
        setPendingConfirm(true);
        setDone(true);
        return;
      }

      setDone(true);
      setTimeout(() => router.push("/dealer/dashboard"), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to create account.");
    } finally {
      setSubmitting(false);
    }
  };

  if (done) return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="bg-[#1e2028] border border-emerald-500/20 rounded-3xl p-12 max-w-sm w-full text-center">
        <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6"><CheckCircle2 className="w-8 h-8 text-emerald-400" /></div>
        <h2 className="text-2xl font-serif font-black text-white mb-2">
          {pendingConfirm ? "Confirm your email" : "Welcome, dealer"}
        </h2>
        <p className="text-white/50 text-sm font-semibold">
          {pendingConfirm
            ? "Check your inbox to confirm your account, then open the dealer dashboard. Submit KYC from your profile so admins can verify your public badge."
            : "Your dealer dashboard is ready. Complete KYC from Profile for a verified badge — redirecting…"}
        </p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div className="w-10 h-10 bg-indigo rounded-xl flex items-center justify-center"><Building2 className="w-5 h-5 text-white" /></div>
            <span className="font-logo text-xl text-white">SqftGo</span>
          </Link>
          <h1 className="text-2xl font-serif font-black text-white mt-5">Register as Dealer</h1>
          <p className="text-white/40 text-sm font-semibold mt-2">Join our network of verified real estate professionals</p>
        </div>

        <div className="bg-[#1e2028] border border-white/10 rounded-3xl p-8 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-sm font-serif font-black text-white">Personal & Account Info</h2>
              {([
                { l: "Full Name", k: "name" as const, t: "text", ph: "Rajesh Mehta" },
                { l: "Email", k: "email" as const, t: "email", ph: "rajesh@broker.com" },
                { l: "Phone", k: "phone" as const, t: "tel", ph: "+91 98765 43210" },
              ] as const).map(({ l, k, t, ph }) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">{l}</label>
                  <input type={t} value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Password</label>
                <div className="relative">
                  <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} placeholder="••••••••" className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 pr-12 rounded-xl focus:outline-none" />
                  <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3 text-white/30 hover:text-white cursor-pointer">{showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Confirm Password</label>
                <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} placeholder="••••••••" className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
              <button onClick={() => setStep(1)} disabled={!form.name || !form.email || !form.password} className="w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 cursor-pointer">Next →</button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-sm font-serif font-black text-white">Business Info</h2>
              {([
                { l: "Firm / Business Name", k: "firmName" as const, ph: "Lake City Brokerage" },
                { l: "RERA ID (Optional)", k: "reraId" as const, ph: "RAJ/A/UDZ/2021/0492" },
              ] as const).map(({ l, k, ph }) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">{l}</label>
                  <input value={form[k]} onChange={e => set(k, e.target.value)} placeholder={ph} className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Category</label>
                <select value={form.category} onChange={e => set("category", e.target.value)} className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                  {["Agent & Broker", "Property Consultant", "Builder & Developer", "Interior Decorator", "Architect"].map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Primary City</label>
                <select value={form.city} onChange={e => set("city", e.target.value)} className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                  {cityOptionsWithoutAll.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {error && (
                <p className="text-rose-400 text-xs font-semibold leading-snug">{error}</p>
              )}
              <div className="flex gap-3">
                <button onClick={() => setStep(0)} className="flex-1 py-3 bg-white/5 text-white/60 text-xs font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer">← Back</button>
                <button
                  onClick={() => void handleRegister()}
                  disabled={!form.firmName || submitting}
                  className="flex-1 py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {submitting ? "Creating…" : "Create Account"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="mt-5 text-center">
          <p className="text-white/40 text-xs font-semibold">Already registered? <Link href="/login" className="text-indigo hover:underline font-bold">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
}

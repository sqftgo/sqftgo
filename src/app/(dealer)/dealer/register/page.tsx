"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { useActiveCities } from "@/hooks/useActiveCities";
import { authService } from "@/services/auth";
import {
  MobilePhoneField,
  mobileFieldError,
} from "@/components/auth/MobilePhoneField";
import { OtpCodeInput } from "@/components/auth/OtpCodeInput";
import Link from "next/link";
import { Building2, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { countryDigits, nationalDigits } from "@/lib/auth/phone";

export default function DealerRegisterPage() {
  const router = useRouter();
  const { addDirectoryProfile } = useApp();
  const { signup } = useAuth();
  const { cities, cityOptionsWithoutAll, locationsReady, findLocation } = useActiveCities();
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successHint, setSuccessHint] = useState<string | null>(null);
  const [showPw, setShowPw] = useState(false);
  const [countryCode, setCountryCode] = useState("91");
  const [otpCode, setOtpCode] = useState("");
  const [resendIn, setResendIn] = useState(0);
  const [debugCode, setDebugCode] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    firmName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    reraId: "",
    city: "",
    category: "Agent & Broker",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!locationsReady || cities.length === 0) return;
    if (!form.city || !cities.some((c) => c.toLowerCase() === form.city.toLowerCase())) {
      set("city", cities[0] ?? "");
    }
  }, [locationsReady, cities, form.city]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn((s) => Math.max(0, s - 1)), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const sendOtp = async () => {
    const phoneErr = mobileFieldError(countryCode, form.phone);
    if (phoneErr) {
      setError(phoneErr);
      return false;
    }
    const sent = await authService.sendMobileOtp({
      purpose: "register",
      countryCode,
      mobileNumber: form.phone,
    });
    setResendIn(sent.resendAfterSeconds);
    setDebugCode(sent.debugCode ?? null);
    setOtpCode(sent.debugCode ?? "");
    setSuccessHint(
      sent.channel === "dev"
        ? "Dev mode: use the code shown below."
        : "OTP sent to your WhatsApp / SMS."
    );
    return true;
  };

  const handleNextFromAccount = async () => {
    setError(null);
    setSuccessHint(null);
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
      setError("Fill all account fields.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    const phoneErr = mobileFieldError(countryCode, form.phone);
    if (phoneErr) {
      setError(phoneErr);
      return;
    }
    setSubmitting(true);
    try {
      await sendOtp();
      setStep(1);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't send OTP.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegister = async () => {
    setError(null);
    setSuccessHint(null);
    if (!/^[0-9]{6}$/.test(otpCode.trim())) {
      setError("Enter the 6-digit verification code.");
      return;
    }
    if (!form.firmName || !form.city) {
      setError("Complete business details.");
      return;
    }

    setSubmitting(true);
    try {
      const verified = await authService.verifyMobileOtpForRegister({
        countryCode,
        mobileNumber: form.phone,
        code: otpCode,
      });

      const loc = findLocation(form.city);
      const result = await signup({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
        intent: "dealer",
        countryCode,
        mobileNumber: form.phone,
        mobileClaimToken: verified.claimToken,
        cityId: loc?.id,
      });

      if (result.status !== "confirm_email") {
        try {
          await addDirectoryProfile({
            firmName: form.firmName,
            ownerName: form.name,
            email: form.email.trim().toLowerCase(),
            mobile: `+${countryDigits(countryCode)}${nationalDigits(countryCode, form.phone)}`,
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

  if (done)
    return (
      <div className="min-h-screen bg-[#0f1117] flex items-center justify-center p-6">
        <div className="bg-[#1e2028] border border-emerald-500/20 rounded-3xl p-12 max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
          </div>
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
            <div className="w-10 h-10 bg-indigo rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-logo text-xl text-white">SqftGo</span>
          </Link>
          <h1 className="text-2xl font-serif font-black text-white mt-5">Register as Dealer</h1>
          <p className="text-white/40 text-sm font-semibold mt-2">
            Join our network of verified real estate professionals
          </p>
        </div>

        <div className="bg-[#1e2028] border border-white/10 rounded-3xl p-8 space-y-5">
          {step === 0 && (
            <>
              <h2 className="text-sm font-serif font-black text-white">Personal & Account Info</h2>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Full Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Rajesh Mehta"
                  className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Email
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="rajesh@broker.com"
                  className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
              <div className="auth-dealer-phone [&_label]:text-[10px] [&_label]:font-black [&_label]:text-white/50 [&_label]:uppercase [&_label]:tracking-wider [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white [&_input]:placeholder-white/20 [&_select]:bg-white/5 [&_select]:border-white/10 [&_select]:text-white [&_svg]:text-white/30">
                <MobilePhoneField
                  countryCode={countryCode}
                  mobileNumber={form.phone}
                  onCountryChange={setCountryCode}
                  onMobileChange={(v) => set("phone", v)}
                  disabled={submitting}
                  label="WhatsApp / Mobile"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => set("password", e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 pr-12 rounded-xl focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-3 text-white/30 hover:text-white cursor-pointer"
                  >
                    {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(e) => set("confirmPassword", e.target.value)}
                  placeholder="••••••••"
                  className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none"
                />
              </div>
              {error && <p className="text-rose-400 text-xs font-semibold leading-snug">{error}</p>}
              <button
                onClick={() => void handleNextFromAccount()}
                disabled={!form.name || !form.email || !form.password || !form.phone || submitting}
                className="w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
              >
                {submitting ? "Sending OTP…" : "Next → Verify mobile"}
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <h2 className="text-sm font-serif font-black text-white">Verify & Business Info</h2>
              <p className="text-white/40 text-xs font-semibold">
                Code sent to +{countryDigits(countryCode)} {nationalDigits(countryCode, form.phone)}
              </p>
              <div className="[&_label]:text-[10px] [&_label]:font-black [&_label]:text-white/50 [&_label]:uppercase [&_label]:tracking-wider [&_input]:bg-white/5 [&_input]:border-white/10 [&_input]:text-white">
                <OtpCodeInput value={otpCode} onChange={setOtpCode} disabled={submitting} />
              </div>
              {debugCode ? (
                <p className="text-amber-300/90 text-[11px] font-semibold">Dev OTP: {debugCode}</p>
              ) : null}
              <button
                type="button"
                disabled={resendIn > 0 || submitting}
                onClick={() => {
                  void (async () => {
                    setError(null);
                    setSubmitting(true);
                    try {
                      await sendOtp();
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Couldn't resend OTP.");
                    } finally {
                      setSubmitting(false);
                    }
                  })();
                }}
                className="text-indigo text-xs font-bold hover:underline disabled:opacity-40 cursor-pointer bg-transparent border-none text-left"
              >
                {resendIn > 0 ? `Resend in ${resendIn}s` : "Resend OTP"}
              </button>

              {(
                [
                  { l: "Firm / Business Name", k: "firmName" as const, ph: "Lake City Brokerage" },
                  { l: "RERA ID (Optional)", k: "reraId" as const, ph: "RAJ/A/UDZ/2021/0492" },
                ] as const
              ).map(({ l, k, ph }) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                    {l}
                  </label>
                  <input
                    value={form[k]}
                    onChange={(e) => set(k, e.target.value)}
                    placeholder={ph}
                    className="bg-white/5 border border-white/10 focus:border-indigo/50 text-white placeholder-white/20 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none"
                  />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  {[
                    "Agent & Broker",
                    "Property Consultant",
                    "Builder & Developer",
                    "Interior Decorator",
                    "Architect",
                  ].map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">
                  Primary City
                </label>
                <select
                  value={form.city}
                  onChange={(e) => set("city", e.target.value)}
                  className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
                >
                  {cityOptionsWithoutAll.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>
              {successHint && (
                <p className="text-emerald-400/90 text-xs font-semibold leading-snug">{successHint}</p>
              )}
              {error && <p className="text-rose-400 text-xs font-semibold leading-snug">{error}</p>}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setStep(0);
                    setOtpCode("");
                    setError(null);
                  }}
                  className="flex-1 py-3 bg-white/5 text-white/60 text-xs font-bold rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  ← Back
                </button>
                <button
                  onClick={() => void handleRegister()}
                  disabled={!form.firmName || submitting || otpCode.length < 6}
                  className="flex-1 py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
                >
                  {submitting ? "Creating…" : "Verify & Create"}
                </button>
              </div>
            </>
          )}
        </div>
        <div className="mt-5 text-center">
          <p className="text-white/40 text-xs font-semibold">
            Already registered?{" "}
            <Link href="/login" className="text-indigo hover:underline font-bold">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

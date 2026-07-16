"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Eye, EyeOff, CheckCircle2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { setIsLoggedIn, setUserEmail, setUserRole, setUserName } = useApp();
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "", agree: false });
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirmPassword) { setError("Passwords do not match!"); return; }
    if (!form.agree) { setError("Please accept the terms to continue."); return; }
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    setIsLoggedIn(true);
    setUserEmail(form.email);
    setUserRole("user");
    setUserName(form.name);
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/"), 1500);
  };

  if (done) return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="bg-white/90 border border-emerald-200 rounded-3xl p-12 max-w-sm w-full text-center shadow-xl">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-serif font-black text-charcoal mb-2">Welcome!</h2>
        <p className="text-charcoal/50 text-sm font-semibold">Account created. Redirecting you home...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-serif font-black text-charcoal">Create Account</h1>
          <p className="text-charcoal/50 text-sm font-semibold mt-2">Join Sun Valley — Rajasthan's premier property marketplace</p>
        </div>

        <div className="bg-white/90 border border-indigo/10 rounded-3xl p-8 shadow-xl space-y-5">
          {error && <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs font-bold text-rose-600">{error}</div>}

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Full Name</label>
            <input value={form.name} onChange={e => set("name", e.target.value)} required placeholder="Arjun Sharma"
              className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Email Address</label>
            <input type="email" value={form.email} onChange={e => set("email", e.target.value)} required placeholder="you@example.com"
              className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Phone (Optional)</label>
            <input type="tel" value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+91 98765 43210"
              className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Password</label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={form.password} onChange={e => set("password", e.target.value)} required placeholder="Min. 8 characters"
                className="w-full bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 pr-12 rounded-xl focus:outline-none" />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3.5 top-3.5 text-charcoal/30 hover:text-charcoal transition-colors cursor-pointer">
                {showPw ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Confirm Password</label>
            <input type="password" value={form.confirmPassword} onChange={e => set("confirmPassword", e.target.value)} required placeholder="••••••••"
              className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none" />
          </div>

          <div className="flex items-start gap-3">
            <input type="checkbox" id="agree" checked={form.agree} onChange={e => set("agree", e.target.checked)}
              className="mt-0.5 w-4 h-4 accent-indigo cursor-pointer" />
            <label htmlFor="agree" className="text-xs text-charcoal/60 font-semibold cursor-pointer">
              I agree to the <span className="text-indigo font-bold">Terms of Service</span> and <span className="text-indigo font-bold">Privacy Policy</span>
            </label>
          </div>

          <button onClick={handleRegister} disabled={loading || !form.name || !form.email || !form.password}
            className="w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-indigo/20 disabled:opacity-50 cursor-pointer">
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="relative flex items-center gap-3">
            <div className="flex-1 h-px bg-indigo/10" />
            <span className="text-[10px] font-black text-charcoal/30 uppercase tracking-wider">or</span>
            <div className="flex-1 h-px bg-indigo/10" />
          </div>

          <button type="button" className="w-full flex items-center justify-center gap-3 py-3.5 border border-indigo/10 bg-white hover:bg-sand/20 text-charcoal text-xs font-bold rounded-xl transition-colors cursor-pointer">
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
            Continue with Google
          </button>
        </div>

        <p className="mt-5 text-center text-xs font-semibold text-charcoal/50">
          Already have an account?{" "}
          <Link href="/login" className="text-indigo font-bold hover:underline">Sign In</Link>
        </p>
        <p className="mt-2 text-center text-xs font-semibold text-charcoal/40">
          A dealer?{" "}
          <Link href="/dealer/register" className="text-purple-600 font-bold hover:underline">Register as Dealer</Link>
        </p>
      </div>
    </div>
  );
}

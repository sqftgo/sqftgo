"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CheckCircle2, Mail, ArrowLeft } from "lucide-react";
import { authService } from "@/services";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {sent ? (
          <div className="bg-white/90 border border-emerald-200 rounded-3xl p-10 text-center shadow-xl">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Check your inbox</h1>
            <p className="text-charcoal/60 text-sm font-semibold leading-relaxed mb-6">
              We&apos;ve sent a password reset link to <span className="text-indigo font-bold">{email}</span>. The link expires in 30 minutes.
            </p>
            <Link href="/login" className="block w-full py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors">
              Back to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 border border-indigo/10 rounded-3xl p-10 shadow-xl">
            <Link href="/login" className="inline-flex items-center gap-2 text-xs font-bold text-charcoal/50 hover:text-indigo mb-7 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo/10 rounded-xl flex items-center justify-center">
                <Mail className="w-5 h-5 text-indigo" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-black text-charcoal">Forgot Password?</h1>
                <p className="text-[11px] text-charcoal/50 font-semibold">We&apos;ll send you a reset link</p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Email Address</label>
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  placeholder="you@example.com"
                  className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none"
                />
              </div>
              {error ? (
                <p className="text-[11px] font-semibold text-rose-600">{error}</p>
              ) : null}
              <button type="submit" disabled={loading || !email}
                className="w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-indigo/20 disabled:opacity-50 cursor-pointer">
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </form>
            <p className="mt-5 text-center text-xs font-semibold text-charcoal/40">
              Remember your password?{" "}
              <Link href="/login" className="text-indigo font-bold hover:underline">Sign in</Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

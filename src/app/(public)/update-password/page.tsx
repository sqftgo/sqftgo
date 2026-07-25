"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, CheckCircle2 } from "lucide-react";

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/update-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Unable to update password");
      }
      setDone(true);
      setTimeout(() => router.push("/login"), 1800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {done ? (
          <div className="bg-white/90 border border-emerald-200 rounded-3xl p-10 text-center shadow-xl">
            <div className="w-16 h-16 bg-emerald-50 rounded-2xl border border-emerald-200 flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Password updated</h1>
            <p className="text-charcoal/60 text-sm font-semibold leading-relaxed mb-6">
              Redirecting you to sign in…
            </p>
            <Link
              href="/login"
              className="block w-full py-3 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors"
            >
              Go to Login
            </Link>
          </div>
        ) : (
          <div className="bg-white/90 border border-indigo/10 rounded-3xl p-10 shadow-xl">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-xs font-bold text-charcoal/50 hover:text-indigo mb-7 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </Link>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo/10 rounded-xl flex items-center justify-center">
                <Lock className="w-5 h-5 text-indigo" />
              </div>
              <div>
                <h1 className="text-xl font-serif font-black text-charcoal">Set a new password</h1>
                <p className="text-[11px] text-charcoal/50 font-semibold">
                  Choose a strong password (8+ characters)
                </p>
              </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">
                  New password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">
                  Confirm password
                </label>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal text-sm font-semibold px-4 py-3.5 rounded-xl focus:outline-none"
                />
              </div>
              {error ? <p className="text-[11px] font-semibold text-rose-600">{error}</p> : null}
              <button
                type="submit"
                disabled={loading || !password || !confirm}
                className="w-full py-3.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors shadow-lg shadow-indigo/20 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Updating..." : "Update password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

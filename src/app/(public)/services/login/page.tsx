"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, LogIn, ShieldCheck, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { ServiceProviderLoginModal } from "@/features/services/components/ServiceProviderLoginModal";

export default function ServiceProfessionalLoginPage() {
  const router = useRouter();
  const { isLoggedIn, sessionReady } = useAuth();
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    router.replace("/services/manage");
  }, [sessionReady, isLoggedIn, router]);

  return (
    <div className="min-h-[75vh] relative overflow-hidden">
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(201,123,90,0.18),_transparent_55%),radial-gradient(ellipse_at_bottom_right,_rgba(45,55,95,0.12),_transparent_50%)]"
        aria-hidden
      />
      <div className="relative container mx-auto px-6 py-16 md:py-24 flex flex-col items-center">
        <div className="w-full max-w-3xl text-center mb-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-terracotta">
            Service provider portal
          </p>
          <h1 className="mt-3 font-serif font-black text-4xl md:text-5xl text-indigo leading-tight">
            Grow your business on SqftGo
          </h1>
          <p className="mt-4 text-base font-semibold text-charcoal/70 max-w-xl mx-auto leading-relaxed">
            Register once, manage enquiries from your dashboard, and earn trust with a verified
            professional profile customers can evaluate before they book.
          </p>
        </div>

        <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-5">
          <button
            type="button"
            onClick={() => router.push("/services/register")}
            className="group text-left rounded-3xl border border-sand bg-white p-7 shadow-sm hover:border-terracotta/40 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-terracotta/10 text-terracotta flex items-center justify-center mb-5">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-black text-2xl text-indigo">Register Your Business</h2>
            <p className="mt-2 text-sm font-semibold text-charcoal/65 leading-relaxed">
              New to SqftGo? Create your professional profile with services, location, and portfolio.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-terracotta">
              Start registration
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setLoginOpen(true)}
            className="group text-left rounded-3xl border border-sand bg-white p-7 shadow-sm hover:border-indigo/30 hover:shadow-md transition-all"
          >
            <div className="w-12 h-12 rounded-2xl bg-indigo/10 text-indigo flex items-center justify-center mb-5">
              <LogIn className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-black text-2xl text-indigo">Service Provider Login</h2>
            <p className="mt-2 text-sm font-semibold text-charcoal/65 leading-relaxed">
              Already registered? Sign in with your business mobile number and OTP to open your
              dashboard.
            </p>
            <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-black text-indigo">
              Open login
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </span>
          </button>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-charcoal/50">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Separate from customer accounts
          </span>
          <Link href="/services" className="hover:text-terracotta">
            Browse services directory
          </Link>
        </div>
      </div>

      <ServiceProviderLoginModal open={loginOpen} onClose={() => setLoginOpen(false)} />
    </div>
  );
}

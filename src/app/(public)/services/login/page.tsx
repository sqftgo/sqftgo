"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function ServiceProfessionalLoginPage() {
  const router = useRouter();
  const { isLoggedIn, sessionReady } = useAuth();

  useEffect(() => {
    if (!sessionReady || !isLoggedIn) return;
    router.replace("/services/manage");
  }, [sessionReady, isLoggedIn, router]);

  return (
    <div className="min-h-[70vh] bg-cream/40 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-lg rounded-3xl bg-white border border-sand shadow-lg p-8 text-left">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-terracotta">For service professionals</p>
        <h1 className="mt-2 font-serif font-black text-3xl text-indigo">Sign in to list your service</h1>
        <p className="mt-3 text-sm font-semibold text-charcoal/70 leading-relaxed">
          Architects, contractors, movers, and other local professionals use a normal SqftGo account.
          After you sign in, you add your business details. SqftGo reviews them before the verified badge appears.
        </p>
        <ol className="mt-5 space-y-2 text-sm font-semibold text-charcoal/80 list-decimal pl-5">
          <li>Create an account or sign in.</li>
          <li>Fill in your firm, city, and services.</li>
          <li>Manage bookings from your service page.</li>
        </ol>
        <div className="mt-6 flex flex-col gap-2">
          <Link
            href="/login?next=%2Fservices%2Fmanage"
            className="w-full py-3 rounded-xl bg-indigo text-white text-center text-sm font-black"
          >
            Sign in
          </Link>
          <Link
            href="/login?tab=signup&next=%2Fservices%2Fregister"
            className="w-full py-3 rounded-xl bg-terracotta text-white text-center text-sm font-black"
          >
            Create an account and register
          </Link>
          <Link href="/services" className="w-full py-3 text-center text-sm font-bold text-charcoal/60">
            Back to services
          </Link>
        </div>
      </div>
    </div>
  );
}

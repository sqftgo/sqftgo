"use client";

import React, { useState } from "react";
import { CheckCircle2, Zap, Crown, Building2 } from "lucide-react";

const PLANS = [
  { id: "starter", name: "Starter Partner", price: "₹999", period: "/month", listings: 5, features: ["5 Active Listings", "Basic Analytics", "Email Support", "Standard Profile Page"], color: "border-indigo/20", badge: "" },
  { id: "professional", name: "Professional Partner", price: "₹2,499", period: "/month", listings: 25, features: ["25 Active Listings", "Advanced Analytics", "Priority Support", "Featured Listings", "RERA Badge", "Verified Badge"], color: "border-indigo", badge: "Most Popular", current: true },
  { id: "enterprise", name: "Enterprise Partner", price: "₹5,999", period: "/month", listings: -1, features: ["Unlimited Listings", "Full Analytics Suite", "Dedicated Account Manager", "API Access", "White-label Options", "All Pro Features"], color: "border-terracotta", badge: "Best Value" },
];

export default function DealerSubscriptionPage() {
  const [selected, setSelected] = useState("professional");
  const [upgraded, setUpgraded] = useState(false);

  return (
    <div className="p-6 md:p-8 space-y-8 max-w-5xl mx-auto text-charcoal">
      <div className="bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
        <h1 className="text-2xl font-serif font-black text-charcoal">Subscription Plans</h1>
        <p className="text-charcoal/50 text-xs font-semibold mt-1">Select the subscription level that suits your property listing portfolio.</p>
      </div>

      {upgraded && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          <span className="text-emerald-700 text-sm font-bold">Plan upgraded successfully! Your new partner features are now active.</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map(plan => (
          <div
            key={plan.id}
            onClick={() => setSelected(plan.id)}
            className={`bg-white/80 border-2 ${selected === plan.id ? plan.color : "border-indigo/10"} rounded-3xl p-6 relative cursor-pointer transition-all shadow-sm hover:shadow-md`}
          >
            {plan.badge && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap shadow-sm">
                {plan.badge}
              </span>
            )}
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-black text-charcoal/40 uppercase tracking-widest">{plan.name}</p>
                <p className="text-2xl font-serif font-black text-charcoal mt-1">{plan.price}<span className="text-xs font-semibold text-charcoal/40">{plan.period}</span></p>
              </div>
              {plan.id === "starter" && <Zap className="w-6 h-6 text-indigo/35" />}
              {plan.id === "professional" && <Crown className="w-6 h-6 text-indigo" />}
              {plan.id === "enterprise" && <Building2 className="w-6 h-6 text-terracotta" />}
            </div>
            <div className="space-y-2.5 mb-6">
              {plan.features.map(f => (
                <div key={f} className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="text-xs font-semibold text-charcoal/70">{f}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => { setSelected(plan.id); setUpgraded(true); setTimeout(() => setUpgraded(false), 3000); }}
              className={`w-full py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer ${
                selected === plan.id
                  ? "bg-indigo hover:bg-indigo-hover text-white shadow-md shadow-indigo/15"
                  : "bg-sand/35 hover:bg-indigo/5 text-charcoal/60"
              }`}
            >
              {plan.current && selected === plan.id ? "Current Plan" : "Select Plan"}
            </button>
          </div>
        ))}
      </div>

      <div className="bg-white/80 border border-indigo/10 rounded-3xl p-5 shadow-sm">
        <p className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest mb-1.5">Billing Note</p>
        <p className="text-xs text-charcoal/65 font-semibold leading-relaxed">
          All partner plans are billed monthly. You can upgrade or downgrade at any time. Payments are processed securely via Razorpay. Cancel anytime with no penalties.
        </p>
      </div>
    </div>
  );
}

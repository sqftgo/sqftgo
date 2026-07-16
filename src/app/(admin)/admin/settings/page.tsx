"use client";
import React, { useState } from "react";
import { Save, CheckCircle2, Globe, Bell, Shield, CreditCard } from "lucide-react";

export default function AdminSettingsPage() {
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    siteName: "Sun Valley Real Estate", tagline: "Rajasthan's Premier Property Marketplace",
    supportEmail: "support@svrepl.com", phone: "+91 294 2400000",
    requireApproval: true, allowDealerRegistration: true, maintenanceMode: false,
    maxImagesPerListing: 10, maxListingsPerDealer: 25, inquiryNotifications: true,
    googleAnalyticsId: "UA-XXXXXXXXX", razorpayEnabled: true,
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));
  const handleSave = (e: React.FormEvent) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const Toggle = ({ label, desc, k }: any) => (
    <div className="flex items-start justify-between gap-4">
      <div><p className="text-xs font-bold text-white">{label}</p><p className="text-[10px] text-white/40 mt-0.5">{desc}</p></div>
      <button type="button" onClick={() => set(k, !(form as any)[k])} className={`relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${(form as any)[k] ? "bg-terracotta" : "bg-white/10"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${(form as any)[k] ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2.5 pb-4 border-b border-white/5">
        <Icon className="w-4 h-4 text-terracotta/70" />
        <h2 className="text-sm font-serif font-black text-white">{title}</h2>
      </div>
      {children}
    </div>
  );

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div><h1 className="text-2xl font-serif font-black text-white">Platform Settings</h1><p className="text-white/40 text-sm font-semibold mt-1">Configure global platform behavior</p></div>
        {saved && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 text-sm font-bold">Settings saved!</span></div>}

        <form onSubmit={handleSave} className="space-y-5">
          <Section title="General" icon={Globe}>
            {[{ l: "Site Name", k: "siteName" }, { l: "Tagline", k: "tagline" }, { l: "Support Email", k: "supportEmail" }, { l: "Phone", k: "phone" }].map(({ l, k }) => (
              <div key={k} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">{l}</label>
                <input value={(form as any)[k]} onChange={e => set(k, e.target.value)} className="bg-white/5 border border-white/10 focus:border-terracotta/50 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
            ))}
          </Section>

          <Section title="Listing Controls" icon={Shield}>
            <Toggle label="Require Admin Approval" desc="New listings go to Pending Review before going live" k="requireApproval" />
            <Toggle label="Allow Dealer Registration" desc="Dealers can self-register on the platform" k="allowDealerRegistration" />
            <Toggle label="Maintenance Mode" desc="Take the platform offline for maintenance" k="maintenanceMode" />
            <div className="grid grid-cols-2 gap-4 pt-2">
              {[{ l: "Max Images Per Listing", k: "maxImagesPerListing" }, { l: "Max Listings Per Dealer", k: "maxListingsPerDealer" }].map(({ l, k }) => (
                <div key={k} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">{l}</label>
                  <input type="number" value={(form as any)[k]} onChange={e => set(k, parseInt(e.target.value))} className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
                </div>
              ))}
            </div>
          </Section>

          <Section title="Notifications" icon={Bell}>
            <Toggle label="Inquiry Notifications" desc="Send email alerts on new inquiries" k="inquiryNotifications" />
          </Section>

          <Section title="Integrations" icon={CreditCard}>
            <Toggle label="Razorpay Payments" desc="Enable subscription payments via Razorpay" k="razorpayEnabled" />
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-white/50 uppercase tracking-wider">Google Analytics ID</label>
              <input value={form.googleAnalyticsId} onChange={e => set("googleAnalyticsId", e.target.value)} className="bg-white/5 border border-white/10 text-white text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
          </Section>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-terracotta/20">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

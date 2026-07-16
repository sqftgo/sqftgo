"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Save, CheckCircle2, Lock, Bell, Globe, Shield, CreditCard, ChevronRight } from "lucide-react";

export default function DealerSettingsPage() {
  const { userEmail, setUserEmail } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    email: userEmail, currentPassword: "", newPassword: "", confirmPassword: "",
    emailNotifications: true, smsNotifications: false, marketingEmails: true,
    publicProfile: true, showPhone: true, showEmail: false,
    language: "en", timezone: "Asia/Kolkata",
  });

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword && form.newPassword !== form.confirmPassword) {
      alert("Passwords do not match!"); return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-white/80 border border-indigo/10 rounded-3xl p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2.5 pb-4 border-b border-indigo/5">
        <Icon className="w-4 h-4 text-indigo/70" />
        <h2 className="text-sm font-serif font-black text-charcoal">{title}</h2>
      </div>
      {children}
    </div>
  );

  const Toggle = ({ label, desc, k }: { label: string, desc: string, k: string }) => (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-xs font-bold text-charcoal">{label}</p>
        <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">{desc}</p>
      </div>
      <button type="button" onClick={() => set(k, !(form as any)[k])}
        className={`relative w-10 h-5 rounded-full transition-colors shrink-0 cursor-pointer ${(form as any)[k] ? "bg-indigo" : "bg-sand"}`}>
        <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${(form as any)[k] ? "translate-x-5" : "translate-x-0.5"}`} />
      </button>
    </div>
  );

  return (
    <div className="p-6 md:p-8 bg-[#faf8f5] min-h-screen text-charcoal">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="bg-white/60 border border-indigo/10 rounded-3xl p-6 shadow-sm">
          <h1 className="text-2xl font-serif font-black text-charcoal">Platform Settings</h1>
          <p className="text-charcoal/50 text-xs font-semibold mt-1">Manage your agency preferences, notification rules, passwords, and invoices.</p>
        </div>

        {saved && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-emerald-700 text-sm font-bold">Settings updated successfully!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          {/* Account preferences */}
          <Section title="Account Settings" icon={Globe}>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Email Address</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Language</label>
                <select value={form.language} onChange={e => set("language", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                  <option value="en">English</option>
                  <option value="hi">Hindi</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Timezone</label>
                <select value={form.timezone} onChange={e => set("timezone", e.target.value)} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
                  <option value="Asia/Kolkata">IST (UTC+5:30)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>
            </div>
          </Section>

          {/* Password controls */}
          <Section title="Security & Passwords" icon={Lock}>
            {[
              { label: "Current Password", k: "currentPassword" },
              { label: "New Password", k: "newPassword" },
              { label: "Confirm New Password", k: "confirmPassword" },
            ].map(({ label, k }) => (
              <div key={k} className="flex flex-col gap-1.5">
                <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">{label}</label>
                <input type="password" value={(form as any)[k]} onChange={e => set(k, e.target.value)} placeholder="••••••••"
                  className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
              </div>
            ))}
          </Section>

          {/* Email alerts notifications */}
          <Section title="Notifications Rules" icon={Bell}>
            <Toggle label="Email Notifications" desc="Receive inquiry and approval alerts via email" k="emailNotifications" />
            <Toggle label="SMS Notifications" desc="Get instant SMS for new buyer messages" k="smsNotifications" />
            <Toggle label="Marketing Emails" desc="Tips, updates, and platform announcements" k="marketingEmails" />
          </Section>

          {/* Profile visibility rules */}
          <Section title="Privacy & Directories" icon={Shield}>
            <Toggle label="Public Profile" desc="Show your profile in the dealer directory" k="publicProfile" />
            <Toggle label="Show Phone Number" desc="Display your mobile on property listings" k="showPhone" />
            <Toggle label="Show Email" desc="Show email address on public profile" k="showEmail" />
          </Section>

          {/* Invoices Billing Logs */}
          <Section title="Billing Settings" icon={CreditCard}>
            <div className="bg-sand/20 rounded-2xl p-4 border border-indigo/5 space-y-3">
              <div className="flex justify-between items-center text-xs font-bold text-charcoal">
                <span>Next Billing Date</span>
                <span className="text-indigo">15 August 2026</span>
              </div>
              <div className="h-px bg-indigo/5" />
              <div className="flex justify-between items-center text-xs text-charcoal/60">
                <span>Plan Amount</span>
                <span>₹1,500 / month</span>
              </div>
            </div>
          </Section>

          <div className="flex justify-end">
            <button type="submit" className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-indigo/15">
              <Save className="w-4 h-4" /> Save Settings
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

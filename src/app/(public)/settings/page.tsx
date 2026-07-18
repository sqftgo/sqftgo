"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { Settings, Bell, Lock, User, Eye, CheckCircle2, ChevronRight, Globe, Shield } from "lucide-react";

export default function PublicSettingsPage() {
  const { isLoggedIn, userEmail, userName, setUserName } = useApp();
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Mock settings state
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsAlerts: false,
    marketingEmails: true,
    twoFactorAuth: false,
    profileVisibility: "public",
    language: "English",
  });

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    triggerToast("Settings preference updated.");
  };

  const handleSelectChange = (key: keyof typeof settings, value: string) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
    triggerToast("Settings preference updated.");
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6">
        <div className="bg-white/80 border border-indigo/10 rounded-3xl p-10 max-w-sm w-full text-center shadow-xl">
          <Settings className="w-14 h-14 text-indigo/30 mx-auto mb-5 animate-spin-slow" />
          <h1 className="text-2xl font-serif font-black text-charcoal mb-2">Sign In Required</h1>
          <p className="text-charcoal/50 text-sm font-semibold mb-6">Please login to access settings.</p>
          <Link href="/login" className="block w-full py-3 bg-indigo text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-hover transition-colors">Sign In</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-10 right-10 bg-indigo text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-indigo/20 z-50 text-xs font-bold animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-serif font-black text-charcoal">Account Settings</h1>
        <p className="text-charcoal/50 text-sm font-semibold mt-1">Manage your platform preferences, privacy options, and security settings</p>
      </div>

      <div className="space-y-6">
        {/* SECTION 1: NOTIFICATION PREFERENCES */}
        <div className="bg-white border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-serif font-black text-charcoal flex items-center gap-2 mb-6 pb-3 border-b border-indigo/5">
            <Bell className="w-5 h-5 text-indigo/60" />
            <span>Notification Preferences</span>
          </h2>

          <div className="space-y-5">
            {/* Row 1 */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">Email Alerts</p>
                <p className="text-xs text-charcoal/50 font-semibold mt-0.5">Receive immediate notifications about price drops and new shortlisted matches.</p>
              </div>
              <button
                onClick={() => handleToggle("emailNotifications")}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                  settings.emailNotifications ? "bg-indigo" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.emailNotifications ? "translate-x-5" : ""
                }`} />
              </button>
            </div>

            {/* Row 2 */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">SMS/WhatsApp Alerts</p>
                <p className="text-xs text-charcoal/50 font-semibold mt-0.5">Receive mobile alerts when a broker accepts your tour schedule or sends a message.</p>
              </div>
              <button
                onClick={() => handleToggle("smsAlerts")}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                  settings.smsAlerts ? "bg-indigo" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.smsAlerts ? "translate-x-5" : ""
                }`} />
              </button>
            </div>

            {/* Row 3 */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">Weekly Digest Recommendations</p>
                <p className="text-xs text-charcoal/50 font-semibold mt-0.5">A curated list of handpicked properties matching your favorite cities and size requirements.</p>
              </div>
              <button
                onClick={() => handleToggle("marketingEmails")}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                  settings.marketingEmails ? "bg-indigo" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.marketingEmails ? "translate-x-5" : ""
                }`} />
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 2: PRIVACY & SYSTEM PREFERENCES */}
        <div className="bg-white border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-serif font-black text-charcoal flex items-center gap-2 mb-6 pb-3 border-b border-indigo/5">
            <Globe className="w-5 h-5 text-indigo/60" />
            <span>Preferences & Privacy</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Search Region Language</label>
              <select
                value={settings.language}
                onChange={e => handleSelectChange("language", e.target.value)}
                className="bg-sand/30 border border-indigo/10 text-charcoal text-xs font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
              >
                {["English", "Hindi", "Gujarati", "Rajasthani"].map(lang => (
                  <option key={lang} value={lang}>{lang}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Profile Directory Visibility</label>
              <select
                value={settings.profileVisibility}
                onChange={e => handleSelectChange("profileVisibility", e.target.value)}
                className="bg-sand/30 border border-indigo/10 text-charcoal text-xs font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer"
              >
                <option value="public">Public (Visible to all brokers & listings owners)</option>
                <option value="private">Private (Only visible to you & site admins)</option>
              </select>
            </div>
          </div>
        </div>

        {/* SECTION 3: ACCOUNT SECURITY */}
        <div className="bg-white border border-indigo/10 rounded-3xl p-6 md:p-8 shadow-sm">
          <h2 className="text-base font-serif font-black text-charcoal flex items-center gap-2 mb-6 pb-3 border-b border-indigo/5">
            <Shield className="w-5 h-5 text-indigo/60" />
            <span>Security Preferences</span>
          </h2>

          <div className="space-y-6">
            {/* 2FA Option */}
            <div className="flex items-center justify-between gap-4 py-1">
              <div>
                <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">Two-Factor Authentication (2FA)</p>
                <p className="text-xs text-charcoal/50 font-semibold mt-0.5">Secure your client account using mobile authenticator app confirmations.</p>
              </div>
              <button
                onClick={() => handleToggle("twoFactorAuth")}
                className={`w-11 h-6 rounded-full transition-all relative shrink-0 ${
                  settings.twoFactorAuth ? "bg-indigo" : "bg-slate-200"
                }`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                  settings.twoFactorAuth ? "translate-x-5" : ""
                }`} />
              </button>
            </div>

            <div className="h-px bg-indigo/5" />

            {/* Quick Actions */}
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs font-black text-charcoal/80 uppercase tracking-wide">Update Login Password</p>
                <p className="text-xs text-charcoal/50 font-semibold mt-0.5">Regularly change your password to keep your shortlist transactions safe.</p>
              </div>
              <button
                onClick={() => triggerToast("Password reset link has been dispatched to your email.")}
                className="px-4 py-2 bg-indigo/5 hover:bg-indigo/10 text-indigo text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Trigger Password Reset
              </button>
            </div>
          </div>
        </div>

        {/* Profile Link */}
        <div className="bg-sand/20 border border-sand/35 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-indigo" />
            <div>
              <p className="text-xs font-bold text-charcoal">Looking to edit your public details, bio, or contact information?</p>
              <p className="text-[10px] text-charcoal/40 font-semibold mt-0.5">Display name and phone numbers are visible on submitted enquiries.</p>
            </div>
          </div>
          <Link href="/profile/edit" className="flex items-center gap-1.5 px-4 py-2 bg-indigo text-white hover:bg-indigo-hover text-xs font-bold rounded-xl transition-all">
            <span>Edit Profile</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}

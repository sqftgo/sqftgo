"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { Save, CheckCircle2, Shield, Lock, Globe } from "lucide-react";

export default function AdminProfilePage() {
  const { userEmail } = useApp();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: "Admin User", email: userEmail, phone: "+91 98000 00001", bio: "Platform administrator for Sun Valley Real Estate." });

  const handleSave = (e: React.FormEvent) => { e.preventDefault(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-serif font-black text-charcoal">Admin Profile</h1>
          <p className="text-charcoal/40 text-sm font-semibold mt-1">Manage your administrator account</p>
        </div>
        {saved && (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span className="text-emerald-600 text-sm font-bold">Profile saved!</span>
          </div>
        )}
        <form onSubmit={handleSave} className="bg-white/80 border border-indigo/10 rounded-2xl p-6 space-y-5 shadow-sm">
          <div className="flex items-center gap-4 pb-5 border-b border-indigo/5">
            <div className="w-16 h-16 rounded-2xl bg-terracotta/10 flex items-center justify-center text-terracotta font-black text-2xl border border-terracotta/20">A</div>
            <div>
              <p className="text-sm font-bold text-charcoal">{form.name}</p>
              <div className="flex items-center gap-2 mt-1">
                <Shield className="w-3 h-3 text-terracotta" />
                <span className="text-[10px] font-black text-terracotta uppercase tracking-wider">Super Administrator</span>
              </div>
            </div>
          </div>
          {[{ l: "Full Name", k: "name" }, { l: "Email", k: "email" }, { l: "Phone", k: "phone" }].map(({ l, k }) => (
            <div key={k} className="flex flex-col gap-1.5">
              <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">{l}</label>
              <input value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} className="bg-sand/35 border border-indigo/5 focus:border-terracotta/50 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none transition-colors" />
            </div>
          ))}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/40 uppercase tracking-widest">Bio</label>
            <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={3} className="bg-sand/35 border border-indigo/5 focus:border-terracotta/50 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none transition-colors" />
          </div>
          <div className="flex justify-end pt-3 border-t border-indigo/5">
            <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-md shadow-terracotta/15">
              <Save className="w-4 h-4" /> Save Profile
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

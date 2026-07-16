"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import Link from "next/link";
import { ArrowLeft, Save, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { userEmail, userName, setUserName } = useApp();
  const router = useRouter();
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({ name: userName || "", phone: "", city: "Udaipur", bio: "" });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (setUserName) setUserName(form.name);
    setSaved(true);
    setTimeout(() => { setSaved(false); router.push("/profile"); }, 1500);
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-8">
        <button onClick={() => router.back()} className="p-2 bg-white/60 hover:bg-white border border-indigo/10 text-charcoal rounded-xl transition-colors cursor-pointer"><ArrowLeft className="w-4 h-4" /></button>
        <h1 className="text-2xl font-serif font-black text-charcoal">Edit Profile</h1>
      </div>
      {saved && <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3 mb-5"><CheckCircle2 className="w-5 h-5 text-emerald-500" /><span className="text-emerald-700 text-sm font-bold">Profile updated!</span></div>}
      <form onSubmit={handleSave} className="bg-white/80 border border-indigo/10 rounded-3xl p-8 shadow-lg space-y-5">
        {[{ l: "Display Name", k: "name", t: "text", ph: "Your name" }, { l: "Phone", k: "phone", t: "tel", ph: "+91 98765 43210" }].map(({ l, k, t, ph }) => (
          <div key={k} className="flex flex-col gap-1.5">
            <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">{l}</label>
            <input type={t} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph} className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none" />
          </div>
        ))}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Email (Read-only)</label>
          <input value={userEmail} disabled className="bg-sand/20 border border-indigo/5 text-charcoal/50 text-sm font-semibold px-4 py-3 rounded-xl cursor-not-allowed" />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">City</label>
          <select value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="bg-sand/30 border border-indigo/10 text-charcoal text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none cursor-pointer">
            {["Udaipur", "Jaipur", "Jodhpur", "Jaisalmer", "Kota", "Ahmedabad", "Surat", "Mumbai", "Delhi"].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-black text-charcoal/50 uppercase tracking-wider">Bio</label>
          <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} rows={4} placeholder="Tell us about yourself..." className="bg-sand/30 border border-indigo/10 focus:border-indigo/40 text-charcoal placeholder-charcoal/30 text-sm font-semibold px-4 py-3 rounded-xl focus:outline-none resize-none" />
        </div>
        <div className="flex justify-end gap-3 pt-3 border-t border-indigo/5">
          <button type="button" onClick={() => router.back()} className="px-4 py-2.5 text-charcoal/50 text-xs font-bold hover:text-charcoal transition-colors cursor-pointer">Cancel</button>
          <button type="submit" className="flex items-center gap-2 px-6 py-2.5 bg-indigo hover:bg-indigo-hover text-white text-xs font-black uppercase tracking-wider rounded-xl transition-colors cursor-pointer">
            <Save className="w-4 h-4" /> Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}

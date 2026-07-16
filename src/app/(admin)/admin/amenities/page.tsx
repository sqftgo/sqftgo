"use client";
import React, { useState } from "react";
import { Plus, Trash2, CheckCircle2 } from "lucide-react";

const DEFAULT_AMENITIES = [
  "Swimming Pool", "Parking", "Gym", "Security", "Power Backup", "Lift", "Garden", "Lake View",
  "Clubhouse", "Children Play Area", "CCTV", "Wi-Fi", "AC Rooms", "Terrace", "Modular Kitchen",
  "Vaastu Compliant", "Jogging Track", "Library", "Amphitheatre", "Meditation Zone"
];

export default function AdminAmenitiesPage() {
  const [amenities, setAmenities] = useState(DEFAULT_AMENITIES);
  const [newAmenity, setNewAmenity] = useState("");
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!newAmenity.trim() || amenities.includes(newAmenity)) return;
    setAmenities(prev => [...prev, newAmenity]);
    setNewAmenity("");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = (a: string) => setAmenities(prev => prev.filter(x => x !== a));

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div><h1 className="text-2xl font-serif font-black text-white">Amenities</h1><p className="text-white/40 text-sm font-semibold mt-1">Manage available property amenities</p></div>
      {saved && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 text-sm font-bold">Amenity added!</span></div>}

      <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
        <div className="flex gap-3">
          <input value={newAmenity} onChange={e => setNewAmenity(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAdd()} placeholder="New amenity name..." className="flex-1 bg-white/5 border border-white/10 focus:border-terracotta/50 text-white placeholder-white/30 text-sm font-semibold px-4 py-2.5 rounded-xl focus:outline-none" />
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black rounded-xl transition-colors cursor-pointer"><Plus className="w-4 h-4" /> Add</button>
        </div>
      </div>

      <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
        <p className="text-[10px] font-black text-white/30 uppercase tracking-wider mb-4">{amenities.length} amenities</p>
        <div className="flex flex-wrap gap-2">
          {amenities.map(a => (
            <div key={a} className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-2">
              <span className="text-xs font-bold text-white/70">{a}</span>
              <button onClick={() => handleDelete(a)} className="text-white/30 hover:text-rose-400 transition-colors cursor-pointer"><Trash2 className="w-3 h-3" /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

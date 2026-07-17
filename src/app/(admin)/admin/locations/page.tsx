"use client";
import React, { useState } from "react";
import { useApp, Location } from "@/context/AppContext";
import { Plus, Trash2, ToggleLeft, ToggleRight, CheckCircle2 } from "lucide-react";

export default function AdminLocationsPage() {
  const { locations, setLocations, addLog, userEmail } = useApp();
  const [form, setForm] = useState({ city: "", state: "", country: "India" });
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!form.city.trim()) return;
    const newLoc: Location = { id: `loc-${Date.now()}`, ...form, active: true, propertyCount: 0 };
    setLocations(prev => [...prev, newLoc]);
    addLog({ action: "Location Added", performedBy: userEmail, role: "Admin", target: `${form.city}, ${form.state}` });
    setForm({ city: "", state: "", country: "India" });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleActive = (id: string) => setLocations(prev => prev.map(l => l.id === id ? { ...l, active: !l.active } : l));
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete location "${name}"?`)) return;
    setLocations(prev => prev.filter(l => l.id !== id));
    addLog({ action: "Location Deleted", performedBy: userEmail, role: "Admin", target: name });
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-serif font-black text-charcoal">Locations</h1>
        <p className="text-charcoal/40 text-sm font-semibold mt-1">Manage cities and regions on the platform</p>
      </div>

      {saved && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span className="text-emerald-600 text-sm font-bold">Location added!</span>
        </div>
      )}

      <div className="bg-white/80 border border-indigo/10 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-serif font-black text-charcoal mb-4">Add Location</h2>
        <div className="flex flex-wrap gap-3">
          {[
            { k: "city", ph: "City name", cls: "flex-1 min-w-[150px]" },
            { k: "state", ph: "State", cls: "flex-1 min-w-[150px]" },
            { k: "country", ph: "Country", cls: "flex-1 min-w-[120px]" },
          ].map(({ k, ph, cls }) => (
            <input key={k} value={(form as any)[k]} onChange={e => setForm(f => ({ ...f, [k]: e.target.value }))} placeholder={ph}
              className={`${cls} bg-sand/35 border border-indigo/5 focus:border-terracotta/50 text-charcoal placeholder-charcoal/40 text-sm font-semibold px-4 py-2.5 rounded-xl focus:outline-none`} />
          ))}
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black rounded-xl transition-all cursor-pointer shadow-md shadow-terracotta/15">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      <div className="bg-white/80 border border-indigo/10 rounded-2xl overflow-hidden shadow-sm">
        <div className="divide-y divide-indigo/5">
          {locations.map(loc => (
            <div key={loc.id} className="flex items-center gap-4 px-5 py-4 hover:bg-indigo/5 transition-colors">
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">{loc.city}</p>
                <p className="text-[10px] text-charcoal/40 font-semibold">{loc.state}, {loc.country}</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${loc.active ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-white/10 text-charcoal/40 border-indigo/5"}`}>
                {loc.active ? "Active" : "Inactive"}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(loc.id)} className="p-2 bg-indigo/5 hover:bg-indigo/10 text-charcoal/40 hover:text-indigo rounded-lg cursor-pointer">
                  {loc.active ? <ToggleRight className="w-4 h-4 text-emerald-600" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(loc.id, loc.city)} className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg cursor-pointer">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

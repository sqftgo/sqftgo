"use client";
import React, { useState } from "react";
import { useApp, Category } from "@/context/AppContext";
import { Plus, Trash2, Edit2, ToggleLeft, ToggleRight, CheckCircle2 } from "lucide-react";

export default function AdminCategoriesPage() {
  const { categories, setCategories, addLog, userEmail } = useApp();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏠");
  const [saved, setSaved] = useState(false);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newCat: Category = { id: `cat-${Date.now()}`, name: newName, icon: newIcon, count: 0, active: true };
    setCategories(prev => [...prev, newCat]);
    addLog({ action: "Category Added", performedBy: userEmail, role: "Admin", target: newName });
    setNewName(""); setNewIcon("🏠");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleActive = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete category "${name}"?`)) return;
    setCategories(prev => prev.filter(c => c.id !== id));
    addLog({ action: "Category Deleted", performedBy: userEmail, role: "Admin", target: name });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div><h1 className="text-2xl font-serif font-black text-white">Categories</h1><p className="text-white/40 text-sm font-semibold mt-1">Manage property type categories</p></div>

      {saved && <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-center gap-3"><CheckCircle2 className="w-5 h-5 text-emerald-400" /><span className="text-emerald-400 text-sm font-bold">Category added!</span></div>}

      {/* Add New */}
      <div className="bg-[#1e2028] border border-white/10 rounded-2xl p-5">
        <h2 className="text-sm font-serif font-black text-white mb-4">Add Category</h2>
        <div className="flex gap-3 flex-wrap">
          <input value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Icon (emoji)" className="bg-white/5 border border-white/10 text-white text-center text-xl w-16 px-3 py-2.5 rounded-xl focus:outline-none" maxLength={2} />
          <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className="flex-1 min-w-[200px] bg-white/5 border border-white/10 focus:border-terracotta/50 text-white placeholder-white/30 text-sm font-semibold px-4 py-2.5 rounded-xl focus:outline-none" />
          <button onClick={handleAdd} className="flex items-center gap-2 px-5 py-2.5 bg-terracotta hover:bg-terracotta-hover text-white text-xs font-black rounded-xl transition-colors cursor-pointer">
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* List */}
      <div className="bg-[#1e2028] border border-white/10 rounded-2xl overflow-hidden">
        <div className="divide-y divide-white/5">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-white/2 transition-colors">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-white">{cat.name}</p>
                <p className="text-[10px] text-white/30 font-semibold">{cat.count} properties</p>
              </div>
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded border ${cat.active ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-white/5 text-white/30 border-white/10"}`}>
                {cat.active ? "Active" : "Inactive"}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => toggleActive(cat.id)} className="p-2 bg-white/5 hover:bg-white/10 text-white/50 hover:text-white rounded-lg transition-all cursor-pointer" title="Toggle">
                  {cat.active ? <ToggleRight className="w-4 h-4 text-emerald-400" /> : <ToggleLeft className="w-4 h-4" />}
                </button>
                <button onClick={() => handleDelete(cat.id, cat.name)} className="p-2 bg-white/5 hover:bg-rose-500/20 text-white/50 hover:text-rose-400 rounded-lg transition-all cursor-pointer">
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

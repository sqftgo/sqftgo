"use client";
import React, { useState } from "react";
import { useApp, Category } from "@/context/AppContext";
import { Plus, Trash2 } from "lucide-react";
import {
  DashboardPageHeader,
  Alert,
  Switch,
  Badge,
  ConfirmDialog,
  Button,
  TextInput,
  Panel,
} from "@/components/ui";

export default function AdminCategoriesPage() {
  const { categories, setCategories, addLog, userEmail } = useApp();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏠");
  const [saved, setSaved] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = () => {
    if (!newName.trim()) return;
    const newCat: Category = { id: `cat-${Date.now()}`, name: newName, icon: newIcon, count: 0, active: true };
    setCategories(prev => [...prev, newCat]);
    addLog({ action: "Category Added", performedBy: userEmail, role: "Admin", target: newName });
    setNewName(""); setNewIcon("🏠");
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const toggleActive = (id: string) => setCategories(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    setCategories(prev => prev.filter(c => c.id !== pendingDelete.id));
    addLog({ action: "Category Deleted", performedBy: userEmail, role: "Admin", target: pendingDelete.name });
    setPendingDelete(null);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader
        title="Categories"
        description="Manage property type categories"
      />

      {saved && (
        <Alert variant="success" title="Category added!" onDismiss={() => setSaved(false)} />
      )}

      <Panel title="Add Category">
        <div className="flex gap-3 flex-wrap">
          <TextInput value={newIcon} onChange={e => setNewIcon(e.target.value)} placeholder="Icon" className="text-center text-xl w-16" maxLength={2} />
          <TextInput value={newName} onChange={e => setNewName(e.target.value)} placeholder="Category name" className="flex-1 min-w-[200px]" />
          <Button onClick={handleAdd} size="md">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Panel>

      <Panel padding="none">
        <div className="divide-y divide-indigo/5">
          {categories.map(cat => (
            <div key={cat.id} className="flex items-center gap-4 px-5 py-4 hover:bg-indigo/5 transition-colors">
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">{cat.name}</p>
                <p className="text-[10px] text-charcoal/40 font-semibold">{cat.count} properties</p>
              </div>
              <Badge status={cat.active ? "active" : "inactive"} size="sm">
                {cat.active ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cat.active}
                  onCheckedChange={() => toggleActive(cat.id)}
                  size="sm"
                  accent="terracotta"
                  aria-label={`Toggle ${cat.name}`}
                />
                <button
                  type="button"
                  onClick={() => setPendingDelete({ id: cat.id, name: cat.name })}
                  className="p-2 bg-indigo/5 hover:bg-rose-500/10 text-charcoal/40 hover:text-rose-500 rounded-lg transition-all cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
        title="Delete category?"
        description={pendingDelete ? `Delete category "${pendingDelete.name}"?` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}

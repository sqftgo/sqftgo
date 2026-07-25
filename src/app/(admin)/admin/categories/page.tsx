"use client";
import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
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
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    addLog,
    userEmail,
  } = useApp();
  const [newName, setNewName] = useState("");
  const [newIcon, setNewIcon] = useState("🏠");
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const handleAdd = async () => {
    if (!newName.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      await createCategory({ name: newName.trim(), icon: newIcon || "🏠" });
      addLog({ action: "Category Added", performedBy: userEmail, role: "Admin", target: newName });
      setNewName("");
      setNewIcon("🏠");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to add category");
    } finally {
      setBusy(false);
    }
  };

  const toggleActive = async (id: string, active: boolean) => {
    try {
      await updateCategory(id, { active: !active });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update category");
    }
  };

  const confirmDelete = async () => {
    if (!pendingDelete || busy) return;
    setBusy(true);
    try {
      await deleteCategory(pendingDelete.id);
      addLog({
        action: "Category Deleted",
        performedBy: userEmail,
        role: "Admin",
        target: pendingDelete.name,
      });
      setPendingDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete category");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      <DashboardPageHeader title="Categories" description="Manage property type categories" />

      {saved && (
        <Alert variant="success" title="Category added!" onDismiss={() => setSaved(false)} />
      )}
      {error ? (
        <Alert variant="danger" title={error} onDismiss={() => setError(null)} />
      ) : null}

      <Panel title="Add Category">
        <div className="flex gap-3 flex-wrap">
          <TextInput
            value={newIcon}
            onChange={(e) => setNewIcon(e.target.value)}
            placeholder="Icon"
            className="text-center text-xl w-16"
            maxLength={2}
          />
          <TextInput
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Category name"
            className="flex-1 min-w-[200px]"
          />
          <Button onClick={() => void handleAdd()} size="md" disabled={busy}>
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
      </Panel>

      <Panel padding="none">
        <div className="divide-y divide-indigo/5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center gap-4 px-5 py-4 hover:bg-indigo/5 transition-colors"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-bold text-charcoal">{cat.name}</p>
                <p className="text-[10px] text-charcoal/40 font-semibold">
                  {cat.count} properties
                </p>
              </div>
              <Badge status={cat.active ? "active" : "inactive"} size="sm">
                {cat.active ? "Active" : "Inactive"}
              </Badge>
              <div className="flex items-center gap-2">
                <Switch
                  checked={cat.active}
                  onCheckedChange={() => void toggleActive(cat.id, cat.active)}
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
        onConfirm={() => {
          void confirmDelete();
        }}
        title="Delete category?"
        description={pendingDelete ? `Delete category "${pendingDelete.name}"?` : undefined}
        confirmLabel="Delete"
        tone="danger"
      />
    </div>
  );
}
